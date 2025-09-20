import React, { useState, useEffect, useRef } from "react";
import "./App.css";
import axios from "axios";
import { BrowserRouter, Routes, Route, Link, useNavigate, useParams, useLocation } from "react-router-dom";
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
        <Card className="card-hover gradient-card bg-gradient-to-br from-blue-500 to-blue-600 border-0 text-white p-6">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="card-title text-sm font-medium text-white/90">Total de Leads</CardTitle>
            <Users className="card-icon h-5 w-5 text-white/80" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="card-value stats-number text-3xl font-bold text-white">{stats.total_leads}</div>
            <p className="card-description text-xs text-white/75 mt-1">leads cadastrados</p>
          </CardContent>
        </Card>

        <Card className="card-hover gradient-card bg-gradient-to-br from-green-500 to-green-600 border-0 text-white p-6">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="card-title text-sm font-medium text-white/90">Conversas Hoje</CardTitle>
            <MessageSquare className="card-icon h-5 w-5 text-white/80" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="card-value stats-number text-3xl font-bold text-white">{stats.conversations_today}</div>
            <p className="card-description text-xs text-white/75 mt-1">mensagens trocadas</p>
          </CardContent>
        </Card>

        <Card className="card-hover gradient-card bg-gradient-to-br from-purple-500 to-purple-600 border-0 text-white p-6">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="card-title text-sm font-medium text-white/90">Taxa de Resposta</CardTitle>
            <TrendingUp className="card-icon h-5 w-5 text-white/80" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="card-value stats-number text-3xl font-bold text-white">{stats.response_rate}%</div>
            <p className="card-description text-xs text-white/75 mt-1">respostas automáticas</p>
          </CardContent>
        </Card>

        <Card className="card-hover gradient-card bg-gradient-to-br from-orange-500 to-orange-600 border-0 text-white p-6">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="card-title text-sm font-medium text-white/90">Em Negociação</CardTitle>
            <BarChart3 className="card-icon h-5 w-5 text-white/80" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="card-value stats-number text-3xl font-bold text-white">{stats.leads_by_status.em_negociacao || 0}</div>
            <p className="card-description text-xs text-white/75 mt-1">leads ativos</p>
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

