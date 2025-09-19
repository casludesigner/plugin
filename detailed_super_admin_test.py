#!/usr/bin/env python3
"""
Teste detalhado adicional dos endpoints Super Admin
"""

import requests
import json

API_BASE_URL = "https://whatsapp-crm-13.preview.emergentagent.com/api"

def test_validation_details():
    """Testa validações específicas em detalhes"""
    print("🔍 TESTANDO VALIDAÇÕES DETALHADAS")
    print("=" * 50)
    
    # Teste 1: Empresa inexistente
    print("\n1. Testando empresa inexistente:")
    url = f"{API_BASE_URL}/super-admin/companies/invalid-id/users"
    response = requests.get(url)
    print(f"   Status: {response.status_code}")
    print(f"   Resposta: {response.text[:200]}")
    
    # Teste 2: Status inválido
    print("\n2. Testando status inválido:")
    # Primeiro, criar uma empresa para testar
    company_data = {
        "name": "Empresa Teste Validação",
        "email": "validacao@teste.com",
        "plan": "basic"
    }
    create_response = requests.post(f"{API_BASE_URL}/super-admin/companies", json=company_data)
    if create_response.status_code == 200:
        company_id = create_response.json()["id"]
        print(f"   Empresa criada: {company_id}")
        
        # Testar status inválido
        url = f"{API_BASE_URL}/super-admin/companies/{company_id}/status"
        response = requests.put(url, params={"status": "status_invalido"})
        print(f"   Status: {response.status_code}")
        print(f"   Resposta: {response.text[:200]}")
    
    # Teste 3: Papel inválido
    print("\n3. Testando papel inválido:")
    # Criar usuário primeiro
    user_data = {
        "name": "Usuário Teste",
        "email": "usuario@teste.com",
        "role": "colaborador",
        "company_id": company_id if 'company_id' in locals() else "test-id"
    }
    user_response = requests.post(f"{API_BASE_URL}/super-admin/users", json=user_data)
    if user_response.status_code == 200:
        user_id = user_response.json()["id"]
        print(f"   Usuário criado: {user_id}")
        
        # Testar papel inválido
        url = f"{API_BASE_URL}/super-admin/users/{user_id}/role"
        response = requests.put(url, params={"role": "papel_invalido"})
        print(f"   Status: {response.status_code}")
        print(f"   Resposta: {response.text[:200]}")

