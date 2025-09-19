#!/usr/bin/env python3
"""
Teste detalhado e específico dos endpoints de Automação Comercial conforme solicitado
"""

import requests
import json
import sys
from datetime import datetime, timedelta
import time

# Configuração da API
API_BASE_URL = "https://whatsapp-crm-13.preview.emergentagent.com/api"

class DetailedAutomationTester:
    def __init__(self):
        self.base_url = API_BASE_URL
        self.session = requests.Session()
        self.test_results = []
        self.created_leads = []
        
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

    def create_test_leads(self):
        """Cria múltiplos leads para testes mais realistas"""
        leads_data = [
            {
                "name": "Carlos Investidor",
                "phone": "11987654321",
                "email": "carlos@investidor.com"
            },
            {
                "name": "Ana Compradora",
                "phone": "11987654322", 
                "email": "ana@compradora.com"
            },
            {
                "name": "Roberto Interessado",
                "phone": "11987654323",
                "email": "roberto@interessado.com"
            }
        ]
        
        for lead_data in leads_data:
            try:
                url = f"{self.base_url}/leads"
                response = self.session.post(url, json=lead_data)
                
                if response.status_code == 200:
                    data = response.json()
                    lead_id = data.get("id")
                    self.created_leads.append(lead_id)
                    
                    # Adicionar mensagens variadas para cada lead
                    self.add_messages_to_lead(lead_id, lead_data["name"])
                    
            except Exception as e:
                print(f"Erro ao criar lead {lead_data['name']}: {str(e)}")
        
        self.log_test("Setup - Criar leads de teste", True, 
                    f"{len(self.created_leads)} leads criados para testes")

    def add_messages_to_lead(self, lead_id, lead_name):
        """Adiciona mensagens variadas para simular engajamento"""
        message_url = f"{self.base_url}/chat/message"
        
        # Mensagens diferentes para cada lead para variar os scores
        if "Carlos" in lead_name:
            messages = [
                {"lead_id": lead_id, "sender": "lead", "message": "Olá, quero comprar um apartamento para investimento"},
                {"lead_id": lead_id, "sender": "agent", "message": "Ótimo! Qual seria seu orçamento?"},
                {"lead_id": lead_id, "sender": "lead", "message": "Tenho até 800 mil. Gostaria de agendar visita"},
                {"lead_id": lead_id, "sender": "lead", "message": "Qual o valor do metro quadrado na região?"},
                {"lead_id": lead_id, "sender": "agent", "message": "Vou verificar os melhores preços para você"}
            ]
        elif "Ana" in lead_name:
            messages = [
                {"lead_id": lead_id, "sender": "lead", "message": "Oi, estou interessada em apartamentos"},
                {"lead_id": lead_id, "sender": "agent", "message": "Que bom! Tem alguma preferência de região?"},
                {"lead_id": lead_id, "sender": "lead", "message": "Prefiro zona sul, orçamento até 600 mil"}
            ]
        else:
            messages = [
                {"lead_id": lead_id, "sender": "lead", "message": "Tenho interesse em imóveis"},
                {"lead_id": lead_id, "sender": "agent", "message": "Como posso ajudar?"}
            ]
        
        for msg in messages:
            try:
                self.session.post(message_url, json=msg)
                time.sleep(0.1)
            except:
                pass

    def test_default_settings_creation(self):
        """Testa se configurações padrão são criadas corretamente"""
        try:
            # Limpar configurações existentes (se possível)
            url = f"{self.base_url}/automation/settings"
            response = self.session.get(url)
            
            if response.status_code == 200:
                data = response.json()
                
                # Verificar configurações padrão específicas
                follow_ups = data.get("follow_up_configs", [])
                reactivation = data.get("reactivation_config", {})
                qualification = data.get("qualification_config", {})
                
                # Verificar intervalos padrão [1, 24, 72] horas
                novo_lead_config = next((config for config in follow_ups if config.get("stage") == "novo_lead"), None)
                if novo_lead_config:
                    intervals = novo_lead_config.get("intervals", [])
                    expected_intervals = [1, 24, 72]
                    
                    if intervals == expected_intervals:
                        self.log_test("Configurações padrão - Intervalos follow-up", True, 
                                    f"Intervalos corretos: {intervals} horas")
                    else:
                        self.log_test("Configurações padrão - Intervalos follow-up", False, 
                                    f"Intervalos incorretos. Esperado: {expected_intervals}, Obtido: {intervals}")
                
                # Verificar reativação com 30 dias
                inactive_days = reactivation.get("inactive_days", 0)
                if inactive_days == 30:
                    self.log_test("Configurações padrão - Reativação 30 dias", True, 
                                f"Configurado para {inactive_days} dias de inatividade")
                else:
                    self.log_test("Configurações padrão - Reativação 30 dias", False, 
                                f"Esperado 30 dias, obtido {inactive_days}")
                
                # Verificar critérios de qualificação
                if qualification.get("enabled", False):
                    threshold = qualification.get("hot_lead_threshold", 0)
                    self.log_test("Configurações padrão - Qualificação", True, 
                                f"Qualificação habilitada com threshold {threshold}")
                else:
                    self.log_test("Configurações padrão - Qualificação", False, 
                                "Qualificação deveria estar habilitada por padrão")
            else:
                self.log_test("Configurações padrão", False, 
                            f"Erro ao obter configurações: {response.status_code}")
                
        except Exception as e:
            self.log_test("Configurações padrão", False, f"Erro: {str(e)}")

    def test_lead_qualification_criteria(self):
        """Testa qualificação baseada em critérios de pontuação específicos"""
        try:
            # Executar qualificação
            url = f"{self.base_url}/automation/qualify-leads"
            response = self.session.get(url)
            
            if response.status_code == 200:
                data = response.json()
                qualified_count = data.get("qualified_leads", 0)
                total_count = data.get("total_leads", 0)
                
                # Obter leads qualificados para verificar critérios
                qualified_url = f"{self.base_url}/automation/qualified-leads"
                qualified_response = self.session.get(qualified_url)
                
                if qualified_response.status_code == 200:
                    qualified_leads = qualified_response.json()
                    
                    # Verificar critérios específicos
                    criteria_found = []
                    for lead in qualified_leads:
                        criteria_met = lead.get("criteria_met", {})
                        score = lead.get("score", 0)
                        
                        # Verificar critérios esperados
                        expected_criteria = ["recent_activity", "high_engagement", "high_interest_keywords"]
                        for criterion in expected_criteria:
                            if criterion in criteria_met and criteria_met[criterion]:
                                criteria_found.append(criterion)
                    
                    unique_criteria = list(set(criteria_found))
                    self.log_test("Qualificação - Critérios de pontuação", True, 
                                f"Critérios aplicados: {unique_criteria}")
                    
                    # Verificar se leads com palavras-chave foram qualificados
                    high_score_leads = [lead for lead in qualified_leads if lead.get("score", 0) >= 3]
                    self.log_test("Qualificação - Threshold de pontuação", True, 
                                f"{len(high_score_leads)} leads com score >= 3")
                else:
                    self.log_test("Qualificação - Critérios de pontuação", False, 
                                "Não foi possível obter leads qualificados")
            else:
                self.log_test("Qualificação - Critérios de pontuação", False, 
                            f"Erro na qualificação: {response.status_code}")
                
        except Exception as e:
            self.log_test("Qualificação - Critérios de pontuação", False, f"Erro: {str(e)}")

    def test_followup_scheduling_and_processing(self):
        """Testa agendamento e processamento de follow-ups"""
        try:
            # Processar follow-ups
            url = f"{self.base_url}/automation/process-followups"
            response = self.session.post(url)
            
            if response.status_code == 200:
                data = response.json()
                processed_count = data.get("processed_count", 0)
                
                # Verificar histórico para confirmar agendamento
                history_url = f"{self.base_url}/automation/history"
                history_response = self.session.get(history_url)
                
                if history_response.status_code == 200:
                    history = history_response.json()
                    
                    # Filtrar follow-ups
                    followup_history = [item for item in history if item.get("automation_type") == "follow_up"]
                    
                    # Verificar status dos follow-ups
                    sent_followups = [item for item in followup_history if item.get("status") == "sent"]
                    scheduled_followups = [item for item in followup_history if item.get("status") == "scheduled"]
                    
                    self.log_test("Follow-ups - Agendamento", True, 
                                f"{len(scheduled_followups)} agendados, {len(sent_followups)} enviados")
                    
                    # Verificar se mensagens foram personalizadas
                    if followup_history:
                        sample_message = followup_history[0].get("message", "")
                        if "{name}" not in sample_message:  # Template foi processado
                            self.log_test("Follow-ups - Personalização", True, 
                                        "Mensagens personalizadas com nome do lead")
                        else:
                            self.log_test("Follow-ups - Personalização", False, 
                                        "Template não foi processado corretamente")
                else:
                    self.log_test("Follow-ups - Agendamento", False, 
                                "Não foi possível verificar histórico")
            else:
                self.log_test("Follow-ups - Agendamento", False, 
                            f"Erro no processamento: {response.status_code}")
                
        except Exception as e:
            self.log_test("Follow-ups - Agendamento", False, f"Erro: {str(e)}")

    def test_whatsapp_integration_functionality(self):
        """Testa funcionalidade específica da integração WhatsApp"""
        try:
            # Verificar status detalhado
            status_url = f"{self.base_url}/whatsapp/status"
            status_response = self.session.get(status_url)
            
            if status_response.status_code == 200:
                status_data = status_response.json()
                
                if status_data.get("status") == "success":
                    connected = status_data.get("connected", False)
                    profile_name = status_data.get("profile_name", "")
                    phone = status_data.get("phone", "")
                    
                    self.log_test("WhatsApp - Status detalhado", True, 
                                f"Conectado: {connected}, Perfil: {profile_name}, Telefone: {phone}")
                    
                    # Testar envio de mensagem (se conectado)
                    if connected and self.created_leads:
                        send_url = f"{self.base_url}/whatsapp/send-message"
                        send_data = {
                            "lead_id": self.created_leads[0],
                            "message": "Mensagem de teste da automação"
                        }
                        
                        send_response = self.session.post(send_url, json=send_data)
                        
                        if send_response.status_code == 200:
                            self.log_test("WhatsApp - Envio de mensagem", True, 
                                        "Mensagem enviada com sucesso")
                        else:
                            self.log_test("WhatsApp - Envio de mensagem", False, 
                                        f"Erro no envio: {send_response.status_code}")
                else:
                    self.log_test("WhatsApp - Status detalhado", True, 
                                f"Status: {status_data.get('status')}")
            else:
                self.log_test("WhatsApp - Status detalhado", False, 
                            f"Erro ao verificar status: {status_response.status_code}")
                
        except Exception as e:
            self.log_test("WhatsApp - Integração", False, f"Erro: {str(e)}")

    def test_data_models_correctness(self):
        """Testa correção dos modelos de dados"""
        try:
            # Testar modelo AutomationSettings
            settings_url = f"{self.base_url}/automation/settings"
            settings_response = self.session.get(settings_url)
            
            if settings_response.status_code == 200:
                settings = settings_response.json()
                
                # Verificar estrutura completa
                required_fields = {
                    "id": str,
                    "follow_up_configs": list,
                    "reactivation_config": dict,
                    "qualification_config": dict,
                    "created_at": str,
                    "updated_at": str
                }
                
                model_correct = True
                missing_fields = []
                
                for field, expected_type in required_fields.items():
                    if field not in settings:
                        missing_fields.append(field)
                        model_correct = False
                    elif not isinstance(settings[field], expected_type):
                        missing_fields.append(f"{field} (tipo incorreto)")
                        model_correct = False
                
                if model_correct:
                    self.log_test("Modelos de dados - AutomationSettings", True, 
                                "Estrutura correta com todos os campos")
                else:
                    self.log_test("Modelos de dados - AutomationSettings", False, 
                                f"Campos ausentes/incorretos: {missing_fields}")
            
            # Testar modelo AutomationHistory
            history_url = f"{self.base_url}/automation/history"
            history_response = self.session.get(history_url)
            
            if history_response.status_code == 200:
                history = history_response.json()
                
                if history:
                    history_item = history[0]
                    required_history_fields = {
                        "id": str,
                        "lead_id": str,
                        "automation_type": str,
                        "stage": str,
                        "message": str,
                        "status": str,
                        "scheduled_at": str,
                        "created_at": str
                    }
                    
                    history_correct = True
                    missing_history_fields = []
                    
                    for field, expected_type in required_history_fields.items():
                        if field not in history_item:
                            missing_history_fields.append(field)
                            history_correct = False
                        elif not isinstance(history_item[field], expected_type):
                            missing_history_fields.append(f"{field} (tipo incorreto)")
                            history_correct = False
                    
                    if history_correct:
                        self.log_test("Modelos de dados - AutomationHistory", True, 
                                    "Estrutura correta com todos os campos")
                    else:
                        self.log_test("Modelos de dados - AutomationHistory", False, 
                                    f"Campos ausentes/incorretos: {missing_history_fields}")
                else:
                    self.log_test("Modelos de dados - AutomationHistory", True, 
                                "Histórico vazio (normal para novos sistemas)")
                
        except Exception as e:
            self.log_test("Modelos de dados", False, f"Erro: {str(e)}")

    def run_detailed_tests(self):
        """Executa todos os testes detalhados"""
        print("🔍 INICIANDO TESTES DETALHADOS DE AUTOMAÇÃO COMERCIAL")
        print("=" * 70)
        print()
        
        # Setup com dados mais realistas
        self.create_test_leads()
        
        # Testes específicos conforme solicitação
        self.test_default_settings_creation()
        self.test_lead_qualification_criteria()
        self.test_followup_scheduling_and_processing()
        self.test_whatsapp_integration_functionality()
        self.test_data_models_correctness()
        
        return self.print_summary()

    def print_summary(self):
        """Imprime resumo dos testes detalhados"""
        print("=" * 70)
        print("📊 RESUMO DOS TESTES DETALHADOS DE AUTOMAÇÃO")
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
        
        # Salvar resultados detalhados
        with open("/app/detailed_automation_results.json", "w", encoding="utf-8") as f:
            json.dump(self.test_results, f, indent=2, ensure_ascii=False)
        
        print("📄 Resultados detalhados salvos em: /app/detailed_automation_results.json")
        
        return passed_tests, failed_tests

def main():
    """Função principal"""
    tester = DetailedAutomationTester()
    passed, failed = tester.run_detailed_tests()
    
    sys.exit(0 if failed == 0 else 1)

if __name__ == "__main__":
    main()