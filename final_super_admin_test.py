#!/usr/bin/env python3
"""
Teste final e completo dos endpoints Super Admin
"""

import requests
import json

API_BASE_URL = "https://whatsapp-crm-13.preview.emergentagent.com/api"

def test_complete_workflow():
    """Testa um fluxo completo de trabalho do Super Admin"""
    print("🚀 TESTE COMPLETO DO FLUXO SUPER ADMIN")
    print("=" * 60)
    
    results = []
    
    # 1. Verificar estatísticas iniciais
    print("\n1. 📊 Verificando estatísticas iniciais...")
    response = requests.get(f"{API_BASE_URL}/super-admin/stats")
    if response.status_code == 200:
        initial_stats = response.json()
        print(f"   ✅ Estatísticas obtidas:")
        print(f"      - Total de empresas: {initial_stats['total_companies']}")
        print(f"      - Empresas ativas: {initial_stats['active_companies']}")
        print(f"      - Total de usuários: {initial_stats['total_users']}")
        print(f"      - Total de leads: {initial_stats['total_leads']}")
        results.append(("Estatísticas iniciais", True, "Obtidas com sucesso"))
    else:
        print(f"   ❌ Erro ao obter estatísticas: {response.status_code}")
        results.append(("Estatísticas iniciais", False, f"Status {response.status_code}"))
        return results
    
    # 2. Criar empresa completa
    print("\n2. 🏢 Criando empresa completa...")
    company_data = {
        "name": "Imobiliária Teste Final",
        "cnpj": "11.222.333/0001-44",
        "email": "final@imobiliaria.com",
        "phone": "(11) 77777-7777",
        "plan": "enterprise"
    }
    
    response = requests.post(f"{API_BASE_URL}/super-admin/companies", json=company_data)
    if response.status_code == 200:
        company = response.json()
        company_id = company["id"]
        print(f"   ✅ Empresa criada: {company['name']}")
        print(f"      - ID: {company_id}")
        print(f"      - Plano: {company['plan']}")
        print(f"      - Status: {company['status']}")
        results.append(("Criação de empresa", True, f"ID: {company_id}"))
    else:
        print(f"   ❌ Erro ao criar empresa: {response.status_code}")
        results.append(("Criação de empresa", False, f"Status {response.status_code}"))
        return results
    
    # 3. Verificar empresa na lista
    print("\n3. 📋 Verificando empresa na lista...")
    response = requests.get(f"{API_BASE_URL}/super-admin/companies")
    if response.status_code == 200:
        companies = response.json()
        found_company = next((c for c in companies if c["id"] == company_id), None)
        if found_company:
            print(f"   ✅ Empresa encontrada na lista")
            print(f"      - Nome: {found_company['name']}")
            print(f"      - Email: {found_company['email']}")
            results.append(("Empresa na lista", True, "Encontrada"))
        else:
            print(f"   ❌ Empresa não encontrada na lista")
            results.append(("Empresa na lista", False, "Não encontrada"))
    else:
        print(f"   ❌ Erro ao listar empresas: {response.status_code}")
        results.append(("Empresa na lista", False, f"Status {response.status_code}"))
    
    # 4. Criar equipe de usuários
    print("\n4. 👥 Criando equipe de usuários...")
    users_data = [
        {"name": "Carlos Admin", "email": "carlos@final.com", "role": "admin", "company_id": company_id},
        {"name": "Lucia Gestora", "email": "lucia@final.com", "role": "gestor", "company_id": company_id},
        {"name": "Pedro Colaborador", "email": "pedro@final.com", "role": "colaborador", "company_id": company_id}
    ]
    
    created_users = []
    for user_data in users_data:
        response = requests.post(f"{API_BASE_URL}/super-admin/users", json=user_data)
        if response.status_code == 200:
            user = response.json()
            created_users.append(user)
            print(f"   ✅ Usuário criado: {user['name']} ({user['role']})")
        else:
            print(f"   ❌ Erro ao criar usuário {user_data['name']}: {response.status_code}")
    
    if len(created_users) == len(users_data):
        results.append(("Criação de usuários", True, f"{len(created_users)} usuários criados"))
    else:
        results.append(("Criação de usuários", False, f"Apenas {len(created_users)}/{len(users_data)} criados"))
    
    # 5. Verificar usuários da empresa
    print("\n5. 🔍 Verificando usuários da empresa...")
    response = requests.get(f"{API_BASE_URL}/super-admin/companies/{company_id}/users")
    if response.status_code == 200:
        company_users = response.json()
        print(f"   ✅ Usuários da empresa: {len(company_users)}")
        for user in company_users:
            print(f"      - {user['name']} ({user['role']}) - {user['email']}")
        
        if len(company_users) == len(created_users):
            results.append(("Usuários da empresa", True, f"{len(company_users)} usuários"))
        else:
            results.append(("Usuários da empresa", False, f"Esperado {len(created_users)}, encontrado {len(company_users)}"))
    else:
        print(f"   ❌ Erro ao listar usuários: {response.status_code}")
        results.append(("Usuários da empresa", False, f"Status {response.status_code}"))
    
    # 6. Testar alterações de papéis
    print("\n6. 🔄 Testando alterações de papéis...")
    if created_users:
        user_id = created_users[0]["id"]  # Carlos Admin
        original_role = created_users[0]["role"]
        
        # Alterar para gestor
        response = requests.put(f"{API_BASE_URL}/super-admin/users/{user_id}/role", params={"role": "gestor"})
        if response.status_code == 200:
            print(f"   ✅ Papel alterado de {original_role} para gestor")
            
            # Voltar para admin
            response = requests.put(f"{API_BASE_URL}/super-admin/users/{user_id}/role", params={"role": "admin"})
            if response.status_code == 200:
                print(f"   ✅ Papel restaurado para admin")
                results.append(("Alteração de papéis", True, "Alterações bem-sucedidas"))
            else:
                results.append(("Alteração de papéis", False, "Erro ao restaurar papel"))
        else:
            results.append(("Alteração de papéis", False, f"Status {response.status_code}"))
    
    # 7. Testar alterações de status da empresa
    print("\n7. 🏢 Testando alterações de status da empresa...")
    statuses_to_test = ["inativa", "suspensa", "ativa"]
    status_results = []
    
    for status in statuses_to_test:
        response = requests.put(f"{API_BASE_URL}/super-admin/companies/{company_id}/status", params={"status": status})
        if response.status_code == 200:
            print(f"   ✅ Status alterado para: {status}")
            status_results.append(True)
        else:
            print(f"   ❌ Erro ao alterar para {status}: {response.status_code}")
            status_results.append(False)
    
    if all(status_results):
        results.append(("Alteração de status", True, "Todas as alterações bem-sucedidas"))
    else:
        results.append(("Alteração de status", False, f"{sum(status_results)}/{len(status_results)} alterações"))
    
    # 8. Verificar estatísticas finais
    print("\n8. 📊 Verificando estatísticas finais...")
    response = requests.get(f"{API_BASE_URL}/super-admin/stats")
    if response.status_code == 200:
        final_stats = response.json()
        print(f"   ✅ Estatísticas finais:")
        print(f"      - Total de empresas: {final_stats['total_companies']}")
        print(f"      - Empresas ativas: {final_stats['active_companies']}")
        print(f"      - Total de usuários: {final_stats['total_users']}")
        
        # Verificar se as estatísticas aumentaram
        companies_increased = final_stats['total_companies'] > initial_stats['total_companies']
        users_increased = final_stats['total_users'] > initial_stats['total_users']
        
        if companies_increased and users_increased:
            print(f"   ✅ Estatísticas atualizadas corretamente")
            results.append(("Estatísticas finais", True, "Atualizadas corretamente"))
        else:
            print(f"   ⚠️  Estatísticas podem não ter sido atualizadas")
            results.append(("Estatísticas finais", False, "Não atualizadas"))
    else:
        results.append(("Estatísticas finais", False, f"Status {response.status_code}"))
    
    return results

