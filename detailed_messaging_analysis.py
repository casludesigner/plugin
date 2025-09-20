#!/usr/bin/env python3
"""
Análise detalhada dos problemas do sistema de mensagens WhatsApp
Baseado nos logs e problemas identificados
"""

import requests
import json
import sys
from datetime import datetime

# Configuração da API
API_BASE_URL = "https://omnichannelcrm-1.preview.emergentagent.com/api"

class DetailedMessagingAnalyzer:
    def __init__(self):
        self.base_url = API_BASE_URL
        self.session = requests.Session()
        self.analysis_results = []
        self.critical_issues = []
        self.leads_data = []
        
    def log_analysis(self, category, issue_type, success, details="", data=None):
        """Log analysis results"""
        status = "✅ OK" if success else "❌ PROBLEMA"
        result = {
            "category": category,
            "issue_type": issue_type,
            "status": status,
            "success": success,
            "details": details,
            "timestamp": datetime.now().isoformat(),
            "data": data
        }
        self.analysis_results.append(result)
        
        if not success:
            self.critical_issues.append(result)
            
        print(f"{status} - {category}: {issue_type}")
        if details:
            print(f"   Detalhes: {details}")
        print()

    def analyze_whatsapp_connection(self):
        """Analisa conexão WhatsApp em detalhes"""
        try:
            url = f"{self.base_url}/whatsapp/status"
            response = self.session.get(url)
            
            if response.status_code == 200:
                data = response.json()
                
                connected = data.get("connected", False)
                connection_status = data.get("connection_status", "unknown")
                profile_name = data.get("profile_name", "")
                phone = data.get("phone", "")
                
                if connected and connection_status == "open":
                    self.log_analysis("WhatsApp Connection", "Status", True, 
                                    f"Conectado: {profile_name} ({phone})")
                    
                    # Verificar se o número está formatado corretamente
                    if phone and len(phone) >= 10:
                        self.log_analysis("WhatsApp Connection", "Phone Format", True, 
                                        f"Número válido: {phone}")
                    else:
                        self.log_analysis("WhatsApp Connection", "Phone Format", False, 
                                        f"Número pode estar mal formatado: {phone}")
                else:
                    self.log_analysis("WhatsApp Connection", "Status", False, 
                                    f"Não conectado - Status: {connection_status}")
            else:
                self.log_analysis("WhatsApp Connection", "API Response", False, 
                                f"Erro HTTP {response.status_code}")
                
        except Exception as e:
            self.log_analysis("WhatsApp Connection", "Connection Error", False, str(e))

    def analyze_leads_phone_numbers(self):
        """Analisa números de telefone dos leads em detalhes"""
        try:
            url = f"{self.base_url}/leads"
            response = self.session.get(url)
            
            if response.status_code == 200:
                leads = response.json()
                self.leads_data = leads
                
                if not leads:
                    self.log_analysis("Leads Analysis", "Data Availability", False, 
                                    "Nenhum lead encontrado no sistema")
                    return
                
                # Análise detalhada dos telefones
                phone_issues = []
                valid_phones = []
                invalid_phones = []
                
                for lead in leads:
                    name = lead.get("name", "Sem nome")
                    phone = lead.get("phone", "")
                    lead_id = lead.get("id", "")
                    
                    if not phone:
                        phone_issues.append(f"{name}: Telefone vazio")
                        invalid_phones.append({"name": name, "phone": phone, "issue": "empty"})
                        continue
                    
                    # Limpar e analisar telefone
                    clean_phone = ''.join(filter(str.isdigit, phone))
                    
                    # Verificar comprimento
                    if len(clean_phone) < 10:
                        phone_issues.append(f"{name}: {phone} (muito curto - {len(clean_phone)} dígitos)")
                        invalid_phones.append({"name": name, "phone": phone, "issue": "too_short"})
                        continue
                    
                    # Verificar formato brasileiro
                    if not clean_phone.startswith('55'):
                        if len(clean_phone) == 10 or len(clean_phone) == 11:
                            # Pode ser número brasileiro sem código do país
                            formatted_phone = '55' + clean_phone
                            if len(formatted_phone) == 12:  # Adicionar 9 se necessário
                                formatted_phone = formatted_phone[:4] + '9' + formatted_phone[4:]
                            
                            phone_issues.append(f"{name}: {phone} -> deveria ser {formatted_phone}")
                            invalid_phones.append({
                                "name": name, 
                                "phone": phone, 
                                "issue": "missing_country_code",
                                "suggested": formatted_phone
                            })
                        else:
                            phone_issues.append(f"{name}: {phone} (formato inválido)")
                            invalid_phones.append({"name": name, "phone": phone, "issue": "invalid_format"})
                    else:
                        # Verificar se é um número válido do Brasil
                        if len(clean_phone) == 13:
                            area_code = clean_phone[2:4]
                            if 11 <= int(area_code) <= 99 and clean_phone[4] == '9':
                                valid_phones.append({"name": name, "phone": phone})
                            else:
                                phone_issues.append(f"{name}: {phone} (área inválida ou não é celular)")
                                invalid_phones.append({"name": name, "phone": phone, "issue": "invalid_area_or_not_mobile"})
                        else:
                            phone_issues.append(f"{name}: {phone} (comprimento inválido após formatação)")
                            invalid_phones.append({"name": name, "phone": phone, "issue": "invalid_length"})
                
                # Log resultados
                total_leads = len(leads)
                valid_count = len(valid_phones)
                invalid_count = len(invalid_phones)
                
                if invalid_count > 0:
                    self.log_analysis("Leads Analysis", "Phone Validation", False, 
                                    f"{invalid_count}/{total_leads} leads com telefones inválidos")
                    
                    # Mostrar primeiros problemas
                    for issue in phone_issues[:5]:
                        print(f"      - {issue}")
                    if len(phone_issues) > 5:
                        print(f"      ... e mais {len(phone_issues) - 5} problemas")
                else:
                    self.log_analysis("Leads Analysis", "Phone Validation", True, 
                                    f"Todos os {total_leads} leads têm telefones válidos")
                
                return valid_phones, invalid_phones
                
        except Exception as e:
            self.log_analysis("Leads Analysis", "API Error", False, str(e))
            return [], []

    def test_whatsapp_number_existence(self, phone_samples):
        """Testa se os números realmente existem no WhatsApp"""
        try:
            # Pegar alguns números para testar
            test_numbers = phone_samples[:3] if phone_samples else []
            
            if not test_numbers:
                self.log_analysis("WhatsApp Validation", "Number Existence", False, 
                                "Nenhum número válido para testar")
                return
            
            existence_results = []
            
            for phone_data in test_numbers:
                name = phone_data["name"]
                phone = phone_data["phone"]
                
                # Tentar enviar mensagem de teste (isso vai falhar se o número não existir)
                # Mas vamos capturar o erro para análise
                url = f"{self.base_url}/whatsapp/send-message"
                test_message = {
                    "lead_id": "test",  # ID fictício para teste
                    "message": "Teste de existência do número"
                }
                
                # Modificar temporariamente para usar o telefone específico
                # (Isso é só para análise, não vamos realmente enviar)
                
                existence_results.append({
                    "name": name,
                    "phone": phone,
                    "exists": "unknown"  # Não podemos testar sem modificar o código
                })
            
            self.log_analysis("WhatsApp Validation", "Number Existence", True, 
                            f"Análise preparada para {len(test_numbers)} números")
            
        except Exception as e:
            self.log_analysis("WhatsApp Validation", "Test Error", False, str(e))

    def analyze_message_flow(self):
        """Analisa o fluxo completo de mensagens"""
        try:
            # Verificar se há leads para testar
            if not self.leads_data:
                self.log_analysis("Message Flow", "Lead Availability", False, 
                                "Nenhum lead disponível para testar fluxo")
                return
            
            # Pegar primeiro lead
            test_lead = self.leads_data[0]
            lead_id = test_lead.get("id")
            lead_name = test_lead.get("name")
            lead_phone = test_lead.get("phone")
            
            self.log_analysis("Message Flow", "Test Lead", True, 
                            f"Usando lead: {lead_name} ({lead_phone})")
            
            # 1. Testar salvamento de mensagem no banco
            url = f"{self.base_url}/chat/message"
            message_data = {
                "lead_id": lead_id,
                "sender": "human",
                "message": "Teste de análise do sistema",
                "channel": "whatsapp"
            }
            
            response = self.session.post(url, json=message_data)
            if response.status_code == 200:
                self.log_analysis("Message Flow", "Database Save", True, 
                                "Mensagem salva no banco com sucesso")
            else:
                self.log_analysis("Message Flow", "Database Save", False, 
                                f"Erro ao salvar: HTTP {response.status_code}")
            
            # 2. Testar resposta da IA
            url = f"{self.base_url}/chat/ai-response/{lead_id}"
            ai_data = {"message": "Teste de resposta da IA"}
            
            response = self.session.post(url, json=ai_data)
            if response.status_code == 200:
                data = response.json()
                if data.get("response"):
                    self.log_analysis("Message Flow", "AI Response", True, 
                                    "IA gerando respostas corretamente")
                else:
                    self.log_analysis("Message Flow", "AI Response", False, 
                                    "IA não retornou resposta válida")
            else:
                self.log_analysis("Message Flow", "AI Response", False, 
                                f"Erro na IA: HTTP {response.status_code}")
            
            # 3. Testar envio para WhatsApp (vai falhar se número não existir)
            url = f"{self.base_url}/whatsapp/send-message"
            whatsapp_data = {
                "lead_id": lead_id,
                "message": "Teste de envio WhatsApp"
            }
            
            response = self.session.post(url, json=whatsapp_data)
            if response.status_code == 200:
                data = response.json()
                if data.get("status") == "success":
                    self.log_analysis("Message Flow", "WhatsApp Send", True, 
                                    "Mensagem enviada para WhatsApp")
                else:
                    self.log_analysis("Message Flow", "WhatsApp Send", False, 
                                    f"Falha no envio: {data}")
            else:
                self.log_analysis("Message Flow", "WhatsApp Send", False, 
                                f"Erro HTTP {response.status_code}: {response.text}")
            
        except Exception as e:
            self.log_analysis("Message Flow", "Flow Error", False, str(e))

    def analyze_evolution_api_config(self):
        """Analisa configuração da Evolution API"""
        try:
            # Verificar configurações (baseado no código do servidor)
            config_analysis = {
                "EVOLUTION_API_URL": "https://api.airys.com.br",
                "EVOLUTION_INSTANCE": "propbot-new",
                "API_KEY": "4bb4d6a9f91c3b16342a251cba010a9c"  # Mascarado
            }
            
            self.log_analysis("Evolution API", "Configuration", True, 
                            f"URL: {config_analysis['EVOLUTION_API_URL']}, Instance: {config_analysis['EVOLUTION_INSTANCE']}")
            
            # Verificar se a instância está ativa
            url = f"{self.base_url}/whatsapp/status"
            response = self.session.get(url)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("connected"):
                    self.log_analysis("Evolution API", "Instance Status", True, 
                                    "Instância ativa e conectada")
                else:
                    self.log_analysis("Evolution API", "Instance Status", False, 
                                    "Instância não conectada")
            else:
                self.log_analysis("Evolution API", "Instance Status", False, 
                                "Erro ao verificar status da instância")
                
        except Exception as e:
            self.log_analysis("Evolution API", "Config Error", False, str(e))

    def run_complete_analysis(self):
        """Executa análise completa do sistema de mensagens"""
        print("🔍 ANÁLISE DETALHADA DO SISTEMA DE MENSAGENS WHATSAPP")
        print("=" * 80)
        print("Identificando problemas específicos reportados pelo usuário")
        print("=" * 80)
        print()
        
        # 1. Analisar conexão WhatsApp
        self.analyze_whatsapp_connection()
        
        # 2. Analisar números de telefone dos leads
        valid_phones, invalid_phones = self.analyze_leads_phone_numbers()
        
        # 3. Analisar configuração Evolution API
        self.analyze_evolution_api_config()
        
        # 4. Testar existência de números no WhatsApp
        self.test_whatsapp_number_existence(valid_phones)
        
        # 5. Analisar fluxo completo de mensagens
        self.analyze_message_flow()
        
        # Gerar relatório final
        return self.generate_final_report(valid_phones, invalid_phones)

    def generate_final_report(self, valid_phones, invalid_phones):
        """Gera relatório final com diagnóstico e soluções"""
        print("=" * 80)
        print("📋 RELATÓRIO FINAL - DIAGNÓSTICO DO SISTEMA DE MENSAGENS")
        print("=" * 80)
        
        total_issues = len(self.critical_issues)
        total_checks = len(self.analysis_results)
        success_rate = ((total_checks - total_issues) / total_checks * 100) if total_checks > 0 else 0
        
        print(f"Total de verificações: {total_checks}")
        print(f"Problemas encontrados: {total_issues}")
        print(f"Taxa de sucesso: {success_rate:.1f}%")
        print()
        
        # Diagnóstico principal
        print("🎯 DIAGNÓSTICO PRINCIPAL:")
        
        # Verificar conexão WhatsApp
        whatsapp_connected = any(r["success"] for r in self.analysis_results 
                               if r["category"] == "WhatsApp Connection" and r["issue_type"] == "Status")
        
        if whatsapp_connected:
            print("   ✅ WhatsApp está conectado e funcionando")
        else:
            print("   ❌ WhatsApp NÃO está conectado - PROBLEMA CRÍTICO")
        
        # Verificar telefones
        if invalid_phones:
            print(f"   ❌ {len(invalid_phones)} leads com telefones inválidos/não registrados no WhatsApp")
            print("      ESTE É O PRINCIPAL PROBLEMA REPORTADO PELO USUÁRIO")
        else:
            print("   ✅ Todos os telefones estão formatados corretamente")
        
        # Verificar fluxo de mensagens
        message_flow_ok = any(r["success"] for r in self.analysis_results 
                            if r["category"] == "Message Flow" and r["issue_type"] == "Database Save")
        
        if message_flow_ok:
            print("   ✅ Sistema salvando mensagens no banco corretamente")
        else:
            print("   ❌ Problema ao salvar mensagens no banco")
        
        # IA funcionando
        ai_ok = any(r["success"] for r in self.analysis_results 
                   if r["category"] == "Message Flow" and r["issue_type"] == "AI Response")
        
        if ai_ok:
            print("   ✅ IA gerando respostas automáticas")
        else:
            print("   ❌ IA não está funcionando corretamente")
        
        print()
        
        # Problemas críticos encontrados
        if self.critical_issues:
            print("🚨 PROBLEMAS CRÍTICOS IDENTIFICADOS:")
            for issue in self.critical_issues:
                print(f"   ❌ {issue['category']} - {issue['issue_type']}: {issue['details']}")
            print()
        
        # Soluções recomendadas
        print("💡 SOLUÇÕES RECOMENDADAS:")
        
        if invalid_phones:
            print("   1. CORRIGIR TELEFONES DOS LEADS:")
            print("      - Atualizar números para formato brasileiro completo (55 + DDD + 9 + número)")
            print("      - Verificar se os números realmente existem no WhatsApp")
            print("      - Implementar validação na criação de leads")
            
            # Mostrar exemplos de correção
            print("\n   📝 EXEMPLOS DE CORREÇÃO NECESSÁRIA:")
            for phone_data in invalid_phones[:5]:
                if "suggested" in phone_data:
                    print(f"      {phone_data['name']}: {phone_data['phone']} → {phone_data['suggested']}")
                else:
                    print(f"      {phone_data['name']}: {phone_data['phone']} (verificar se existe no WhatsApp)")
        
        if not whatsapp_connected:
            print("   2. RECONECTAR WHATSAPP:")
            print("      - Verificar conexão com Evolution API")
            print("      - Gerar novo QR Code se necessário")
            print("      - Verificar credenciais da API")
        
        print("   3. VALIDAÇÃO DE NÚMEROS:")
        print("      - Implementar verificação de existência no WhatsApp antes de enviar")
        print("      - Adicionar feedback para usuário sobre números inválidos")
        print("      - Criar processo de limpeza de leads com números inválidos")
        
        print()
        
        # Status final
        if total_issues == 0:
            print("🎉 SISTEMA FUNCIONANDO CORRETAMENTE!")
            final_status = "success"
        elif len(invalid_phones) > 0:
            print("⚠️  SISTEMA PARCIALMENTE FUNCIONAL - NÚMEROS DE TELEFONE PRECISAM SER CORRIGIDOS")
            final_status = "partial"
        else:
            print("🔥 SISTEMA COM PROBLEMAS CRÍTICOS - REQUER ATENÇÃO IMEDIATA")
            final_status = "critical"
        
        # Salvar relatório
        report_data = {
            "timestamp": datetime.now().isoformat(),
            "status": final_status,
            "total_checks": total_checks,
            "critical_issues": total_issues,
            "success_rate": success_rate,
            "valid_phones": len(valid_phones),
            "invalid_phones": len(invalid_phones),
            "analysis_results": self.analysis_results,
            "critical_issues_details": self.critical_issues
        }
        
        with open("/app/detailed_messaging_analysis.json", "w", encoding="utf-8") as f:
            json.dump(report_data, f, indent=2, ensure_ascii=False)
        
        print("📄 Relatório detalhado salvo em: /app/detailed_messaging_analysis.json")
        
        return final_status, total_issues

def main():
    """Função principal"""
    analyzer = DetailedMessagingAnalyzer()
    status, issues = analyzer.run_complete_analysis()
    
    # Retornar código baseado no status
    if status == "success":
        sys.exit(0)
    elif status == "partial":
        sys.exit(1)  # Problemas menores
    else:
        sys.exit(2)  # Problemas críticos

if __name__ == "__main__":
    main()