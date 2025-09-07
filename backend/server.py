from fastapi import FastAPI, APIRouter, HTTPException, UploadFile, File
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone
from emergentintegrations.llm.chat import LlmChat, UserMessage
import json

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Initialize LLM Chat
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY')

# Pydantic Models
class AgentConfig(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str = "Agente Imobiliário"
    behavior: str = "Profissional, cordial e focado em ajudar clientes a encontrar o imóvel ideal"
    script: List[str] = Field(default_factory=lambda: [
        "Cumprimentar e se apresentar",
        "Identificar necessidades do cliente",
        "Apresentar opções disponíveis",
        "Agendar visita se houver interesse",
        "Coletar informações de contato"
    ])
    knowledge_base: List[str] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class AgentConfigCreate(BaseModel):
    name: str
    behavior: str
    script: List[str]

class Lead(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    phone: str
    email: Optional[str] = None
    status: str = "novo_lead"  # novo_lead, em_negociacao, visita_agendada, fechamento
    last_interaction: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class LeadCreate(BaseModel):
    name: str
    phone: str
    email: Optional[str] = None

class ChatMessage(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    lead_id: str
    sender: str  # "lead" or "agent"
    message: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ChatMessageCreate(BaseModel):
    lead_id: str
    sender: str
    message: str

class Report(BaseModel):
    total_leads: int
    leads_by_status: Dict[str, int]
    conversations_today: int
    response_rate: float

# Helper functions
def prepare_for_mongo(data):
    if isinstance(data, dict):
        for key, value in data.items():
            if isinstance(value, datetime):
                data[key] = value.isoformat()
            elif isinstance(value, list):
                data[key] = [prepare_for_mongo(item) if isinstance(item, dict) else item for item in value]
    return data

def parse_from_mongo(item):
    if isinstance(item, dict):
        for key, value in item.items():
            if key.endswith('_at') or key == 'timestamp':
                if isinstance(value, str):
                    try:
                        item[key] = datetime.fromisoformat(value.replace('Z', '+00:00'))
                    except:
                        pass
    return item

# Agent Configuration Routes
@api_router.post("/agent-config", response_model=AgentConfig)
async def create_agent_config(config: AgentConfigCreate):
    agent_dict = config.dict()
    agent_obj = AgentConfig(**agent_dict)
    agent_data = prepare_for_mongo(agent_obj.dict())
    await db.agent_configs.insert_one(agent_data)
    return agent_obj

@api_router.get("/agent-config", response_model=AgentConfig)
async def get_agent_config():
    config = await db.agent_configs.find_one({}, sort=[("created_at", -1)])
    if not config:
        # Return default config
        default_config = AgentConfig()
        agent_data = prepare_for_mongo(default_config.dict())
        await db.agent_configs.insert_one(agent_data)
        return default_config
    config = parse_from_mongo(config)
    return AgentConfig(**config)

@api_router.put("/agent-config/{config_id}", response_model=AgentConfig)
async def update_agent_config(config_id: str, config: AgentConfigCreate):
    agent_dict = config.dict()
    agent_obj = AgentConfig(id=config_id, **agent_dict)
    agent_data = prepare_for_mongo(agent_obj.dict())
    await db.agent_configs.replace_one({"id": config_id}, agent_data)
    return agent_obj

# Lead Management Routes
@api_router.post("/leads", response_model=Lead)
async def create_lead(lead: LeadCreate):
    lead_dict = lead.dict()
    lead_obj = Lead(**lead_dict)
    lead_data = prepare_for_mongo(lead_obj.dict())
    await db.leads.insert_one(lead_data)
    return lead_obj

@api_router.get("/leads", response_model=List[Lead])
async def get_leads():
    leads = await db.leads.find().sort("created_at", -1).to_list(1000)
    return [Lead(**parse_from_mongo(lead)) for lead in leads]

@api_router.get("/leads/{lead_id}", response_model=Lead)
async def get_lead(lead_id: str):
    lead = await db.leads.find_one({"id": lead_id})
    if not lead:
        raise HTTPException(status_code=404, detail="Lead não encontrado")
    lead = parse_from_mongo(lead)
    return Lead(**lead)

@api_router.put("/leads/{lead_id}/status")
async def update_lead_status(lead_id: str, status: str):
    await db.leads.update_one(
        {"id": lead_id},
        {"$set": {"status": status, "last_interaction": datetime.now(timezone.utc).isoformat()}}
    )
    return {"message": "Status atualizado com sucesso"}

# Chat Routes
@api_router.post("/chat/message", response_model=ChatMessage)
async def send_message(message: ChatMessageCreate):
    message_dict = message.dict()
    message_obj = ChatMessage(**message_dict)
    message_data = prepare_for_mongo(message_obj.dict())
    await db.messages.insert_one(message_data)
    
    # Update lead's last interaction
    await db.leads.update_one(
        {"id": message.lead_id},
        {"$set": {"last_interaction": datetime.now(timezone.utc).isoformat()}}
    )
    
    return message_obj

@api_router.get("/chat/{lead_id}", response_model=List[ChatMessage])
async def get_chat_history(lead_id: str):
    messages = await db.messages.find({"lead_id": lead_id}).sort("timestamp", 1).to_list(1000)
    return [ChatMessage(**parse_from_mongo(message)) for message in messages]

@api_router.post("/chat/ai-response/{lead_id}")
async def get_ai_response(lead_id: str, user_message: str):
    try:
        # Get agent config
        config = await db.agent_configs.find_one({}, sort=[("created_at", -1)])
        if not config:
            config = AgentConfig().dict()
        
        # Get lead info
        lead = await db.leads.find_one({"id": lead_id})
        if not lead:
            raise HTTPException(status_code=404, detail="Lead não encontrado")
        
        # Get recent chat history
        recent_messages = await db.messages.find({"lead_id": lead_id}).sort("timestamp", -1).limit(10).to_list(10)
        recent_messages.reverse()  # Put in chronological order
        
        # Build context
        context = f"""Você é um {config.get('name', 'Agente Imobiliário')} com o seguinte comportamento: {config.get('behavior', 'Profissional e cordial')}.

Roteiro a seguir:
{chr(10).join([f"- {step}" for step in config.get('script', [])])}

Informações do cliente:
- Nome: {lead.get('name')}
- Telefone: {lead.get('phone')}
- Status: {lead.get('status')}

Histórico da conversa:
{chr(10).join([f"{msg.get('sender', 'desconhecido')}: {msg.get('message', '')}" for msg in recent_messages[-5:]])}

Responda de forma natural, seguindo seu roteiro e comportamento. Seja objetivo e útil."""

        # Initialize chat with Gemini 2.5 Pro
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"lead_{lead_id}",
            system_message=context
        ).with_model("gemini", "gemini-2.5-pro")
        
        # Send message to AI
        ai_message = UserMessage(text=user_message)
        ai_response = await chat.send_message(ai_message)
        
        # Save AI response as message
        ai_message_obj = ChatMessage(
            lead_id=lead_id,
            sender="agent",
            message=ai_response
        )
        ai_message_data = prepare_for_mongo(ai_message_obj.dict())
        await db.messages.insert_one(ai_message_data)
        
        return {"response": ai_response}
        
    except Exception as e:
        logging.error(f"Error generating AI response: {str(e)}")
        # Fallback response
        fallback_response = "Obrigado pela sua mensagem! Em breve um de nossos consultores entrará em contato com você."
        
        ai_message_obj = ChatMessage(
            lead_id=lead_id,
            sender="agent",
            message=fallback_response
        )
        ai_message_data = prepare_for_mongo(ai_message_obj.dict())
        await db.messages.insert_one(ai_message_data)
        
        return {"response": fallback_response}

# Reports Routes
@api_router.get("/reports", response_model=Report)
async def get_reports():
    # Count total leads
    total_leads = await db.leads.count_documents({})
    
    # Count leads by status
    leads_by_status = {}
    statuses = ["novo_lead", "em_negociacao", "visita_agendada", "fechamento"]
    for status in statuses:
        count = await db.leads.count_documents({"status": status})
        leads_by_status[status] = count
    
    # Count conversations today
    today = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    conversations_today = await db.messages.count_documents({
        "timestamp": {"$gte": today.isoformat()}
    })
    
    # Calculate response rate (simplified)
    total_messages = await db.messages.count_documents({})
    agent_messages = await db.messages.count_documents({"sender": "agent"})
    response_rate = (agent_messages / total_messages * 100) if total_messages > 0 else 0
    
    return Report(
        total_leads=total_leads,
        leads_by_status=leads_by_status,
        conversations_today=conversations_today,
        response_rate=round(response_rate, 1)
    )

# Upload Knowledge Base
@api_router.post("/upload-knowledge")
async def upload_knowledge(file: UploadFile = File(...)):
    try:
        content = await file.read()
        text_content = content.decode('utf-8')
        
        # Get current agent config
        config = await db.agent_configs.find_one({}, sort=[("created_at", -1)])
        if not config:
            config = AgentConfig().dict()
        
        # Add to knowledge base
        if 'knowledge_base' not in config:
            config['knowledge_base'] = []
        
        config['knowledge_base'].append({
            "filename": file.filename,
            "content": text_content,
            "uploaded_at": datetime.now(timezone.utc).isoformat()
        })
        
        # Update config
        await db.agent_configs.replace_one({"id": config.get("id")}, prepare_for_mongo(config))
        
        return {"message": f"Arquivo {file.filename} enviado com sucesso"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erro ao processar arquivo: {str(e)}")

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()