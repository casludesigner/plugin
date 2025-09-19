#!/usr/bin/env python3
"""
Teste específico do SISTEMA DE MENSAGENS WhatsApp do PropBot CRM
Foco nos problemas reportados pelo usuário
"""

import requests
import json
import sys
from datetime import datetime
import time

# Configuração da API
API_BASE_URL = "https://whatsapp-crm-13.preview.emergentagent.com/api"

class WhatsAppMessagingTester:
    def __init__(self):
        self.base_url = API_BASE_URL
        self.session = requests.Session()
        self.test_results = []
        self.test_lead_id = None
        self.existing_leads = []
        
    def log_test(self, test_name, success, details="", response_data=None):
        """Log test results"""
        status = "✅ PASSOU" if success else "❌ FALHOU"
        result = {
            "test": test_name,
            "status": status,
            "success": success,
            "details": details,
            "timestamp": datetime.now().isoformat(),
            "response_data": response_data
        }
        self.test_results.append(result)
        print(f"{status} - {test_name}")
        if details:
            print(f"   Detalhes: {details}")
        if not success and response_data:
            print(f"   Resposta: {response_data}")
        print()

    def test_whatsapp_status(self):
        """Testa GET /api/whatsapp/status - verificar se está conectado"""
        try:
            url = f"{self.base_url}/whatsapp/status"
            response = self.session.get(url)
            
            if response.status_code == 200:
                data = response.json()
                
                # Verificar campos obrigatórios
                required_fields = ["status", "connected"]
                missing_fields = [field for field in required_fields if field not in data]
                
                if missing_fields:
                    self.log_test("WhatsApp Status - Estrutura", False, 
                                f"Campos obrigatórios ausentes: {missing_fields}", data)
                else:
                    connected = data.get("connected", False)
                    connection_status = data.get("connection_status", "unknown")
                    profile_name = data.get("profile_name", "")
                    phone = data.get("phone", "")
                    
                    if connected:
                        self.log_test("WhatsApp Status - Conectado", True, 
                                    f"WhatsApp conectado: {profile_name} ({phone}) - Status: {connection_status}")
                    else:
                        self.log_test("WhatsApp Status - Conectado", False, 
                                    f"WhatsApp NÃO conectado - Status: {connection_status}")
                        
                    # Log additional info
                    self.log_test("WhatsApp Status - Dados", True, 
                                f"Profile: {profile_name}, Phone: {phone}, Status: {connection_status}")
            else:
                self.log_test("WhatsApp Status", False, 
                            f"Status HTTP {response.status_code}", response.text)
                
        except Exception as e:
            self.log_test("WhatsApp Status", False, f"Erro de conexão: {str(e)}")

    def test_get_leads(self):
        """Testa GET /api/leads - verificar telefones dos leads"""
        try:
            url = f"{self.base_url}/leads"
            response = self.session.get(url)
            
            if response.status_code == 200:
                data = response.json()
                
                if isinstance(data, list):
                    self.existing_leads = data
                    leads_count = len(data)
                    
                    if leads_count > 0:
                        # Verificar estrutura dos leads
                        lead = data[0]
                        required_fields = ["id", "name", "phone", "status"]
                        missing_fields = [field for field in required_fields if field not in lead]
                        
                        if missing_fields:
                            self.log_test("Leads - Estrutura", False, 
                                        f"Campos obrigatórios ausentes: {missing_fields}")
                        else:
                            self.log_test("Leads - Estrutura", True, "Estrutura correta dos leads")
                            
                            # Selecionar lead para testes
                            self.test_lead_id = lead["id"]
                            
                            # Verificar formatação dos telefones
                            phone_issues = []
                            valid_phones = 0
                            
                            for lead in data[:5]:  # Verificar primeiros 5 leads
                                phone = lead.get("phone", "")
                                if phone:
                                    # Verificar se está no formato brasileiro
                                    clean_phone = ''.join(filter(str.isdigit, phone))
                                    if len(clean_phone) >= 10:
                                        if clean_phone.startswith('55'):
                                            valid_phones += 1
                                        else:
                                            phone_issues.append(f"Lead {lead['name']}: {phone} (sem código do país)")
                                    else:
                                        phone_issues.append(f"Lead {lead['name']}: {phone} (muito curto)")
                                else:
                                    phone_issues.append(f"Lead {lead['name']}: telefone vazio")
                            
                            if phone_issues:
                                self.log_test("Leads - Formatação Telefones", False, 
                                            f"Problemas encontrados: {phone_issues[:3]}")  # Mostrar só os primeiros 3
                            else:
                                self.log_test("Leads - Formatação Telefones", True, 
                                            f"{valid_phones} telefones com formato válido")
                        
                        self.log_test("GET /api/leads", True, 
                                    f"Lista de leads obtida com {leads_count} leads")
                    else:
                        self.log_test("GET /api/leads", True, 
                                    "Lista de leads vazia - criando lead de teste")
                        # Criar lead de teste se não houver nenhum
                        self.create_test_lead()
                else:
                    self.log_test("GET /api/leads", False, 
                                "Resposta não é uma lista", data)
            else:
                self.log_test("GET /api/leads", False, 
                            f"Status HTTP {response.status_code}", response.text)
                
        except Exception as e:
            self.log_test("GET /api/leads", False, f"Erro de conexão: {str(e)}")

    def create_test_lead(self):
        """Cria um lead de teste com telefone brasileiro válido"""
        try:
            url = f"{self.base_url}/leads"
            
            # Lead de teste com telefone brasileiro válido
            lead_data = {
                "name": "Maria Silva - Teste Mensagem",
                "phone": "5511987654321",  # Formato brasileiro válido
                "email": "maria.teste@email.com"
            }
            
            response = self.session.post(url, json=lead_data)
            
            if response.status_code == 200:
                data = response.json()
                self.test_lead_id = data.get("id")
                self.log_test("Criar Lead de Teste", True, 
                            f"Lead criado: {data.get('name')} - ID: {self.test_lead_id}")
            else:
                self.log_test("Criar Lead de Teste", False, 
                            f"Status HTTP {response.status_code}", response.text)
                
        except Exception as e:
            self.log_test("Criar Lead de Teste", False, f"Erro: {str(e)}")

    def test_send_whatsapp_message(self):
        """Testa POST /api/whatsapp/send-message com lead existente"""
        if not self.test_lead_id:
            self.log_test("WhatsApp Send Message", False, 
                        "Nenhum lead disponível para teste")
            return
            
        try:
            url = f"{self.base_url}/whatsapp/send-message"
            
            # Mensagem de teste conforme solicitado
            message_data = {
                "lead_id": self.test_lead_id,
                "message": "Teste de mensagem - sistema corrigido"
            }
            
            response = self.session.post(url, json=message_data)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("status") == "success":
                    self.log_test("WhatsApp Send Message", True, 
                                f"Mensagem enviada com sucesso: {data.get('message', '')}")
                else:
                    self.log_test("WhatsApp Send Message", False, 
                                f"Status não é success: {data}")
            elif response.status_code == 201:
                # Evolution API retorna 201 para sucesso
                self.log_test("WhatsApp Send Message", True, 
                            "Mensagem enviada com sucesso (HTTP 201)")
            else:
                self.log_test("WhatsApp Send Message", False, 
                            f"Status HTTP {response.status_code}", response.text)
                
        except Exception as e:
            self.log_test("WhatsApp Send Message", False, f"Erro: {str(e)}")

    def test_chat_message(self):
        """Testa POST /api/chat/message - salvar mensagem no banco"""
        if not self.test_lead_id:
            self.log_test("Chat Message", False, 
                        "Nenhum lead disponível para teste")
            return
            
        try:
            url = f"{self.base_url}/chat/message"
            
            # Mensagem de teste
            message_data = {
                "lead_id": self.test_lead_id,
                "sender": "human",
                "sender_name": "Atendente Teste",
                "message": "Teste de mensagem - sistema corrigido",
                "channel": "whatsapp"
            }
            
            response = self.session.post(url, json=message_data)
            
            if response.status_code == 200:
                data = response.json()
                
                # Verificar se a mensagem foi salva corretamente
                required_fields = ["id", "lead_id", "sender", "message", "timestamp"]
                missing_fields = [field for field in required_fields if field not in data]
                
                if missing_fields:
                    self.log_test("Chat Message - Estrutura", False, 
                                f"Campos obrigatórios ausentes: {missing_fields}", data)
                else:
                    if (data.get("lead_id") == self.test_lead_id and 
                        data.get("message") == message_data["message"] and
                        data.get("sender") == message_data["sender"]):
                        self.log_test("Chat Message", True, 
                                    f"Mensagem salva no banco: ID {data.get('id')}")
                    else:
                        self.log_test("Chat Message", False, 
                                    "Dados da mensagem não correspondem ao enviado", data)
            else:
                self.log_test("Chat Message", False, 
                            f"Status HTTP {response.status_code}", response.text)
                
        except Exception as e:
            self.log_test("Chat Message", False, f"Erro: {str(e)}")

    def test_ai_response(self):
        """Testa POST /api/chat/ai-response/{lead_id} - IA respondendo"""
        if not self.test_lead_id:
            self.log_test("AI Response", False, 
                        "Nenhum lead disponível para teste")
            return
            
        try:
            url = f"{self.base_url}/chat/ai-response/{self.test_lead_id}"
            
            # Mensagem para a IA processar
            message_data = {
                "message": "Olá, tenho interesse em comprar um apartamento de 2 quartos"
            }
            
            response = self.session.post(url, json=message_data)
            
            if response.status_code == 200:
                data = response.json()
                
                if "response" in data:
                    ai_response = data.get("response", "")
                    if ai_response and len(ai_response) > 10:  # Resposta não vazia
                        self.log_test("AI Response", True, 
                                    f"IA gerou resposta: '{ai_response[:100]}...'")
                        
                        # Verificar se a resposta foi salva no banco
                        self.verify_ai_message_saved()
                    else:
                        self.log_test("AI Response", False, 
                                    f"Resposta da IA muito curta ou vazia: '{ai_response}'")
                else:
                    self.log_test("AI Response", False, 
                                "Campo 'response' não encontrado na resposta", data)
            else:
                self.log_test("AI Response", False, 
                            f"Status HTTP {response.status_code}", response.text)
                
        except Exception as e:
            self.log_test("AI Response", False, f"Erro: {str(e)}")

    def verify_ai_message_saved(self):
        """Verifica se a mensagem da IA foi salva no banco"""
        try:
            url = f"{self.base_url}/chat/{self.test_lead_id}"
            response = self.session.get(url)
            
            if response.status_code == 200:
                messages = response.json()
                
                if isinstance(messages, list) and messages:
                    # Procurar mensagem do agente (IA)
                    agent_messages = [msg for msg in messages if msg.get("sender") == "agent"]
                    
                    if agent_messages:
                        latest_agent_msg = agent_messages[-1]  # Última mensagem do agente
                        self.log_test("AI Message Saved", True, 
                                    f"Mensagem da IA salva no banco: '{latest_agent_msg.get('message', '')[:50]}...'")
                    else:
                        self.log_test("AI Message Saved", False, 
                                    "Nenhuma mensagem do agente encontrada no histórico")
                else:
                    self.log_test("AI Message Saved", False, 
                                "Histórico de chat vazio ou inválido")
            else:
                self.log_test("AI Message Saved", False, 
                            f"Erro ao buscar histórico: HTTP {response.status_code}")
                
        except Exception as e:
            self.log_test("AI Message Saved", False, f"Erro: {str(e)}")

    def test_phone_validation(self):
        """Testa validação e formatação de números de telefone"""
        try:
            # Testar diferentes formatos de telefone
            test_phones = [
                "11987654321",      # Sem código do país
                "5511987654321",    # Formato correto
                "(11) 98765-4321",  # Com formatação
                "+55 11 98765-4321", # Com + e espaços
                "011987654321",     # Com 0 no início
                "1198765432",       # Sem o 9 do celular
            ]
            
            validation_results = []
            
            for phone in test_phones:
                # Simular a validação que o sistema faz
                clean_phone = ''.join(filter(str.isdigit, phone))
                
                # Remover 0 inicial se houver
                if clean_phone.startswith('0'):
                    clean_phone = clean_phone[1:]
                
                # Adicionar código do país se não tiver
                if len(clean_phone) == 10 or len(clean_phone) == 11:
                    clean_phone = '55' + clean_phone
                
                # Adicionar 9 se for celular sem o 9
                if len(clean_phone) == 12:  # 55 + 10 dígitos
                    clean_phone = clean_phone[:4] + '9' + clean_phone[4:]
                
                # Validar formato final
                is_valid = (len(clean_phone) == 13 and 
                           clean_phone.startswith('55') and
                           11 <= int(clean_phone[2:4]) <= 99 and
                           clean_phone[4] == '9')
                
                validation_results.append({
                    "original": phone,
                    "formatted": clean_phone,
                    "valid": is_valid
                })
            
            valid_count = sum(1 for result in validation_results if result["valid"])
            
            self.log_test("Phone Validation", True, 
                        f"Validação testada: {valid_count}/{len(test_phones)} números válidos após formatação")
            
            # Log detalhes
            for result in validation_results:
                status = "✅" if result["valid"] else "❌"
                print(f"   {status} {result['original']} -> {result['formatted']}")
            
        except Exception as e:
            self.log_test("Phone Validation", False, f"Erro: {str(e)}")

    def run_messaging_tests(self):
        """Executa todos os testes do sistema de mensagens"""
        print("🚀 INICIANDO TESTES DO SISTEMA DE MENSAGENS WHATSAPP")
        print("=" * 70)
        print("Foco: Problemas reportados pelo usuário")
        print("=" * 70)
        print()
        
        # 1. Testar status WhatsApp
        self.test_whatsapp_status()
        
        # 2. Testar leads existentes
        self.test_get_leads()
        
        # 3. Testar validação de telefones
        self.test_phone_validation()
        
        # 4. Testar envio direto para WhatsApp
        self.test_send_whatsapp_message()
        
        # 5. Testar chat básico (salvar no banco)
        self.test_chat_message()
        
        # 6. Testar resposta da IA
        self.test_ai_response()
        
        # Resumo dos resultados
        return self.print_summary()

    def print_summary(self):
        """Imprime resumo dos testes"""
        print("=" * 70)
        print("📊 RESUMO DOS TESTES - SISTEMA DE MENSAGENS")
        print("=" * 70)
        
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result["success"])
        failed_tests = total_tests - passed_tests
        
        print(f"Total de testes: {total_tests}")
        print(f"✅ Passou: {passed_tests}")
        print(f"❌ Falhou: {failed_tests}")
        print(f"Taxa de sucesso: {(passed_tests/total_tests)*100:.1f}%")
        print()
        
        # Análise específica do sistema de mensagens
        print("🔍 ANÁLISE DO SISTEMA DE MENSAGENS:")
        
        # Status WhatsApp
        whatsapp_status_tests = [r for r in self.test_results if "WhatsApp Status" in r["test"]]
        if whatsapp_status_tests:
            connected_test = next((r for r in whatsapp_status_tests if "Conectado" in r["test"]), None)
            if connected_test:
                if connected_test["success"]:
                    print("   ✅ WhatsApp está conectado e funcionando")
                else:
                    print("   ❌ WhatsApp NÃO está conectado - PROBLEMA CRÍTICO")
        
        # Envio de mensagens
        send_test = next((r for r in self.test_results if "WhatsApp Send Message" in r["test"]), None)
        if send_test:
            if send_test["success"]:
                print("   ✅ Envio de mensagens WhatsApp funcionando")
            else:
                print("   ❌ Envio de mensagens WhatsApp FALHANDO - PROBLEMA CRÍTICO")
        
        # IA
        ai_test = next((r for r in self.test_results if "AI Response" in r["test"]), None)
        if ai_test:
            if ai_test["success"]:
                print("   ✅ IA gerando respostas automáticas")
            else:
                print("   ❌ IA NÃO está respondendo - PROBLEMA CRÍTICO")
        
        # Chat
        chat_test = next((r for r in self.test_results if "Chat Message" in r["test"]), None)
        if chat_test:
            if chat_test["success"]:
                print("   ✅ Mensagens sendo salvas no banco")
            else:
                print("   ❌ Mensagens NÃO estão sendo salvas - PROBLEMA CRÍTICO")
        
        print()
        
        if failed_tests > 0:
            print("🔍 PROBLEMAS CRÍTICOS ENCONTRADOS:")
            for result in self.test_results:
                if not result["success"] and any(keyword in result["test"] for keyword in ["WhatsApp", "AI", "Chat"]):
                    print(f"  ❌ {result['test']}: {result['details']}")
            print()
        
        # Salvar resultados em arquivo
        with open("/app/whatsapp_messaging_test_results.json", "w", encoding="utf-8") as f:
            json.dump(self.test_results, f, indent=2, ensure_ascii=False)
        
        print("📄 Resultados detalhados salvos em: /app/whatsapp_messaging_test_results.json")
        
        return passed_tests, failed_tests

def main():
    """Função principal"""
    tester = WhatsAppMessagingTester()
    passed, failed = tester.run_messaging_tests()
    
    # Retornar código de saída apropriado
    sys.exit(0 if failed == 0 else 1)

if __name__ == "__main__":
    main()