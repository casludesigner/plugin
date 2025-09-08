import React, { useState, useEffect, useRef } from "react";
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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./components/ui/dialog";
import { Progress } from "./components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./components/ui/table";
import { MessageSquare, Users, TrendingUp, Bot, Settings, BarChart3, UserPlus, Phone, Mail, Calendar, Send, MessageCircle, Search, Filter, Paperclip, Smile, MoreHorizontal, X, Upload, FileText, Trash2, CheckCircle, AlertCircle, Clock, Wifi, WifiOff, RefreshCw, QrCode, Building2, Shield, Edit, Eye, UserCheck, Crown } from "lucide-react";
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

// Document Upload Component
const DocumentUpload = ({ onDocumentsUpdate }) => {
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [training, setTraining] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await axios.get(`${API}/training-documents`);
      setDocuments(response.data);
      if (onDocumentsUpdate) {
        onDocumentsUpdate(response.data);
      }
    } catch (error) {
      console.error('Erro ao carregar documentos:', error);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    uploadFiles(files);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    uploadFiles(files);
  };

  const uploadFiles = async (files) => {
    setUploading(true);
    
    for (const file of files) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await axios.post(`${API}/training-documents/upload`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        
        toast.success(`${file.name} enviado com sucesso!`);
        
      } catch (error) {
        console.error('Erro ao enviar arquivo:', error);
        toast.error(`Erro ao enviar ${file.name}: ${error.response?.data?.detail || 'Erro desconhecido'}`);
      }
    }
    
    setUploading(false);
    fetchDocuments();
  };

  const deleteDocument = async (docId) => {
    try {
      await axios.delete(`${API}/training-documents/${docId}`);
      toast.success('Documento removido com sucesso!');
      fetchDocuments();
    } catch (error) {
      console.error('Erro ao remover documento:', error);
      toast.error('Erro ao remover documento');
    }
  };

  const trainAI = async () => {
    setTraining(true);
    try {
      const response = await axios.post(`${API}/training-documents/train-ai`);
      toast.success(response.data.message);
    } catch (error) {
      console.error('Erro ao treinar IA:', error);
      toast.error(error.response?.data?.detail || 'Erro ao treinar IA');
    } finally {
      setTraining(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'processando':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'treinado':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'erro':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'processando':
        return 'bg-yellow-100 text-yellow-800';
      case 'treinado':
        return 'bg-green-100 text-green-800';
      case 'erro':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const trainedDocuments = documents.filter(doc => doc.status === 'treinado');

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-indigo-900">
            <Upload className="h-5 w-5" />
            Adicionar Documentos
          </CardTitle>
          <CardDescription className="text-indigo-700">
            Envie arquivos para que a IA aprenda sobre seus imóveis e empresa
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragOver
                ? 'border-indigo-400 bg-indigo-50'
                : 'border-indigo-200 hover:border-indigo-300 hover:bg-indigo-50'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Upload className="h-12 w-12 text-indigo-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-indigo-900 mb-2">
              Arraste arquivos aqui ou clique para selecionar
            </p>
            <p className="text-sm text-indigo-600 mb-4">
              Tipos aceitos: PDF, XML, CSV, XLSX, TXT, DOCX
            </p>
            <p className="text-xs text-indigo-500 mb-4">
              Você pode enviar planilhas de imóveis, PDFs institucionais ou catálogos de produtos
            </p>
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {uploading ? 'Enviando...' : 'Selecionar Arquivos'}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.xml,.csv,.xlsx,.txt,.docx"
              className="hidden"
              onChange={handleFileSelect}
            />
          </div>
          <p className="text-xs text-indigo-500 mt-2">
            Limite: 10MB por arquivo
          </p>
        </CardContent>
      </Card>

      {/* Documents List */}
      {documents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Documentos Enviados
            </CardTitle>
            <CardDescription>
              {documents.length} documento(s) • {trainedDocuments.length} treinado(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(doc.status)}
                    <div>
                      <p className="font-medium text-gray-900">{doc.original_name}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>{doc.file_type.toUpperCase()}</span>
                        <span>{formatFileSize(doc.file_size)}</span>
                        <span>{new Date(doc.upload_date).toLocaleDateString('pt-BR')}</span>
                      </div>
                      {doc.error_message && (
                        <p className="text-xs text-red-600 mt-1">{doc.error_message}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(doc.status)}>
                      {doc.status === 'processando' && 'Processando'}
                      {doc.status === 'treinado' && 'Treinado'}
                      {doc.status === 'erro' && 'Erro'}
                    </Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteDocument(doc.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {trainedDocuments.length > 0 && (
              <div className="mt-6 pt-4 border-t">
                <Button
                  onClick={trainAI}
                  disabled={training}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {training ? 'Treinando IA...' : `Treinar IA com ${trainedDocuments.length} Documento(s)`}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Agent Configuration Component
const AgentConfig = () => {
  const [config, setConfig] = useState({
    name: "",
    behavior: "",
    script: [],
    useAdvancedAgent: false,
    n8nWebhookUrl: ""
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newStep, setNewStep] = useState("");
  const [activeTab, setActiveTab] = useState("personality");

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
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Configuração do Agente IA</h1>
        <p className="text-lg text-gray-600">Personalize o comportamento do seu assistente virtual</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="personality" className="flex items-center gap-2">
            <Bot className="h-4 w-4" />
            Personalidade
          </TabsTrigger>
          <TabsTrigger value="script" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Roteiro
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Documentos
          </TabsTrigger>
          <TabsTrigger value="advanced" className="flex items-center gap-2">
            <Bot className="h-4 w-4" />
            IA Avançada
          </TabsTrigger>
        </TabsList>

        <TabsContent value="personality" className="space-y-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-900">
                <Bot className="h-5 w-5" />
                Personalidade do Agente
              </CardTitle>
              <CardDescription className="text-blue-700">
                Defina como seu agente IA deve se comportar e interagir com os clientes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-blue-900 font-medium">Nome do Agente</Label>
                <Input
                  id="name"
                  placeholder="Ex: Maria - Consultora Imobiliária"
                  value={config.name}
                  onChange={(e) => setConfig({...config, name: e.target.value})}
                  className="border-blue-200 focus:border-blue-400"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="behavior" className="text-blue-900 font-medium">Comportamento</Label>
                <Textarea
                  id="behavior"
                  placeholder="Descreva como o agente deve se comportar (tom, estilo, abordagem)"
                  value={config.behavior}
                  onChange={(e) => setConfig({...config, behavior: e.target.value})}
                  rows={4}
                  className="border-blue-200 focus:border-blue-400"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="script" className="space-y-6">
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-900">
                <Settings className="h-5 w-5" />
                Roteiro de Atendimento
              </CardTitle>
              <CardDescription className="text-purple-700">
                Defina os passos que o agente deve seguir durante o atendimento
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                {config.script.map((step, index) => (
                  <div key={index} className="flex items-center gap-3 p-4 bg-white rounded-lg border border-purple-200">
                    <span className="flex-shrink-0 w-8 h-8 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </span>
                    <span className="flex-1 text-gray-900">{step}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeStep(index)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <X className="h-4 w-4" />
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
                  className="border-purple-200 focus:border-purple-400"
                />
                <Button onClick={addStep} className="bg-purple-600 hover:bg-purple-700">
                  Adicionar
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
          <DocumentUpload />
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6">
          <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-emerald-900">
                <Bot className="h-5 w-5" />
                Agente de IA Avançado (N8N)
              </CardTitle>
              <CardDescription className="text-emerald-700">
                Configure um agente mais inteligente usando workflows visuais
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="useAdvancedAgent"
                  checked={config.useAdvancedAgent}
                  onChange={(e) => setConfig({...config, useAdvancedAgent: e.target.checked})}
                  className="rounded border-emerald-300"
                />
                <Label htmlFor="useAdvancedAgent" className="text-emerald-900 font-medium">
                  Usar Agente IA Avançado (N8N)
                </Label>
              </div>

              {config.useAdvancedAgent && (
                <div className="space-y-4 p-4 bg-white rounded-lg border border-emerald-200">
                  <div className="space-y-2">
                    <Label htmlFor="n8nWebhook" className="text-emerald-900 font-medium">
                      URL do Webhook N8N
                    </Label>
                    <Input
                      id="n8nWebhook"
                      placeholder="https://sua-instancia-n8n.com/webhook/propbot-agent"
                      value={config.n8nWebhookUrl}
                      onChange={(e) => setConfig({...config, n8nWebhookUrl: e.target.value})}
                      className="border-emerald-200 focus:border-emerald-400"
                    />
                  </div>

                  <div className="bg-emerald-50 p-4 rounded-lg">
                    <h4 className="font-medium text-emerald-900 mb-2">Recursos do Agente Avançado:</h4>
                    <ul className="space-y-1 text-sm text-emerald-700">
                      <li>✅ Classificação inteligente de intenções</li>
                      <li>✅ Busca automática em banco de imóveis</li>
                      <li>✅ Agendamento de visitas integrado</li>
                      <li>✅ Negociação de preços assistida</li>
                      <li>✅ Múltiplas IAs (GPT-4, Claude, Gemini)</li>
                      <li>✅ Workflows personalizáveis</li>
                    </ul>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Como configurar N8N:</h4>
                    <ol className="space-y-1 text-sm text-blue-700">
                      <li>1. Instale N8N: <code className="bg-blue-100 px-2 py-1 rounded">docker run -p 5678:5678 n8nio/n8n</code></li>
                      <li>2. Acesse: http://localhost:5678</li>
                      <li>3. Importe o template de workflow do PropBot</li>
                      <li>4. Configure suas chaves de API (OpenAI, etc)</li>
                      <li>5. Ative o webhook e cole a URL acima</li>
                    </ol>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button onClick={saveConfig} disabled={saving} size="lg" className="bg-green-600 hover:bg-green-700">
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

// WhatsApp Configuration Component
const WhatsAppConfig = () => {
  const [whatsappStatus, setWhatsappStatus] = useState({
    connected: false,
    connection_status: 'close',
    profile_name: '',
    phone: ''
  });
  const [qrCode, setQrCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    checkWhatsAppStatus();
  }, []);

  const checkWhatsAppStatus = async () => {
    try {
      const response = await axios.get(`${API}/whatsapp/status`);
      if (response.data.status === 'success') {
        setWhatsappStatus(response.data);
        
        // If not connected, get QR code
        if (!response.data.connected) {
          await getQRCode();
        }
      }
    } catch (error) {
      console.error('Erro ao verificar status:', error);
      toast.error('Erro ao verificar status do WhatsApp');
    } finally {
      setLoading(false);
    }
  };

  const getQRCode = async () => {
    setConnecting(true);
    try {
      const response = await axios.get(`${API}/whatsapp/qr-code`);
      if (response.data.status === 'success') {
        setQrCode(response.data.qr_code);
        
        // Start polling for connection
        const pollInterval = setInterval(async () => {
          const statusResponse = await axios.get(`${API}/whatsapp/status`);
          if (statusResponse.data.connected) {
            setWhatsappStatus(statusResponse.data);
            setConnecting(false);
            clearInterval(pollInterval);
            toast.success('WhatsApp conectado com sucesso!');
          }
        }, 3000);

        // Stop polling after 2 minutes
        setTimeout(() => {
          clearInterval(pollInterval);
          setConnecting(false);
        }, 120000);
      }
    } catch (error) {
      console.error('Erro ao gerar QR Code:', error);
      toast.error('Erro ao gerar QR Code');
      setConnecting(false);
    }
  };

  const refreshQRCode = async () => {
    setRefreshing(true);
    await getQRCode();
    setRefreshing(false);
  };

  const disconnectWhatsApp = async () => {
    try {
      await axios.post(`${API}/whatsapp/disconnect`);
      setWhatsappStatus({
        connected: false,
        connection_status: 'close',
        profile_name: '',
        phone: ''
      });
      await getQRCode();
      toast.success('WhatsApp desconectado');
    } catch (error) {
      console.error('Erro ao desconectar:', error);
      toast.error('Erro ao desconectar WhatsApp');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Configuração do WhatsApp</h1>
        <p className="text-lg text-gray-600">Configure a integração com WhatsApp Business</p>
      </div>

      {/* Status Card */}
      <Card className={`${whatsappStatus.connected ? 'bg-gradient-to-br from-green-50 to-green-100 border-green-200' : 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200'}`}>
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 ${whatsappStatus.connected ? 'text-green-900' : 'text-gray-900'}`}>
            {whatsappStatus.connected ? <Wifi className="h-5 w-5" /> : <WifiOff className="h-5 w-5" />}
            Status da Conexão
          </CardTitle>
          <CardDescription className={whatsappStatus.connected ? 'text-green-700' : 'text-gray-600'}>
            {whatsappStatus.connected ? 'WhatsApp conectado e funcionando' : 'WhatsApp não conectado'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Status:</p>
              <Badge className={whatsappStatus.connected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                {whatsappStatus.connected ? 'Conectado' : 'Desconectado'}
              </Badge>
            </div>
            
            {whatsappStatus.connected && (
              <div className="text-right">
                <p className="font-medium">{whatsappStatus.profile_name || 'WhatsApp Business'}</p>
                <p className="text-sm text-gray-600">{whatsappStatus.phone}</p>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button onClick={checkWhatsAppStatus} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar Status
            </Button>
            
            {whatsappStatus.connected && (
              <Button onClick={disconnectWhatsApp} variant="outline" className="text-red-600 hover:text-red-700">
                <WifiOff className="h-4 w-4 mr-2" />
                Desconectar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* QR Code Card */}
      {!whatsappStatus.connected && (
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <QrCode className="h-5 w-5" />
              Conectar WhatsApp
            </CardTitle>
            <CardDescription className="text-blue-700">
              Escaneie o QR Code com seu WhatsApp Business para conectar
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {qrCode ? (
              <div className="text-center space-y-4">
                <div className="inline-block p-4 bg-white rounded-lg shadow-sm">
                  <img 
                    src={qrCode} 
                    alt="QR Code WhatsApp" 
                    className="max-w-xs mx-auto"
                    style={{ width: '280px', height: '280px' }}
                  />
                </div>
                
                {connecting ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-center gap-2 text-blue-700">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      <span>Aguardando conexão...</span>
                    </div>
                    <p className="text-sm text-blue-600">Escaneie o QR Code com seu WhatsApp</p>
                  </div>
                ) : (
                  <Button onClick={refreshQRCode} disabled={refreshing} className="bg-blue-600 hover:bg-blue-700">
                    {refreshing ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Gerando...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Gerar Novo QR Code
                      </>
                    )}
                  </Button>
                )}
              </div>
            ) : (
              <div className="text-center space-y-4">
                <div className="w-64 h-64 mx-auto bg-gray-100 rounded-lg flex items-center justify-center">
                  <QrCode className="h-16 w-16 text-gray-400" />
                </div>
                <Button onClick={getQRCode} disabled={connecting} className="bg-blue-600 hover:bg-blue-700">
                  {connecting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Gerando QR Code...
                    </>
                  ) : (
                    <>
                      <QrCode className="h-4 w-4 mr-2" />
                      Gerar QR Code
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* Instructions */}
            <div className="bg-white p-4 rounded-lg border">
              <h3 className="font-medium mb-3">Como conectar:</h3>
              <ol className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-5 h-5 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-medium">1</span>
                  Abra o WhatsApp Business no seu celular
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-5 h-5 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-medium">2</span>
                  Toque em "Mais opções" (⋮) → "Dispositivos conectados"
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-5 h-5 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-medium">3</span>
                  Toque em "Conectar dispositivo"
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-5 h-5 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-medium">4</span>
                  Escaneie o QR Code acima
                </li>
              </ol>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Configuration Info */}
      <Card>
        <CardHeader>
          <CardTitle>Informações da Integração</CardTitle>
          <CardDescription>Detalhes técnicos da configuração</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-700">Webhook URL</Label>
              <p className="text-sm text-gray-900 font-mono bg-gray-50 p-2 rounded">
                https://propbot-mvp.preview.emergentagent.com/api/whatsapp/webhook
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">Instância</Label>
              <p className="text-sm text-gray-900">propbot</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">Eventos Habilitados</Label>
              <p className="text-sm text-gray-900">MESSAGES_UPSERT, CONNECTION_UPDATE</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">Servidor Evolution API</Label>
              <p className="text-sm text-gray-900">https://api.airys.com.br</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Live Chat Component
const LiveChat = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [leads, setLeads] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [filter, setFilter] = useState('todos');
  const [whatsappIntegration, setWhatsappIntegration] = useState({ is_connected: false });
  const [showConnectDialog, setShowConnectDialog] = useState(false);
  const [connectionForm, setConnectionForm] = useState({ phone_number: '', business_name: '' });
  const [selectedLead, setSelectedLead] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [leadsRes, integrationRes] = await Promise.all([
        axios.get(`${API}/leads`),
        axios.get(`${API}/whatsapp-integration`)
      ]);
      
      setLeads(leadsRes.data);
      setWhatsappIntegration(integrationRes.data);
      
      // Create mock conversations from leads
      const mockConversations = leadsRes.data.map(lead => ({
        id: `conv_${lead.id}`,
        lead_id: lead.id,
        status: 'novo',
        assigned_to: null,
        channel: 'whatsapp',
        last_message: 'Olá! Estou interessado em imóveis.',
        last_message_time: lead.last_interaction,
        lead: lead
      }));
      
      setConversations(mockConversations);
      
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados do chat');
    } finally {
      setLoading(false);
    }
  };

  const connectWhatsApp = async () => {
    try {
      await axios.post(`${API}/whatsapp-integration/connect`, connectionForm);
      setWhatsappIntegration({ is_connected: true, ...connectionForm });
      setShowConnectDialog(false);
      toast.success('WhatsApp conectado com sucesso!');
    } catch (error) {
      console.error('Erro ao conectar WhatsApp:', error);
      toast.error('Erro ao conectar WhatsApp');
    }
  };

  const selectConversation = async (conversation) => {
    setSelectedConversation(conversation);
    setSelectedLead(conversation.lead);
    
    try {
      const response = await axios.get(`${API}/chat/${conversation.lead_id}`);
      setMessages(response.data);
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
      setMessages([]);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      // Send message via API
      await axios.post(`${API}/chat/message`, {
        lead_id: selectedConversation.lead_id,
        sender: 'human',
        sender_name: 'Atendente',
        message: newMessage,
        channel: 'whatsapp'
      });

      // Send directly to WhatsApp via Evolution API
      await axios.post(`${API}/whatsapp/send-message`, {
        lead_id: selectedConversation.lead_id,
        message: newMessage
      });

      setNewMessage('');
      // Refresh messages
      const response = await axios.get(`${API}/chat/${selectedConversation.lead_id}`);
      setMessages(response.data);
      toast.success('Mensagem enviada para o WhatsApp!');
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast.error('Erro ao enviar mensagem');
    }
  };

  const assignToMe = async () => {
    if (!selectedConversation) return;
    
    // Update conversation status
    const updatedConversations = conversations.map(conv => 
      conv.id === selectedConversation.id 
        ? { ...conv, status: 'em_atendimento', assigned_to: 'Atendente' }
        : conv
    );
    setConversations(updatedConversations);
    setSelectedConversation({ ...selectedConversation, status: 'em_atendimento', assigned_to: 'Atendente' });
    toast.success('Atendimento assumido!');
  };

  const returnToBot = async () => {
    if (!selectedConversation) return;
    
    // Update conversation status
    const updatedConversations = conversations.map(conv => 
      conv.id === selectedConversation.id 
        ? { ...conv, status: 'novo', assigned_to: null }
        : conv
    );
    setConversations(updatedConversations);
    setSelectedConversation({ ...selectedConversation, status: 'novo', assigned_to: null });
    toast.success('Conversa devolvida para o bot!');
  };

  const closeConversation = async () => {
    if (!selectedConversation) return;
    
    // Update conversation status
    const updatedConversations = conversations.map(conv => 
      conv.id === selectedConversation.id 
        ? { ...conv, status: 'fechado' }
        : conv
    );
    setConversations(updatedConversations);
    setSelectedConversation({ ...selectedConversation, status: 'fechado' });
    toast.success('Conversa encerrada!');
  };

  const filteredConversations = conversations.filter(conv => {
    if (filter === 'todos') return true;
    if (filter === 'novos') return conv.status === 'novo';
    if (filter === 'em_atendimento') return conv.status === 'em_atendimento';
    if (filter === 'fechados') return conv.status === 'fechado';
    return true;
  });

  const getStatusColor = (status) => {
    const colors = {
      novo: "bg-blue-100 text-blue-800",
      em_atendimento: "bg-green-100 text-green-800",
      fechado: "bg-gray-100 text-gray-800"
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getStatusLabel = (status) => {
    const labels = {
      novo: "Novo",
      em_atendimento: "Em Atendimento",
      fechado: "Fechado"
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
    <div className="h-screen flex flex-col">
      {/* WhatsApp Connection Banner */}
      {!whatsappIntegration.is_connected && (
        <div className="bg-green-500 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MessageCircle className="h-6 w-6" />
            <span className="font-medium">Conecte o WhatsApp para ativar o atendimento ao vivo</span>
          </div>
          <Button 
            variant="secondary" 
            onClick={() => setShowConnectDialog(true)}
            className="bg-white text-green-700 hover:bg-gray-100"
          >
            Conectar WhatsApp
          </Button>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar de Conversas */}
        <div className="w-80 border-r bg-white flex flex-col">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Chat ao Vivo</h2>
            
            {/* Filtros */}
            <div className="flex gap-1">
              {[
                { key: 'todos', label: 'Todos' },
                { key: 'novos', label: 'Novos' },
                { key: 'em_atendimento', label: 'Em Atendimento' },
                { key: 'fechados', label: 'Fechados' }
              ].map(({ key, label }) => (
                <Button
                  key={key}
                  size="sm"
                  variant={filter === key ? "default" : "ghost"}
                  onClick={() => setFilter(key)}
                  className="text-xs"
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>

          {/* Lista de Conversas */}
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => selectConversation(conversation)}
                className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedConversation?.id === conversation.id ? 'bg-blue-50 border-blue-200' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-green-100 text-green-700">
                      {conversation.lead?.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-sm text-gray-900 truncate">
                        {conversation.lead?.name}
                      </p>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="h-3 w-3 text-green-600" />
                      </div>
                    </div>
                    
                    <p className="text-xs text-gray-500 truncate mb-2">
                      {conversation.last_message}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <Badge className={`text-xs ${getStatusColor(conversation.status)}`}>
                        {getStatusLabel(conversation.status)}
                      </Badge>
                      <span className="text-xs text-gray-400">
                        {new Date(conversation.last_message_time).toLocaleTimeString('pt-BR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Área Principal */}
        <div className="flex-1 flex">
          {selectedConversation ? (
            <>
              {/* Chat Area */}
              <div className="flex-1 flex flex-col">
                {/* Header */}
                <div className="p-4 border-b bg-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-green-100 text-green-700">
                          {selectedLead?.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-gray-900">{selectedLead?.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <MessageCircle className="h-3 w-3" />
                          <span>WhatsApp</span>
                          <span>•</span>
                          <span>
                            {selectedConversation.assigned_to 
                              ? `Atendido por ${selectedConversation.assigned_to}`
                              : 'Atendido pelo Bot'
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {selectedConversation.status === 'novo' && (
                        <Button size="sm" onClick={assignToMe}>
                          Assumir Atendimento
                        </Button>
                      )}
                      {selectedConversation.status === 'em_atendimento' && (
                        <Button size="sm" variant="outline" onClick={returnToBot}>
                          Devolver para IA
                        </Button>
                      )}
                      <Button size="sm" variant="outline" onClick={closeConversation}>
                        Encerrar
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'lead' ? 'justify-start' : 'justify-end'}`}
                    >
                      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.sender === 'lead'
                          ? 'bg-gray-100 text-gray-900'
                          : message.sender === 'agent'
                          ? 'bg-green-100 text-green-900 flex items-start gap-2'
                          : 'bg-blue-500 text-white'
                      }`}>
                        {message.sender === 'agent' && <span className="text-xs">🤖</span>}
                        <div>
                          <p className="text-sm">{message.message}</p>
                          <p className={`text-xs mt-1 ${
                            message.sender === 'lead' 
                              ? 'text-gray-500' 
                              : message.sender === 'agent'
                              ? 'text-green-600'
                              : 'text-blue-100'
                          }`}>
                            {new Date(message.timestamp).toLocaleTimeString('pt-BR', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Message Input */}
                <div className="p-4 border-t bg-white">
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost">
                      <Paperclip className="h-4 w-4" />
                    </Button>
                    <Input
                      placeholder="Digite sua mensagem..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      className="flex-1"
                    />
                    <Button size="sm" variant="ghost">
                      <Smile className="h-4 w-4" />
                    </Button>
                    <Button size="sm" onClick={sendMessage} disabled={!newMessage.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Lead Panel */}
              <div className="w-80 border-l bg-gray-50 p-4">
                <h3 className="font-semibold text-gray-900 mb-4">Informações do Lead</h3>
                
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Nome</Label>
                    <p className="text-sm text-gray-900">{selectedLead?.name}</p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Telefone</Label>
                    <p className="text-sm text-gray-900">{selectedLead?.phone}</p>
                  </div>
                  
                  {selectedLead?.email && (
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Email</Label>
                      <p className="text-sm text-gray-900">{selectedLead?.email}</p>
                    </div>
                  )}
                  
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Tags</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      <Badge variant="outline">Interessado</Badge>
                      <Badge variant="outline">Apartamento</Badge>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Observações Internas</Label>
                    <Textarea
                      placeholder="Adicione observações sobre este lead..."
                      className="mt-1"
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Selecione uma conversa</h3>
                <p className="text-gray-500">Escolha uma conversa da lista para começar o atendimento</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* WhatsApp Connection Dialog */}
      <Dialog open={showConnectDialog} onOpenChange={setShowConnectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Conectar WhatsApp Business</DialogTitle>
            <DialogDescription>
              Configure sua conta do WhatsApp Business para receber mensagens
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="business_name">Nome da Empresa</Label>
              <Input
                id="business_name"
                placeholder="Sua Imobiliária"
                value={connectionForm.business_name}
                onChange={(e) => setConnectionForm({...connectionForm, business_name: e.target.value})}
              />
            </div>
            
            <div>
              <Label htmlFor="phone_number">Número do WhatsApp</Label>
              <Input
                id="phone_number"
                placeholder="(11) 99999-9999"
                value={connectionForm.phone_number}
                onChange={(e) => setConnectionForm({...connectionForm, phone_number: e.target.value})}
              />
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button onClick={connectWhatsApp} className="flex-1">
                Conectar WhatsApp
              </Button>
              <Button variant="outline" onClick={() => setShowConnectDialog(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
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
      const aiResponse = await axios.post(`${API}/chat/ai-response/${leadId}`, { message: newMessage });

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
            <Link to="/live-chat" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
              Chat ao Vivo
            </Link>
            <Link to="/whatsapp-config" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
              WhatsApp
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
              <Route path="/live-chat" element={<LiveChat />} />
              <Route path="/whatsapp-config" element={<WhatsAppConfig />} />
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