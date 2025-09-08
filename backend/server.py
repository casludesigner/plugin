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

class TrainingDocument(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    filename: str
    original_name: str
    file_type: str
    file_size: int
    status: str = "processando"  # processando, treinado, erro
    upload_date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    content: Optional[str] = None
    error_message: Optional[str] = None

class TrainingDocumentResponse(BaseModel):
    id: str
    filename: str
    original_name: str
    file_type: str
    file_size: int
    status: str
    upload_date: datetime
    error_message: Optional[str] = None

class Lead(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    phone: str
    email: Optional[str] = None
    status: str = "novo_lead"  # novo_lead, em_negociacao, visita_agendada, fechamento
    tags: List[str] = Field(default_factory=list)  # quente, frio, em_negociacao
    notes: str = ""
    last_interaction: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class LeadCreate(BaseModel):
    name: str
    phone: str
    email: Optional[str] = None

class ChatMessage(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    lead_id: str
    sender: str  # "lead", "agent", "human"
    sender_name: Optional[str] = None  # Nome do atendente humano
    message: str
    channel: str = "whatsapp"  # whatsapp, web, etc
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ChatMessageCreate(BaseModel):
    lead_id: str
    sender: str
    sender_name: Optional[str] = None
    message: str
    channel: str = "whatsapp"

class LiveConversation(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    lead_id: str
    status: str = "novo"  # novo, em_atendimento, fechado
    assigned_to: Optional[str] = None  # Nome do atendente
    channel: str = "whatsapp"
    last_message: Optional[str] = None
    last_message_time: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class LiveConversationCreate(BaseModel):
    lead_id: str
    channel: str = "whatsapp"

class WhatsAppIntegration(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    is_connected: bool = False
    phone_number: Optional[str] = None
    business_name: Optional[str] = None
    webhook_url: Optional[str] = None
    access_token: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Multi-tenant Models
class Company(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    cnpj: Optional[str] = None
    email: str
    phone: Optional[str] = None
    status: str = "ativa"  # ativa, inativa, suspensa
    plan: str = "basic"  # basic, premium, enterprise
    limits: Dict[str, int] = Field(default_factory=lambda: {
        "max_users": 5,
        "max_leads": 1000,
        "max_agents": 2,
        "max_integrations": 3
    })
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    last_activity: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CompanyCreate(BaseModel):
    name: str
    cnpj: Optional[str] = None
    email: str
    phone: Optional[str] = None
    plan: str = "basic"

class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    company_id: str
    name: str
    email: str
    role: str = "colaborador"  # superadmin, admin, gestor, colaborador
    status: str = "ativo"  # ativo, inativo
    last_login: Optional[datetime] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserCreate(BaseModel):
    company_id: str
    name: str
    email: str
    role: str = "colaborador"

class ActivityLog(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    company_id: str
    user_id: Optional[str] = None
    action: str
    description: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CompanyStats(BaseModel):
    total_companies: int
    active_companies: int
    total_users: int
    total_leads: int
    companies_by_plan: Dict[str, int]

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
            if key.endswith('_at') or key == 'timestamp' or key == 'last_message_time' or key == 'upload_date':
                if isinstance(value, str):
                    try:
                        item[key] = datetime.fromisoformat(value.replace('Z', '+00:00'))
                    except:
                        pass
    return item

def get_file_size_mb(size_bytes):
    return round(size_bytes / (1024 * 1024), 2)

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "PropBot CRM API is running", "status": "ok"}

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

# Training Documents Routes
@api_router.post("/training-documents/upload", response_model=TrainingDocumentResponse)
async def upload_training_document(file: UploadFile = File(...)):
    # Validate file type
    allowed_extensions = ['.pdf', '.xml', '.csv', '.xlsx', '.txt', '.docx']
    file_extension = Path(file.filename).suffix.lower()
    
    if file_extension not in allowed_extensions:
        raise HTTPException(
            status_code=400, 
            detail=f"Tipo de arquivo não suportado. Tipos aceitos: {', '.join(allowed_extensions)}"
        )
    
    # Check file size (10MB limit)
    content = await file.read()
    if len(content) > 10 * 1024 * 1024:  # 10MB
        raise HTTPException(status_code=400, detail="Arquivo muito grande. Limite: 10MB")
    
    try:
        # Create document record
        doc = TrainingDocument(
            filename=f"{uuid.uuid4()}{file_extension}",
            original_name=file.filename,
            file_type=file_extension,
            file_size=len(content),
            status="processando"
        )
        
        # Save to database
        doc_data = prepare_for_mongo(doc.dict())
        await db.training_documents.insert_one(doc_data)
        
        # Simulate processing (in real implementation, this would process the file)
        try:
            # Try to decode content for text files
            if file_extension in ['.txt', '.csv', '.xml']:
                text_content = content.decode('utf-8')
                doc.content = text_content[:1000]  # Store first 1000 chars
            
            # Update status to trained
            await db.training_documents.update_one(
                {"id": doc.id},
                {"$set": {"status": "treinado", "content": doc.content}}
            )
            doc.status = "treinado"
            
        except Exception as e:
            # Update status to error
            error_msg = f"Erro ao processar arquivo: {str(e)}"
            await db.training_documents.update_one(
                {"id": doc.id},
                {"$set": {"status": "erro", "error_message": error_msg}}
            )
            doc.status = "erro"
            doc.error_message = error_msg
        
        return TrainingDocumentResponse(**doc.dict())
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro interno: {str(e)}")

@api_router.get("/training-documents", response_model=List[TrainingDocumentResponse])
async def get_training_documents():
    documents = await db.training_documents.find().sort("upload_date", -1).to_list(100)
    return [TrainingDocumentResponse(**parse_from_mongo(doc)) for doc in documents]

@api_router.delete("/training-documents/{doc_id}")
async def delete_training_document(doc_id: str):
    result = await db.training_documents.delete_one({"id": doc_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Documento não encontrado")
    return {"message": "Documento removido com sucesso"}

@api_router.post("/training-documents/train-ai")
async def train_ai_with_documents():
    # Get all trained documents
    documents = await db.training_documents.find({"status": "treinado"}).to_list(100)
    
    if not documents:
        raise HTTPException(status_code=400, detail="Nenhum documento treinado disponível")
    
    # Simulate AI training process
    try:
        # In real implementation, this would:
        # 1. Process all documents
        # 2. Extract relevant information
        # 3. Update the AI knowledge base
        # 4. Update agent configuration
        
        # Get current agent config
        config = await db.agent_configs.find_one({}, sort=[("created_at", -1)])
        if config:
            # Add document info to knowledge base
            knowledge_items = []
            for doc in documents:
                knowledge_items.append({
                    "source": doc.get("original_name"),
                    "type": doc.get("file_type"),
                    "content_preview": doc.get("content", "")[:200] if doc.get("content") else "",
                    "processed_at": datetime.now(timezone.utc).isoformat()
                })
            
            # Update agent config with new knowledge
            await db.agent_configs.update_one(
                {"id": config.get("id")},
                {"$set": {"knowledge_base": knowledge_items}}
            )
        
        return {
            "message": f"IA treinada com sucesso usando {len(documents)} documentos",
            "documents_count": len(documents)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao treinar IA: {str(e)}")

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

@api_router.put("/leads/{lead_id}/tags")
async def update_lead_tags(lead_id: str, tags: List[str]):
    await db.leads.update_one(
        {"id": lead_id},
        {"$set": {"tags": tags}}
    )
    return {"message": "Tags atualizadas com sucesso"}

@api_router.put("/leads/{lead_id}/notes")
async def update_lead_notes(lead_id: str, request_body: dict):
    notes = request_body.get("notes", "")
    await db.leads.update_one(
        {"id": lead_id},
        {"$set": {"notes": notes}}
    )
    return {"message": "Observações atualizadas com sucesso"}

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
async def get_ai_response(lead_id: str, request_body: dict):
    try:
        # Extract user message from request body
        user_message = request_body.get("message", "")
        
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
        
        # Build context with knowledge base
        knowledge_context = ""
        if config.get('knowledge_base'):
            knowledge_context = "\n\nConhecimento da empresa:\n"
            for item in config.get('knowledge_base', []):
                if isinstance(item, dict):
                    knowledge_context += f"- {item.get('source', '')}: {item.get('content_preview', '')}\n"
        
        # Build context
        context = f"""Você é um {config.get('name', 'Agente Imobiliário')} com o seguinte comportamento: {config.get('behavior', 'Profissional e cordial')}.

Roteiro a seguir:
{chr(10).join([f"- {step}" for step in config.get('script', [])])}

Informações do cliente:
- Nome: {lead.get('name')}
- Telefone: {lead.get('phone')}
- Status: {lead.get('status')}

{knowledge_context}

Histórico da conversa:
{chr(10).join([f"{msg.get('sender', 'desconhecido')}: {msg.get('message', '')}" for msg in recent_messages[-5:]])}

Responda de forma natural, seguindo seu roteiro e comportamento. Use as informações da empresa quando relevante. Seja objetivo e útil."""

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

# Live Chat Routes
@api_router.get("/live-conversations", response_model=List[LiveConversation])
async def get_live_conversations():
    conversations = await db.live_conversations.find().sort("last_message_time", -1).to_list(1000)
    return [LiveConversation(**parse_from_mongo(conv)) for conv in conversations]

@api_router.post("/live-conversations", response_model=LiveConversation)
async def create_live_conversation(conv: LiveConversationCreate):
    conv_dict = conv.dict()
    conv_obj = LiveConversation(**conv_dict)
    conv_data = prepare_for_mongo(conv_obj.dict())
    await db.live_conversations.insert_one(conv_data)
    return conv_obj

@api_router.put("/live-conversations/{conv_id}/assign")
async def assign_conversation(conv_id: str, request_body: dict):
    attendant_name = request_body.get("attendant_name", "")
    await db.live_conversations.update_one(
        {"id": conv_id},
        {"$set": {"assigned_to": attendant_name, "status": "em_atendimento"}}
    )
    return {"message": "Conversa atribuída com sucesso"}

@api_router.put("/live-conversations/{conv_id}/return-to-bot") 
async def return_to_bot(conv_id: str):
    await db.live_conversations.update_one(
        {"id": conv_id},
        {"$set": {"assigned_to": None, "status": "novo"}}
    )
    return {"message": "Conversa devolvida para o bot"}

@api_router.put("/live-conversations/{conv_id}/close")
async def close_conversation(conv_id: str):
    await db.live_conversations.update_one(
        {"id": conv_id},
        {"$set": {"status": "fechado"}}
    )
    return {"message": "Conversa encerrada"}

# WhatsApp Integration Routes
@api_router.get("/whatsapp-integration", response_model=WhatsAppIntegration)
async def get_whatsapp_integration():
    integration = await db.whatsapp_integrations.find_one({}, sort=[("created_at", -1)])
    if not integration:
        # Return default config
        default_integration = WhatsAppIntegration()
        integration_data = prepare_for_mongo(default_integration.dict())
        await db.whatsapp_integrations.insert_one(integration_data)
        return default_integration
    integration = parse_from_mongo(integration)
    return WhatsAppIntegration(**integration)

# WhatsApp Management Routes
@api_router.get("/whatsapp/qr-code")
async def get_whatsapp_qr():
    """
    Gera QR Code para conectar WhatsApp
    """
    try:
        import requests
        
        # Call Evolution API to get QR code
        response = requests.get(
            "https://api.airys.com.br/instance/connect/propbot-new",
            headers={"apikey": "4bb4d6a9f91c3b16342a251cba010a9c"}
        )
        
        if response.status_code == 200:
            data = response.json()
            return {
                "qr_code": data.get("base64", ""),
                "code": data.get("code", ""),
                "status": "success"
            }
        else:
            return {"status": "error", "message": "Erro ao gerar QR Code"}
            
    except Exception as e:
        logging.error(f"Error getting QR code: {str(e)}")
        return {"status": "error", "message": str(e)}

@api_router.get("/whatsapp/status")
async def get_whatsapp_status():
    """
    Verifica status da conexão WhatsApp
    """
    try:
        import requests
        
        # Check instance status
        response = requests.get(
            "https://api.airys.com.br/instance/fetchInstances",
            headers={"apikey": "4bb4d6a9f91c3b16342a251cba010a9c"}
        )
        
        if response.status_code == 200:
            instances = response.json()
            propbot_instance = None
            
            for instance in instances:
                if instance.get("name") == "propbot-new":
                    propbot_instance = instance
                    break
            
            if propbot_instance:
                status = propbot_instance.get("connectionStatus", "close")
                profile_name = propbot_instance.get("profileName", "")
                owner_jid = propbot_instance.get("ownerJid", "")
                phone = owner_jid.replace("@s.whatsapp.net", "") if owner_jid else ""
                
                return {
                    "status": "success",
                    "connected": status == "open",
                    "connection_status": status,
                    "profile_name": profile_name,
                    "phone": phone
                }
            else:
                return {"status": "error", "message": "Instância não encontrada"}
        else:
            return {"status": "error", "message": "Erro ao verificar status"}
            
    except Exception as e:
        logging.error(f"Error checking WhatsApp status: {str(e)}")
        return {"status": "error", "message": str(e)}

@api_router.post("/whatsapp/send-message")
async def send_message_to_whatsapp(request_body: dict):
    """
    Envia mensagem diretamente para WhatsApp
    """
    try:
        lead_id = request_body.get('lead_id')
        message = request_body.get('message')
        
        if not lead_id or not message:
            raise HTTPException(status_code=400, detail="lead_id e message são obrigatórios")
        
        await send_whatsapp_message(lead_id, message)
        return {"status": "success", "message": "Mensagem enviada para WhatsApp"}
        
    except Exception as e:
        logging.error(f"Error in send_message_to_whatsapp: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
@api_router.post("/whatsapp/disconnect")
async def disconnect_whatsapp():
    """
    Desconecta WhatsApp
    """
    try:
        import requests
        
        response = requests.delete(
            "https://api.airys.com.br/instance/logout/propbot-new",
            headers={"apikey": "4bb4d6a9f91c3b16342a251cba010a9c"}
        )
        
        if response.status_code == 200:
            return {"status": "success", "message": "WhatsApp desconectado"}
        else:
            return {"status": "error", "message": "Erro ao desconectar"}
            
    except Exception as e:
        logging.error(f"Error disconnecting WhatsApp: {str(e)}")
        return {"status": "error", "message": str(e)}

# N8N Integration Routes
@api_router.post("/n8n/webhook")
async def n8n_webhook(request_body: dict):
    """
    Endpoint para receber respostas do n8n
    """
    try:
        lead_id = request_body.get('lead_id')
        message = request_body.get('message')
        action = request_body.get('action', 'send_message')
        
        if action == 'send_message' and lead_id and message:
            # Send message back to WhatsApp
            await send_whatsapp_message(lead_id, message)
            
            # Save as agent message
            agent_message = ChatMessage(
                lead_id=lead_id,
                sender='agent',
                sender_name='IA Avançada',
                message=message,
                channel='whatsapp'
            )
            message_data = prepare_for_mongo(agent_message.dict())
            await db.messages.insert_one(message_data)
            
            return {"status": "success"}
        
        elif action == 'update_lead':
            # Update lead information
            lead_updates = request_body.get('lead_updates', {})
            await db.leads.update_one(
                {"id": lead_id},
                {"$set": lead_updates}
            )
            return {"status": "lead_updated"}
            
        elif action == 'schedule_visit':
            # Handle visit scheduling
            visit_data = request_body.get('visit_data', {})
            # Implement scheduling logic here
            return {"status": "visit_scheduled"}
            
        return {"status": "unknown_action"}
        
    except Exception as e:
        logging.error(f"N8N webhook error: {str(e)}")
        return {"status": "error", "message": str(e)}

@api_router.post("/n8n/send-to-agent")
async def send_to_n8n_agent(request_body: dict):
    """
    Envia mensagem para processamento avançado no n8n
    """
    try:
        import requests
        
        lead_id = request_body.get('lead_id')
        message = request_body.get('message')
        
        # Get lead context
        lead = await db.leads.find_one({"id": lead_id})
        if not lead:
            raise HTTPException(status_code=404, detail="Lead não encontrado")
        
        # Get recent conversation history
        recent_messages = await db.messages.find({"lead_id": lead_id}).sort("timestamp", -1).limit(5).to_list(5)
        recent_messages.reverse()
        
        # Prepare context for n8n
        context = {
            "lead_id": lead_id,
            "lead_info": {
                "name": lead.get("name"),
                "phone": lead.get("phone"),
                "email": lead.get("email"),
                "status": lead.get("status"),
                "tags": lead.get("tags", []),
                "notes": lead.get("notes", "")
            },
            "message": message,
            "conversation_history": [
                {
                    "sender": msg.get("sender"),
                    "message": msg.get("message"),
                    "timestamp": msg.get("timestamp")
                } for msg in recent_messages
            ],
            "webhook_url": "https://propbot-mvp.preview.emergentagent.com/api/n8n/webhook"
        }
        
        # Send to n8n webhook (you'll configure this URL)
        n8n_webhook_url = "https://your-n8n-instance.com/webhook/propbot-agent"
        
        # For now, return the context that would be sent
        return {"status": "ready_for_n8n", "context": context}
        
    except Exception as e:
        logging.error(f"Error preparing for n8n: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Super Admin Routes
@api_router.get("/super-admin/stats", response_model=CompanyStats)
async def get_super_admin_stats():
    """
    Estatísticas gerais do sistema para superadmin
    """
    try:
        # Count companies
        total_companies = await db.companies.count_documents({})
        active_companies = await db.companies.count_documents({"status": "ativa"})
        
        # Count users
        total_users = await db.users.count_documents({})
        
        # Count leads (from all companies)
        total_leads = await db.leads.count_documents({})
        
        # Companies by plan
        companies_by_plan = {}
        plans = ["basic", "premium", "enterprise"]
        for plan in plans:
            count = await db.companies.count_documents({"plan": plan})
            companies_by_plan[plan] = count
        
        return CompanyStats(
            total_companies=total_companies,
            active_companies=active_companies,
            total_users=total_users,
            total_leads=total_leads,
            companies_by_plan=companies_by_plan
        )
        
    except Exception as e:
        logging.error(f"Error getting super admin stats: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/super-admin/companies", response_model=List[Company])
async def get_all_companies():
    """
    Lista todas as empresas do sistema
    """
    try:
        companies = await db.companies.find().sort("created_at", -1).to_list(1000)
        return [Company(**parse_from_mongo(company)) for company in companies]
    except Exception as e:
        logging.error(f"Error getting companies: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/super-admin/companies", response_model=Company)
async def create_company(company: CompanyCreate):
    """
    Cria uma nova empresa
    """
    try:
        company_dict = company.dict()
        company_obj = Company(**company_dict)
        company_data = prepare_for_mongo(company_obj.dict())
        await db.companies.insert_one(company_data)
        
        # Log activity
        await log_activity("", "", "COMPANY_CREATED", f"Empresa {company.name} criada")
        
        return company_obj
    except Exception as e:
        logging.error(f"Error creating company: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/super-admin/companies/{company_id}", response_model=Company)
async def get_company(company_id: str):
    """
    Obtém dados de uma empresa específica
    """
    try:
        company = await db.companies.find_one({"id": company_id})
        if not company:
            raise HTTPException(status_code=404, detail="Empresa não encontrada")
        company = parse_from_mongo(company)
        return Company(**company)
    except Exception as e:
        logging.error(f"Error getting company: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.put("/super-admin/companies/{company_id}", response_model=Company)
async def update_company(company_id: str, company_update: CompanyCreate):
    """
    Atualiza dados de uma empresa
    """
    try:
        company_dict = company_update.dict()
        company_dict["last_activity"] = datetime.now(timezone.utc).isoformat()
        
        result = await db.companies.update_one(
            {"id": company_id},
            {"$set": prepare_for_mongo(company_dict)}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Empresa não encontrada")
        
        # Get updated company
        updated_company = await db.companies.find_one({"id": company_id})
        updated_company = parse_from_mongo(updated_company)
        
        # Log activity
        await log_activity(company_id, "", "COMPANY_UPDATED", f"Empresa {company_update.name} atualizada")
        
        return Company(**updated_company)
    except Exception as e:
        logging.error(f"Error updating company: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.put("/super-admin/companies/{company_id}/status")
async def update_company_status(company_id: str, status: str):
    """
    Atualiza status de uma empresa (ativa/inativa/suspensa)
    """
    try:
        if status not in ["ativa", "inativa", "suspensa"]:
            raise HTTPException(status_code=400, detail="Status inválido")
        
        result = await db.companies.update_one(
            {"id": company_id},
            {"$set": {"status": status, "last_activity": datetime.now(timezone.utc).isoformat()}}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Empresa não encontrada")
        
        # Log activity
        await log_activity(company_id, "", "COMPANY_STATUS_CHANGED", f"Status alterado para {status}")
        
        return {"message": f"Status alterado para {status}"}
    except Exception as e:
        logging.error(f"Error updating company status: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/super-admin/companies/{company_id}/users", response_model=List[User])
async def get_company_users(company_id: str):
    """
    Lista usuários de uma empresa
    """
    try:
        users = await db.users.find({"company_id": company_id}).sort("created_at", -1).to_list(1000)
        return [User(**parse_from_mongo(user)) for user in users]
    except Exception as e:
        logging.error(f"Error getting company users: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/super-admin/users", response_model=User)
async def create_user(user: UserCreate):
    """
    Cria um novo usuário
    """
    try:
        # Check if company exists
        company = await db.companies.find_one({"id": user.company_id})
        if not company:
            raise HTTPException(status_code=404, detail="Empresa não encontrada")
        
        # Check company limits
        current_users = await db.users.count_documents({"company_id": user.company_id, "status": "ativo"})
        if current_users >= company.get("limits", {}).get("max_users", 5):
            raise HTTPException(status_code=400, detail="Limite de usuários atingido")
        
        user_dict = user.dict()
        user_obj = User(**user_dict)
        user_data = prepare_for_mongo(user_obj.dict())
        await db.users.insert_one(user_data)
        
        # Log activity
        await log_activity(user.company_id, user_obj.id, "USER_CREATED", f"Usuário {user.name} criado")
        
        return user_obj
    except Exception as e:
        logging.error(f"Error creating user: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.put("/super-admin/users/{user_id}/role")
async def update_user_role(user_id: str, role: str):
    """
    Atualiza papel de um usuário
    """
    try:
        if role not in ["superadmin", "admin", "gestor", "colaborador"]:
            raise HTTPException(status_code=400, detail="Papel inválido")
        
        user = await db.users.find_one({"id": user_id})
        if not user:
            raise HTTPException(status_code=404, detail="Usuário não encontrado")
        
        await db.users.update_one(
            {"id": user_id},
            {"$set": {"role": role}}
        )
        
        # Log activity
        await log_activity(user.get("company_id", ""), user_id, "USER_ROLE_CHANGED", f"Papel alterado para {role}")
        
        return {"message": f"Papel alterado para {role}"}
    except Exception as e:
        logging.error(f"Error updating user role: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/super-admin/companies/{company_id}/logs")
async def get_company_logs(company_id: str, limit: int = 50):
    """
    Obtém logs de atividade de uma empresa
    """
    try:
        logs = await db.activity_logs.find({"company_id": company_id}).sort("timestamp", -1).limit(limit).to_list(limit)
        return [ActivityLog(**parse_from_mongo(log)) for log in logs]
    except Exception as e:
        logging.error(f"Error getting company logs: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

async def log_activity(company_id: str, user_id: str, action: str, description: str):
    """
    Helper function to log activities
    """
    try:
        activity = ActivityLog(
            company_id=company_id,
            user_id=user_id if user_id else None,
            action=action,
            description=description
        )
        activity_data = prepare_for_mongo(activity.dict())
        await db.activity_logs.insert_one(activity_data)
    except Exception as e:
        logging.error(f"Error logging activity: {str(e)}")
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

# Upload Knowledge Base (Legacy - keeping for compatibility)
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

# WhatsApp Webhook Handler
@api_router.post("/whatsapp/webhook")
async def whatsapp_webhook(request_body: dict):
    """
    Webhook para receber mensagens do WhatsApp
    """
    try:
        # Log incoming message
        logging.info(f"WhatsApp webhook received: {request_body}")
        
        # Extract message data (format varies by provider)
        if 'messages' in request_body:
            # WhatsApp Business API format
            for message in request_body['messages']:
                phone = message.get('from', '').replace('+', '')
                text = message.get('text', {}).get('body', '')
                message_id = message.get('id', '')
                contact_name = message.get('profile', {}).get('name', '')
                
                if text and phone:
                    await process_whatsapp_message(phone, text, message_id, contact_name)
                    
        elif 'data' in request_body:
            # Evolution API format
            data = request_body['data']
            phone = data.get('key', {}).get('remoteJid', '').replace('@s.whatsapp.net', '')
            text = data.get('message', {}).get('conversation', '') or \
                   data.get('message', {}).get('extendedTextMessage', {}).get('text', '')
            message_id = data.get('key', {}).get('id', '')
            # Try to get contact name from pushName or other fields
            contact_name = data.get('pushName', '') or data.get('verifiedBizName', '') or data.get('notifyName', '')
            
            if text and phone:
                await process_whatsapp_message(phone, text, message_id, contact_name)
        
        return {"status": "success"}
        
    except Exception as e:
        logging.error(f"WhatsApp webhook error: {str(e)}")
        return {"status": "error", "message": str(e)}

# Catch all webhook variations
@api_router.post("/whatsapp/webhook/{path:path}")
async def whatsapp_webhook_catchall(path: str, request_body: dict):
    """
    Catch all webhook variations from Evolution API
    """
    logging.info(f"WhatsApp webhook catchall for path: {path}")
    return await whatsapp_webhook(request_body)

async def process_whatsapp_message(phone: str, text: str, message_id: str, contact_name: str = None):
    """
    Processa mensagem recebida do WhatsApp
    """
    try:
        # Find or create lead
        lead = await db.leads.find_one({"phone": phone})
        if not lead:
            # Create new lead from WhatsApp message with real name
            lead_name = contact_name or f"Lead WhatsApp {phone[-4:]}"
            new_lead = Lead(
                name=lead_name,
                phone=phone,
                status="novo_lead"
            )
            lead_data = prepare_for_mongo(new_lead.dict())
            await db.leads.insert_one(lead_data)
            lead = new_lead.dict()
        else:
            # Update lead name if we got a better one
            if contact_name and lead.get("name", "").startswith("Lead WhatsApp"):
                await db.leads.update_one(
                    {"id": lead["id"]},
                    {"$set": {"name": contact_name}}
                )
                lead["name"] = contact_name
        
        # Save incoming message
        message = ChatMessage(
            lead_id=lead['id'],
            sender='lead',
            message=text,
            channel='whatsapp'
        )
        message_data = prepare_for_mongo(message.dict())
        await db.messages.insert_one(message_data)
        
        # Create/update live conversation
        conversation = await db.live_conversations.find_one({"lead_id": lead['id']})
        if not conversation:
            new_conversation = LiveConversation(
                lead_id=lead['id'],
                status='novo',
                channel='whatsapp',
                last_message=text
            )
            conv_data = prepare_for_mongo(new_conversation.dict())
            await db.live_conversations.insert_one(conv_data)
        else:
            await db.live_conversations.update_one(
                {"id": conversation['id']},
                {"$set": {
                    "last_message": text,
                    "last_message_time": datetime.now(timezone.utc).isoformat(),
                    "status": "novo"
                }}
            )
        
        # Auto-respond with AI if no human agent assigned
        if not conversation or not conversation.get('assigned_to'):
            await generate_ai_response_whatsapp(lead['id'], text)
            
    except Exception as e:
        logging.error(f"Error processing WhatsApp message: {str(e)}")

async def generate_ai_response_whatsapp(lead_id: str, user_message: str):
    """
    Gera resposta automática da IA para WhatsApp
    """
    try:
        # Get AI response (reuse existing logic)
        response = await get_ai_response(lead_id, {"message": user_message})
        ai_text = response.get("response", "")
        
        if ai_text:
            # Send response back to WhatsApp
            await send_whatsapp_message(lead_id, ai_text)
            
    except Exception as e:
        logging.error(f"Error generating AI response for WhatsApp: {str(e)}")

async def send_whatsapp_message(lead_id: str, message: str):
    """
    Envia mensagem para WhatsApp via Evolution API
    """
    try:
        import requests
        
        # Get lead phone
        lead = await db.leads.find_one({"id": lead_id})
        if not lead:
            return
            
        phone = lead.get('phone', '')
        
        # Send via Evolution API
        response = requests.post(
            "https://api.airys.com.br/message/sendText/propbot-new",
            headers={
                "apikey": "4bb4d6a9f91c3b16342a251cba010a9c",
                "Content-Type": "application/json"
            },
            json={
                "number": phone,
                "text": message
            }
        )
        
        if response.status_code == 201:
            logging.info(f"WhatsApp message sent successfully to {phone}")
        else:
            logging.error(f"Error sending WhatsApp message: {response.text}")
        
        # Save outgoing message to database
        outgoing_message = ChatMessage(
            lead_id=lead_id,
            sender='human',
            sender_name='Atendente',
            message=message,
            channel='whatsapp'
        )
        message_data = prepare_for_mongo(outgoing_message.dict())
        await db.messages.insert_one(message_data)
        
    except Exception as e:
        logging.error(f"Error sending WhatsApp message: {str(e)}")

@api_router.get("/whatsapp/webhook")  
async def whatsapp_webhook_verify(hub_mode: str = None, hub_verify_token: str = None, hub_challenge: str = None):
    """
    Verificação do webhook do WhatsApp Business API
    """
    verify_token = "propbot_verify_token_123"  # Configure this
    
    if hub_mode == "subscribe" and hub_challenge:
        if hub_verify_token == verify_token:
            return int(hub_challenge)
        else:
            return {"error": "Invalid verify token"}
    
    return {"status": "webhook endpoint active"}

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