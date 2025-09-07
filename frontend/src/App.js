import React, { useState, useEffect } from "react";
import "./App.css";
import axios from "axios";
import { BrowserRouter, Routes, Route, Link, useNavigate } from "react-router-dom";
import { Button } from "./components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { Badge } from "./components/ui/badge";
import { Input } from "./components/ui/input";
import { Textarea } from "./components/ui/textarea";
import { Label } from "./components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./components/ui/select";
import { Avatar, AvatarFallback } from "./components/ui/avatar";
import { Separator } from "./components/ui/separator";
import { MessageSquare, Users, TrendingUp, Bot, Settings, BarChart3, UserPlus, Phone, Mail, Calendar, Send } from "lucide-react";
import { toast, Toaster } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Dashboard Component
const Dashboard = () => {
  const [stats, setStats] = useState({
    total_leads: 0,
    leads_by_status: {},
    conversations_today: 0,
    response_rate: 0
  });
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, leadsRes] = await Promise.all([
        axios.get(`${API}/reports`),
        axios.get(`${API}/leads`)
      ]);
      setStats(statsRes.data);
      setLeads(leadsRes.data);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados do dashboard');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      novo_lead: "bg-blue-100 text-blue-800",
      em_negociacao: "bg-yellow-100 text-yellow-800",
      visita_agendada: "bg-purple-100 text-purple-800",
      fechamento: "bg-green-100 text-green-800"
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getStatusLabel = (status) => {
    const labels = {
      novo_lead: "Novo Lead",
      em_negociacao: "Em Negociação",
      visita_agendada: "Visita Agendada",
      fechamento: "Fechamento"
    };
    return labels[status] || status;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard Imobiliário</h1>
        <p className="text-lg text-gray-600">Visão geral das suas vendas e leads</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Total de Leads</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{stats.total_leads}</div>
            <p className="text-xs text-blue-600">leads cadastrados</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Conversas Hoje</CardTitle>
            <MessageSquare className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{stats.conversations_today}</div>
            <p className="text-xs text-green-600">mensagens trocadas</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">Taxa de Resposta</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">{stats.response_rate}%</div>
            <p className="text-xs text-purple-600">respostas automáticas</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-700">Em Negociação</CardTitle>
            <BarChart3 className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">{stats.leads_by_status.em_negociacao || 0}</div>
            <p className="text-xs text-orange-600">leads ativos</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Leads */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Leads Recentes
          </CardTitle>
          <CardDescription>Últimos leads cadastrados no sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {leads.slice(0, 5).map(lead => (
              <div key={lead.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarFallback className="bg-blue-100 text-blue-700">
                      {lead.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-gray-900">{lead.name}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {lead.phone}
                      </span>
                      {lead.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {lead.email}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={getStatusColor(lead.status)}>
                    {getStatusLabel(lead.status)}
                  </Badge>
                  <Link to={`/chat/${lead.id}`}>
                    <Button size="sm" variant="outline">
                      <MessageSquare className="h-4 w-4 mr-1" />
                      Chat
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Agent Configuration Component
const AgentConfig = () => {
  const [config, setConfig] = useState({
    name: "",
    behavior: "",
    script: []
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newStep, setNewStep] = useState("");

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const response = await axios.get(`${API}/agent-config`);
      setConfig(response.data);
    } catch (error) {
      console.error('Erro ao carregar configuração:', error);
      toast.error('Erro ao carregar configuração do agente');
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async () => {
    setSaving(true);
    try {
      await axios.post(`${API}/agent-config`, {
        name: config.name,
        behavior: config.behavior,
        script: config.script
      });
      toast.success('Configuração salva com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar configuração:', error);
      toast.error('Erro ao salvar configuração');
    } finally {
      setSaving(false);
    }
  };

  const addStep = () => {
    if (newStep.trim()) {
      setConfig({
        ...config,
        script: [...config.script, newStep.trim()]
      });
      setNewStep("");
    }
  };

  const removeStep = (index) => {
    setConfig({
      ...config,
      script: config.script.filter((_, i) => i !== index)
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Configuração do Agente IA</h1>
        <p className="text-lg text-gray-600">Personalize o comportamento do seu assistente virtual</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Personalidade do Agente
          </CardTitle>
          <CardDescription>Defina como seu agente IA deve se comportar</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Agente</Label>
            <Input
              id="name"
              placeholder="Ex: Maria - Consultora Imobiliária"
              value={config.name}
              onChange={(e) => setConfig({...config, name: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="behavior">Comportamento</Label>
            <Textarea
              id="behavior"
              placeholder="Descreva como o agente deve se comportar (tom, estilo, abordagem)"
              value={config.behavior}
              onChange={(e) => setConfig({...config, behavior: e.target.value})}
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Roteiro de Atendimento
          </CardTitle>
          <CardDescription>Defina os passos que o agente deve seguir</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            {config.script.map((step, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-sm font-medium">
                  {index + 1}
                </span>
                <span className="flex-1">{step}</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeStep(index)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  Remover
                </Button>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="Novo passo do roteiro"
              value={newStep}
              onChange={(e) => setNewStep(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addStep()}
            />
            <Button onClick={addStep}>Adicionar</Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={saveConfig} disabled={saving} size="lg">
          {saving ? 'Salvando...' : 'Salvar Configurações'}
        </Button>
      </div>
    </div>
  );
};

// CRM Component
const CRM = () => {
  const [leads, setLeads] = useState([]);
  const [selectedLead, setSelectedLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newLead, setNewLead] = useState({ name: '', phone: '', email: '' });
  const [showNewLeadForm, setShowNewLeadForm] = useState(false);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const response = await axios.get(`${API}/leads`);
      setLeads(response.data);
    } catch (error) {
      console.error('Erro ao carregar leads:', error);
      toast.error('Erro ao carregar leads');
    } finally {
      setLoading(false);
    }
  };

  const createLead = async () => {
    try {
      await axios.post(`${API}/leads`, newLead);
      setNewLead({ name: '', phone: '', email: '' });
      setShowNewLeadForm(false);
      fetchLeads();
      toast.success('Lead criado com sucesso!');
    } catch (error) {
      console.error('Erro ao criar lead:', error);
      toast.error('Erro ao criar lead');
    }
  };

  const updateLeadStatus = async (leadId, status) => {
    try {
      await axios.put(`${API}/leads/${leadId}/status`, null, { params: { status } });
      fetchLeads();
      toast.success('Status atualizado!');
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast.error('Erro ao atualizar status');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      novo_lead: "bg-blue-100 text-blue-800",
      em_negociacao: "bg-yellow-100 text-yellow-800",
      visita_agendada: "bg-purple-100 text-purple-800",
      fechamento: "bg-green-100 text-green-800"
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getStatusLabel = (status) => {
    const labels = {
      novo_lead: "Novo Lead",
      em_negociacao: "Em Negociação",
      visita_agendada: "Visita Agendada",
      fechamento: "Fechamento"
    };
    return labels[status] || status;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">CRM - Gestão de Leads</h1>
          <p className="text-lg text-gray-600">Gerencie seus leads e acompanhe o funil de vendas</p>
        </div>
        <Button onClick={() => setShowNewLeadForm(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Novo Lead
        </Button>
      </div>

      {showNewLeadForm && (
        <Card>
          <CardHeader>
            <CardTitle>Novo Lead</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="leadName">Nome</Label>
                <Input
                  id="leadName"
                  placeholder="Nome completo"
                  value={newLead.name}
                  onChange={(e) => setNewLead({...newLead, name: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="leadPhone">Telefone</Label>
                <Input
                  id="leadPhone"
                  placeholder="(11) 99999-9999"
                  value={newLead.phone}
                  onChange={(e) => setNewLead({...newLead, phone: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="leadEmail">Email (opcional)</Label>
                <Input
                  id="leadEmail"
                  placeholder="email@exemplo.com"
                  value={newLead.email}
                  onChange={(e) => setNewLead({...newLead, email: e.target.value})}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={createLead}>Criar Lead</Button>
              <Button variant="outline" onClick={() => setShowNewLeadForm(false)}>Cancelar</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Funil de Vendas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { status: 'novo_lead', label: 'Novos Leads', color: 'blue' },
          { status: 'em_negociacao', label: 'Em Negociação', color: 'yellow' },
          { status: 'visita_agendada', label: 'Visita Agendada', color: 'purple' },
          { status: 'fechamento', label: 'Fechamento', color: 'green' }
        ].map(({ status, label, color }) => (
          <Card key={status}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-700">{label}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {leads.filter(lead => lead.status === status).map(lead => (
                <div key={lead.id} className="p-3 bg-gray-50 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-sm">{lead.name}</p>
                    <Link to={`/chat/${lead.id}`}>
                      <Button size="sm" variant="ghost">
                        <MessageSquare className="h-3 w-3" />
                      </Button>
                    </Link>
                  </div>
                  <p className="text-xs text-gray-500">{lead.phone}</p>
                  <Select onValueChange={(newStatus) => updateLeadStatus(lead.id, newStatus)}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Alterar status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="novo_lead">Novo Lead</SelectItem>
                      <SelectItem value="em_negociacao">Em Negociação</SelectItem>
                      <SelectItem value="visita_agendada">Visita Agendada</SelectItem>
                      <SelectItem value="fechamento">Fechamento</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ))}
              {leads.filter(lead => lead.status === status).length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">Nenhum lead neste estágio</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

// Chat Component
const Chat = ({ leadId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (leadId) {
      fetchChatData();
    }
  }, [leadId]);

  const fetchChatData = async () => {
    try {
      const [chatRes, leadRes] = await Promise.all([
        axios.get(`${API}/chat/${leadId}`),
        axios.get(`${API}/leads/${leadId}`)
      ]);
      setMessages(chatRes.data);
      setLead(leadRes.data);
    } catch (error) {
      console.error('Erro ao carregar chat:', error);
      toast.error('Erro ao carregar conversa');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    setSending(true);
    try {
      // Send user message
      await axios.post(`${API}/chat/message`, {
        lead_id: leadId,
        sender: 'lead',
        message: newMessage
      });

      // Get AI response
      const aiResponse = await axios.post(`${API}/chat/ai-response/${leadId}`, newMessage, {
        headers: { 'Content-Type': 'text/plain' }
      });

      setNewMessage('');
      fetchChatData(); // Refresh messages
      toast.success('Mensagem enviada!');
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast.error('Erro ao enviar mensagem');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto h-screen flex flex-col">
      {/* Header */}
      <div className="p-6 border-b bg-white">
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12">
            <AvatarFallback className="bg-green-100 text-green-700">
              {lead?.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{lead?.name}</h1>
            <p className="text-gray-600">{lead?.phone}</p>
          </div>
          <div className="ml-auto">
            <Badge className={getStatusColor(lead?.status)}>
              {getStatusLabel(lead?.status)}
            </Badge>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map(message => (
          <div key={message.id} className={`flex ${message.sender === 'agent' ? 'justify-start' : 'justify-end'}`}>
            <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
              message.sender === 'agent'
                ? 'bg-gray-100 text-gray-900'
                : 'bg-blue-600 text-white'
            }`}>
              <p className="text-sm">{message.message}</p>
              <p className={`text-xs mt-1 ${
                message.sender === 'agent' ? 'text-gray-500' : 'text-blue-100'
              }`}>
                {new Date(message.timestamp).toLocaleTimeString('pt-BR', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="p-6 border-t bg-white">
        <div className="flex gap-2">
          <Input
            placeholder="Digite sua mensagem..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !sending && sendMessage()}
            disabled={sending}
          />
          <Button onClick={sendMessage} disabled={sending || !newMessage.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );

  function getStatusColor(status) {
    const colors = {
      novo_lead: "bg-blue-100 text-blue-800",
      em_negociacao: "bg-yellow-100 text-yellow-800",
      visita_agendada: "bg-purple-100 text-purple-800",
      fechamento: "bg-green-100 text-green-800"
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  }

  function getStatusLabel(status) {
    const labels = {
      novo_lead: "Novo Lead",
      em_negociacao: "Em Negociação",
      visita_agendada: "Visita Agendada",
      fechamento: "Fechamento"
    };
    return labels[status] || status;
  }
};

// Reports Component
const Reports = () => {
  const [stats, setStats] = useState({
    total_leads: 0,
    leads_by_status: {},
    conversations_today: 0,
    response_rate: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API}/reports`);
      setStats(response.data);
    } catch (error) {
      console.error('Erro ao carregar relatórios:', error);
      toast.error('Erro ao carregar relatórios');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Relatórios</h1>
        <p className="text-lg text-gray-600">Acompanhe o desempenho do seu agente IA</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-blue-700">Total de Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900">{stats.total_leads}</div>
            <p className="text-xs text-blue-600 mt-1">leads cadastrados</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-green-700">Conversas Hoje</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-900">{stats.conversations_today}</div>
            <p className="text-xs text-green-600 mt-1">mensagens trocadas</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-purple-700">Taxa de Resposta</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-900">{stats.response_rate}%</div>
            <p className="text-xs text-purple-600 mt-1">respostas automáticas</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-orange-700">Em Negociação</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-900">{stats.leads_by_status.em_negociacao || 0}</div>
            <p className="text-xs text-orange-600 mt-1">leads ativos</p>
          </CardContent>
        </Card>
      </div>

      {/* Status Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Distribuição por Status</CardTitle>
          <CardDescription>Leads em cada etapa do funil de vendas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries({
              novo_lead: "Novos Leads",
              em_negociacao: "Em Negociação", 
              visita_agendada: "Visita Agendada",
              fechamento: "Fechamento"
            }).map(([status, label]) => (
              <div key={status} className="flex items-center justify-between">
                <span className="text-sm font-medium">{label}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ 
                        width: `${stats.total_leads > 0 ? (stats.leads_by_status[status] || 0) / stats.total_leads * 100 : 0}%` 
                      }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 w-8">{stats.leads_by_status[status] || 0}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Navigation Component
const Navigation = () => {
  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <Bot className="h-8 w-8 text-blue-600 mr-2" />
              <span className="text-xl font-bold text-gray-900">PropBot CRM</span>
            </Link>
          </div>
          <div className="flex items-center space-x-8">
            <Link to="/" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
              Dashboard
            </Link>
            <Link to="/agent" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
              Configurar IA
            </Link>
            <Link to="/crm" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
              CRM
            </Link>
            <Link to="/reports" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
              Relatórios
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

// Main App Component
function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <BrowserRouter>
        <Navigation />
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/agent" element={<AgentConfig />} />
              <Route path="/crm" element={<CRM />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/chat/:leadId" element={<ChatWrapper />} />
            </Routes>
          </div>
        </main>
      </BrowserRouter>
      <Toaster position="top-right" />
    </div>
  );
}

// Chat Wrapper to extract leadId from URL
const ChatWrapper = () => {
  const { leadId } = useParams();
  return <Chat leadId={leadId} />;
};

// Add useParams import
import { useParams } from "react-router-dom";

export default App;