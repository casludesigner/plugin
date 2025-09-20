#!/usr/bin/env python3
"""
Teste completo dos endpoints da API CRM Kanban no PropBot CRM
Foco: Testar endpoints de leads após implementação Kanban com react-dnd
"""

import requests
import json
import sys
from datetime import datetime

# Configuração da API
API_BASE_URL = "https://omnichannelcrm-1.preview.emergentagent.com/api"

class CRMKanbanAPITester:
    def __init__(self):
        self.base_url = API_BASE_URL
        self.session = requests.Session()
        self.test_results = []
        self.created_lead_ids = []
        
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

    def test_api_health(self):
        """Testa se a API está funcionando"""
        try:
            url = f"{self.base_url}/"
            response = self.session.get(url)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("status") == "ok":
                    self.log_test("API Health Check", True, 
                                f"API funcionando: {data.get('message', '')}")
                else:
                    self.log_test("API Health Check", False, 
                                "API não retornou status ok", data)
            else:
                self.log_test("API Health Check", False, 
                            f"Status HTTP {response.status_code}", response.text)
                
        except Exception as e:
            self.log_test("API Health Check", False, f"Erro de conexão: {str(e)}")

    def test_get_leads(self):
        """Testa GET /api/leads - listar todos os leads"""
        try:
            url = f"{self.base_url}/leads"
            response = self.session.get(url)
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    self.log_test("GET /api/leads", True, 
                                f"Lista de leads obtida com {len(data)} leads")
                    
                    # Verificar estrutura se houver leads
                    if data:
                        lead = data[0]
                        required_fields = ["id", "name", "phone", "status", "created_at"]
                        missing_fields = [field for field in required_fields if field not in lead]
                        if missing_fields:
                            self.log_test("Estrutura do lead", False, 
                                        f"Campos obrigatórios ausentes: {missing_fields}")
                        else:
                            # Verificar se status é válido para Kanban
                            valid_statuses = ["novo_lead", "em_negociacao", "visita_agendada", "fechamento"]
                            if lead.get("status") in valid_statuses:
                                self.log_test("Estrutura do lead", True, 
                                            f"Estrutura correta com status Kanban: {lead.get('status')}")
                            else:
                                self.log_test("Status Kanban", False, 
                                            f"Status inválido para Kanban: {lead.get('status')}")
                else:
                    self.log_test("GET /api/leads", False, 
                                "Resposta não é uma lista", data)
            else:
                self.log_test("GET /api/leads", False, 
                            f"Status HTTP {response.status_code}", response.text)
                
        except Exception as e:
            self.log_test("GET /api/leads", False, f"Erro de conexão: {str(e)}")

    def test_create_lead(self):
        """Testa POST /api/leads - criar novo lead"""
        try:
            url = f"{self.base_url}/leads"
            
            # Dados de teste realistas para imobiliária
            lead_data = {
                "name": "Maria Silva Santos",
                "phone": "(11) 98765-4321",
                "email": "maria.santos@email.com"
            }
            
            response = self.session.post(url, json=lead_data)
            
            if response.status_code == 200:
                data = response.json()
                
                # Verificar se os dados foram salvos corretamente
                if (data.get("name") == lead_data["name"] and 
                    data.get("phone") == lead_data["phone"] and
                    data.get("email") == lead_data["email"] and
                    "id" in data):
                    
                    # Verificar se status padrão é correto para Kanban
                    if data.get("status") == "novo_lead":
                        self.created_lead_ids.append(data["id"])
                        self.log_test("POST /api/leads", True, 
                                    f"Lead criado com ID: {data['id']}, status: {data.get('status')}")
                    else:
                        self.log_test("POST /api/leads - Status padrão", False, 
                                    f"Status padrão deveria ser 'novo_lead', mas é: {data.get('status')}")
                else:
                    self.log_test("POST /api/leads", False, 
                                "Dados do lead não correspondem ao enviado", data)
            else:
                self.log_test("POST /api/leads", False, 
                            f"Status HTTP {response.status_code}", response.text)
                
        except Exception as e:
            self.log_test("POST /api/leads", False, f"Erro de conexão: {str(e)}")

    def test_create_multiple_leads(self):
        """Cria múltiplos leads para testar mudanças de status"""
        leads_data = [
            {"name": "João Pereira", "phone": "(11) 99888-7777", "email": "joao@email.com"},
            {"name": "Ana Costa", "phone": "(11) 97777-6666", "email": "ana@email.com"},
            {"name": "Carlos Oliveira", "phone": "(11) 96666-5555", "email": "carlos@email.com"}
        ]
        
        for i, lead_data in enumerate(leads_data):
            try:
                url = f"{self.base_url}/leads"
                response = self.session.post(url, json=lead_data)
                
                if response.status_code == 200:
                    data = response.json()
                    if "id" in data:
                        self.created_lead_ids.append(data["id"])
                        self.log_test(f"Criar Lead Adicional {i+1}", True, 
                                    f"Lead {lead_data['name']} criado com ID: {data['id']}")
                    else:
                        self.log_test(f"Criar Lead Adicional {i+1}", False, 
                                    "ID não retornado na resposta", data)
                else:
                    self.log_test(f"Criar Lead Adicional {i+1}", False, 
                                f"Status HTTP {response.status_code}", response.text)
                    
            except Exception as e:
                self.log_test(f"Criar Lead Adicional {i+1}", False, f"Erro de conexão: {str(e)}")

    def test_get_single_lead(self):
        """Testa GET /api/leads/{lead_id} - obter lead específico"""
        if not self.created_lead_ids:
            self.log_test("GET /api/leads/{id}", False, 
                        "Nenhum lead foi criado para testar")
            return
            
        try:
            lead_id = self.created_lead_ids[0]
            url = f"{self.base_url}/leads/{lead_id}"
            response = self.session.get(url)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("id") == lead_id:
                    self.log_test("GET /api/leads/{id}", True, 
                                f"Lead obtido: {data.get('name')} - Status: {data.get('status')}")
                else:
                    self.log_test("GET /api/leads/{id}", False, 
                                "ID do lead não corresponde", data)
            else:
                self.log_test("GET /api/leads/{id}", False, 
                            f"Status HTTP {response.status_code}", response.text)
                
        except Exception as e:
            self.log_test("GET /api/leads/{id}", False, f"Erro de conexão: {str(e)}")

    def test_update_lead_status_kanban(self):
        """Testa PUT /api/leads/{lead_id}/status - mudanças de status para Kanban"""
        if len(self.created_lead_ids) < 4:
            self.log_test("Teste Status Kanban", False, 
                        "Não há leads suficientes para testar todos os status")
            return
        
        # Status válidos para o Kanban
        kanban_statuses = ["novo_lead", "em_negociacao", "visita_agendada", "fechamento"]
        
        for i, status in enumerate(kanban_statuses):
            if i < len(self.created_lead_ids):
                try:
                    lead_id = self.created_lead_ids[i]
                    url = f"{self.base_url}/leads/{lead_id}/status"
                    
                    response = self.session.put(url, params={"status": status})
                    
                    if response.status_code == 200:
                        data = response.json()
                        if "message" in data:
                            # Verificar se a mudança foi persistida
                            verify_url = f"{self.base_url}/leads/{lead_id}"
                            verify_response = self.session.get(verify_url)
                            
                            if verify_response.status_code == 200:
                                verify_data = verify_response.json()
                                if verify_data.get("status") == status:
                                    self.log_test(f"Status Kanban: {status}", True, 
                                                f"Status alterado e persistido para: {status}")
                                else:
                                    self.log_test(f"Status Kanban: {status}", False, 
                                                f"Status não foi persistido. Esperado: {status}, Atual: {verify_data.get('status')}")
                            else:
                                self.log_test(f"Status Kanban: {status}", False, 
                                            "Erro ao verificar persistência do status")
                        else:
                            self.log_test(f"Status Kanban: {status}", False, 
                                        "Resposta não contém mensagem de confirmação", data)
                    else:
                        self.log_test(f"Status Kanban: {status}", False, 
                                    f"Status HTTP {response.status_code}", response.text)
                        
                except Exception as e:
                    self.log_test(f"Status Kanban: {status}", False, f"Erro de conexão: {str(e)}")

    def test_invalid_status_update(self):
        """Testa atualização com status inválido"""
        if not self.created_lead_ids:
            self.log_test("Validação Status Inválido", False, 
                        "Nenhum lead disponível para teste")
            return
            
        try:
            lead_id = self.created_lead_ids[0]
            url = f"{self.base_url}/leads/{lead_id}/status"
            
            # Testar status inválido
            response = self.session.put(url, params={"status": "status_invalido"})
            
            # A API pode aceitar qualquer status (não há validação), então vamos verificar
            if response.status_code == 200:
                # Verificar se o status foi realmente alterado
                verify_url = f"{self.base_url}/leads/{lead_id}"
                verify_response = self.session.get(verify_url)
                
                if verify_response.status_code == 200:
                    verify_data = verify_response.json()
                    current_status = verify_data.get("status")
                    
                    # Se aceitou status inválido, é um problema para o Kanban
                    if current_status == "status_invalido":
                        self.log_test("Validação Status Inválido", False, 
                                    "API aceita status inválidos - problema para Kanban")
                    else:
                        self.log_test("Validação Status Inválido", True, 
                                    "Status inválido foi rejeitado ou não persistido")
            else:
                self.log_test("Validação Status Inválido", True, 
                            f"Status inválido rejeitado com HTTP {response.status_code}")
                
        except Exception as e:
            self.log_test("Validação Status Inválido", False, f"Erro de conexão: {str(e)}")

    def test_lead_status_transitions(self):
        """Testa transições de status típicas do fluxo Kanban"""
        if not self.created_lead_ids:
            self.log_test("Transições Kanban", False, 
                        "Nenhum lead disponível para teste")
            return
        
        # Fluxo típico: novo_lead -> em_negociacao -> visita_agendada -> fechamento
        transitions = [
            ("novo_lead", "em_negociacao"),
            ("em_negociacao", "visita_agendada"), 
            ("visita_agendada", "fechamento")
        ]
        
        lead_id = self.created_lead_ids[0]
        
        for from_status, to_status in transitions:
            try:
                # Primeiro, definir o status inicial
                url = f"{self.base_url}/leads/{lead_id}/status"
                self.session.put(url, params={"status": from_status})
                
                # Depois, fazer a transição
                response = self.session.put(url, params={"status": to_status})
                
                if response.status_code == 200:
                    # Verificar se a transição foi bem-sucedida
                    verify_url = f"{self.base_url}/leads/{lead_id}"
                    verify_response = self.session.get(verify_url)
                    
                    if verify_response.status_code == 200:
                        verify_data = verify_response.json()
                        if verify_data.get("status") == to_status:
                            self.log_test(f"Transição {from_status} → {to_status}", True, 
                                        "Transição realizada com sucesso")
                        else:
                            self.log_test(f"Transição {from_status} → {to_status}", False, 
                                        f"Transição falhou. Status atual: {verify_data.get('status')}")
                    else:
                        self.log_test(f"Transição {from_status} → {to_status}", False, 
                                    "Erro ao verificar transição")
                else:
                    self.log_test(f"Transição {from_status} → {to_status}", False, 
                                f"Status HTTP {response.status_code}")
                    
            except Exception as e:
                self.log_test(f"Transição {from_status} → {to_status}", False, f"Erro: {str(e)}")

    def test_lead_tags_update(self):
        """Testa PUT /api/leads/{lead_id}/tags - atualizar tags do lead"""
        if not self.created_lead_ids:
            self.log_test("PUT /api/leads/{id}/tags", False, 
                        "Nenhum lead disponível para teste")
            return
            
        try:
            lead_id = self.created_lead_ids[0]
            url = f"{self.base_url}/leads/{lead_id}/tags"
            
            # Tags típicas para imobiliária
            tags = ["quente", "apartamento", "zona_sul"]
            
            response = self.session.put(url, json=tags)
            
            if response.status_code == 200:
                data = response.json()
                if "message" in data:
                    # Verificar se as tags foram persistidas
                    verify_url = f"{self.base_url}/leads/{lead_id}"
                    verify_response = self.session.get(verify_url)
                    
                    if verify_response.status_code == 200:
                        verify_data = verify_response.json()
                        if verify_data.get("tags") == tags:
                            self.log_test("PUT /api/leads/{id}/tags", True, 
                                        f"Tags atualizadas: {tags}")
                        else:
                            self.log_test("PUT /api/leads/{id}/tags", False, 
                                        f"Tags não persistidas. Esperado: {tags}, Atual: {verify_data.get('tags')}")
                    else:
                        self.log_test("PUT /api/leads/{id}/tags", False, 
                                    "Erro ao verificar persistência das tags")
                else:
                    self.log_test("PUT /api/leads/{id}/tags", False, 
                                "Resposta não contém mensagem de confirmação", data)
            else:
                self.log_test("PUT /api/leads/{id}/tags", False, 
                            f"Status HTTP {response.status_code}", response.text)
                
        except Exception as e:
            self.log_test("PUT /api/leads/{id}/tags", False, f"Erro de conexão: {str(e)}")

    def test_lead_notes_update(self):
        """Testa PUT /api/leads/{lead_id}/notes - atualizar observações do lead"""
        if not self.created_lead_ids:
            self.log_test("PUT /api/leads/{id}/notes", False, 
                        "Nenhum lead disponível para teste")
            return
            
        try:
            lead_id = self.created_lead_ids[0]
            url = f"{self.base_url}/leads/{lead_id}/notes"
            
            notes = "Cliente interessado em apartamento de 2 quartos na zona sul. Orçamento até R$ 500.000. Visita agendada para sexta-feira."
            
            response = self.session.put(url, json={"notes": notes})
            
            if response.status_code == 200:
                data = response.json()
                if "message" in data:
                    # Verificar se as observações foram persistidas
                    verify_url = f"{self.base_url}/leads/{lead_id}"
                    verify_response = self.session.get(verify_url)
                    
                    if verify_response.status_code == 200:
                        verify_data = verify_response.json()
                        if verify_data.get("notes") == notes:
                            self.log_test("PUT /api/leads/{id}/notes", True, 
                                        "Observações atualizadas com sucesso")
                        else:
                            self.log_test("PUT /api/leads/{id}/notes", False, 
                                        "Observações não foram persistidas corretamente")
                    else:
                        self.log_test("PUT /api/leads/{id}/notes", False, 
                                    "Erro ao verificar persistência das observações")
                else:
                    self.log_test("PUT /api/leads/{id}/notes", False, 
                                "Resposta não contém mensagem de confirmação", data)
            else:
                self.log_test("PUT /api/leads/{id}/notes", False, 
                            f"Status HTTP {response.status_code}", response.text)
                
        except Exception as e:
            self.log_test("PUT /api/leads/{id}/notes", False, f"Erro de conexão: {str(e)}")

    def test_nonexistent_lead(self):
        """Testa operações com lead inexistente"""
        fake_lead_id = "lead-inexistente-123"
        
        try:
            # Testar GET com lead inexistente
            url = f"{self.base_url}/leads/{fake_lead_id}"
            response = self.session.get(url)
            
            if response.status_code == 404:
                self.log_test("Lead Inexistente - GET", True, 
                            "Retornou 404 para lead inexistente")
            else:
                self.log_test("Lead Inexistente - GET", False, 
                            f"Deveria retornar 404, mas retornou {response.status_code}")
            
            # Testar PUT status com lead inexistente
            url = f"{self.base_url}/leads/{fake_lead_id}/status"
            response = self.session.put(url, params={"status": "novo_lead"})
            
            if response.status_code in [404, 500]:
                self.log_test("Lead Inexistente - PUT Status", True, 
                            f"Retornou {response.status_code} para lead inexistente")
            else:
                self.log_test("Lead Inexistente - PUT Status", False, 
                            f"Deveria retornar 404/500, mas retornou {response.status_code}")
                
        except Exception as e:
            self.log_test("Lead Inexistente", False, f"Erro de conexão: {str(e)}")

    def test_reports_endpoint(self):
        """Testa GET /api/reports - relatórios do sistema"""
        try:
            url = f"{self.base_url}/reports"
            response = self.session.get(url)
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ["total_leads", "leads_by_status", "conversations_today", "response_rate"]
                
                missing_fields = [field for field in required_fields if field not in data]
                if missing_fields:
                    self.log_test("GET /api/reports", False, 
                                f"Campos obrigatórios ausentes: {missing_fields}", data)
                else:
                    # Verificar se leads_by_status contém status do Kanban
                    leads_by_status = data.get("leads_by_status", {})
                    kanban_statuses = ["novo_lead", "em_negociacao", "visita_agendada", "fechamento"]
                    
                    has_kanban_data = any(status in leads_by_status for status in kanban_statuses)
                    
                    if has_kanban_data:
                        self.log_test("GET /api/reports", True, 
                                    f"Relatórios obtidos com dados Kanban: {leads_by_status}")
                    else:
                        self.log_test("GET /api/reports - Dados Kanban", False, 
                                    f"Relatórios não contêm dados dos status Kanban: {leads_by_status}")
            else:
                self.log_test("GET /api/reports", False, 
                            f"Status HTTP {response.status_code}", response.text)
                
        except Exception as e:
            self.log_test("GET /api/reports", False, f"Erro de conexão: {str(e)}")

    def run_all_tests(self):
        """Executa todos os testes focados no CRM Kanban"""
        print("🚀 INICIANDO TESTES CRM KANBAN BACKEND API")
        print("=" * 60)
        print("Foco: Endpoints de leads após implementação Kanban com react-dnd")
        print("=" * 60)
        print()
        
        # Teste básico de conectividade
        self.test_api_health()
        
        # Testes principais de leads (foco do Kanban)
        self.test_get_leads()
        self.test_create_lead()
        self.test_create_multiple_leads()
        self.test_get_single_lead()
        
        # Testes críticos para funcionalidade Kanban
        self.test_update_lead_status_kanban()
        self.test_lead_status_transitions()
        
        # Testes de funcionalidades complementares
        self.test_lead_tags_update()
        self.test_lead_notes_update()
        
        # Testes de validação e edge cases
        self.test_invalid_status_update()
        self.test_nonexistent_lead()
        
        # Teste de relatórios (importante para dashboard Kanban)
        self.test_reports_endpoint()
        
        # Resumo dos resultados
        return self.print_summary()

    def print_summary(self):
        """Imprime resumo dos testes"""
        print("=" * 60)
        print("📊 RESUMO DOS TESTES CRM KANBAN")
        print("=" * 60)
        
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result["success"])
        failed_tests = total_tests - passed_tests
        
        print(f"Total de testes: {total_tests}")
        print(f"✅ Passou: {passed_tests}")
        print(f"❌ Falhou: {failed_tests}")
        print(f"Taxa de sucesso: {(passed_tests/total_tests)*100:.1f}%")
        print()
        
        # Análise específica para Kanban
        kanban_critical_tests = [
            "GET /api/leads", "POST /api/leads", "Status Kanban: novo_lead", 
            "Status Kanban: em_negociacao", "Status Kanban: visita_agendada", 
            "Status Kanban: fechamento"
        ]
        
        kanban_passed = sum(1 for result in self.test_results 
                           if result["success"] and any(critical in result["test"] 
                           for critical in kanban_critical_tests))
        
        print(f"🎯 TESTES CRÍTICOS KANBAN:")
        print(f"   Funcionalidades essenciais para drag-and-drop: {kanban_passed}/{len(kanban_critical_tests)}")
        print()
        
        if failed_tests > 0:
            print("🔍 TESTES QUE FALHARAM:")
            for result in self.test_results:
                if not result["success"]:
                    print(f"  - {result['test']}: {result['details']}")
            print()
        
        # Salvar resultados em arquivo
        with open("/app/test_results_kanban.json", "w", encoding="utf-8") as f:
            json.dump(self.test_results, f, indent=2, ensure_ascii=False)
        
        print("📄 Resultados detalhados salvos em: /app/test_results_kanban.json")
        
        return passed_tests, failed_tests

def main():
    """Função principal"""
    tester = CRMKanbanAPITester()
    passed, failed = tester.run_all_tests()
    
    # Retornar código de saída apropriado
    sys.exit(0 if failed == 0 else 1)

if __name__ == "__main__":
    main()