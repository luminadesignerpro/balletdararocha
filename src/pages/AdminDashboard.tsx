import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { 
  LayoutDashboard, 
  Users, 
  DollarSign, 
  MessageSquare, 
  LogOut, 
  Settings, 
  QrCode, 
  Search, 
  Trash2, 
  Edit3, 
  Camera, 
  Image as ImageIcon,
  Phone,
  Plus,
  Calendar,
  Check,
  X,
  Shield,
  ArrowRight,
  Play,
  RefreshCw,
  Send,
  Smartphone,
  Sparkles,
  MessageCircle,
  ClipboardList
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import QRCode from "react-qr-code";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MatriculaCompletaModal } from "@/components/MatriculaCompletaModal";
import {
  getEvolutionConfig,
  saveEvolutionConfig,
  getChatbotFlow,
  saveChatbotFlow,
  fetchEvolutionStatus,
  fetchEvolutionQR,
  disconnectEvolution,
  sendEvolutionMessage,
  getTrialClasses,
  createTrialClass,
  updateTrialClassStatus,
  deleteTrialClass,
  type EvolutionConfig,
  type ChatbotFlow,
  type TrialClass
} from "@/services/whatsapp";
import {
  getMatriculas,
  atualizarStatusMatricula,
  type Matricula
} from "@/services/matriculas";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [alunas, setAlunas] = useState<any[]>([]);
  const [newAluna, setNewAluna] = useState({ nome: "", turma: "", whatsapp: "", mensalidade: "", vencimento: "", senha: "" });
  const [qrToken, setQrToken] = useState<string>('');
  const [editingAluna, setEditingAluna] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMatriculaModalOpen, setIsMatriculaModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("geral");
  const [galeriaImgs, setGaleriaImgs] = useState<any[]>([]);
  const [matriculas, setMatriculas] = useState<Matricula[]>([]);

  // WhatsApp CRM States
  const [whatsAppSubTab, setWhatsAppSubTab] = useState<'connect' | 'flow' | 'test' | 'trials'>('connect');
  const [apiConfig, setApiConfig] = useState<EvolutionConfig>({ apiUrl: '', apiKey: '', instanceName: '' });
  const [botStatus, setBotStatus] = useState<'CONNECTED' | 'DISCONNECTED' | 'CONNECTING'>('DISCONNECTED');
  const [qrCodeBase64, setQrCodeBase64] = useState<string>('');
  const [chatbotFlow, setChatbotFlow] = useState<ChatbotFlow>(getChatbotFlow());
  const [trialClasses, setTrialClasses] = useState<TrialClass[]>([]);
  const [simMessages, setSimMessages] = useState<Array<{ sender: 'user' | 'bot'; text: string; time: string }>>([
    { 
      sender: 'bot', 
      text: 'Olá! Seja bem-vinda ao Ballet Dara Rocha! 🩰✨\n\nEu sou a Bella, a assistente virtual do estúdio. Envie "Oi" para começar a simulação do fluxo!', 
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) 
    }
  ]);
  const [simInput, setSimInput] = useState('');
  const [simStep, setSimStep] = useState<number>(0);
  const [simTempData, setSimTempData] = useState({ mae: '', crianca: '', whatsapp: '', turma: '' });

  // Cálculos dinâmicos baseados nos dados reais
  const totalBailarinas = alunas.length;
  const faturamentoMensal = alunas.reduce((acc, aluna) => acc + (Number(aluna.mensalidade) || 0), 0);

  // Buscar dados ao carregar
  useEffect(() => {
    fetchAlunas();
    fetchGaleria();
    fetchMatriculas();
    
    // Carrega configurações do WhatsApp e aulas experimentais
    const config = getEvolutionConfig();
    if (config) {
      setApiConfig(config);
      checkBotConnection(config);
    } else {
      // Inicia com um token simulado por padrão para que o QR code mostre algo de cara
      setQrToken("BALLET-DARA-ROCHA-SIMULADOR");
    }
    loadTrialClasses();
  }, []);

  const loadTrialClasses = async () => {
    const data = await getTrialClasses();
    setTrialClasses(data);
  };

  const checkBotConnection = async (config: EvolutionConfig) => {
    try {
      const status = await fetchEvolutionStatus(config);
      setBotStatus(status);
      if (status !== 'CONNECTED') {
        const qrResult = await fetchEvolutionQR(config);
        if (qrResult.base64) {
          setQrCodeBase64(qrResult.base64);
        }
        if (qrResult.code) {
          setQrToken(qrResult.code);
        }
      }
    } catch (e) {
      console.error("Erro ao verificar conexão:", e);
    }
  };

  const fetchGaleria = async () => {
    const { data, error } = await supabase.storage.from('alunas-media').list('galeria', {
      limit: 100,
      sortBy: { column: 'name', order: 'desc' },
    });
    if (data) {
      const files = data.filter(f => f.name !== '.emptyFolderPlaceholder');
      const urls = files.map(f => {
        const { data: { publicUrl } } = supabase.storage.from('alunas-media').getPublicUrl(`galeria/${f.name}`);
        return { name: f.name, url: publicUrl };
      });
      setGaleriaImgs(urls);
    }
  };

  const fetchMatriculas = async () => {
    const data = await getMatriculas();
    setMatriculas(data);
  };

  const fetchAlunas = async () => {
    const { data, error } = await supabase.from('alunas').select('*').order('created_at', { ascending: false });
    if (error) toast.error("Erro ao carregar alunas");
    else setAlunas(data || []);
  };

  const handleAddAluna = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Gera uma senha aleatória de 6 dígitos se não houver uma
    const senhaGerada = Math.floor(100000 + Math.random() * 900000).toString();
    const alunaComSenha = { ...newAluna, senha: senhaGerada };

    const { error } = await supabase.from('alunas').insert([alunaComSenha]);

    if (error) {
      toast.error("Erro ao cadastrar: " + error.message);
    } else {
    toast.success(`Aluna cadastrada! Senha: ${senhaGerada}`);
    setNewAluna({ nome: "", turma: "", whatsapp: "", mensalidade: "", vencimento: "", senha: "" });
    fetchAlunas();
    }
    setLoading(false);
  };

  const handleDeleteAluna = async (id: string) => {
    const { error } = await supabase.from('alunas').delete().eq('id', id);
    if (error) {
      toast.error('Erro ao excluir aluna');
    } else {
      toast.success('Aluna excluída');
      fetchAlunas();
    }
  };

  const handleSendWhatsApp = (aluna: any, type: 'general' | 'billing' = 'general') => {
    try {
      const message = type === 'billing' 
        ? `Olá ${aluna.nome}, tudo bem? Passando para lembrar do vencimento da mensalidade de Ballet no valor de R$ ${aluna.mensalidade} em ${aluna.vencimento?.split('-').reverse().join('/')}. Chave PIX: balletdararocha@gmail.com. Caso já tenha pago, favor desconsiderar! ✨`
        : `Olá ${aluna.nome}, aqui é a Dara do Ballet. Como podemos ajudar?`;

      let phone = aluna.whatsapp.replace(/\D/g, '');
      if (phone && !phone.startsWith('55')) {
        phone = '55' + phone;
      }

      const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
      
      toast.success('Redirecionando para o WhatsApp...');
    } catch (e: any) {
      toast.error('Erro ao abrir o WhatsApp.');
    }
  };

  // Salvar configuração da Evolution API
  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      saveEvolutionConfig(apiConfig);
      toast.success("Configurações da Evolution API salvas com sucesso!");
      await checkBotConnection(apiConfig);
    } catch (err: any) {
      toast.error("Erro ao se conectar à API: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Desconectar o robô de WhatsApp
  const handleDisconnect = async () => {
    setLoading(true);
    try {
      const config = getEvolutionConfig();
      if (config && botStatus === 'CONNECTED') {
        const success = await disconnectEvolution(config);
        if (success) {
          toast.success("Instância do WhatsApp desconectada!");
          setBotStatus('DISCONNECTED');
          setQrCodeBase64('');
          setQrToken('BALLET-DARA-ROCHA-SIMULADOR');
        } else {
          toast.error("Falha ao desconectar na API. Resetando localmente...");
          setBotStatus('DISCONNECTED');
          setQrToken('BALLET-DARA-ROCHA-SIMULADOR');
        }
      } else {
        // Redefine localmente se for simulador
        setBotStatus('DISCONNECTED');
        setQrToken('BALLET-DARA-ROCHA-SIMULADOR');
        setQrCodeBase64('');
        toast.success("Conexão simulada encerrada!");
      }
    } catch (e) {
      toast.error("Erro ao processar desconexão.");
    } finally {
      setLoading(false);
    }
  };

  // Salvar alterações no fluxo de atendimento
  const handleSaveFlow = () => {
    saveChatbotFlow(chatbotFlow);
    toast.success("Fluxo de atendimento atualizado!");
  };

  // Simular a leitura do QR Code
  const handleSimulateScan = () => {
    setBotStatus('CONNECTING');
    toast.info("Iniciando leitor de QR Code...");
    
    setTimeout(() => {
      setQrToken("CONECTADO-SIMULACAO-OK");
      toast.info("QR Code lido pelo celular...");
      
      setTimeout(() => {
        setBotStatus('CONNECTED');
        toast.success("WhatsApp Conectado com Sucesso (Simulação)!");
      }, 1500);
    }, 1500);
  };

  // Atualizar status de aula experimental
  const handleTrialStatusUpdate = async (id: string, status: 'Confirmado' | 'Cancelado') => {
    try {
      await updateTrialClassStatus(id, status);
      toast.success(`Agendamento da aula experimental ${status === 'Confirmado' ? 'confirmado!' : 'cancelado!'}`);
      loadTrialClasses();
    } catch (e) {
      toast.error("Erro ao atualizar o status do agendamento");
    }
  };

  // Deletar agendamento de aula experimental
  const handleRemoveTrialClass = async (id: string) => {
    try {
      await deleteTrialClass(id);
      toast.success("Agendamento excluído!");
      loadTrialClasses();
    } catch (e) {
      toast.error("Erro ao excluir agendamento");
    }
  };

  // Lógica do Simulador de Mensagens do Chatbot
  const handleSendSimMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!simInput.trim()) return;

    const userText = simInput.trim();
    const timeNow = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    
    const newMessages = [...simMessages, { sender: 'user' as const, text: userText, time: timeNow }];
    setSimMessages(newMessages);
    setSimInput('');

    // Simula resposta do Bot após um pequeno atraso
    setTimeout(async () => {
      const replyTime = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      let botReply = '';
      let nextStep = simStep;
      let nextTempData = { ...simTempData };

      const cleanText = userText.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

      if (cleanText === 'oi' || cleanText === 'ola' || cleanText === 'menu' || cleanText === 'voltar' || simStep === 0) {
        botReply = chatbotFlow.welcome;
        nextStep = 1; // Aguardando opção do menu
      } else if (simStep === 1) {
        if (userText === '1') {
          botReply = chatbotFlow.trialInfo;
          nextStep = 2; // Aguardando dados da aula
        } else if (userText === '2') {
          botReply = chatbotFlow.scheduleInfo;
        } else if (userText === '3') {
          botReply = chatbotFlow.priceInfo;
        } else if (userText === '4') {
          botReply = chatbotFlow.locationInfo;
        } else if (userText === '5') {
          botReply = chatbotFlow.humanContact;
          nextStep = 0; // Reseta
        } else {
          botReply = "Opção inválida. Digite um número de *1* a *5* para selecionar uma das opções do menu.";
        }
      } else if (simStep === 2) {
        // userText contem nome da criança/idade
        nextTempData.mae = "Mãe do Simulador";
        nextTempData.crianca = userText;
        nextTempData.whatsapp = "85986031932";
        
        if (cleanText.includes("baby")) nextTempData.turma = "Baby Class (4-5 anos)";
        else if (cleanText.includes("preliminar") || cleanText.includes("6") || cleanText.includes("7") || cleanText.includes("8")) nextTempData.turma = "Preliminar (6-9 anos)";
        else if (cleanText.includes("basico") || cleanText.includes("10") || cleanText.includes("11")) nextTempData.turma = "Básico (10-15 anos)";
        else if (cleanText.includes("adulto")) nextTempData.turma = "Ballet Adulto (16+ anos)";
        else nextTempData.turma = "Baby Class (4-5 anos)";

        botReply = `Perfeito! Anotei os dados da bailarina. Agora qual seria a melhor data da semana para a aula experimental? Digite no formato *DD/MM/AAAA* (ex: 26/05/2026).`;
        nextStep = 3; // Aguardando data
      } else if (simStep === 3) {
        let dateVal = userText;
        if (userText.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
          const parts = userText.split('/');
          dateVal = `${parts[2]}-${parts[1]}-${parts[0]}`;
        } else {
          dateVal = new Date().toISOString().split('T')[0];
        }

        botReply = `Pronto! A aula experimental para a bailarina *${nextTempData.crianca}* na turma *${nextTempData.turma}* foi agendada para o dia *${userText}*! 🎉\n\nNosso atendimento entrará em contato via WhatsApp para confirmar os detalhes. Nos vemos no estúdio! 🩰✨`;
        
        try {
          await createTrialClass({
            nome_mae: nextTempData.mae,
            nome_crianca: nextTempData.crianca,
            whatsapp: nextTempData.whatsapp,
            turma: nextTempData.turma,
            data_aula: dateVal
          });
          loadTrialClasses();
        } catch (err) {
          console.error(err);
        }
        
        nextStep = 0; // Reset
      }

      setSimStep(nextStep);
      setSimTempData(nextTempData);
      setSimMessages(prev => [...prev, { sender: 'bot' as const, text: botReply, time: replyTime }]);
    }, 800);
  };

  const handleUpdateEvolucao = async () => {
    if (!editingAluna) return;
    setLoading(true);
    const { error } = await supabase
      .from('alunas')
      .update({
        flexibilidade: editingAluna.flexibilidade,
        tecnica: editingAluna.tecnica,
        feedback: editingAluna.feedback,
        // As fotos serão tratadas separadamente se houver upload
      })
      .eq('id', editingAluna.id);

    if (error) {
      toast.error("Erro ao salvar evolução");
    } else {
      toast.success("Evolução atualizada com sucesso!");
      setIsModalOpen(false);
      fetchAlunas();
    }
    setLoading(false);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingAluna) return;

    setLoading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${editingAluna.id}/${Math.random()}.${fileExt}`;
    const filePath = `fotos/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('alunas-media')
      .upload(filePath, file);

    if (uploadError) {
      toast.error("Erro no upload da foto: " + uploadError.message);
    } else {
      const { data: { publicUrl } } = supabase.storage.from('alunas-media').getPublicUrl(filePath);
      
      // Salva a URL da foto no array de fotos da aluna
      const currentPhotos = editingAluna.fotos || [];
      const { error: updateError } = await supabase
        .from('alunas')
        .update({ fotos: [...currentPhotos, publicUrl] })
        .eq('id', editingAluna.id);

      if (updateError) {
        toast.error("Erro ao salvar referência da foto");
      } else {
        toast.success("Foto descarregada com sucesso!");
        setEditingAluna({ ...editingAluna, fotos: [...currentPhotos, publicUrl] });
        fetchAlunas();
      }
    }
    setLoading(false);
  };
  const handleUploadGaleria = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `galeria/${Math.random().toString(36).substring(7)}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('alunas-media')
      .upload(fileName, file);

    if (uploadError) {
      toast.error("Erro no upload: " + uploadError.message);
    } else {
      toast.success("Foto adicionada à galeria!");
      fetchGaleria();
    }
    setLoading(false);
  };

  const handleDeleteGaleriaFoto = async (fileName: string) => {
    const { error } = await supabase.storage
      .from('alunas-media')
      .remove([`galeria/${fileName}`]);
    
    if (error) {
      toast.error("Erro ao excluir foto");
    } else {
      toast.success("Foto removida da galeria!");
      fetchGaleria();
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex overflow-hidden">
      {/* Sidebar - Design Elegante */}
      <aside className="w-72 bg-[#4A5D23] text-white p-8 hidden md:flex flex-col shadow-2xl relative z-20">
        <div className="mb-12">
          <h2 className="text-2xl font-serif font-bold italic tracking-tight">Dara Rocha</h2>
          <p className="text-[10px] uppercase tracking-[0.3em] text-white/50 mt-1">Management Pro</p>
        </div>
        
        <nav className="space-y-3 flex-1">
          {[
            { id: 'geral', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'alunas', label: 'Alunas', icon: Users },
            { id: 'matriculas', label: 'Matrículas', icon: Shield },
            { id: 'financeiro', label: 'Financeiro', icon: DollarSign },
            { id: 'galeria', label: 'Galeria do Site', icon: ImageIcon },
            { id: 'whatsapp', label: 'WhatsApp Bot', icon: MessageSquare },
          ].map((item) => (
            <Button
              key={item.id}
              variant="ghost"
              onClick={() => setActiveTab(item.id)}
              className={`w-full justify-start hover:bg-white/10 rounded-2xl py-6 transition-all duration-300 group ${activeTab === item.id ? 'bg-white/20 text-white' : 'text-white/80'}`}
            >
              <item.icon className="mr-3 w-5 h-5 group-hover:scale-110 transition-transform" /> 
              {item.label}
            </Button>
          ))}
        </nav>

        <div className="pt-8 border-t border-white/10">
          <Button variant="ghost" onClick={() => navigate("/")} className="w-full justify-start hover:bg-red-400/20 text-white/60 hover:text-white rounded-2xl py-6">
            <LogOut className="mr-3 w-5 h-5" /> Sair
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10 overflow-y-auto bg-gradient-to-br from-[#FDFBF7] to-[#F5F1E9]">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-serif font-bold text-[#4A5D23]">Olá, Administradora</h1>
            <p className="text-muted-foreground italic mt-1">Sua escola está crescendo hoje.</p>
          </div>
          <div className="flex gap-4 items-center">
            <div className="flex flex-col text-right hidden sm:block">
              <span className="text-sm font-bold text-[#4A5D23]">Dara Rocha</span>
              <span className="text-[10px] uppercase text-muted-foreground tracking-widest">Diretora</span>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-[#E89A7B] shadow-lg flex items-center justify-center font-bold text-white text-xl">DR</div>
          </div>
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-10">
          <TabsList className="bg-white/50 backdrop-blur-md border border-[#4A5D23]/10 p-1.5 rounded-2xl shadow-sm inline-flex">
            <TabsTrigger value="geral" className="rounded-xl px-8 py-2.5 data-[state=active]:bg-[#4A5D23] data-[state=active]:text-white">Geral</TabsTrigger>
            <TabsTrigger value="alunas" className="rounded-xl px-8 py-2.5 data-[state=active]:bg-[#4A5D23] data-[state=active]:text-white">Alunas</TabsTrigger>
            <TabsTrigger value="matriculas" className="rounded-xl px-8 py-2.5 data-[state=active]:bg-[#4A5D23] data-[state=active]:text-white relative">
              Matrículas
              {matriculas.filter(m => m.status === 'Pendente').length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {matriculas.filter(m => m.status === 'Pendente').length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="financeiro" className="rounded-xl px-8 py-2.5 data-[state=active]:bg-[#4A5D23] data-[state=active]:text-white">Financeiro</TabsTrigger>
            <TabsTrigger value="galeria" className="rounded-xl px-8 py-2.5 data-[state=active]:bg-[#4A5D23] data-[state=active]:text-white">Galeria</TabsTrigger>
            <TabsTrigger value="whatsapp" className="rounded-xl px-8 py-2.5 data-[state=active]:bg-[#4A5D23] data-[state=active]:text-white">Bot</TabsTrigger>
          </TabsList>

          <TabsContent value="geral" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="border-none shadow-xl shadow-[#4A5D23]/5 bg-white rounded-[2rem] overflow-hidden group hover:-translate-y-1 transition-all">
                <div className="h-1.5 bg-[#4A5D23]" />
                <CardHeader className="pb-2">
                  <CardTitle className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold">Total de Bailarinas</CardTitle>
                </CardHeader>
                <CardContent className="flex items-end justify-between">
                  <p className="text-5xl font-serif font-bold text-[#4A5D23]">{totalBailarinas}</p>
                  <Users className="w-10 h-10 text-[#4A5D23]/10 group-hover:text-[#4A5D23]/20 transition-colors" />
                </CardContent>
              </Card>

              <Card className="border-none shadow-xl shadow-[#E89A7B]/10 bg-white rounded-[2rem] overflow-hidden group hover:-translate-y-1 transition-all">
                <div className="h-1.5 bg-[#E89A7B]" />
                <CardHeader className="pb-2">
                  <CardTitle className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold">Mensalidades / Mês</CardTitle>
                </CardHeader>
                <CardContent className="flex items-end justify-between">
                  <p className="text-5xl font-serif font-bold text-[#E89A7B]">R$ {faturamentoMensal.toLocaleString('pt-BR')}</p>
                  <DollarSign className="w-10 h-10 text-[#E89A7B]/10 group-hover:text-[#E89A7B]/20 transition-colors" />
                </CardContent>
              </Card>

              <Card className="border-none shadow-xl shadow-[#4A5D23]/5 bg-white rounded-[2rem] overflow-hidden group hover:-translate-y-1 transition-all">
                <div className="h-1.5 bg-green-400" />
                <CardHeader className="pb-2">
                  <CardTitle className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold">Status Sistema</CardTitle>
                </CardHeader>
                <CardContent className="flex items-end justify-between">
                  <p className="text-5xl font-serif font-bold text-green-500">Online</p>
                  <MessageSquare className="w-10 h-10 text-green-500/10 group-hover:text-green-500/20 transition-colors" />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="financeiro" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="space-y-8">
               <div className="grid md:grid-cols-2 gap-8">
                 <Card className="border-none shadow-xl bg-white rounded-[2.5rem] p-8 flex items-center gap-6">
                   <div className="w-16 h-16 rounded-2xl bg-[#4A5D23]/5 flex items-center justify-center text-[#4A5D23]">
                     <DollarSign className="w-8 h-8" />
                   </div>
                   <div>
                     <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Previsão Total</p>
                     <p className="text-3xl font-serif font-bold text-[#4A5D23]">R$ {faturamentoMensal.toLocaleString('pt-BR')}</p>
                   </div>
                 </Card>
                 <Card className="border-none shadow-xl bg-white rounded-[2.5rem] p-8 flex items-center gap-6">
                   <div className="w-16 h-16 rounded-2xl bg-[#E89A7B]/5 flex items-center justify-center text-[#E89A7B]">
                     <Users className="w-8 h-8" />
                   </div>
                   <div>
                     <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Pagamentos Pendentes</p>
                     <p className="text-3xl font-serif font-bold text-[#E89A7B]">{alunas.length}</p>
                   </div>
                 </Card>
               </div>

               <Card className="border-none shadow-2xl bg-white rounded-[3rem] overflow-hidden">
                 <div className="bg-[#4A5D23] p-8 text-white flex justify-between items-center">
                    <div>
                      <h3 className="text-2xl font-serif italic">Controle de Mensalidades</h3>
                      <p className="text-white/50 text-xs">Gerencie recebimentos e envie lembretes</p>
                    </div>
                    <Search className="w-5 h-5 text-white/30" />
                 </div>
                 <CardContent className="p-0">
                   <div className="overflow-x-auto">
                     <table className="w-full">
                       <thead>
                         <tr className="border-b border-[#4A5D23]/5 bg-[#FDFBF7]">
                           <th className="px-8 py-6 text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Bailarina</th>
                           <th className="px-8 py-6 text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Valor</th>
                           <th className="px-8 py-6 text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Vencimento</th>
                           <th className="px-8 py-6 text-right text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Ação</th>
                         </tr>
                       </thead>
                       <tbody className="divide-y divide-[#4A5D23]/5">
                         {alunas.map((aluna) => (
                           <tr key={aluna.id} className="group hover:bg-[#FDFBF7]/50 transition-colors">
                             <td className="px-8 py-6 font-bold text-[#4A5D23]">{aluna.nome}</td>
                             <td className="px-8 py-6 text-[#E89A7B] font-bold">R$ {aluna.mensalidade}</td>
                             <td className="px-8 py-6 text-muted-foreground">{aluna.vencimento?.split('-').reverse().join('/') || "-"}</td>
                             <td className="px-8 py-6 text-right">
                               <Button 
                                 size="sm" 
                                 onClick={() => handleSendWhatsApp(aluna, 'billing')}
                                 className="bg-[#E89A7B] hover:bg-[#D4896D] text-white rounded-xl gap-2 font-bold shadow-md active:scale-95 transition-all"
                               >
                                 <MessageSquare className="w-3 h-3" /> Cobrar via WhatsApp
                               </Button>
                             </td>
                           </tr>
                         ))}
                       </tbody>
                     </table>
                   </div>
                 </CardContent>
               </Card>
             </div>
          </TabsContent>

          <TabsContent value="whatsapp" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid lg:grid-cols-12 gap-10">
              
              {/* Menu Lateral do Bot */}
              <div className="lg:col-span-3 flex flex-col gap-3">
                <Card className="border-none shadow-xl bg-white rounded-[2rem] p-4 flex flex-col gap-2">
                  <div className="p-4 border-b border-[#4A5D23]/5 mb-2">
                    <h3 className="font-serif text-lg font-bold text-[#4A5D23]">WhatsApp Bot</h3>
                    <p className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider">Metodologia Dara Rocha</p>
                  </div>
                  
                  {[
                    { id: 'connect', label: 'Conexão', icon: QrCode, desc: 'Instâncias & QR Code' },
                    { id: 'flow', label: 'Fluxo do Bot', icon: Sparkles, desc: 'Mensagens do Chatbot' },
                    { id: 'test', label: 'Testar no Chat', icon: Smartphone, desc: 'Simulador em Tempo Real' },
                    { id: 'trials', label: 'Aulas Experimentais', icon: Calendar, desc: 'Leads Agendados', badge: trialClasses.filter(t => t.status === 'Pendente').length },
                  ].map((subTab) => (
                    <button
                      key={subTab.id}
                      onClick={() => setWhatsAppSubTab(subTab.id as any)}
                      className={`w-full text-left p-4 rounded-2xl flex items-center justify-between group transition-all ${whatsAppSubTab === subTab.id ? 'bg-[#4A5D23] text-white shadow-lg' : 'hover:bg-[#4A5D23]/5 text-[#4A5D23]'}`}
                    >
                      <div className="flex items-center gap-3">
                        <subTab.icon className={`w-5 h-5 shrink-0 ${whatsAppSubTab === subTab.id ? 'text-[#E89A7B]' : 'text-[#4A5D23]/60 group-hover:scale-110 transition-transform'}`} />
                        <div>
                          <p className="font-bold text-sm leading-none">{subTab.label}</p>
                          <p className={`text-[9px] mt-0.5 ${whatsAppSubTab === subTab.id ? 'text-white/60' : 'text-muted-foreground'}`}>{subTab.desc}</p>
                        </div>
                      </div>
                      {subTab.badge ? (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${whatsAppSubTab === subTab.id ? 'bg-[#E89A7B] text-white' : 'bg-red-500 text-white animate-pulse'}`}>
                          {subTab.badge}
                        </span>
                      ) : null}
                    </button>
                  ))}
                </Card>
              </div>

              {/* Conteúdo Principal do Bot */}
              <div className="lg:col-span-9">
                {whatsAppSubTab === 'connect' && (
                  <div className="grid md:grid-cols-2 gap-8">
                    {/* Status e QR Code */}
                    <Card className="border-none shadow-2xl bg-white rounded-[2.5rem] overflow-hidden flex flex-col">
                      <div className="bg-[#4A5D23] p-8 text-white flex justify-between items-center">
                        <div>
                          <CardTitle className="font-serif italic text-2xl">Conectar Aparelho</CardTitle>
                          <CardDescription className="text-white/60 text-xs">Escaneie com seu WhatsApp para conectar</CardDescription>
                        </div>
                        <QrCode className="w-8 h-8 text-[#E89A7B]" />
                      </div>
                      
                      <CardContent className="p-8 flex-1 flex flex-col justify-center items-center text-center">
                        {botStatus === 'CONNECTED' ? (
                          <div className="py-8 space-y-6">
                            <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center text-green-500 shadow-inner mx-auto animate-pulse">
                              <Check className="w-12 h-12" />
                            </div>
                            <div>
                              <h4 className="text-2xl font-serif font-bold text-[#4A5D23]">WhatsApp Conectado!</h4>
                              <p className="text-sm text-muted-foreground mt-1 font-mono">{apiConfig.instanceName || "Instância Padrão"} · Ativa</p>
                            </div>
                            <Button 
                              variant="destructive"
                              className="rounded-2xl px-8 py-5 h-auto font-bold shadow-md hover:bg-red-600/90 active:scale-95 transition-all"
                              onClick={handleDisconnect}
                            >
                              Desconectar Robô
                            </Button>
                          </div>
                        ) : botStatus === 'CONNECTING' ? (
                          <div className="py-12 space-y-6">
                            <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center text-amber-500 shadow-inner mx-auto animate-spin">
                              <RefreshCw className="w-10 h-10" />
                            </div>
                            <div>
                              <h4 className="text-xl font-bold text-[#4A5D23]">Conectando...</h4>
                              <p className="text-xs text-muted-foreground mt-1">Aguardando a resposta do servidor Evolution</p>
                            </div>
                          </div>
                        ) : (
                          <div className="w-full flex flex-col items-center">
                            <div className="bg-[#FDFBF7] aspect-square w-64 p-6 flex items-center justify-center rounded-[2rem] border-2 border-dashed border-[#4A5D23]/10 relative group mb-6">
                              {qrCodeBase64 ? (
                                <img src={qrCodeBase64} alt="Evolution QR Code" className="w-full h-full object-contain" />
                              ) : qrToken ? (
                                <div className="bg-white p-4 rounded-xl shadow-md">
                                  <QRCode value={qrToken} size={180} />
                                </div>
                              ) : (
                                <div className="text-[#4A5D23]/30 text-center">
                                  <QrCode className="w-20 h-20 mx-auto opacity-35" />
                                  <p className="text-[10px] font-bold uppercase tracking-widest mt-4">Configuração Necessária</p>
                                </div>
                              )}
                            </div>
                            
                            <div className="space-y-4 w-full">
                              <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                                Escaneie este QR Code com a câmera do seu WhatsApp (Aparelhos Conectados).
                              </p>
                              <div className="flex gap-3 justify-center">
                                {apiConfig.apiUrl ? (
                                  <Button 
                                    className="bg-[#4A5D23] hover:bg-[#3A491B] text-white rounded-xl py-4 h-auto font-bold text-xs"
                                    onClick={() => checkBotConnection(apiConfig)}
                                  >
                                    Recarregar QR Code
                                  </Button>
                                ) : (
                                  <Button 
                                    className="bg-[#E89A7B] hover:bg-[#D4896D] text-white rounded-xl py-4 h-auto font-bold text-xs animate-bounce"
                                    onClick={handleSimulateScan}
                                  >
                                    Simular Escaneamento
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Configuração da API */}
                    <Card className="border-none shadow-2xl bg-white rounded-[2.5rem] p-4 flex flex-col justify-between">
                      <div>
                        <CardHeader>
                          <CardTitle className="text-[#4A5D23] font-serif text-2xl">Evolution API</CardTitle>
                          <CardDescription className="text-xs">Configure os dados da sua API hospedada no Render</CardDescription>
                        </CardHeader>
                        
                        <CardContent className="space-y-6 pt-2">
                          <form onSubmit={handleSaveConfig} className="space-y-4">
                            <div className="space-y-2">
                              <label className="text-[10px] font-bold uppercase tracking-widest text-[#4A5D23]/60 px-1">URL da API (API Endpoint)</label>
                              <Input
                                value={apiConfig.apiUrl}
                                onChange={(e) => setApiConfig({ ...apiConfig, apiUrl: e.target.value })}
                                placeholder="https://minha-api.onrender.com"
                                className="rounded-2xl border-[#4A5D23]/10 bg-[#FDFBF7] h-12 text-sm"
                                required
                              />
                            </div>

                            <div className="space-y-2">
                              <label className="text-[10px] font-bold uppercase tracking-widest text-[#4A5D23]/60 px-1">Token de Acesso (API Key)</label>
                              <Input
                                type="password"
                                value={apiConfig.apiKey}
                                onChange={(e) => setApiConfig({ ...apiConfig, apiKey: e.target.value })}
                                placeholder="Insira a API Key da Evolution"
                                className="rounded-2xl border-[#4A5D23]/10 bg-[#FDFBF7] h-12 text-sm"
                                required
                              />
                            </div>

                            <div className="space-y-2">
                              <label className="text-[10px] font-bold uppercase tracking-widest text-[#4A5D23]/60 px-1">Nome da Instância</label>
                              <Input
                                value={apiConfig.instanceName}
                                onChange={(e) => setApiConfig({ ...apiConfig, instanceName: e.target.value })}
                                placeholder="Ex: ballet-dara"
                                className="rounded-2xl border-[#4A5D23]/10 bg-[#FDFBF7] h-12 text-sm"
                                required
                              />
                            </div>

                            <Button 
                              type="submit" 
                              disabled={loading}
                              className="w-full bg-[#4A5D23] hover:bg-[#3A491B] text-white rounded-2xl h-12 font-bold text-sm shadow-md mt-4 hover:scale-[1.02] active:scale-95 transition-all"
                            >
                              {loading ? "Conectando..." : "Salvar & Conectar"}
                            </Button>
                          </form>
                        </CardContent>
                      </div>
                      
                      <div className="p-6 bg-[#FDFBF7] rounded-[2rem] border border-[#4A5D23]/5 mt-4 text-[11px] text-muted-foreground leading-relaxed">
                        ⚠️ <strong>Dica:</strong> Se você não possui uma instância da Evolution API, pode clicar em <em>"Simular Escaneamento"</em> para testar todo o fluxo de atendimento de ballet e cadastramento de alunas no sistema sem precisar de configuração externa.
                      </div>
                    </Card>
                  </div>
                )}

                {whatsAppSubTab === 'flow' && (
                  <Card className="border-none shadow-2xl bg-white rounded-[2.5rem] overflow-hidden">
                    <div className="bg-[#4A5D23] p-8 text-white flex justify-between items-center">
                      <div>
                        <CardTitle className="font-serif italic text-2xl">Fluxo de Atendimento</CardTitle>
                        <CardDescription className="text-white/60 text-xs">Customize as mensagens automáticas do seu robô</CardDescription>
                      </div>
                      <Sparkles className="w-8 h-8 text-[#E89A7B]" />
                    </div>
                    
                    <CardContent className="p-8 space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        
                        <div className="space-y-4">
                          <div className="p-4 bg-[#FDFBF7] rounded-2xl border border-[#4A5D23]/10">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-[#4A5D23] bg-[#4A5D23]/5 px-3 py-1 rounded-full">Menu Principal (Boas-vindas)</span>
                            <p className="text-xs text-muted-foreground mt-2 mb-3">Enviado assim que o cliente mandar a primeira mensagem.</p>
                            <Textarea
                              value={chatbotFlow.welcome}
                              onChange={(e) => setChatbotFlow({ ...chatbotFlow, welcome: e.target.value })}
                              className="min-h-[140px] rounded-xl border-[#4A5D23]/10 bg-white font-sans text-xs leading-relaxed"
                            />
                          </div>

                          <div className="p-4 bg-[#FDFBF7] rounded-2xl border border-[#4A5D23]/10">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-[#4A5D23] bg-[#4A5D23]/5 px-3 py-1 rounded-full">Opção 1: Agendamento</span>
                            <p className="text-xs text-muted-foreground mt-2 mb-3">Mensagem explicando como agendar a aula experimental.</p>
                            <Textarea
                              value={chatbotFlow.trialInfo}
                              onChange={(e) => setChatbotFlow({ ...chatbotFlow, trialInfo: e.target.value })}
                              className="min-h-[120px] rounded-xl border-[#4A5D23]/10 bg-white font-sans text-xs leading-relaxed"
                            />
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="p-4 bg-[#FDFBF7] rounded-2xl border border-[#4A5D23]/10">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-[#4A5D23] bg-[#4A5D23]/5 px-3 py-1 rounded-full">Opção 2: Horários & Turmas</span>
                            <p className="text-xs text-muted-foreground mt-2 mb-3">Exibição de horários, turmas e idades das alunas.</p>
                            <Textarea
                              value={chatbotFlow.scheduleInfo}
                              onChange={(e) => setChatbotFlow({ ...chatbotFlow, scheduleInfo: e.target.value })}
                              className="min-h-[120px] rounded-xl border-[#4A5D23]/10 bg-white font-sans text-xs leading-relaxed"
                            />
                          </div>

                          <div className="p-4 bg-[#FDFBF7] rounded-2xl border border-[#4A5D23]/10">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-[#4A5D23] bg-[#4A5D23]/5 px-3 py-1 rounded-full">Opções 3, 4 e 5: Financeiro e Contatos</span>
                            <p className="text-xs text-muted-foreground mt-2 mb-3">Configurações para as mensagens de mensalidade, PIX, endereço e contato humano.</p>
                            
                            <div className="space-y-3 mt-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="outline" className="w-full justify-start rounded-xl text-xs font-bold border-[#4A5D23]/10 bg-white text-[#4A5D23] hover:bg-[#4A5D23]/5">
                                    💰 Matrículas & Mensalidades
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-md bg-[#FDFBF7] rounded-2xl border-none">
                                  <DialogHeader>
                                    <DialogTitle className="font-serif">Mensalidades & Matrículas</DialogTitle>
                                  </DialogHeader>
                                  <Textarea 
                                    value={chatbotFlow.priceInfo} 
                                    onChange={(e) => setChatbotFlow({ ...chatbotFlow, priceInfo: e.target.value })} 
                                    className="min-h-[180px] rounded-xl border-[#4A5D23]/10 bg-white text-xs mt-2" 
                                  />
                                </DialogContent>
                              </Dialog>

                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="outline" className="w-full justify-start rounded-xl text-xs font-bold border-[#4A5D23]/10 bg-white text-[#4A5D23] hover:bg-[#4A5D23]/5">
                                    📍 Localização e Endereço
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-md bg-[#FDFBF7] rounded-2xl border-none">
                                  <DialogHeader>
                                    <DialogTitle className="font-serif">Localização & Contatos</DialogTitle>
                                  </DialogHeader>
                                  <Textarea 
                                    value={chatbotFlow.locationInfo} 
                                    onChange={(e) => setChatbotFlow({ ...chatbotFlow, locationInfo: e.target.value })} 
                                    className="min-h-[180px] rounded-xl border-[#4A5D23]/10 bg-[#FDFBF7] text-xs mt-2" 
                                  />
                                </DialogContent>
                              </Dialog>

                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="outline" className="w-full justify-start rounded-xl text-xs font-bold border-[#4A5D23]/10 bg-white text-[#4A5D23] hover:bg-[#4A5D23]/5">
                                    👩‍🏫 Falar com Atendente Humano
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-md bg-[#FDFBF7] rounded-2xl border-none">
                                  <DialogHeader>
                                    <DialogTitle className="font-serif">Falar com Professora Dara</DialogTitle>
                                  </DialogHeader>
                                  <Textarea 
                                    value={chatbotFlow.humanContact} 
                                    onChange={(e) => setChatbotFlow({ ...chatbotFlow, humanContact: e.target.value })} 
                                    className="min-h-[180px] rounded-xl border-[#4A5D23]/10 bg-[#FDFBF7] text-xs mt-2" 
                                  />
                                </DialogContent>
                              </Dialog>
                            </div>
                          </div>
                        </div>

                      </div>

                      <div className="pt-6 border-t border-[#4A5D23]/10 flex justify-end">
                        <Button 
                          onClick={handleSaveFlow}
                          className="bg-[#4A5D23] hover:bg-[#3A491B] text-white px-10 py-5 rounded-2xl shadow-lg font-bold"
                        >
                          Salvar Alterações do Fluxo
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {whatsAppSubTab === 'test' && (
                  <div className="grid md:grid-cols-12 gap-8">
                    
                    {/* Guia de Teste */}
                    <div className="md:col-span-5 space-y-6">
                      <Card className="border-none shadow-xl bg-white rounded-[2rem] p-6">
                        <h4 className="font-serif text-xl font-bold text-[#4A5D23] mb-3 flex items-center gap-2">
                          <Sparkles className="w-5 h-5 text-[#E89A7B]" /> Simulador do Robô
                        </h4>
                        <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                          Use o celular simulado ao lado para testar a experiência exata de um cliente entrando em contato com a sua escola.
                        </p>
                        
                        <div className="space-y-4">
                          <div className="p-3 bg-[#FDFBF7] rounded-xl border border-[#4A5D23]/5">
                            <h5 className="text-xs font-bold text-[#4A5D23] mb-1">Como testar:</h5>
                            <ol className="text-[11px] text-muted-foreground list-decimal list-inside space-y-1">
                              <li>Envie <strong>"Oi"</strong> ou <strong>"Menu"</strong> para começar.</li>
                              <li>Digite <strong>"1"</strong> para simular o agendamento.</li>
                              <li>Escreva o nome da bailarina (ex: "Clara, 6 anos").</li>
                              <li>Informe uma data (ex: "26/05/2026").</li>
                              <li>Veja o agendamento aparecer em tempo real na aba <em>"Aulas Experimentais"</em>!</li>
                            </ol>
                          </div>

                          <Button 
                            variant="outline" 
                            className="w-full rounded-xl border-[#4A5D23]/10 text-xs font-bold text-[#4A5D23] hover:bg-[#4A5D23]/5"
                            onClick={() => {
                              setSimStep(0);
                              setSimMessages([
                                { 
                                  sender: 'bot', 
                                  text: 'Olá! Seja bem-vinda ao Ballet Dara Rocha! 🩰\n\nEu sou a assistente Bella. Envie "Oi" para iniciar!', 
                                  time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) 
                                }
                              ]);
                              toast.info("Simulador reiniciado!");
                            }}
                          >
                            Reiniciar Conversa
                          </Button>
                        </div>
                      </Card>
                    </div>

                    {/* WhatsApp Mock Celular */}
                    <div className="md:col-span-7 flex justify-center">
                      <div className="w-[300px] border-[8px] border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl bg-slate-950 aspect-[9/18] flex flex-col relative">
                        {/* Celular Top Notch */}
                        <div className="absolute top-0 inset-x-0 h-4 bg-slate-800 flex items-center justify-center z-30">
                          <div className="w-16 h-3 bg-black rounded-full" />
                        </div>
                        
                        {/* WhatsApp Header */}
                        <div className="bg-[#075E54] pt-6 pb-3 px-4 text-white flex items-center gap-2 shadow-md relative z-20">
                          <div className="w-8 h-8 rounded-full bg-[#E89A7B] text-white flex items-center justify-center font-bold text-xs shadow-inner">
                            B
                          </div>
                          <div>
                            <p className="font-bold text-xs leading-none text-white font-sans">Bella (Ballet Dara)</p>
                            <p className="text-[8px] text-white/70 mt-0.5 font-sans">Online · Assistente Virtual</p>
                          </div>
                        </div>

                        {/* Conversa Content */}
                        <div className="flex-1 bg-[#ECE5DD] p-4 overflow-y-auto space-y-4 relative z-10 flex flex-col pt-6 font-sans">
                          {simMessages.map((msg, i) => (
                            <div 
                              key={i} 
                              className={`max-w-[85%] p-3 rounded-2xl shadow-sm text-xs leading-relaxed relative ${msg.sender === 'user' ? 'bg-[#DCF8C6] text-slate-800 self-end rounded-tr-none' : 'bg-white text-slate-800 self-start rounded-tl-none'}`}
                            >
                              <p className="whitespace-pre-line text-[11px]">{msg.text}</p>
                              <span className="text-[8px] text-slate-400 block text-right mt-1 font-bold">{msg.time}</span>
                            </div>
                          ))}
                        </div>

                        {/* WhatsApp Form Input */}
                        <form onSubmit={handleSendSimMessage} className="bg-[#F4F0EB] p-2 flex gap-2 items-center relative z-20 border-t border-slate-200">
                          <Input
                            value={simInput}
                            onChange={(e) => setSimInput(e.target.value)}
                            placeholder="Digite uma mensagem..."
                            className="rounded-full bg-white border-none shadow-inner h-9 px-4 text-xs flex-1 text-slate-800 focus-visible:ring-0 focus-visible:ring-offset-0"
                          />
                          <Button 
                            type="submit" 
                            size="icon" 
                            className="rounded-full bg-[#075E54] hover:bg-[#128C7E] w-9 h-9 flex items-center justify-center text-white shrink-0 shadow-md"
                          >
                            <Send className="w-4 h-4 fill-white" />
                          </Button>
                        </form>
                      </div>
                    </div>

                  </div>
                )}

                {whatsAppSubTab === 'trials' && (
                  <Card className="border-none shadow-2xl bg-white rounded-[2.5rem] overflow-hidden">
                    <div className="bg-[#4A5D23] p-8 text-white flex justify-between items-center">
                      <div>
                        <CardTitle className="font-serif italic text-2xl">Aulas Experimentais</CardTitle>
                        <CardDescription className="text-white/60 text-xs">Bailarinas agendadas pelo site ou pelo robô</CardDescription>
                      </div>
                      <Calendar className="w-8 h-8 text-[#E89A7B]" />
                    </div>
                    
                    <CardContent className="p-8 font-sans">
                      {trialClasses.length === 0 ? (
                        <div className="py-20 text-center text-muted-foreground border-2 border-dashed rounded-3xl bg-[#FDFBF7] border-[#4A5D23]/10">
                          <p className="italic text-sm">Nenhuma aula experimental agendada por enquanto.</p>
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b border-[#4A5D23]/5 bg-[#FDFBF7]">
                                <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-[#4A5D23]/60">Bailarina</th>
                                <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-[#4A5D23]/60">Responsável</th>
                                <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-[#4A5D23]/60">Turma</th>
                                <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-[#4A5D23]/60">Data Aula</th>
                                <th className="px-6 py-4 text-center text-[10px] font-bold uppercase tracking-widest text-[#4A5D23]/60">Status</th>
                                <th className="px-6 py-4 text-right text-[10px] font-bold uppercase tracking-widest text-[#4A5D23]/60">Ações</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[#4A5D23]/5">
                              {trialClasses.map((trial) => (
                                <tr key={trial.id} className="group hover:bg-[#FDFBF7]/40 transition-colors">
                                  <td className="px-6 py-4">
                                    <p className="font-bold text-[#4A5D23] text-sm">{trial.nome_crianca}</p>
                                    <p className="text-[10px] text-muted-foreground font-mono">{new Date(trial.created_at).toLocaleDateString('pt-BR')}</p>
                                  </td>
                                  <td className="px-6 py-4">
                                    <p className="text-sm font-semibold">{trial.nome_mae}</p>
                                    <a 
                                      href={`https://wa.me/${trial.whatsapp.replace(/\D/g, '')}`} 
                                      target="_blank" 
                                      className="text-xs text-[#E89A7B] hover:underline inline-flex items-center gap-1 font-bold"
                                    >
                                      <MessageCircle className="w-3.5 h-3.5 fill-[#E89A7B]/10 text-[#E89A7B]" /> WhatsApp
                                    </a>
                                  </td>
                                  <td className="px-6 py-4 text-xs font-semibold text-slate-700">{trial.turma}</td>
                                  <td className="px-6 py-4 text-xs font-bold text-[#4A5D23]">
                                    {trial.data_aula.split('-').reverse().join('/')}
                                  </td>
                                  <td className="px-6 py-4 text-center">
                                    <span className={`text-[9px] font-bold uppercase tracking-wider px-3 py-1 rounded-full ${trial.status === 'Confirmado' ? 'bg-green-50 text-green-600 border border-green-200 font-bold' : trial.status === 'Cancelado' ? 'bg-red-50 text-red-500 border border-red-100 font-bold' : 'bg-amber-50 text-amber-600 border border-amber-200 font-bold'}`}>
                                      {trial.status}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 text-right">
                                    <div className="flex gap-1 justify-end">
                                      {trial.status === 'Pendente' && (
                                        <>
                                          <Button 
                                            size="icon" 
                                            variant="ghost" 
                                            className="h-8 w-8 rounded-lg text-green-600 hover:bg-green-50"
                                            onClick={() => handleTrialStatusUpdate(trial.id, 'Confirmado')}
                                            title="Confirmar Aula"
                                          >
                                            <Check className="w-4 h-4" />
                                          </Button>
                                          <Button 
                                            size="icon" 
                                            variant="ghost" 
                                            className="h-8 w-8 rounded-lg text-red-500 hover:bg-red-50"
                                            onClick={() => handleTrialStatusUpdate(trial.id, 'Cancelado')}
                                            title="Cancelar Aula"
                                          >
                                            <X className="w-4 h-4" />
                                          </Button>
                                        </>
                                      )}
                                      <Button 
                                        size="icon" 
                                        variant="ghost" 
                                        className="h-8 w-8 rounded-lg text-[#E89A7B] hover:bg-rose-50"
                                        onClick={() => handleRemoveTrialClass(trial.id)}
                                        title="Excluir"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>

            </div>
          </TabsContent>

          <TabsContent value="matriculas" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card className="border-none shadow-2xl bg-white rounded-[3rem] overflow-hidden">
              <div className="bg-[#4A5D23] p-10 text-white flex justify-between items-center">
                <div>
                  <h3 className="text-3xl font-serif italic">Fichas de Matrícula</h3>
                  <p className="text-white/50 text-sm mt-1">Gerencie as matrículas e o processo de assinatura digital</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-widest text-white/40">Pendentes</p>
                    <p className="text-2xl font-serif font-bold text-[#E89A7B]">{matriculas.filter(m => m.status === 'Pendente').length}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-widest text-white/40">Assinadas</p>
                    <p className="text-2xl font-serif font-bold text-green-400">{matriculas.filter(m => m.status === 'Assinado').length}</p>
                  </div>
                  <Shield className="w-12 h-12 text-[#E89A7B] ml-4" />
                </div>
              </div>
              <CardContent className="p-0">
                {matriculas.length === 0 ? (
                  <div className="py-20 text-center text-muted-foreground border-t border-[#4A5D23]/5">
                    <p className="italic text-sm">Nenhuma ficha de matrícula registrada ainda.</p>
                    <p className="text-xs mt-2">As fichas preenchidas pelo site aparecem aqui automaticamente.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-[#4A5D23]/5 bg-[#FDFBF7]">
                          <th className="px-8 py-5 text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Aluna</th>
                          <th className="px-8 py-5 text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Responsável</th>
                          <th className="px-8 py-5 text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Modalidade</th>
                          <th className="px-8 py-5 text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Data</th>
                          <th className="px-8 py-5 text-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Status</th>
                          <th className="px-8 py-5 text-right text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#4A5D23]/5">
                        {matriculas.map((mat) => {
                          const sigLink = `${window.location.origin}/balletdararocha/assinar/${mat.token}`;
                          const waMsg = `Olá ${mat.nome_mae || mat.nome_aluna}! Segue o link para assinar a ficha de matrícula do Ballet Dara Rocha:\n\n${sigLink}`;
                          return (
                            <tr key={mat.id} className="group hover:bg-[#FDFBF7]/50 transition-colors">
                              <td className="px-8 py-5">
                                <p className="font-bold text-[#4A5D23]">{mat.nome_aluna}</p>
                                {mat.apelido && <p className="text-xs text-muted-foreground italic">&ldquo;{mat.apelido}&rdquo;</p>}
                              </td>
                              <td className="px-8 py-5">
                                <p className="text-sm font-semibold">{mat.nome_mae || mat.nome_pai || '—'}</p>
                                {(mat.whatsapp_mae || mat.whatsapp_pai) && (
                                  <p className="text-xs text-muted-foreground">{mat.whatsapp_mae || mat.whatsapp_pai}</p>
                                )}
                              </td>
                              <td className="px-8 py-5">
                                <p className="text-xs text-muted-foreground">{mat.modalidades?.join(', ') || mat.turma || '—'}</p>
                              </td>
                              <td className="px-8 py-5 text-xs text-muted-foreground">
                                {new Date(mat.created_at).toLocaleDateString('pt-BR')}
                              </td>
                              <td className="px-8 py-5 text-center">
                                <span className={`text-[9px] font-bold uppercase tracking-wider px-3 py-1 rounded-full ${
                                  mat.status === 'Assinado'
                                    ? 'bg-green-50 text-green-600 border border-green-200'
                                    : mat.status === 'Contrato Enviado'
                                    ? 'bg-blue-50 text-blue-600 border border-blue-200'
                                    : 'bg-amber-50 text-amber-600 border border-amber-200'
                                }`}>
                                  {mat.status === 'Assinado' ? '✅ Assinado' : mat.status === 'Contrato Enviado' ? '📤 Enviado' : '⏳ Pendente'}
                                </span>
                              </td>
                              <td className="px-8 py-5">
                                <div className="flex gap-2 justify-end flex-wrap">
                                  {mat.status === 'Pendente' && (
                                    <Button
                                      size="sm"
                                      onClick={() => {
                                        window.open(`https://wa.me/${(mat.whatsapp_mae || mat.whatsapp_pai || '').replace(/\D/g,'')}?text=${encodeURIComponent(waMsg)}`, '_blank');
                                        atualizarStatusMatricula(mat.id, 'Contrato Enviado').then(fetchMatriculas);
                                      }}
                                      className="bg-[#25D366] hover:bg-[#1DA851] text-white rounded-xl gap-1.5 text-xs font-bold shadow-sm"
                                    >
                                      <Send className="w-3 h-3" /> Enviar Contrato
                                    </Button>
                                  )}
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => { navigator.clipboard.writeText(sigLink); toast.success('Link copiado!'); }}
                                    className="rounded-xl border-[#4A5D23]/20 text-[#4A5D23] text-xs gap-1.5"
                                  >
                                    <ArrowRight className="w-3 h-3" /> Link
                                  </Button>
                                  {mat.assinatura_url && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => window.open(mat.assinatura_url, '_blank')}
                                      className="rounded-xl border-green-200 text-green-600 text-xs gap-1.5"
                                    >
                                      <Check className="w-3 h-3" /> Ver Assinatura
                                    </Button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="alunas" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid lg:grid-cols-12 gap-10">
              {/* Form Cadastro */}
              <div className="lg:col-span-4">
                <Card className="border-none shadow-2xl bg-white rounded-[2.5rem] p-4">
                  <CardHeader>
                    <CardTitle className="text-[#4A5D23] font-serif text-2xl">Cadastro Rápido</CardTitle>
                    <p className="text-xs text-muted-foreground italic">Para alunas com ficha já assinada</p>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      onClick={() => setIsMatriculaModalOpen(true)}
                      className="w-full mb-6 bg-[#E89A7B] hover:bg-[#D4896D] text-white rounded-2xl h-14 shadow-lg font-bold text-base gap-2"
                    >
                      <ClipboardList className="w-5 h-5" /> Preencher Ficha Completa
                    </Button>
                    <div className="flex items-center gap-4 mb-6">
                      <div className="h-px bg-[#4A5D23]/10 flex-1"></div>
                      <span className="text-[10px] uppercase tracking-widest text-[#4A5D23]/40 font-bold">Ou cadastre direto</span>
                      <div className="h-px bg-[#4A5D23]/10 flex-1"></div>
                    </div>
                    <form onSubmit={handleAddAluna} className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-[#4A5D23]/60 px-1">Nome da Bailarina</label>
                        <Input
                          value={newAluna.nome}
                          onChange={(e) => setNewAluna({ ...newAluna, nome: e.target.value })}
                          placeholder="Nome Completo"
                          className="rounded-2xl border-[#4A5D23]/10 bg-[#FDFBF7] h-12"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-[#4A5D23]/60 px-1">Turma / Nível</label>
                        <Input
                          value={newAluna.turma}
                          onChange={(e) => setNewAluna({ ...newAluna, turma: e.target.value })}
                          placeholder="Ex: Baby Class"
                          className="rounded-2xl border-[#4A5D23]/10 bg-[#FDFBF7] h-12"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-[#4A5D23]/60 px-1">WhatsApp Responsável</label>
                        <Input
                          value={newAluna.whatsapp}
                          onChange={(e) => setNewAluna({ ...newAluna, whatsapp: e.target.value })}
                          placeholder="85 9..."
                          className="rounded-2xl border-[#4A5D23]/10 bg-[#FDFBF7] h-12"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-[#4A5D23]/60 px-1">Mensalidade</label>
                          <Input
                            type="number"
                            value={newAluna.mensalidade}
                            onChange={(e) => setNewAluna({ ...newAluna, mensalidade: e.target.value })}
                            placeholder="R$"
                            className="rounded-2xl border-[#4A5D23]/10 bg-[#FDFBF7] h-12"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-[#4A5D23]/60 px-1">Vencimento</label>
                          <Input
                            type="date"
                            value={newAluna.vencimento}
                            onChange={(e) => setNewAluna({ ...newAluna, vencimento: e.target.value })}
                            className="rounded-2xl border-[#4A5D23]/10 bg-[#FDFBF7] h-12"
                          />
                        </div>
                      </div>
                      <Button type="submit" disabled={loading} className="w-full bg-[#4A5D23] hover:bg-[#3A491B] text-white h-14 rounded-2xl shadow-lg transition-all font-bold">
                        {loading ? "Cadastrando..." : "Confirmar Matrícula"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>

              {/* Lista Alunas */}
              <div className="lg:col-span-8 space-y-6">
                <div className="flex justify-between items-center bg-white/50 p-6 rounded-[2rem] border border-white">
                  <h3 className="text-xl font-serif font-bold text-[#4A5D23]">Bailarinas Ativas</h3>
                  <div className="relative w-64">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4A5D23]/40" />
                    <Input className="pl-12 rounded-full border-none shadow-sm h-11 bg-white" placeholder="Buscar..." />
                  </div>
                </div>

                <div className="space-y-4">
                  {alunas.map((aluna) => (
                    <Card key={aluna.id} className="border-none shadow-sm hover:shadow-md transition-all rounded-[1.5rem] bg-white group overflow-hidden">
                      <div className="flex items-center justify-between p-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-[#4A5D23]/5 flex items-center justify-center text-[#4A5D23] font-bold uppercase">
                            {aluna.nome[0]}
                          </div>
                          <div>
                            <p className="font-bold text-[#4A5D23] text-lg">{aluna.nome}</p>
                            <p className="text-xs text-muted-foreground flex items-center gap-2">
                              <span className="bg-[#E89A7B]/10 text-[#E89A7B] px-2 py-0.5 rounded-full font-bold">{aluna.turma}</span>
                              <span>• {aluna.whatsapp}</span>
                            </p>
                          </div>
                        </div>
                        
                        <div className="hidden md:flex gap-8 text-center px-8 border-x border-[#4A5D23]/5">
                           <div>
                             <p className="text-[10px] uppercase text-muted-foreground font-bold">Mensalidade</p>
                             <p className="text-sm font-bold text-[#E89A7B]">R$ {aluna.mensalidade}</p>
                           </div>
                           <div>
                             <p className="text-[10px] uppercase text-muted-foreground font-bold">Senha</p>
                             <p className="text-sm font-mono font-bold text-[#4A5D23] tracking-widest">{aluna.senha}</p>
                           </div>
                        </div>

                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon" className="rounded-xl text-[#4A5D23] hover:bg-[#4A5D23]/10" onClick={() => {
                            setEditingAluna(aluna);
                            setIsModalOpen(true);
                          }}>
                            <Edit3 className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="rounded-xl text-[#E89A7B] hover:bg-[#E89A7B]/10" onClick={() => handleSendWhatsApp(aluna)}><MessageSquare className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="icon" className="rounded-xl text-red-400 hover:bg-red-50" onClick={() => handleDeleteAluna(aluna.id)}><Trash2 className="w-4 h-4" /></Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="galeria" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card className="border-none shadow-2xl bg-white rounded-[3rem] overflow-hidden">
              <div className="bg-[#4A5D23] p-10 text-white flex justify-between items-center">
                <div>
                  <h3 className="text-3xl font-serif italic">Galeria do Site</h3>
                  <p className="text-white/50 text-sm mt-1">Gerencie as fotos que aparecem na página inicial pública</p>
                </div>
                <ImageIcon className="w-12 h-12 text-[#E89A7B]" />
              </div>
              <CardContent className="p-10">
                <div className="flex justify-between items-center mb-8">
                  <h4 className="text-lg font-bold text-[#4A5D23]">Fotos Publicadas ({galeriaImgs.length})</h4>
                  <label className="bg-[#E89A7B] hover:bg-[#D4896D] text-white px-6 py-3 rounded-xl shadow-lg cursor-pointer font-bold transition-all active:scale-95 inline-flex items-center gap-2">
                    <Camera className="w-5 h-5" />
                    {loading ? "Enviando..." : "Adicionar Nova Foto"}
                    <input type="file" className="hidden" accept="image/*" onChange={handleUploadGaleria} disabled={loading} />
                  </label>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {galeriaImgs.length === 0 && !loading ? (
                    <div className="col-span-full py-16 text-center text-muted-foreground border-2 border-dashed rounded-2xl">
                      Nenhuma foto na galeria ainda. Faça upload para substituir as fotos padrão do site.
                    </div>
                  ) : (
                    galeriaImgs.map((img) => (
                      <div key={img.name} className="group relative aspect-[4/5] rounded-2xl overflow-hidden shadow-md">
                        <img src={img.url} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="Galeria" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Button variant="destructive" size="icon" className="rounded-full shadow-2xl scale-0 group-hover:scale-100 transition-transform" onClick={() => handleDeleteGaleriaFoto(img.name)}>
                            <Trash2 className="w-5 h-5" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Modal de Evolução e Fotos */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-3xl bg-[#FDFBF7] rounded-[3rem] border-none p-0 overflow-hidden">
          <DialogHeader className="bg-[#4A5D23] p-10 text-white">
            <DialogTitle className="text-3xl font-serif italic">Gerenciar Evolução: {editingAluna?.nome}</DialogTitle>
            <p className="text-white/60">Acompanhamento técnico e registros fotográficos</p>
          </DialogHeader>
          
          <div className="p-10 space-y-8 max-h-[70vh] overflow-y-auto">
            <div className="grid md:grid-cols-2 gap-10">
              <div className="space-y-6">
                <h4 className="text-[#4A5D23] font-bold uppercase tracking-widest text-xs">Notas de Desempenho</h4>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <label className="text-sm font-medium">Flexibilidade ({editingAluna?.flexibilidade || 0}%)</label>
                  </div>
                  <input 
                    type="range" 
                    className="w-full h-2 bg-[#4A5D23]/10 rounded-full appearance-none cursor-pointer accent-[#E89A7B]"
                    value={editingAluna?.flexibilidade || 0}
                    onChange={(e) => setEditingAluna({...editingAluna, flexibilidade: parseInt(e.target.value)})}
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <label className="text-sm font-medium">Técnica ({editingAluna?.tecnica || 0}%)</label>
                  </div>
                  <input 
                    type="range" 
                    className="w-full h-2 bg-[#4A5D23]/10 rounded-full appearance-none cursor-pointer accent-[#E89A7B]"
                    value={editingAluna?.tecnica || 0}
                    onChange={(e) => setEditingAluna({...editingAluna, tecnica: parseInt(e.target.value)})}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-[#4A5D23]/60">Feedback da Professora</label>
                  <Textarea 
                    placeholder="Escreva como foi o desempenho da aluna este mês..."
                    className="rounded-2xl border-[#4A5D23]/10 min-h-[120px]"
                    value={editingAluna?.feedback || ""}
                    onChange={(e) => setEditingAluna({...editingAluna, feedback: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-6">
                <h4 className="text-[#4A5D23] font-bold uppercase tracking-widest text-xs">Galeria de Fotos</h4>
                
                <div className="grid grid-cols-3 gap-3">
                  {editingAluna?.fotos?.map((foto: string, idx: number) => (
                    <div key={idx} className="aspect-square rounded-2xl overflow-hidden border border-[#4A5D23]/5 shadow-sm">
                      <img src={foto} alt="Evolução" className="w-full h-full object-cover" />
                    </div>
                  ))}
                  <label className="aspect-square rounded-2xl border-2 border-dashed border-[#4A5D23]/10 flex flex-col items-center justify-center cursor-pointer hover:bg-[#4A5D23]/5 transition-all text-[#4A5D23]/40 hover:text-[#4A5D23]">
                    <Camera className="w-8 h-8 mb-2" />
                    <span className="text-[10px] font-bold uppercase tracking-tight">Adicionar</span>
                    <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                  </label>
                </div>
                <p className="text-[10px] text-muted-foreground italic text-center">As fotos aparecem na hora no portal da aluna.</p>
              </div>
            </div>

            <div className="pt-8 border-t border-[#4A5D23]/5 flex justify-end gap-4">
              <Button variant="ghost" onClick={() => setIsModalOpen(false)} className="rounded-2xl px-8 py-6">Cancelar</Button>
              <Button onClick={handleUpdateEvolucao} disabled={loading} className="bg-[#4A5D23] hover:bg-[#3A491B] text-white rounded-2xl px-12 py-6 font-bold shadow-xl">
                {loading ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <MatriculaCompletaModal 
        isOpen={isMatriculaModalOpen} 
        onClose={() => setIsMatriculaModalOpen(false)} 
        onSuccess={() => fetchMatriculas()} 
      />
    </div>
  );
};

export default AdminDashboard;
