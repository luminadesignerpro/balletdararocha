import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { LayoutDashboard, Users, DollarSign, MessageSquare, LogOut, Settings, QrCode, Search, Trash2, Edit3, Camera, Image as ImageIcon } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { sendWhatsAppMessage } from "@/services/whatsapp";
import QRCode from "react-qr-code";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [alunas, setAlunas] = useState<any[]>([]);
  const [newAluna, setNewAluna] = useState({ nome: "", turma: "", whatsapp: "", mensalidade: "", vencimento: "", senha: "" });
  const [qrToken, setQrToken] = useState<string>('');
  const [editingAluna, setEditingAluna] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("geral");
  const [galeriaImgs, setGaleriaImgs] = useState<any[]>([]);
  // Cálculos dinâmicos baseados nos dados reais
  const totalBailarinas = alunas.length;
  const faturamentoMensal = alunas.reduce((acc, aluna) => acc + (Number(aluna.mensalidade) || 0), 0);

  // Buscar dados ao carregar
  useEffect(() => {
    fetchAlunas();
    fetchGaleria();
  }, []);

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

  const handleSendWhatsApp = async (aluna: any, type: 'general' | 'billing' = 'general') => {
    try {
      const message = type === 'billing' 
        ? `Olá ${aluna.nome}, tudo bem? Passando para lembrar do vencimento da mensalidade de Ballet no valor de R$ ${aluna.mensalidade} em ${aluna.vencimento?.split('-').reverse().join('/')}. Chave PIX: balletdararocha@gmail.com. Caso já tenha pago, favor desconsiderar! ✨`
        : `Olá ${aluna.nome}, aqui é a Dara do Ballet. Como podemos ajudar?`;

      const result = await sendWhatsAppMessage({
        phoneNumber: aluna.whatsapp.replace(/\D/g, ''), // limpa formatação
        message: message,
      });
      toast.success('Mensagem enviada!');
    } catch (e: any) {
      toast.error('Falha ao enviar WhatsApp: ' + e.message);
    }
  };

  // Generate QR token for WhatsApp bot
  const generateQr = () => {
    const token = Math.random().toString(36).substring(2, 10).toUpperCase();
    setQrToken(token);
    toast.success('QR Code gerado');
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
            <TabsTrigger value="alunas" className="rounded-xl px-8 py-2.5 data-[state=active]:bg-[#4A5D23] data-[state=active]:text-white">Matrículas</TabsTrigger>
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
            <Card className="border-none shadow-2xl bg-white rounded-[3rem] max-w-2xl mx-auto overflow-hidden">
              <div className="bg-[#4A5D23] p-10 text-white flex justify-between items-center">
                <div>
                  <h3 className="text-3xl font-serif italic">Conexão WhatsApp</h3>
                  <p className="text-white/50 text-sm mt-1">Escaneie o QR Code para ativar o robô</p>
                </div>
                <MessageSquare className="w-12 h-12 text-[#E89A7B]" />
              </div>
              <CardContent className="p-12 text-center">
                <div className="bg-[#FDFBF7] aspect-square w-72 mx-auto mb-10 flex items-center justify-center rounded-[2.5rem] border-2 border-dashed border-[#4A5D23]/10 relative group">
                  {qrToken ? (
                    <QRCode value={qrToken} size={220} className="w-full h-full p-6" />
                  ) : (
                    <div className="text-[#4A5D23]/10 text-center">
                      <QrCode className="w-48 h-48 mx-auto" />
                      <p className="text-xs font-bold uppercase tracking-widest mt-4">Aguardando Servidor</p>
                    </div>
                  )}
                </div>
                <Button className="bg-[#4A5D23] hover:bg-[#3A491B] text-white px-12 py-7 rounded-2xl shadow-xl transition-all active:scale-95 font-bold" onClick={generateQr}>
                  Gerar Novo QR Code
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="alunas" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid lg:grid-cols-12 gap-10">
              {/* Form Cadastro */}
              <div className="lg:col-span-4">
                <Card className="border-none shadow-2xl bg-white rounded-[2.5rem] p-4">
                  <CardHeader>
                    <CardTitle className="text-[#4A5D23] font-serif text-2xl">Nova Matrícula</CardTitle>
                    <p className="text-xs text-muted-foreground italic">Adicione uma nova estrela à escola</p>
                  </CardHeader>
                  <CardContent>
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
    </div>
  );
};

export default AdminDashboard;
