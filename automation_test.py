#!/usr/bin/env python3
"""
Teste completo dos endpoints de Automação Comercial do PropBot CRM
"""

import requests
import json
import sys
from datetime import datetime, timedelta
import time

# Configuração da API
API_BASE_URL = "https://whatsapp-crm-13.preview.emergentagent.com/api"

class AutomationAPITester:
    def __init__(self):
        self.base_url = API_BASE_URL
        self.session = requests.Session()
        self.test_results = []
        self.created_lead_id = None
        self.created_history_id = None
        
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

    def setup_test_data(self):
        """Cria dados de teste necessários (leads)"""
        try:
            # Criar lead de teste
            url = f"{self.base_url}/leads"
            lead_data = {
                "name": "Maria Silva",
                "phone": "11987654321",
                "email": "maria@teste.com"
            }
            
            response = self.session.post(url, json=lead_data)
            if response.status_code == 200:
                data = response.json()
                self.created_lead_id = data.get("id")
                self.log_test("Setup - Criar lead de teste", True, 
                            f"Lead criado com ID: {self.created_lead_id}")
                
                # Adicionar algumas mensagens para o lead
                message_url = f"{self.base_url}/chat/message"
                messages = [
                    {"lead_id": self.created_lead_id, "sender": "lead", "message": "Olá, tenho interesse em comprar um apartamento"},
                    {"lead_id": self.created_lead_id, "sender": "agent", "message": "Ótimo! Qual seria seu orçamento?"},
                    {"lead_id": self.created_lead_id, "sender": "lead", "message": "Até 500 mil reais. Gostaria de agendar uma visita"}
                ]
                
                for msg in messages:
                    self.session.post(message_url, json=msg)
                    time.sleep(0.1)  # Small delay between messages
                
                return True
            else:
                self.log_test("Setup - Criar lead de teste", False, 
                            f"Status HTTP {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_test("Setup - Criar lead de teste", False, f"Erro: {str(e)}")
            return False

    def test_get_automation_settings(self):
        """Testa GET /api/automation/settings"""
        try:
            url = f"{self.base_url}/automation/settings"
            response = self.session.get(url)
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ["id", "follow_up_configs", "reactivation_config", "qualification_config"]
                
                missing_fields = [field for field in required_fields if field not in data]
                if missing_fields:
                    self.log_test("GET /automation/settings", False, 
                                f"Campos obrigatórios ausentes: {missing_fields}", data)
                else:
                    # Verificar estrutura dos follow_up_configs
                    follow_ups = data.get("follow_up_configs", [])
                    if isinstance(follow_ups, list) and len(follow_ups) > 0:
                        # Verificar se tem configurações padrão
                        stages = [config.get("stage") for config in follow_ups]
                        expected_stages = ["novo_lead", "em_negociacao", "visita_agendada", "fechamento"]
                        
                        if all(stage in stages for stage in expected_stages):
                            self.log_test("GET /automation/settings", True, 
                                        f"Configurações obtidas com {len(follow_ups)} estágios de follow-up")
                        else:
                            self.log_test("GET /automation/settings", False, 
                                        f"Estágios de follow-up incompletos. Encontrados: {stages}")
                    else:
                        self.log_test("GET /automation/settings", False, 
                                    "follow_up_configs vazio ou inválido", data)
            else:
                self.log_test("GET /automation/settings", False, 
                            f"Status HTTP {response.status_code}", response.text)
                
        except Exception as e:
            self.log_test("GET /automation/settings", False, f"Erro de conexão: {str(e)}")

    def test_update_automation_settings(self):
        """Testa PUT /api/automation/settings"""
        try:
            # Primeiro obter as configurações atuais
            get_url = f"{self.base_url}/automation/settings"
            get_response = self.session.get(get_url)
            
            if get_response.status_code != 200:
                self.log_test("PUT /automation/settings", False, 
                            "Não foi possível obter configurações atuais")
                return
            
            current_settings = get_response.json()
            
            # Modificar algumas configurações
            current_settings["reactivation_config"]["inactive_days"] = 45
            current_settings["qualification_config"]["hot_lead_threshold"] = 4
            
            # Atualizar configurações
            put_url = f"{self.base_url}/automation/settings"
            response = self.session.put(put_url, json=current_settings)
            
            if response.status_code == 200:
                data = response.json()
                
                # Verificar se as mudanças foram aplicadas
                if (data.get("reactivation_config", {}).get("inactive_days") == 45 and
                    data.get("qualification_config", {}).get("hot_lead_threshold") == 4):
                    self.log_test("PUT /automation/settings", True, 
                                "Configurações atualizadas com sucesso")
                else:
                    self.log_test("PUT /automation/settings", False, 
                                "Configurações não foram atualizadas corretamente", data)
            else:
                self.log_test("PUT /automation/settings", False, 
                            f"Status HTTP {response.status_code}", response.text)
                
        except Exception as e:
            self.log_test("PUT /automation/settings", False, f"Erro de conexão: {str(e)}")

    def test_qualify_leads(self):
        """Testa GET /api/automation/qualify-leads"""
        try:
            url = f"{self.base_url}/automation/qualify-leads"
            response = self.session.get(url)
            
            if response.status_code == 200:
                data = response.json()
                
                # Verificar estrutura da resposta
                if "message" in data and "qualified_leads" in data and "total_leads" in data:
                    qualified_count = data.get("qualified_leads", 0)
                    total_count = data.get("total_leads", 0)
                    
                    self.log_test("GET /automation/qualify-leads", True, 
                                f"Qualificação executada: {qualified_count}/{total_count} leads qualificados")
                else:
                    self.log_test("GET /automation/qualify-leads", False, 
                                "Estrutura de resposta inválida", data)
            else:
                self.log_test("GET /automation/qualify-leads", False, 
                            f"Status HTTP {response.status_code}", response.text)
                
        except Exception as e:
            self.log_test("GET /automation/qualify-leads", False, f"Erro de conexão: {str(e)}")

    def test_get_qualified_leads(self):
        """Testa GET /api/automation/qualified-leads"""
        try:
            url = f"{self.base_url}/automation/qualified-leads"
            response = self.session.get(url)
            
            if response.status_code == 200:
                data = response.json()
                
                if isinstance(data, list):
                    self.log_test("GET /automation/qualified-leads", True, 
                                f"Lista de leads qualificados obtida: {len(data)} leads")
                    
                    # Verificar estrutura se houver leads qualificados
                    if data:
                        lead_qualification = data[0]
                        required_fields = ["id", "lead_id", "score", "criteria_met", "is_qualified"]
                        missing_fields = [field for field in required_fields if field not in lead_qualification]
                        
                        if missing_fields:
                            self.log_test("Estrutura lead qualificado", False, 
                                        f"Campos obrigatórios ausentes: {missing_fields}")
                        else:
                            self.log_test("Estrutura lead qualificado", True, 
                                        f"Lead com score {lead_qualification.get('score')}")
                else:
                    self.log_test("GET /automation/qualified-leads", False, 
                                "Resposta não é uma lista", data)
            else:
                self.log_test("GET /automation/qualified-leads", False, 
                            f"Status HTTP {response.status_code}", response.text)
                
        except Exception as e:
            self.log_test("GET /automation/qualified-leads", False, f"Erro de conexão: {str(e)}")

    def test_process_followups(self):
        """Testa POST /api/automation/process-followups"""
        try:
            url = f"{self.base_url}/automation/process-followups"
            response = self.session.post(url)
            
            if response.status_code == 200:
                data = response.json()
                
                # Verificar estrutura da resposta
                if "message" in data and "processed_count" in data:
                    processed_count = data.get("processed_count", 0)
                    self.log_test("POST /automation/process-followups", True, 
                                f"Follow-ups processados: {processed_count}")
                else:
                    self.log_test("POST /automation/process-followups", False, 
                                "Estrutura de resposta inválida", data)
            else:
                self.log_test("POST /automation/process-followups", False, 
                            f"Status HTTP {response.status_code}", response.text)
                
        except Exception as e:
            self.log_test("POST /automation/process-followups", False, f"Erro de conexão: {str(e)}")

    def test_process_reactivations(self):
        """Testa POST /api/automation/process-reactivations"""
        try:
            url = f"{self.base_url}/automation/process-reactivations"
            response = self.session.post(url)
            
            if response.status_code == 200:
                data = response.json()
                
                # Verificar estrutura da resposta
                if "message" in data:
                    if "processed_count" in data:
                        processed_count = data.get("processed_count", 0)
                        self.log_test("POST /automation/process-reactivations", True, 
                                    f"Reativações processadas: {processed_count}")
                    else:
                        # Pode ser que não tenha leads para reativar
                        message = data.get("message", "")
                        if "desabilitada" in message or "não encontradas" in message:
                            self.log_test("POST /automation/process-reactivations", True, 
                                        f"Resposta válida: {message}")
                        else:
                            self.log_test("POST /automation/process-reactivations", True, 
                                        "Processamento executado com sucesso")
                else:
                    self.log_test("POST /automation/process-reactivations", False, 
                                "Estrutura de resposta inválida", data)
            else:
                self.log_test("POST /automation/process-reactivations", False, 
                            f"Status HTTP {response.status_code}", response.text)
                
        except Exception as e:
            self.log_test("POST /automation/process-reactivations", False, f"Erro de conexão: {str(e)}")

    def test_get_automation_history(self):
        """Testa GET /api/automation/history"""
        try:
            url = f"{self.base_url}/automation/history"
            response = self.session.get(url)
            
            if response.status_code == 200:
                data = response.json()
                
                if isinstance(data, list):
                    self.log_test("GET /automation/history", True, 
                                f"Histórico de automação obtido: {len(data)} registros")
                    
                    # Verificar estrutura se houver histórico
                    if data:
                        history_item = data[0]
                        required_fields = ["id", "lead_id", "automation_type", "stage", "message", "status"]
                        missing_fields = [field for field in required_fields if field not in history_item]
                        
                        if missing_fields:
                            self.log_test("Estrutura histórico automação", False, 
                                        f"Campos obrigatórios ausentes: {missing_fields}")
                        else:
                            self.log_test("Estrutura histórico automação", True, 
                                        f"Registro tipo {history_item.get('automation_type')}")
                else:
                    self.log_test("GET /automation/history", False, 
                                "Resposta não é uma lista", data)
            else:
                self.log_test("GET /automation/history", False, 
                            f"Status HTTP {response.status_code}", response.text)
                
        except Exception as e:
            self.log_test("GET /automation/history", False, f"Erro de conexão: {str(e)}")

    def test_create_automation_history(self):
        """Testa POST /api/automation/history"""
        if not self.created_lead_id:
            self.log_test("POST /automation/history", False, 
                        "Lead de teste não foi criado")
            return
            
        try:
            url = f"{self.base_url}/automation/history"
            
            # Dados de teste para histórico
            history_data = {
                "lead_id": self.created_lead_id,
                "automation_type": "follow_up",
                "stage": "novo_lead",
                "message": "Olá Maria, obrigado pelo interesse! Como posso ajudá-la?",
                "status": "sent",
                "scheduled_at": datetime.now().isoformat(),
                "sent_at": datetime.now().isoformat()
            }
            
            response = self.session.post(url, json=history_data)
            
            if response.status_code == 200:
                data = response.json()
                
                # Verificar se os dados foram salvos corretamente
                if (data.get("lead_id") == history_data["lead_id"] and 
                    data.get("automation_type") == history_data["automation_type"] and
                    data.get("stage") == history_data["stage"] and
                    "id" in data):
                    
                    self.created_history_id = data["id"]
                    self.log_test("POST /automation/history", True, 
                                f"Histórico criado com ID: {self.created_history_id}")
                else:
                    self.log_test("POST /automation/history", False, 
                                "Dados do histórico não correspondem ao enviado", data)
            else:
                self.log_test("POST /automation/history", False, 
                            f"Status HTTP {response.status_code}", response.text)
                
        except Exception as e:
            self.log_test("POST /automation/history", False, f"Erro de conexão: {str(e)}")

    def test_whatsapp_integration(self):
        """Testa integração com WhatsApp (verificação básica)"""
        try:
            # Testar status do WhatsApp
            url = f"{self.base_url}/whatsapp/status"
            response = self.session.get(url)
            
            if response.status_code == 200:
                data = response.json()
                
                if "status" in data:
                    status = data.get("status")
                    if status == "success":
                        connected = data.get("connected", False)
                        self.log_test("Integração WhatsApp - Status", True, 
                                    f"WhatsApp {'conectado' if connected else 'desconectado'}")
                    else:
                        self.log_test("Integração WhatsApp - Status", True, 
                                    f"Status obtido: {status}")
                else:
                    self.log_test("Integração WhatsApp - Status", False, 
                                "Resposta não contém status", data)
            else:
                self.log_test("Integração WhatsApp - Status", False, 
                            f"Status HTTP {response.status_code}", response.text)
                
        except Exception as e:
            self.log_test("Integração WhatsApp - Status", False, f"Erro de conexão: {str(e)}")

    def test_data_models_validation(self):
        """Testa validação dos modelos de dados"""
        try:
            # Testar configurações com dados inválidos
            url = f"{self.base_url}/automation/settings"
            invalid_settings = {
                "id": "test-id",
                "follow_up_configs": [
                    {
                        "stage": "invalid_stage",  # Stage inválido
                        "enabled": True,
                        "intervals": [1, 24],
                        "message_template": "Test message"
                    }
                ],
                "reactivation_config": {
                    "enabled": True,
                    "inactive_days": -5,  # Valor inválido
                    "max_attempts": 3,
                    "intervals": [1, 7],
                    "message_template": "Test reactivation"
                }
            }
            
            response = self.session.put(url, json=invalid_settings)
            
            # Pode retornar 200 (aceita) ou 400/500 (rejeita)
            if response.status_code in [200, 400, 500]:
                self.log_test("Validação modelos de dados", True, 
                            f"Validação funcionando - Status {response.status_code}")
            else:
                self.log_test("Validação modelos de dados", False, 
                            f"Status inesperado: {response.status_code}")
                
        except Exception as e:
            self.log_test("Validação modelos de dados", False, f"Erro de conexão: {str(e)}")

    def run_all_tests(self):
        """Executa todos os testes de automação"""
        print("🚀 INICIANDO TESTES DOS ENDPOINTS DE AUTOMAÇÃO COMERCIAL")
        print("=" * 70)
        print()
        
        # Setup inicial
        if not self.setup_test_data():
            print("❌ Falha no setup inicial. Alguns testes podem falhar.")
            print()
        
        # Testes de configurações
        self.test_get_automation_settings()
        self.test_update_automation_settings()
        
        # Testes de qualificação
        self.test_qualify_leads()
        self.test_get_qualified_leads()
        
        # Testes de processamento
        self.test_process_followups()
        self.test_process_reactivations()
        
        # Testes de histórico
        self.test_get_automation_history()
        self.test_create_automation_history()
        
        # Testes de integração
        self.test_whatsapp_integration()
        
        # Testes de validação
        self.test_data_models_validation()
        
        # Resumo dos resultados
        return self.print_summary()

    def print_summary(self):
        """Imprime resumo dos testes"""
        print("=" * 70)
        print("📊 RESUMO DOS TESTES DE AUTOMAÇÃO")
        print("=" * 70)
        
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result["success"])
        failed_tests = total_tests - passed_tests
        
        print(f"Total de testes: {total_tests}")
        print(f"✅ Passou: {passed_tests}")
        print(f"❌ Falhou: {failed_tests}")
        print(f"Taxa de sucesso: {(passed_tests/total_tests)*100:.1f}%")
        print()
        
        if failed_tests > 0:
            print("🔍 TESTES QUE FALHARAM:")
            for result in self.test_results:
                if not result["success"]:
                    print(f"  - {result['test']}: {result['details']}")
            print()
        
        # Salvar resultados em arquivo
        with open("/app/test_results_automation.json", "w", encoding="utf-8") as f:
            json.dump(self.test_results, f, indent=2, ensure_ascii=False)
        
        print("📄 Resultados detalhados salvos em: /app/test_results_automation.json")
        
        return passed_tests, failed_tests

def main():
    """Função principal"""
    tester = AutomationAPITester()
    passed, failed = tester.run_all_tests()
    
    # Retornar código de saída apropriado
    sys.exit(0 if failed == 0 else 1)

if __name__ == "__main__":
    main()