// Super Admin Component
const SuperAdmin = () => {
  const [stats, setStats] = useState({
    total_companies: 0,
    active_companies: 0,
    total_users: 0,
    total_leads: 0,
    companies_by_plan: {}
  });
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [companyUsers, setCompanyUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateCompany, setShowCreateCompany] = useState(false);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [newCompany, setNewCompany] = useState({
    name: '',
    cnpj: '',
    email: '',
    phone: '',
    plan: 'basic'
  });
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'colaborador'
  });
  const [activeTab, setActiveTab] = useState("companies");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, companiesRes] = await Promise.all([
        axios.get(`${API}/super-admin/stats`),
        axios.get(`${API}/super-admin/companies`)
      ]);
      setStats(statsRes.data);
      setCompanies(companiesRes.data);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados do painel');
    } finally {
      setLoading(false);
    }
  };

  const createCompany = async () => {
    try {
      await axios.post(`${API}/super-admin/companies`, newCompany);
      setNewCompany({ name: '', cnpj: '', email: '', phone: '', plan: 'basic' });
      setShowCreateCompany(false);
      fetchData();
      toast.success('Empresa criada com sucesso!');
    } catch (error) {
      console.error('Erro ao criar empresa:', error);
      toast.error('Erro ao criar empresa');
    }
  };

  const updateCompanyStatus = async (companyId, status) => {
    try {
      await axios.put(`${API}/super-admin/companies/${companyId}/status?status=${status}`);
      fetchData();
      toast.success(`Status alterado para ${status}`);
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      toast.error('Erro ao alterar status');
    }
  };

  const fetchCompanyUsers = async (companyId) => {
    try {
      const response = await axios.get(`${API}/super-admin/companies/${companyId}/users`);
      setCompanyUsers(response.data);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      toast.error('Erro ao carregar usuários');
    }
  };

  const createUser = async () => {
    if (!selectedCompany) return;
    
    try {
      await axios.post(`${API}/super-admin/users`, {
        ...newUser,
        company_id: selectedCompany.id
      });
      setNewUser({ name: '', email: '', role: 'colaborador' });
      setShowCreateUser(false);
      fetchCompanyUsers(selectedCompany.id);
      toast.success('Usuário criado com sucesso!');
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      toast.error(error.response?.data?.detail || 'Erro ao criar usuário');
    }
  };

  const updateUserRole = async (userId, role) => {
    try {
      await axios.put(`${API}/super-admin/users/${userId}/role?role=${role}`);
      fetchCompanyUsers(selectedCompany.id);
      toast.success(`Papel alterado para ${role}`);
    } catch (error) {
      console.error('Erro ao alterar papel:', error);
      toast.error('Erro ao alterar papel');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      ativa: "bg-green-100 text-green-800",
      inativa: "bg-red-100 text-red-800",
      suspensa: "bg-yellow-100 text-yellow-800"
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getPlanColor = (plan) => {
    const colors = {
      basic: "bg-blue-100 text-blue-800",
      premium: "bg-purple-100 text-purple-800",
      enterprise: "bg-orange-100 text-orange-800"
    };
    return colors[plan] || "bg-gray-100 text-gray-800";
  };

  const getRoleColor = (role) => {
    const colors = {
      superadmin: "bg-red-100 text-red-800",
      admin: "bg-orange-100 text-orange-800",
      gestor: "bg-purple-100 text-purple-800",
      colaborador: "bg-blue-100 text-blue-800"
    };
    return colors[role] || "bg-gray-100 text-gray-800";
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
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Crown className="h-10 w-10 text-yellow-600" />
          <h1 className="text-4xl font-bold text-gray-900">Administração de Empresas</h1>
        </div>
        <p className="text-lg text-gray-600">Gerencie múltiplas contas em um só lugar</p>
        <Button 
          onClick={() => setShowCreateCompany(true)}
          className="bg-green-600 hover:bg-green-700"
          size="lg"
        >
          <Building2 className="h-5 w-5 mr-2" />
          Criar Nova Empresa
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Total Empresas</CardTitle>
            <Building2 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{stats.total_companies}</div>
            <p className="text-xs text-blue-600">{stats.active_companies} ativas</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Total Usuários</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{stats.total_users}</div>
            <p className="text-xs text-green-600">usuários cadastrados</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">Total Leads</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">{stats.total_leads}</div>
            <p className="text-xs text-purple-600">em todas empresas</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-700">Planos</CardTitle>
            <Crown className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-orange-700">Basic: {stats.companies_by_plan.basic || 0}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-orange-700">Premium: {stats.companies_by_plan.premium || 0}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-orange-700">Enterprise: {stats.companies_by_plan.enterprise || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="companies" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Empresas
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Gestão de Usuários
          </TabsTrigger>
        </TabsList>

        <TabsContent value="companies" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Lista de Empresas
              </CardTitle>
              <CardDescription>Gerencie todas as empresas cadastradas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome da Empresa</TableHead>
                      <TableHead>CNPJ</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Plano</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Criada em</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {companies.map((company) => (
                      <TableRow key={company.id}>
                        <TableCell className="font-medium">{company.name}</TableCell>
                        <TableCell>{company.cnpj || '-'}</TableCell>
                        <TableCell>{company.email}</TableCell>
                        <TableCell>
                          <Badge className={getPlanColor(company.plan)}>
                            {company.plan}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(company.status)}>
                            {company.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(company.created_at).toLocaleDateString('pt-BR')}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedCompany(company);
                                fetchCompanyUsers(company.id);
                                setActiveTab("users");
                              }}
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Select onValueChange={(status) => updateCompanyStatus(company.id, status)}>
                              <SelectTrigger className="w-32 h-8">
                                <SelectValue placeholder="Status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="ativa">Ativar</SelectItem>
                                <SelectItem value="inativa">Inativar</SelectItem>
                                <SelectItem value="suspensa">Suspender</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          {selectedCompany ? (
            <>
              <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-indigo-900">
                    <Building2 className="h-5 w-5" />
                    {selectedCompany.name}
                  </CardTitle>
                  <CardDescription className="text-indigo-700">
                    Gerencie usuários desta empresa
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-indigo-700">Status</p>
                        <Badge className={getStatusColor(selectedCompany.status)}>
                          {selectedCompany.status}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm text-indigo-700">Plano</p>
                        <Badge className={getPlanColor(selectedCompany.plan)}>
                          {selectedCompany.plan}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm text-indigo-700">Usuários</p>
                        <p className="font-semibold text-indigo-900">
                          {companyUsers.length}/{selectedCompany.limits?.max_users || 5}
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={() => setShowCreateUser(true)}
                      className="bg-indigo-600 hover:bg-indigo-700"
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Adicionar Usuário
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Usuários da Empresa</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nome</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Função</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Último Login</TableHead>
                          <TableHead>Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {companyUsers.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell className="font-medium">{user.name}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>
                              <Badge className={getRoleColor(user.role)}>
                                {user.role}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className={user.status === 'ativo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                                {user.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {user.last_login ? new Date(user.last_login).toLocaleDateString('pt-BR') : 'Nunca'}
                            </TableCell>
                            <TableCell>
                              <Select onValueChange={(role) => updateUserRole(user.id, role)}>
                                <SelectTrigger className="w-32 h-8">
                                  <SelectValue placeholder="Função" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="colaborador">Colaborador</SelectItem>
                                  <SelectItem value="gestor">Gestor</SelectItem>
                                  <SelectItem value="admin">Admin</SelectItem>
                                  <SelectItem value="superadmin">Super Admin</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Selecione uma empresa</h3>
                <p className="text-gray-500">Escolha uma empresa da lista para gerenciar seus usuários</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Create Company Dialog */}
      <Dialog open={showCreateCompany} onOpenChange={setShowCreateCompany}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar Nova Empresa</DialogTitle>
            <DialogDescription>
              Preencha os dados da nova empresa
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="companyName">Nome da Empresa</Label>
              <Input
                id="companyName"
                placeholder="Nome da empresa"
                value={newCompany.name}
                onChange={(e) => setNewCompany({...newCompany, name: e.target.value})}
              />
            </div>
            
            <div>
              <Label htmlFor="companyCnpj">CNPJ</Label>
              <Input
                id="companyCnpj"
                placeholder="00.000.000/0000-00"
                value={newCompany.cnpj}
                onChange={(e) => setNewCompany({...newCompany, cnpj: e.target.value})}
              />
            </div>
            
            <div>
              <Label htmlFor="companyEmail">Email</Label>
              <Input
                id="companyEmail"
                type="email"
                placeholder="contato@empresa.com"
                value={newCompany.email}
                onChange={(e) => setNewCompany({...newCompany, email: e.target.value})}
              />
            </div>
            
            <div>
              <Label htmlFor="companyPhone">Telefone</Label>
              <Input
                id="companyPhone"
                placeholder="(11) 99999-9999"
                value={newCompany.phone}
                onChange={(e) => setNewCompany({...newCompany, phone: e.target.value})}
              />
            </div>
            
            <div>
              <Label htmlFor="companyPlan">Plano</Label>
              <Select value={newCompany.plan} onValueChange={(plan) => setNewCompany({...newCompany, plan})}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o plano" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Basic</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button onClick={createCompany} className="flex-1">
                Criar Empresa
              </Button>
              <Button variant="outline" onClick={() => setShowCreateCompany(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create User Dialog */}
      <Dialog open={showCreateUser} onOpenChange={setShowCreateUser}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Usuário</DialogTitle>
            <DialogDescription>
              Adicione um novo usuário à empresa {selectedCompany?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="userName">Nome</Label>
              <Input
                id="userName"
                placeholder="Nome do usuário"
                value={newUser.name}
                onChange={(e) => setNewUser({...newUser, name: e.target.value})}
              />
            </div>
            
            <div>
              <Label htmlFor="userEmail">Email</Label>
              <Input
                id="userEmail"
                type="email"
                placeholder="usuario@empresa.com"
                value={newUser.email}
                onChange={(e) => setNewUser({...newUser, email: e.target.value})}
              />
            </div>
            
            <div>
              <Label htmlFor="userRole">Função</Label>
              <Select value={newUser.role} onValueChange={(role) => setNewUser({...newUser, role})}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a função" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="colaborador">Colaborador</SelectItem>
                  <SelectItem value="gestor">Gestor</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button onClick={createUser} className="flex-1">
                Criar Usuário
              </Button>
              <Button variant="outline" onClick={() => setShowCreateUser(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
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

// Live Chat Component - Omnichannel Style
const LiveChat = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [leads, setLeads] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [filter, setFilter] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [whatsappIntegration, setWhatsappIntegration] = useState({ is_connected: false });
  const [showConnectDialog, setShowConnectDialog] = useState(false);
  const [connectionForm, setConnectionForm] = useState({ phone_number: '', business_name: '' });
  const [selectedLead, setSelectedLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [leadNotes, setLeadNotes] = useState('');
  const [leadTags, setLeadTags] = useState([]);
  const [newTag, setNewTag] = useState('');
  const [assignedAgent, setAssignedAgent] = useState('');
  const [priority, setPriority] = useState('media');
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const [notesHistory, setNotesHistory] = useState([]);
  const [showMacros, setShowMacros] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  // Separate useEffect for notifications to avoid infinite loops
  useEffect(() => {
    const interval = setInterval(() => {
      setConversations(prev => {
        const hasNewConversations = prev.some(conv => conv.status === 'novo' && !conv.notified);
        if (hasNewConversations) {
          toast.info('🔔 Novo atendimento aguardando atendente', {
            duration: 5000,
          });
          // Mark conversations as notified
          return prev.map(conv => 
            conv.status === 'novo' && !conv.notified ? { ...conv, notified: true } : conv
          );
        }
        return prev; // Return unchanged if no new conversations
      });
    }, 30000);

    return () => clearInterval(interval);
  }, []); // Empty dependency array to run only once

  const fetchData = async () => {
    try {
      const [leadsRes, integrationRes] = await Promise.all([
        axios.get(`${API}/leads`),
        axios.get(`${API}/whatsapp-integration`)
      ]);
      
      setLeads(leadsRes.data);
      setWhatsappIntegration(integrationRes.data);
      
      // Create enhanced conversations from leads
      const enhancedConversations = leadsRes.data.map(lead => ({
        id: `conv_${lead.id}`,
        lead_id: lead.id,
        status: Math.random() > 0.6 ? 'novo' : Math.random() > 0.5 ? 'em_atendimento' : 'fechado',
        assigned_to: Math.random() > 0.7 ? 'João Silva' : null,
        assigned_agent: Math.random() > 0.7 ? 'João Silva' : 'IA Bot',
        channel: 'whatsapp',
        priority: ['alta', 'media', 'baixa'][Math.floor(Math.random() * 3)],
        last_message: [
          'Olá! Estou interessado em imóveis.',
          'Gostaria de agendar uma visita.',
          'Qual o valor do apartamento?',
          'Ainda estou interessado no imóvel.',
          'Preciso de mais informações.'
        ][Math.floor(Math.random() * 5)],
        last_message_time: lead.last_interaction,
        unread_count: Math.floor(Math.random() * 5),
        lead: {
          ...lead,
          team: 'Vendas',
          tags: lead.tags || ['Cliente', 'WhatsApp'],
        },
        notified: false
      }));
      
      setConversations(enhancedConversations);
      
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
    setLeadTags(conversation.lead.tags || []);
    setAssignedAgent(conversation.assigned_agent || '');
    setPriority(conversation.priority || 'media');
    
    // Load notes history
    setNotesHistory([
      { id: 1, note: 'Cliente muito interessado em apartamentos na zona sul', author: 'João Silva', date: new Date(Date.now() - 86400000) },
      { id: 2, note: 'Orçamento até R$ 500.000', author: 'Maria Santos', date: new Date(Date.now() - 172800000) }
    ]);
    
    try {
      const response = await axios.get(`${API}/chat/${conversation.lead_id}`);
      // Enhance messages with more realistic data
      const enhancedMessages = response.data.map(msg => ({
        ...msg,
        sender_name: msg.sender === 'agent' ? 'IA Bot' : msg.sender === 'human' ? 'João Silva' : conversation.lead.name
      }));
      setMessages(enhancedMessages);
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
      setMessages([
        {
          id: '1',
          sender: 'lead',
          sender_name: conversation.lead.name,
          message: 'Olá! Estou interessado em apartamentos na zona sul.',
          timestamp: new Date(Date.now() - 3600000).toISOString()
        },
        {
          id: '2',
          sender: 'agent',
          sender_name: 'IA Bot',
          message: 'Olá! Que bom falar com você. Tenho várias opções de apartamentos na zona sul. Qual seu orçamento?',
          timestamp: new Date(Date.now() - 3500000).toISOString()
        },
        {
          id: '3',
          sender: 'lead',
          sender_name: conversation.lead.name,
          message: 'Até R$ 500.000. Tem algo disponível?',
          timestamp: new Date(Date.now() - 3400000).toISOString()
        }
      ]);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !leadTags.includes(newTag.trim())) {
      const updatedTags = [...leadTags, newTag.trim()];
      setLeadTags(updatedTags);
      setNewTag('');
      // Update lead in conversations
      setConversations(prev => prev.map(conv => 
        conv.id === selectedConversation.id 
          ? { ...conv, lead: { ...conv.lead, tags: updatedTags } }
          : conv
      ));
      toast.success('Tag adicionada com sucesso!');
    }
  };

  const removeTag = (tagToRemove) => {
    const updatedTags = leadTags.filter(tag => tag !== tagToRemove);
    setLeadTags(updatedTags);
    setConversations(prev => prev.map(conv => 
      conv.id === selectedConversation.id 
        ? { ...conv, lead: { ...conv.lead, tags: updatedTags } }
        : conv
    ));
    toast.success('Tag removida com sucesso!');
  };

  const saveNotes = () => {
    if (leadNotes.trim()) {
      const newNote = {
        id: Date.now(),
        note: leadNotes.trim(),
        author: 'Você',
        date: new Date()
      };
      setNotesHistory(prev => [newNote, ...prev]);
      setLeadNotes('');
      toast.success('Observação salva com sucesso!');
    }
  };

  const applyMacro = (macroText) => {
    setNewMessage(macroText);
    setShowMacros(false);
    toast.success('Macro aplicada!');
  };

  const quickReplies = [
    'Olá! Como posso ajudá-lo?',
    'Obrigado pelo contato. Vou verificar isso para você.',
    'Temos várias opções disponíveis. Gostaria de agendar uma visita?',
    'Vou transferir você para um especialista.',
    'Entendo sua necessidade. Deixe-me buscar as melhores opções.'
  ];

  const macros = [
    { name: 'Saudação', text: 'Olá! Sou [NOME] da [EMPRESA]. Como posso ajudá-lo hoje?' },
    { name: 'Agendamento', text: 'Vou agendar uma visita para você. Qual o melhor dia e horário?' },
    { name: 'Orçamento', text: 'Para apresentar as melhores opções, preciso saber seu orçamento. Qual valor você tem em mente?' },
    { name: 'Encerramento', text: 'Foi um prazer atendê-lo! Qualquer dúvida, estarei à disposição.' }
  ];

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const newMsg = {
      id: Date.now().toString(),
      lead_id: selectedConversation.lead_id,
      sender: 'human',
      sender_name: 'Você',
      message: newMessage,
      timestamp: new Date().toISOString()
    };

    try {
      // Add message to local state immediately for better UX
      setMessages(prev => [...prev, newMsg]);
      
      // Send message via API
      await axios.post(`${API}/chat/message`, {
        lead_id: selectedConversation.lead_id,
        sender: 'human',
        sender_name: 'Atendente',
        message: newMessage,
        channel: 'whatsapp'
      });

      // Send directly to WhatsApp via Evolution API if available
      try {
        await axios.post(`${API}/whatsapp/send-message`, {
          lead_id: selectedConversation.lead_id,
          message: newMessage
        });
        toast.success('Mensagem enviada para o WhatsApp!');
      } catch (whatsappError) {
        console.warn('WhatsApp send failed:', whatsappError);
        toast.success('Mensagem enviada!');
      }

      setNewMessage('');
      setShowQuickReplies(false);
      setShowMacros(false);
      
      // Update conversation last message
      setConversations(prev => prev.map(conv => 
        conv.id === selectedConversation.id 
          ? { ...conv, last_message: newMessage, last_message_time: new Date().toISOString(), unread_count: 0 }
          : conv
      ));
      
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast.error('Erro ao enviar mensagem');
      // Remove message from local state if failed
      setMessages(prev => prev.filter(msg => msg.id !== newMsg.id));
    }
  };

  const assignToMe = async () => {
    if (!selectedConversation) return;
    
    try {
      // Update conversation status
      const updatedConversations = conversations.map(conv => 
        conv.id === selectedConversation.id 
          ? { ...conv, status: 'em_atendimento', assigned_to: 'João Silva', assigned_agent: 'João Silva' }
          : conv
      );
      
      setConversations(updatedConversations);
      setSelectedConversation({ 
        ...selectedConversation, 
        status: 'em_atendimento', 
        assigned_to: 'João Silva',
        assigned_agent: 'João Silva'
      });
      
      toast.success('Atendimento assumido com sucesso!');
      
      // Add system message
      const systemMsg = {
        id: Date.now().toString(),
        lead_id: selectedConversation.lead_id,
        sender: 'system',
        sender_name: 'Sistema',
        message: '👤 Atendimento assumido por João Silva',
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, systemMsg]);
      
    } catch (error) {
      console.error('Erro ao assumir atendimento:', error);
      toast.error('Erro ao assumir atendimento');
    }
  };

  const returnToBot = async () => {
    if (!selectedConversation) return;
    
    try {
      // Update conversation status
      const updatedConversations = conversations.map(conv => 
        conv.id === selectedConversation.id 
          ? { ...conv, status: 'novo', assigned_to: null, assigned_agent: 'IA Bot' }
          : conv
      );
      
      setConversations(updatedConversations);
      setSelectedConversation({ 
        ...selectedConversation, 
        status: 'novo', 
        assigned_to: null,
        assigned_agent: 'IA Bot'
      });
      
      toast.success('Conversa devolvida para a IA!');
      
      // Add system message
      const systemMsg = {
        id: Date.now().toString(),
        lead_id: selectedConversation.lead_id,
        sender: 'system',
        sender_name: 'Sistema',
        message: '🤖 Atendimento transferido para IA Bot',
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, systemMsg]);
      
    } catch (error) {
      console.error('Erro ao devolver para IA:', error);
      toast.error('Erro ao devolver para IA');
    }
  };

  const closeConversation = async () => {
    if (!selectedConversation) return;
    
    try {
      // Update conversation status
      const updatedConversations = conversations.map(conv => 
        conv.id === selectedConversation.id 
          ? { ...conv, status: 'fechado' }
          : conv
      );
      
      setConversations(updatedConversations);
      setSelectedConversation({ ...selectedConversation, status: 'fechado' });
      
      toast.success('Conversa encerrada com sucesso!');
      
      // Add system message
      const systemMsg = {
        id: Date.now().toString(),
        lead_id: selectedConversation.lead_id,
        sender: 'system',
        sender_name: 'Sistema',
        message: '✅ Conversa encerrada',
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, systemMsg]);
      
    } catch (error) {
      console.error('Erro ao encerrar conversa:', error);
      toast.error('Erro ao encerrar conversa');
    }
  };

  const filteredConversations = conversations.filter(conv => {
    // Filter by status
    const statusMatch = filter === 'todos' || 
                       (filter === 'novos' && conv.status === 'novo') ||
                       (filter === 'em_atendimento' && conv.status === 'em_atendimento') ||
                       (filter === 'fechados' && conv.status === 'fechado');
    
    // Filter by search term
    const searchMatch = !searchTerm || 
                       conv.lead?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       conv.lead?.phone?.includes(searchTerm) ||
                       conv.last_message?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return statusMatch && searchMatch;
  });

  const getStatusColor = (status) => {
    const colors = {
      novo: "bg-blue-100 text-blue-800 border-blue-200",
      em_atendimento: "bg-green-100 text-green-800 border-green-200",
      fechado: "bg-gray-100 text-gray-800 border-gray-200"
    };
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const getStatusLabel = (status) => {
    const labels = {
      novo: "Novo",
      em_atendimento: "Em Atendimento",
      fechado: "Fechado"
    };
    return labels[status] || status;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      alta: "bg-red-100 text-red-800",
      media: "bg-yellow-100 text-yellow-800",
      baixa: "bg-green-100 text-green-800"
    };
    return colors[priority] || "bg-gray-100 text-gray-800";
  };

  const getChannelIcon = (channel) => {
    switch (channel) {
      case 'whatsapp':
        return <MessageCircle className="h-3 w-3 text-green-600" />;
      case 'email':
        return <Mail className="h-3 w-3 text-blue-600" />;
      default:
        return <MessageSquare className="h-3 w-3 text-gray-600" />;
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
    <div className="h-screen flex flex-col bg-gray-50">
      {/* WhatsApp Connection Banner */}
      {!whatsappIntegration.is_connected && (
        <div className="bg-green-500 text-white p-3 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <MessageCircle className="h-5 w-5" />
            <span className="font-medium">Conecte o WhatsApp para ativar o atendimento ao vivo</span>
          </div>
          <Button 
            variant="secondary" 
            size="sm"
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
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          {/* Header da Sidebar */}
          <div className="p-4 border-b border-gray-200 bg-white">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Chat ao Vivo</h2>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  <div className="absolute inset-0 w-3 h-3 bg-green-400 rounded-full animate-ping opacity-30"></div>
                </div>
                <span className="text-xs text-green-600 font-medium">Online</span>
              </div>
            </div>
            
            {/* Busca Global */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar conversas, nomes, telefones..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-9 bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-300"
              />
            </div>
            
            {/* Filtros */}
            <div className="flex gap-1 flex-wrap">
              {[
                { key: 'todos', label: 'Todos', count: conversations.length },
                { key: 'novos', label: 'Novos', count: conversations.filter(c => c.status === 'novo').length },
                { key: 'em_atendimento', label: 'Atendimento', count: conversations.filter(c => c.status === 'em_atendimento').length },
                { key: 'fechados', label: 'Fechados', count: conversations.filter(c => c.status === 'fechado').length }
              ].map(({ key, label, count }) => (
                <Button
                  key={key}
                  size="sm"
                  variant={filter === key ? "default" : "ghost"}
                  onClick={() => setFilter(key)}
                  className={`text-xs h-8 px-2 mr-1 mb-1 ${filter === key ? 'bg-blue-600 text-white' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}
                >
                  {label}
                  {count > 0 && (
                    <Badge className="ml-1 h-4 px-1 text-xs bg-gray-200 text-gray-700 rounded-full">
                      {count}
                    </Badge>
                  )}
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
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-all duration-150 ${
                  selectedConversation?.id === conversation.id ? 'bg-blue-50 border-blue-200 border-l-4 border-l-blue-500' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="relative">
                    <Avatar className="h-11 w-11">
                      <AvatarFallback className="bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700 font-semibold">
                        {conversation.lead?.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    {/* Status indicator */}
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                      conversation.status === 'novo' ? 'bg-blue-500' :
                      conversation.status === 'em_atendimento' ? 'bg-green-500' : 'bg-gray-400'
                    }`}></div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-sm text-gray-900 truncate">
                        {conversation.lead?.name}
                      </p>
                      <div className="flex items-center gap-1">
                        {getChannelIcon(conversation.channel)}
                        {conversation.unread_count > 0 && (
                          <Badge className="h-4 px-1.5 text-xs bg-red-500 text-white rounded-full">
                            {conversation.unread_count}
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-xs text-gray-500 truncate mb-2 leading-relaxed">
                      {conversation.last_message}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className={`text-xs px-2 py-0.5 border ${getStatusColor(conversation.status)}`}>
                          {getStatusLabel(conversation.status)}
                        </Badge>
                        {conversation.priority === 'alta' && (
                          <Badge className={`text-xs px-2 py-0.5 ${getPriorityColor(conversation.priority)}`}>
                            ⚡ Alta
                          </Badge>
                        )}
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-xs text-gray-400">
                          {new Date(conversation.last_message_time).toLocaleTimeString('pt-BR', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                        {conversation.assigned_agent && (
                          <span className="text-xs text-blue-600 flex items-center gap-1 mt-1">
                            <UserCheck className="h-3 w-3" />
                            {conversation.assigned_agent === 'IA Bot' ? '🤖' : '👤'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {filteredConversations.length === 0 && (
              <div className="text-center py-12">
                <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">
                  {searchTerm ? 'Nenhuma conversa encontrada' : 'Nenhuma conversa disponível'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Área Principal do Chat */}
        <div className="flex-1 flex min-w-0">
          {selectedConversation ? (
            <>
              {/* Chat Area */}
              <div className="flex-1 flex flex-col bg-white min-w-0">
                {/* Header do Chat */}
                <div className="px-4 py-3 border-b border-gray-200 bg-white shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <Avatar className="h-10 w-10 flex-shrink-0">
                        <AvatarFallback className="bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700 font-semibold">
                          {selectedLead?.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">{selectedLead?.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-500 flex-wrap">
                          <div className="flex items-center gap-1">
                            {getChannelIcon(selectedConversation.channel)}
                            <span className="capitalize text-xs">{selectedConversation.channel}</span>
                          </div>
                          <span className="hidden sm:inline">•</span>
                          <div className="flex items-center gap-1 text-xs">
                            {selectedConversation.assigned_agent === 'IA Bot' ? (
                              <>
                                🤖 <span className="hidden sm:inline">Atendido pela IA</span>
                              </>
                            ) : selectedConversation.assigned_agent ? (
                              <>
                                👤 <span className="hidden sm:inline">Atendido por {selectedConversation.assigned_agent}</span>
                              </>
                            ) : (
                              <span className="text-orange-600 font-medium text-xs">Aguardando</span>
                            )}
                          </div>
                          {selectedConversation.priority === 'alta' && (
                            <>
                              <span className="hidden sm:inline">•</span>
                              <Badge className="bg-red-100 text-red-700 text-xs px-2 py-0.5">⚡</Badge>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 ml-2">
                      {selectedConversation.status === 'novo' && (
                        <Button size="sm" onClick={assignToMe} className="bg-green-600 hover:bg-green-700 text-xs px-3 py-1">
                          <UserCheck className="h-3 w-3 mr-1" />
                          <span className="hidden sm:inline">Assumir</span>
                        </Button>
                      )}
                      {selectedConversation.status === 'em_atendimento' && (
                        <Button size="sm" variant="outline" onClick={returnToBot} className="border-blue-300 text-blue-700 hover:bg-blue-50 text-xs px-3 py-1">
                          <Bot className="h-3 w-3 mr-1" />
                          <span className="hidden sm:inline">IA</span>
                        </Button>
                      )}
                      <Button size="sm" variant="outline" onClick={closeConversation} className="border-gray-300 text-gray-700 hover:bg-gray-50 text-xs px-3 py-1">
                        <X className="h-3 w-3 mr-1" />
                        <span className="hidden sm:inline">Encerrar</span>
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto px-4 py-3 bg-gray-50 space-y-3">
                  {messages.map((message, index) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'lead' ? 'justify-start' : 'justify-end'} ${index > 0 ? 'mt-3' : ''}`}
                    >
                      <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-sm ${
                        message.sender === 'lead'
                          ? 'bg-white text-gray-900 border border-gray-200'
                          : message.sender === 'agent'
                          ? 'bg-green-500 text-white'
                          : message.sender === 'system'
                          ? 'bg-gray-200 text-gray-700 text-center text-xs px-3 py-2'
                          : 'bg-blue-500 text-white'
                      }`}>
                        {/* Sender label - only for non-lead messages */}
                        {message.sender !== 'lead' && message.sender !== 'system' && (
                          <div className="flex items-center gap-1 mb-1">
                            {message.sender === 'agent' ? (
                              <>
                                <span className="text-xs">🤖</span>
                                <span className="text-xs font-medium opacity-90">IA Bot</span>
                              </>
                            ) : (
                              <>
                                <span className="text-xs">👤</span>
                                <span className="text-xs font-medium opacity-90">{message.sender_name}</span>
                              </>
                            )}
                          </div>
                        )}
                        
                        <div>
                          <p className={`text-sm leading-relaxed ${message.sender === 'system' ? 'text-center' : ''}`}>
                            {message.message}
                          </p>
                          {message.sender !== 'system' && (
                            <p className={`text-xs mt-2 ${
                              message.sender === 'lead' 
                                ? 'text-gray-500' 
                                : 'text-white opacity-75'
                            }`}>
                              {new Date(message.timestamp).toLocaleTimeString('pt-BR', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Message Composer */}
                <div className="px-4 py-3 border-t border-gray-200 bg-white">
                  {/* Quick Replies */}
                  {showQuickReplies && (
                    <div className="mb-3 p-3 bg-gray-50 rounded-lg border">
                      <p className="text-xs font-medium text-gray-700 mb-2">Respostas Rápidas:</p>
                      <div className="flex flex-wrap gap-2">
                        {quickReplies.map((reply, index) => (
                          <Button
                            key={index}
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setNewMessage(reply);
                              setShowQuickReplies(false);
                            }}
                            className="text-xs h-7 px-2 bg-white hover:bg-blue-50 border-gray-300"
                          >
                            {reply.length > 25 ? reply.substring(0, 25) + '...' : reply}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Macros */}
                  {showMacros && (
                    <div className="mb-3 p-3 bg-gray-50 rounded-lg border">
                      <p className="text-xs font-medium text-gray-700 mb-2">Macros Disponíveis:</p>
                      <div className="space-y-2">
                        {macros.map((macro, index) => (
                          <Button
                            key={index}
                            size="sm"
                            variant="outline"
                            onClick={() => applyMacro(macro.text)}
                            className="w-full justify-start text-xs h-8 bg-white hover:bg-blue-50 border-gray-300"
                          >
                            <span className="font-medium mr-2">{macro.name}:</span>
                            <span className="text-gray-600 truncate">{macro.text}</span>
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Composer */}
                  <div className="flex items-end gap-2">
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setShowQuickReplies(!showQuickReplies)}
                        className="text-gray-600 hover:text-gray-900 h-9 w-9 p-0 flex-shrink-0"
                        title="Respostas Rápidas"
                      >
                        ⚡
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setShowMacros(!showMacros)}
                        className="text-gray-600 hover:text-gray-900 h-9 w-9 p-0 flex-shrink-0"
                        title="Macros"
                      >
                        📋
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-gray-600 hover:text-gray-900 h-9 w-9 p-0 flex-shrink-0"
                        title="Anexar Arquivo"
                      >
                        <Paperclip className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="flex-1 relative min-w-0">
                      <Textarea
                        placeholder="Digite sua mensagem..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
                        className="min-h-[40px] max-h-32 resize-none pr-12 py-2 text-sm"
                        rows={1}
                      />
                      <Button
                        size="sm"
                        onClick={sendMessage}
                        disabled={!newMessage.trim()}
                        className="absolute right-2 bottom-2 h-7 w-7 p-0 bg-blue-600 hover:bg-blue-700 flex-shrink-0"
                      >
                        <Send className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Painel Lateral Direito - Informações do Lead */}
              <div className="w-80 border-l border-gray-200 bg-white flex flex-col">
                <div className="px-4 py-3 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Informações do Lead
                  </h3>
                  
                  {/* Informações Básicas */}
                  <div className="space-y-3 mb-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Nome</Label>
                      <p className="text-sm text-gray-900 font-medium mt-1">{selectedLead?.name}</p>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Telefone</Label>
                      <p className="text-sm text-gray-900 flex items-center gap-2 mt-1">
                        <Phone className="h-3 w-3" />
                        {selectedLead?.phone}
                      </p>
                    </div>
                    
                    {selectedLead?.email && (
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Email</Label>
                        <p className="text-sm text-gray-900 flex items-center gap-2 mt-1">
                          <Mail className="h-3 w-3" />
                          {selectedLead?.email}
                        </p>
                      </div>
                    )}
                    
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Status no CRM</Label>
                      <Badge className={`mt-1 text-xs px-2 py-1 ${getStatusColor(selectedLead?.status)}`}>
                        {getStatusLabel(selectedLead?.status)}
                      </Badge>
                    </div>
                  </div>

                  {/* Tags Editáveis */}
                  <div className="mb-4">
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">Tags</Label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {leadTags.map((tag, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="px-2 py-1 text-xs flex items-center gap-1 bg-blue-50 text-blue-700 border-blue-200"
                        >
                          {tag}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeTag(tag)}
                            className="h-3 w-3 p-0 hover:bg-red-100 text-red-600 ml-1 rounded-full"
                          >
                            <X className="h-2 w-2" />
                          </Button>
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Nova tag"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addTag();
                          }
                        }}
                        className="h-8 text-xs flex-1"
                      />
                      <Button 
                        size="sm" 
                        onClick={addTag} 
                        disabled={!newTag.trim()}
                        className="h-8 px-3 text-xs bg-blue-600 hover:bg-blue-700"
                      >
                        +
                      </Button>
                    </div>
                  </div>

                  {/* Atribuição e Prioridade */}
                  <div className="space-y-3 mb-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700 mb-1 block">Agente Responsável</Label>
                      <Select value={assignedAgent} onValueChange={setAssignedAgent}>
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Selecionar agente" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="IA Bot">🤖 IA Bot</SelectItem>
                          <SelectItem value="João Silva">👤 João Silva</SelectItem>
                          <SelectItem value="Maria Santos">👤 Maria Santos</SelectItem>
                          <SelectItem value="Pedro Oliveira">👤 Pedro Oliveira</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-gray-700 mb-1 block">Equipe</Label>
                      <p className="text-sm text-gray-900">{selectedLead?.team || 'Vendas'}</p>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-gray-700 mb-1 block">Prioridade</Label>
                      <Select value={priority} onValueChange={setPriority}>
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="baixa">🟢 Baixa</SelectItem>
                          <SelectItem value="media">🟡 Média</SelectItem>
                          <SelectItem value="alta">🔴 Alta</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Observações Internas */}
                <div className="flex-1 px-4 py-3 overflow-y-auto">
                  <div className="mb-4">
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">Observações Internas</Label>
                    <div className="space-y-3">
                      <Textarea
                        placeholder="Adicione uma observação sobre este lead..."
                        value={leadNotes}
                        onChange={(e) => setLeadNotes(e.target.value)}
                        className="h-20 text-xs resize-none"
                        rows={3}
                      />
                      <Button 
                        size="sm" 
                        onClick={saveNotes} 
                        disabled={!leadNotes.trim()}
                        className="w-full h-8 text-xs bg-gray-900 hover:bg-gray-800"
                      >
                        Salvar Observação
                      </Button>
                    </div>
                  </div>

                  {/* Histórico de Observações */}
                  {notesHistory.length > 0 && (
                    <div>
                      <Label className="text-sm font-medium text-gray-700 mb-3 block">Histórico de Observações</Label>
                      <div className="space-y-3">
                        {notesHistory.map((note) => (
                          <div key={note.id} className="p-3 bg-gray-50 rounded-lg border">
                            <p className="text-xs text-gray-900 leading-relaxed mb-2">{note.note}</p>
                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <span className="font-medium">{note.author}</span>
                              <span>{note.date.toLocaleDateString('pt-BR')} às {note.date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            // Estado vazio
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center px-4">
                <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Selecione uma conversa</h3>
                <p className="text-gray-500">Escolha uma conversa da lista para começar o atendimento omnichannel</p>
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

// Modern Header Navigation Component
const ModernHeader = () => {
  const location = useLocation();
  const [activeItem, setActiveItem] = useState(location.pathname);

  useEffect(() => {
    setActiveItem(location.pathname);
  }, [location.pathname]);

  const navItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/agent', label: 'IA', icon: '🤖' },
    { path: '/crm', label: 'CRM', icon: '👥' },
    { path: '/live-chat', label: 'Chat ao Vivo', icon: '💬' },
    { path: '/automation', label: 'Automação', icon: '⚡' },
    { path: '/whatsapp-config', label: 'WhatsApp', icon: '📱' },
    { path: '/reports', label: 'Relatórios', icon: '📈' },
    { path: '/super-admin', label: 'Super Admin', icon: '👑' }
  ];

  const handleItemClick = (path) => {
    setActiveItem(path);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200/80 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">P</span>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-xl text-gray-900 leading-tight">PropBot</span>
              <span className="text-xs text-gray-500 font-medium leading-tight">CRM</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => handleItemClick(item.path)}
                className={`
                  relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ease-in-out
                  flex items-center gap-2 select-none cursor-pointer group overflow-hidden
                  ${activeItem === item.path 
                    ? 'bg-black text-white shadow-lg transform scale-105' 
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100/80'
                  }
                `}
                style={{
                  transform: activeItem === item.path ? 'scale(1.05)' : 'scale(1)',
                  transformOrigin: 'center'
                }}
              >
                {/* Background hover effect */}
                <div className={`
                  absolute inset-0 bg-gradient-to-r from-blue-50 to-blue-100 opacity-0 
                  transition-opacity duration-300 ease-in-out -z-10
                  ${activeItem !== item.path ? 'group-hover:opacity-100' : ''}
                `} />
                
                {/* Active item background */}
                <div className={`
                  absolute inset-0 bg-gradient-to-r from-gray-900 to-black opacity-0 
                  transition-opacity duration-300 ease-in-out -z-10
                  ${activeItem === item.path ? 'opacity-100' : ''}
                `} />

                {/* Icon */}
                <span className={`
                  text-base transition-transform duration-300 ease-in-out
                  ${activeItem === item.path ? 'transform scale-110' : 'group-hover:transform group-hover:scale-110'}
                `}>
                  {item.icon}
                </span>

                {/* Label */}
                <span className={`
                  transition-all duration-300 ease-in-out relative z-10
                  ${activeItem === item.path ? 'font-semibold' : 'group-hover:font-semibold'}
                `}>
                  {item.label}
                </span>

                {/* Active indicator */}
                <div className={`
                  absolute bottom-0 left-1/2 transform -translate-x-1/2 h-0.5 bg-white transition-all duration-300 ease-in-out
                  ${activeItem === item.path ? 'w-full opacity-100' : 'w-0 opacity-0'}
                `} />

                {/* Ripple effect on click */}
                <div className="absolute inset-0 overflow-hidden rounded-lg">
                  <div className={`
                    absolute inset-0 bg-white/20 transform scale-0 rounded-full transition-transform duration-500 ease-out
                    ${activeItem === item.path ? 'animate-ping' : ''}
                  `} />
                </div>
              </Link>
            ))}
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button className="p-2 rounded-lg text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors duration-200">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t border-gray-200/80 bg-white/95 backdrop-blur-sm">
        <div className="px-4 py-3 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => handleItemClick(item.path)}
              className={`
                block px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 ease-in-out
                flex items-center gap-3 relative overflow-hidden
                ${activeItem === item.path 
                  ? 'bg-black text-white shadow-lg' 
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100/80'
                }
              `}
            >
              {/* Mobile background effects */}
              <div className={`
                absolute inset-0 bg-gradient-to-r from-blue-50 to-blue-100 opacity-0 
                transition-opacity duration-300 ease-in-out
                ${activeItem !== item.path ? 'hover:opacity-100' : ''}
              `} />
              
              <span className="text-lg relative z-10">{item.icon}</span>
              <span className="relative z-10">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
};

// Main App Component
function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <BrowserRouter>
        <ModernHeader />
        <main className="max-w-7xl mx-auto pt-20 py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/agent" element={<AgentConfig />} />
              <Route path="/crm" element={<CRM />} />
              <Route path="/live-chat" element={<LiveChat />} />
              <Route path="/automation" element={<CommercialAutomation />} />
              <Route path="/whatsapp-config" element={<WhatsAppConfig />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/chat/:leadId" element={<ChatWrapper />} />
              <Route path="/super-admin" element={<SuperAdmin />} />
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

// Commercial Automation Component
const CommercialAutomation = () => {
  const [activeTab, setActiveTab] = useState('settings');
  const [settings, setSettings] = useState(null);
  const [history, setHistory] = useState([]);
  const [qualifiedLeads, setQualifiedLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [settingsRes, historyRes, qualifiedRes] = await Promise.all([
        axios.get(`${API}/automation/settings`),
        axios.get(`${API}/automation/history?limit=50`),
        axios.get(`${API}/automation/qualified-leads`)
      ]);
      
      setSettings(settingsRes.data);
      setHistory(historyRes.data);
      setQualifiedLeads(qualifiedRes.data);
    } catch (error) {
      console.error('Erro ao carregar dados de automação:', error);
      toast.error('Erro ao carregar dados de automação');
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (newSettings) => {
    try {
      setProcessing(true);
      await axios.put(`${API}/automation/settings`, newSettings);
      setSettings(newSettings);
      toast.success('Configurações salvas com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast.error('Erro ao salvar configurações');
    } finally {
      setProcessing(false);
    }
  };

  const processFollowUps = async () => {
    try {
      setProcessing(true);
      const response = await axios.post(`${API}/automation/process-followups`);
      toast.success(response.data.message);
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Erro ao processar follow-ups:', error);
      toast.error('Erro ao processar follow-ups');
    } finally {
      setProcessing(false);
    }
  };

  const processReactivations = async () => {
    try {
      setProcessing(true);
      const response = await axios.post(`${API}/automation/process-reactivations`);
      toast.success(response.data.message);
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Erro ao processar reativações:', error);
      toast.error('Erro ao processar reativações');
    } finally {
      setProcessing(false);
    }
  };

  const qualifyLeads = async () => {
    try {
      setProcessing(true);
      const response = await axios.get(`${API}/automation/qualify-leads`);
      toast.success(response.data.message);
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Erro ao qualificar leads:', error);
      toast.error('Erro ao qualificar leads');
    } finally {
      setProcessing(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'scheduled': 'bg-blue-100 text-blue-800',
      'sent': 'bg-green-100 text-green-800',
      'failed': 'bg-red-100 text-red-800',
      'cancelled': 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status) => {
    const labels = {
      'scheduled': 'Agendado',
      'sent': 'Enviado',
      'failed': 'Falhou',
      'cancelled': 'Cancelado'
    };
    return labels[status] || status;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-2" />
          <p className="text-gray-600">Carregando automação comercial...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Automação Comercial</h1>
              <p className="text-gray-600">Configure follow-ups automáticos, reativação de leads e qualificação inteligente</p>
            </div>
            
            <div className="flex gap-2">
              <Button onClick={processFollowUps} disabled={processing} variant="outline">
                <Send className="h-4 w-4 mr-2" />
                {processing ? 'Processando...' : 'Executar Follow-ups'}
              </Button>
              <Button onClick={processReactivations} disabled={processing} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                {processing ? 'Processando...' : 'Executar Reativações'}
              </Button>
              <Button onClick={qualifyLeads} disabled={processing}>
                <UserCheck className="h-4 w-4 mr-2" />
                {processing ? 'Processando...' : 'Qualificar Leads'}
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="settings">Configurações</TabsTrigger>
            <TabsTrigger value="qualified">Leads Qualificados</TabsTrigger>
            <TabsTrigger value="history">Histórico</TabsTrigger>
            <TabsTrigger value="analytics">Relatórios</TabsTrigger>
          </TabsList>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Configurações de Follow-up por Etapa
                </CardTitle>
                <CardDescription>
                  Configure mensagens automáticas baseadas na etapa do funil de vendas
                </CardDescription>
              </CardHeader>
              <CardContent>
                {settings?.follow_up_configs?.map((config, index) => (
                  <div key={index} className="border rounded-lg p-4 mb-4 bg-gray-50">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-gray-900 capitalize">
                        {config.stage.replace('_', ' ')}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">Ativado</span>
                        <input 
                          type="checkbox" 
                          checked={config.enabled}
                          onChange={(e) => {
                            const newSettings = { ...settings };
                            newSettings.follow_up_configs[index].enabled = e.target.checked;
                            updateSettings(newSettings);
                          }}
                          className="rounded border-gray-300"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium mb-1 block">Intervalos (horas)</Label>
                        <Input 
                          value={config.intervals.join(', ')}
                          onChange={(e) => {
                            const newSettings = { ...settings };
                            newSettings.follow_up_configs[index].intervals = 
                              e.target.value.split(',').map(i => parseInt(i.trim())).filter(i => !isNaN(i));
                            setSettings(newSettings);
                          }}
                          placeholder="1, 24, 72"
                          className="text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium mb-1 block">Template da Mensagem</Label>
                        <Textarea 
                          value={config.message_template}
                          onChange={(e) => {
                            const newSettings = { ...settings };
                            newSettings.follow_up_configs[index].message_template = e.target.value;
                            setSettings(newSettings);
                          }}
                          placeholder="Olá {name}, como posso ajudá-lo?"
                          className="text-sm h-20"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                
                <Button onClick={() => updateSettings(settings)} disabled={processing} className="w-full">
                  Salvar Configurações de Follow-up
                </Button>
              </CardContent>
            </Card>

            {/* Reactivation Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RefreshCw className="h-5 w-5" />
                  Reativação de Leads Inativos
                </CardTitle>
                <CardDescription>
                  Configure campanhas automáticas para reativar leads sem interação
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <Label className="text-sm font-medium mb-1 block">Dias sem interação</Label>
                    <Select 
                      value={settings?.reactivation_config?.inactive_days?.toString()}
                      onValueChange={(value) => {
                        const newSettings = { ...settings };
                        newSettings.reactivation_config.inactive_days = parseInt(value);
                        setSettings(newSettings);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 dias</SelectItem>
                        <SelectItem value="30">30 dias</SelectItem>
                        <SelectItem value="60">60 dias</SelectItem>
                        <SelectItem value="90">90 dias</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium mb-1 block">Máximo de tentativas</Label>
                    <Select 
                      value={settings?.reactivation_config?.max_attempts?.toString()}
                      onValueChange={(value) => {
                        const newSettings = { ...settings };
                        newSettings.reactivation_config.max_attempts = parseInt(value);
                        setSettings(newSettings);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 tentativa</SelectItem>
                        <SelectItem value="2">2 tentativas</SelectItem>
                        <SelectItem value="3">3 tentativas</SelectItem>
                        <SelectItem value="5">5 tentativas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium mb-1 block">Intervalos (dias)</Label>
                    <Input 
                      value={settings?.reactivation_config?.intervals?.join(', ')}
                      onChange={(e) => {
                        const newSettings = { ...settings };
                        newSettings.reactivation_config.intervals = 
                          e.target.value.split(',').map(i => parseInt(i.trim())).filter(i => !isNaN(i));
                        setSettings(newSettings);
                      }}
                      placeholder="1, 7, 14"
                    />
                  </div>
                </div>
                
                <div className="mb-4">
                  <Label className="text-sm font-medium mb-1 block">Template da Mensagem de Reativação</Label>
                  <Textarea 
                    value={settings?.reactivation_config?.message_template}
                    onChange={(e) => {
                      const newSettings = { ...settings };
                      newSettings.reactivation_config.message_template = e.target.value;
                      setSettings(newSettings);
                    }}
                    placeholder="Olá {name}, ainda tem interesse em imóveis?"
                    className="h-20"
                  />
                </div>
                
                <Button onClick={() => updateSettings(settings)} disabled={processing} className="w-full">
                  Salvar Configurações de Reativação
                </Button>
              </CardContent>
            </Card>

            {/* Qualification Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5" />
                  Qualificação Automática de Leads
                </CardTitle>
                <CardDescription>
                  Configure critérios para identificar leads quentes automaticamente
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label className="text-sm font-medium mb-1 block">Pontuação mínima para lead quente</Label>
                    <Select 
                      value={settings?.qualification_config?.hot_lead_threshold?.toString()}
                      onValueChange={(value) => {
                        const newSettings = { ...settings };
                        newSettings.qualification_config.hot_lead_threshold = parseInt(value);
                        setSettings(newSettings);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2">2 pontos</SelectItem>
                        <SelectItem value="3">3 pontos</SelectItem>
                        <SelectItem value="4">4 pontos</SelectItem>
                        <SelectItem value="5">5 pontos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium mb-1 block">Método de atribuição</Label>
                    <Select 
                      value={settings?.qualification_config?.assignment_method}
                      onValueChange={(value) => {
                        const newSettings = { ...settings };
                        newSettings.qualification_config.assignment_method = value;
                        setSettings(newSettings);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="round_robin">Rodízio</SelectItem>
                        <SelectItem value="region">Por região</SelectItem>
                        <SelectItem value="specialty">Por especialidade</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="bg-gray-100 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Critérios de Pontuação:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Atividade recente (&lt;24h): +2 pontos, (&lt;72h): +1 ponto</li>
                    <li>• Alto engajamento (5+ mensagens): +2 pontos, Médio (3+): +1 ponto</li>
                    <li>• Palavras-chave de interesse (3+): +2 pontos, (1+): +1 ponto</li>
                    <li>• Progressão de status (Em negociação/Visita): +1 ponto</li>
                  </ul>
                </div>
                
                <Button onClick={() => updateSettings(settings)} disabled={processing} className="w-full mt-4">
                  Salvar Configurações de Qualificação
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Qualified Leads Tab */}
          <TabsContent value="qualified" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <UserCheck className="h-5 w-5" />
                    Leads Qualificados ({qualifiedLeads.length})
                  </span>
                  <Button onClick={qualifyLeads} disabled={processing} size="sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Requalificar
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Lead</th>
                        <th className="text-left p-2">Pontuação</th>
                        <th className="text-left p-2">Critérios</th>
                        <th className="text-left p-2">Qualificado em</th>
                        <th className="text-left p-2">Atribuído a</th>
                      </tr>
                    </thead>
                    <tbody>
                      {qualifiedLeads.map((qualification) => (
                        <tr key={qualification.id} className="border-b hover:bg-gray-50">
                          <td className="p-2">
                            <div className="font-medium">Lead ID: {qualification.lead_id}</div>
                          </td>
                          <td className="p-2">
                            <Badge className="bg-green-100 text-green-800">
                              {qualification.score} pontos
                            </Badge>
                          </td>
                          <td className="p-2">
                            <div className="text-sm space-y-1">
                              {Object.entries(qualification.criteria_met || {}).map(([key, value]) => (
                                <div key={key} className={`${value ? 'text-green-600' : 'text-gray-400'}`}>
                                  {value ? '✓' : '✗'} {key.replace('_', ' ')}
                                </div>
                              ))}
                            </div>
                          </td>
                          <td className="p-2 text-sm text-gray-600">
                            {new Date(qualification.qualification_date).toLocaleDateString('pt-BR')}
                          </td>
                          <td className="p-2">
                            {qualification.assigned_to ? (
                              <Badge variant="outline">{qualification.assigned_to}</Badge>
                            ) : (
                              <span className="text-gray-400 text-sm">Não atribuído</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  {qualifiedLeads.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <UserCheck className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                      <p>Nenhum lead qualificado encontrado</p>
                      <p className="text-sm">Execute a qualificação automática para encontrar leads quentes</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Histórico de Automações ({history.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Tipo</th>
                        <th className="text-left p-2">Lead</th>
                        <th className="text-left p-2">Etapa</th>
                        <th className="text-left p-2">Mensagem</th>
                        <th className="text-left p-2">Status</th>
                        <th className="text-left p-2">Data</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((item) => (
                        <tr key={item.id} className="border-b hover:bg-gray-50">
                          <td className="p-2">
                            <Badge variant="outline" className="capitalize">
                              {item.automation_type.replace('_', ' ')}
                            </Badge>
                          </td>
                          <td className="p-2 text-sm">
                            {item.lead_id}
                          </td>
                          <td className="p-2 text-sm capitalize">
                            {item.stage.replace('_', ' ')}
                          </td>
                          <td className="p-2 text-sm">
                            <div className="max-w-xs truncate">
                              {item.message}
                            </div>
                          </td>
                          <td className="p-2">
                            <Badge className={getStatusColor(item.status)}>
                              {getStatusLabel(item.status)}
                            </Badge>
                          </td>
                          <td className="p-2 text-sm text-gray-600">
                            {new Date(item.created_at).toLocaleString('pt-BR')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  {history.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Clock className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                      <p>Nenhum histórico de automação encontrado</p>
                      <p className="text-sm">Execute automações para ver o histórico aqui</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Follow-ups Enviados</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {history.filter(h => h.automation_type === 'follow_up' && h.status === 'sent').length}
                  </div>
                  <p className="text-xs text-gray-500">Últimos 30 dias</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Reativações Enviadas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {history.filter(h => h.automation_type === 'reactivation' && h.status === 'sent').length}
                  </div>
                  <p className="text-xs text-gray-500">Últimos 30 dias</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Taxa de Sucesso</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">
                    {history.length > 0 ? Math.round((history.filter(h => h.status === 'sent').length / history.length) * 100) : 0}%
                  </div>
                  <p className="text-xs text-gray-500">Mensagens enviadas com sucesso</p>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Resumo de Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Total de automações executadas</span>
                    <Badge variant="outline">{history.length}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Leads qualificados atualmente</span>
                    <Badge className="bg-green-100 text-green-800">{qualifiedLeads.length}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Automações falharam</span>
                    <Badge className="bg-red-100 text-red-800">
                      {history.filter(h => h.status === 'failed').length}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default App;