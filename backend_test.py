#!/usr/bin/env python3
"""
Teste completo dos endpoints da API do Super Admin no PropBot CRM
"""

import requests
import json
import sys
from datetime import datetime

# Configuração da API
API_BASE_URL = "https://omnichannelcrm-1.preview.emergentagent.com/api"

class SuperAdminAPITester:
    def __init__(self):
        self.base_url = API_BASE_URL
        self.session = requests.Session()
        self.test_results = []
        self.created_company_id = None
        self.created_user_id = None
        
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

    def test_get_stats(self):
        """Testa GET /api/super-admin/stats"""
        try:
            url = f"{self.base_url}/super-admin/stats"
            response = self.session.get(url)
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ["total_companies", "active_companies", "total_users", "total_leads", "companies_by_plan"]
                
                missing_fields = [field for field in required_fields if field not in data]
                if missing_fields:
                    self.log_test("GET /super-admin/stats", False, 
                                f"Campos obrigatórios ausentes: {missing_fields}", data)
                else:
                    # Verificar tipos de dados
                    if (isinstance(data["total_companies"], int) and 
                        isinstance(data["active_companies"], int) and
                        isinstance(data["total_users"], int) and
                        isinstance(data["total_leads"], int) and
                        isinstance(data["companies_by_plan"], dict)):
                        self.log_test("GET /super-admin/stats", True, 
                                    f"Estatísticas obtidas: {data['total_companies']} empresas, {data['total_users']} usuários")
                    else:
                        self.log_test("GET /super-admin/stats", False, 
                                    "Tipos de dados incorretos na resposta", data)
            else:
                self.log_test("GET /super-admin/stats", False, 
                            f"Status HTTP {response.status_code}", response.text)
                
        except Exception as e:
            self.log_test("GET /super-admin/stats", False, f"Erro de conexão: {str(e)}")

    def test_get_companies(self):
        """Testa GET /api/super-admin/companies"""
        try:
            url = f"{self.base_url}/super-admin/companies"
            response = self.session.get(url)
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    self.log_test("GET /super-admin/companies", True, 
                                f"Lista de empresas obtida com {len(data)} empresas")
                    
                    # Verificar estrutura se houver empresas
                    if data:
                        company = data[0]
                        required_fields = ["id", "name", "email", "status", "plan", "created_at"]
                        missing_fields = [field for field in required_fields if field not in company]
                        if missing_fields:
                            self.log_test("Estrutura da empresa", False, 
                                        f"Campos obrigatórios ausentes: {missing_fields}")
                        else:
                            self.log_test("Estrutura da empresa", True, "Estrutura correta")
                else:
                    self.log_test("GET /super-admin/companies", False, 
                                "Resposta não é uma lista", data)
            else:
                self.log_test("GET /super-admin/companies", False, 
                            f"Status HTTP {response.status_code}", response.text)
                
        except Exception as e:
            self.log_test("GET /super-admin/companies", False, f"Erro de conexão: {str(e)}")

    def test_create_company(self):
        """Testa POST /api/super-admin/companies"""
        try:
            url = f"{self.base_url}/super-admin/companies"
            
            # Dados de teste realistas
            company_data = {
                "name": "Imobiliária Teste",
                "cnpj": "12.345.678/0001-99",
                "email": "teste@imobiliaria.com",
                "phone": "(11) 99999-9999",
                "plan": "premium"
            }
            
            response = self.session.post(url, json=company_data)
            
            if response.status_code == 200:
                data = response.json()
                
                # Verificar se os dados foram salvos corretamente
                if (data.get("name") == company_data["name"] and 
                    data.get("email") == company_data["email"] and
                    data.get("plan") == company_data["plan"] and
                    "id" in data):
                    
                    self.created_company_id = data["id"]
                    self.log_test("POST /super-admin/companies", True, 
                                f"Empresa criada com ID: {self.created_company_id}")
                else:
                    self.log_test("POST /super-admin/companies", False, 
                                "Dados da empresa não correspondem ao enviado", data)
            else:
                self.log_test("POST /super-admin/companies", False, 
                            f"Status HTTP {response.status_code}", response.text)
                
        except Exception as e:
            self.log_test("POST /super-admin/companies", False, f"Erro de conexão: {str(e)}")

    def test_update_company_status(self):
        """Testa PUT /api/super-admin/companies/{company_id}/status"""
        if not self.created_company_id:
            self.log_test("PUT /super-admin/companies/{id}/status", False, 
                        "Empresa de teste não foi criada")
            return
            
        try:
            url = f"{self.base_url}/super-admin/companies/{self.created_company_id}/status"
            
            # Testar mudança para "inativa"
            response = self.session.put(url, params={"status": "inativa"})
            
            if response.status_code == 200:
                data = response.json()
                if "message" in data:
                    self.log_test("PUT /super-admin/companies/{id}/status", True, 
                                f"Status alterado: {data['message']}")
                else:
                    self.log_test("PUT /super-admin/companies/{id}/status", False, 
                                "Resposta não contém mensagem de confirmação", data)
            else:
                self.log_test("PUT /super-admin/companies/{id}/status", False, 
                            f"Status HTTP {response.status_code}", response.text)
                
        except Exception as e:
            self.log_test("PUT /super-admin/companies/{id}/status", False, f"Erro de conexão: {str(e)}")

    def test_get_company_users(self):
        """Testa GET /api/super-admin/companies/{company_id}/users"""
        if not self.created_company_id:
            self.log_test("GET /super-admin/companies/{id}/users", False, 
                        "Empresa de teste não foi criada")
            return
            
        try:
            url = f"{self.base_url}/super-admin/companies/{self.created_company_id}/users"
            response = self.session.get(url)
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    self.log_test("GET /super-admin/companies/{id}/users", True, 
                                f"Lista de usuários obtida com {len(data)} usuários")
                else:
                    self.log_test("GET /super-admin/companies/{id}/users", False, 
                                "Resposta não é uma lista", data)
            else:
                self.log_test("GET /super-admin/companies/{id}/users", False, 
                            f"Status HTTP {response.status_code}", response.text)
                
        except Exception as e:
            self.log_test("GET /super-admin/companies/{id}/users", False, f"Erro de conexão: {str(e)}")

    def test_create_user(self):
        """Testa POST /api/super-admin/users"""
        if not self.created_company_id:
            self.log_test("POST /super-admin/users", False, 
                        "Empresa de teste não foi criada")
            return
            
        try:
            url = f"{self.base_url}/super-admin/users"
            
            # Dados de teste realistas
            user_data = {
                "name": "João Admin",
                "email": "joao@teste.com",
                "role": "admin",
                "company_id": self.created_company_id
            }
            
            response = self.session.post(url, json=user_data)
            
            if response.status_code == 200:
                data = response.json()
                
                # Verificar se os dados foram salvos corretamente
                if (data.get("name") == user_data["name"] and 
                    data.get("email") == user_data["email"] and
                    data.get("role") == user_data["role"] and
                    data.get("company_id") == user_data["company_id"] and
                    "id" in data):
                    
                    self.created_user_id = data["id"]
                    self.log_test("POST /super-admin/users", True, 
                                f"Usuário criado com ID: {self.created_user_id}")
                else:
                    self.log_test("POST /super-admin/users", False, 
                                "Dados do usuário não correspondem ao enviado", data)
            else:
                self.log_test("POST /super-admin/users", False, 
                            f"Status HTTP {response.status_code}", response.text)
                
        except Exception as e:
            self.log_test("POST /super-admin/users", False, f"Erro de conexão: {str(e)}")

    def test_update_user_role(self):
        """Testa PUT /api/super-admin/users/{user_id}/role"""
        if not self.created_user_id:
            self.log_test("PUT /super-admin/users/{id}/role", False, 
                        "Usuário de teste não foi criado")
            return
            
        try:
            url = f"{self.base_url}/super-admin/users/{self.created_user_id}/role"
            
            # Testar mudança para "gestor"
            response = self.session.put(url, params={"role": "gestor"})
            
            if response.status_code == 200:
                data = response.json()
                if "message" in data:
                    self.log_test("PUT /super-admin/users/{id}/role", True, 
                                f"Papel alterado: {data['message']}")
                else:
                    self.log_test("PUT /super-admin/users/{id}/role", False, 
                                "Resposta não contém mensagem de confirmação", data)
            else:
                self.log_test("PUT /super-admin/users/{id}/role", False, 
                            f"Status HTTP {response.status_code}", response.text)
                
        except Exception as e:
            self.log_test("PUT /super-admin/users/{id}/role", False, f"Erro de conexão: {str(e)}")

    def test_invalid_endpoints(self):
        """Testa endpoints com dados inválidos"""
        try:
            # Testar empresa inexistente
            url = f"{self.base_url}/super-admin/companies/invalid-id/users"
            response = self.session.get(url)
            
            if response.status_code == 404 or response.status_code == 500:
                self.log_test("Validação - Empresa inexistente", True, 
                            f"Retornou status {response.status_code} como esperado")
            else:
                self.log_test("Validação - Empresa inexistente", False, 
                            f"Deveria retornar 404/500, mas retornou {response.status_code}")
                
            # Testar status inválido
            if self.created_company_id:
                url = f"{self.base_url}/super-admin/companies/{self.created_company_id}/status"
                response = self.session.put(url, params={"status": "status_invalido"})
                
                if response.status_code == 400:
                    self.log_test("Validação - Status inválido", True, 
                                "Retornou 400 para status inválido")
                else:
                    self.log_test("Validação - Status inválido", False, 
                                f"Deveria retornar 400, mas retornou {response.status_code}")
                    
        except Exception as e:
            self.log_test("Validação - Endpoints inválidos", False, f"Erro de conexão: {str(e)}")

    def run_all_tests(self):
        """Executa todos os testes"""
        print("🚀 INICIANDO TESTES DOS ENDPOINTS SUPER ADMIN")
        print("=" * 60)
        print()
        
        # Testes básicos de leitura
        self.test_get_stats()
        self.test_get_companies()
        
        # Testes de criação
        self.test_create_company()
        
        # Testes que dependem da empresa criada
        self.test_update_company_status()
        self.test_get_company_users()
        self.test_create_user()
        
        # Testes que dependem do usuário criado
        self.test_update_user_role()
        
        # Testes de validação
        self.test_invalid_endpoints()
        
        # Resumo dos resultados
        return self.print_summary()

    def print_summary(self):
        """Imprime resumo dos testes"""
        print("=" * 60)
        print("📊 RESUMO DOS TESTES")
        print("=" * 60)
        
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
        with open("/app/test_results_super_admin.json", "w", encoding="utf-8") as f:
            json.dump(self.test_results, f, indent=2, ensure_ascii=False)
        
        print("📄 Resultados detalhados salvos em: /app/test_results_super_admin.json")
        
        return passed_tests, failed_tests

def main():
    """Função principal"""
    tester = SuperAdminAPITester()
    passed, failed = tester.run_all_tests()
    
    # Retornar código de saída apropriado
    sys.exit(0 if failed == 0 else 1)

if __name__ == "__main__":
    main()