def test_data_relationships():
    """Testa relacionamentos entre empresas e usuários"""
    print("\n\n🔗 TESTANDO RELACIONAMENTOS DE DADOS")
    print("=" * 50)
    
    # Criar empresa
    company_data = {
        "name": "Imobiliária Relacionamento",
        "cnpj": "98.765.432/0001-10",
        "email": "relacionamento@imobiliaria.com",
        "phone": "(11) 88888-8888",
        "plan": "enterprise"
    }
    
    print("\n1. Criando empresa:")
    response = requests.post(f"{API_BASE_URL}/super-admin/companies", json=company_data)
    if response.status_code == 200:
        company = response.json()
        company_id = company["id"]
        print(f"   ✅ Empresa criada: {company['name']} (ID: {company_id})")
        
        # Verificar se a empresa aparece na lista
        print("\n2. Verificando se empresa aparece na lista:")
        response = requests.get(f"{API_BASE_URL}/super-admin/companies")
        if response.status_code == 200:
            companies = response.json()
            found = any(c["id"] == company_id for c in companies)
            print(f"   {'✅' if found else '❌'} Empresa encontrada na lista: {found}")
        
        # Criar usuários para a empresa
        users_data = [
            {"name": "Maria Silva", "email": "maria@relacionamento.com", "role": "admin", "company_id": company_id},
            {"name": "João Santos", "email": "joao@relacionamento.com", "role": "gestor", "company_id": company_id},
            {"name": "Ana Costa", "email": "ana@relacionamento.com", "role": "colaborador", "company_id": company_id}
        ]
        
        print("\n3. Criando usuários:")
        created_users = []
        for user_data in users_data:
            response = requests.post(f"{API_BASE_URL}/super-admin/users", json=user_data)
            if response.status_code == 200:
                user = response.json()
                created_users.append(user)
                print(f"   ✅ Usuário criado: {user['name']} ({user['role']})")
            else:
                print(f"   ❌ Erro ao criar usuário {user_data['name']}: {response.status_code}")
        
        # Verificar usuários da empresa
        print("\n4. Verificando usuários da empresa:")
        response = requests.get(f"{API_BASE_URL}/super-admin/companies/{company_id}/users")
        if response.status_code == 200:
            company_users = response.json()
            print(f"   ✅ Usuários encontrados: {len(company_users)}")
            for user in company_users:
                print(f"      - {user['name']} ({user['role']})")
        
        # Testar alteração de papéis
        print("\n5. Testando alteração de papéis:")
        if created_users:
            user_id = created_users[0]["id"]
            new_roles = ["gestor", "colaborador", "admin"]
            for role in new_roles:
                response = requests.put(f"{API_BASE_URL}/super-admin/users/{user_id}/role", params={"role": role})
                if response.status_code == 200:
                    print(f"   ✅ Papel alterado para: {role}")
                else:
                    print(f"   ❌ Erro ao alterar para {role}: {response.status_code}")
        
        # Testar alteração de status da empresa
        print("\n6. Testando alteração de status da empresa:")
        statuses = ["ativa", "inativa", "suspensa", "ativa"]
        for status in statuses:
            response = requests.put(f"{API_BASE_URL}/super-admin/companies/{company_id}/status", params={"status": status})
            if response.status_code == 200:
                print(f"   ✅ Status alterado para: {status}")
            else:
                print(f"   ❌ Erro ao alterar para {status}: {response.status_code}")

def test_stats_accuracy():
    """Testa precisão das estatísticas"""
    print("\n\n📊 TESTANDO PRECISÃO DAS ESTATÍSTICAS")
    print("=" * 50)
    
    # Obter estatísticas antes
    response = requests.get(f"{API_BASE_URL}/super-admin/stats")
    if response.status_code == 200:
        stats_before = response.json()
        print(f"\nEstatísticas antes:")
        print(f"   Empresas: {stats_before['total_companies']}")
        print(f"   Usuários: {stats_before['total_users']}")
        print(f"   Leads: {stats_before['total_leads']}")
        print(f"   Por plano: {stats_before['companies_by_plan']}")
        
        # Criar nova empresa
        company_data = {
            "name": "Empresa Estatísticas",
            "email": "stats@teste.com",
            "plan": "premium"
        }
        response = requests.post(f"{API_BASE_URL}/super-admin/companies", json=company_data)
        
        if response.status_code == 200:
            company_id = response.json()["id"]
            
            # Obter estatísticas depois
            response = requests.get(f"{API_BASE_URL}/super-admin/stats")
            if response.status_code == 200:
                stats_after = response.json()
                print(f"\nEstatísticas depois:")
                print(f"   Empresas: {stats_after['total_companies']}")
                print(f"   Usuários: {stats_after['total_users']}")
                print(f"   Leads: {stats_after['total_leads']}")
                print(f"   Por plano: {stats_after['companies_by_plan']}")
                
                # Verificar se as estatísticas foram atualizadas
                companies_increased = stats_after['total_companies'] > stats_before['total_companies']
                premium_increased = stats_after['companies_by_plan'].get('premium', 0) > stats_before['companies_by_plan'].get('premium', 0)
                
                print(f"\n✅ Empresas aumentaram: {companies_increased}")
                print(f"✅ Plano premium aumentou: {premium_increased}")

if __name__ == "__main__":
    test_validation_details()
    test_data_relationships()
    test_stats_accuracy()
    print("\n" + "=" * 50)
    print("🏁 TESTES DETALHADOS CONCLUÍDOS")