def print_final_summary(results):
    """Imprime resumo final dos testes"""
    print("\n" + "=" * 60)
    print("🏁 RESUMO FINAL DOS TESTES SUPER ADMIN")
    print("=" * 60)
    
    total_tests = len(results)
    passed_tests = sum(1 for _, success, _ in results if success)
    failed_tests = total_tests - passed_tests
    
    print(f"\n📊 RESULTADOS:")
    print(f"   Total de testes: {total_tests}")
    print(f"   ✅ Passou: {passed_tests}")
    print(f"   ❌ Falhou: {failed_tests}")
    print(f"   📈 Taxa de sucesso: {(passed_tests/total_tests)*100:.1f}%")
    
    print(f"\n📋 DETALHES:")
    for test_name, success, details in results:
        status = "✅" if success else "❌"
        print(f"   {status} {test_name}: {details}")
    
    if failed_tests > 0:
        print(f"\n⚠️  ATENÇÃO: {failed_tests} teste(s) falharam")
    else:
        print(f"\n🎉 TODOS OS TESTES PASSARAM!")
    
    return passed_tests, failed_tests

if __name__ == "__main__":
    results = test_complete_workflow()
    passed, failed = print_final_summary(results)
    
    # Salvar resultados
    with open("/app/final_test_results.json", "w", encoding="utf-8") as f:
        json.dump([{"test": name, "success": success, "details": details} for name, success, details in results], f, indent=2, ensure_ascii=False)
    
    print(f"\n📄 Resultados salvos em: /app/final_test_results.json")