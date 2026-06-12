import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Shield, GraduationCap, Heart, Star, Clock, ChevronRight, MapPin, Phone, Instagram, Mail, Menu, X, ClipboardList, CheckCircle2, Loader2, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { createTrialClass } from "@/services/whatsapp";
import { criarMatricula } from "@/services/matriculas";
import heroImg from "@/assets/hero-ballet.jpg";
import logoImg from "@/assets/logo-dara-rocha.png";
import galeria1 from "@/assets/galeria-1.jpg";
import galeria2 from "@/assets/galeria-2.jpg";
import galeria3 from "@/assets/galeria-3.jpg";
import galeria4 from "@/assets/galeria-4.jpg";
import galeria5 from "@/assets/galeria-5.jpg";
import galeria6 from "@/assets/galeria-6.jpg";

const galeriaImgs = [
  { src: galeria1, alt: "Alunas dançando ballet" },
  { src: galeria2, alt: "Aula de ballet na barra" },
  { src: galeria3, alt: "Alunas praticando na barra" },
  { src: galeria4, alt: "Aluna fazendo alongamento" },
  { src: galeria5, alt: "Professora ensinando na barra" },
  { src: galeria6, alt: "Professora auxiliando aluna" },
];

const stats = [
  { value: "10", label: "anos ensinando" },
  { value: "4", label: "turmas disponíveis" },
];

const diferenciais = [
  { 
    icon: Shield, 
    title: "Ambiente Seguro", 
    desc: "Espaço pensado para o desenvolvimento técnico e artístico. Salas amplas com espelhos para correção técnica e percepção corporal." 
  },
  { 
    icon: GraduationCap, 
    title: "Professora Qualificada", 
    desc: "Dara Rocha possui 10 anos de experiência ensinando a arte do ballet. Estamos sempre aprimorando nosso ambiente para proporcionar uma experiência cada vez mais confortável e inspiradora." 
  },
  { 
    icon: Heart, 
    title: "Acolhimento Real", 
    desc: "Cada aluna é tratada individualmente. Respeitamos o ritmo de cada criança, construindo autoconfiança passo a passo." 
  },
];

const turmas = [
  { idade: "4 – 5 anos", badge: "Turma aberta", title: "Baby Class", desc: "Introdução lúdica ao movimento, coordenação motora e ritmo. Aulas com música, histórias e brincadeiras.", horario: "17:00" },
  { idade: "6 – 9 anos", badge: "6 vagas", title: "Preliminar I e II", desc: "Técnica clássica, postura e vocabulário do ballet. Equilíbrio entre rigor técnico e leveza.", horario: "18:00" },
  { idade: "10 – 15 anos", badge: "Turma aberta", title: "Básico I e II", desc: "Aperfeiçoamento técnico, expressividade artística e preparação para apresentações. Com a professora Eva.", horario: "19:00" },
  { idade: "16+ anos", badge: "Turma aberta", title: "Ballet Adulto", desc: "Nunca é tarde para começar. Aulas voltadas para iniciantes e intermediários adultos.", horario: "20:00" },
];

const depoimentos = [
  { nome: "Jeferson Almeida", texto: "Super indico estúdio de ballet super profissional e atenciosos tanto com as bailarinas como com os pais!" },
  { nome: "Myria Brandao", texto: "Atendimento maravilhoso, minha filha ama a Tia Dara e a Tia Debora. ❤️" },
  { nome: "Emanuela Lopes", texto: "Espaço acolhedor, de aprendizado e minha filha ama desde o primeiro dia. Tia Dara é nota 10!" },
  { nome: "Isa Sousa", texto: "Ótimo atendimento e profissional capacitado, minha filha gosta muito das aulas. 👏🏽" },
  { nome: "Samia Vasconcelos", texto: "Qualidade top das Galáxias. Esse eu indico e confio!" },
  { nome: "Bruna Rocha", texto: "Uma profissional de excelência, muito competente e dedicada no que faz!" },
  { nome: "Vivia Aquino", texto: "Uma Escola que trabalha com honestidade, respeito e muito amor. A professora Dara Rocha é um encanto de pessoa. 🩷🌸" },
];

const Index = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ mae: "", crianca: "", whatsapp: "", turma: "", data_aula: "" });
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isMatriculaModalOpen, setIsMatriculaModalOpen] = useState(false);
  const [dynamicGaleria, setDynamicGaleria] = useState<any[]>([]);
  const whatsappUrl = "https://wa.me/5585986031932";

  // ── Multi-step enrollment form state ──────────────────────────────────────
  const TOTAL_STEPS = 5;
  const [matriculaStep, setMatriculaStep] = useState(1);
  const [savingMatricula, setSavingMatricula] = useState(false);
  const [matriculaToken, setMatriculaToken] = useState("");
  const [matriculaDone, setMatriculaDone] = useState(false);
  const [modalidades, setModalidades] = useState<string[]>([]);

  const [mForm, setMForm] = useState({
    // Seção 1 – Aluna
    nome_aluna: "", apelido: "", data_nascimento: "", cpf_aluna: "",
    endereco: "", numero: "", bairro: "", cidade: "Itaitinga", cep: "",
    // Seção 2 – Responsáveis
    nome_mae: "", nome_pai: "", whatsapp_mae: "", whatsapp_pai: "",
    email_responsavel: "", cpf_responsavel: "",
    // Seção 3 – Responsável Financeiro
    nome_financeiro: "", cpf_financeiro: "", whatsapp_financeiro: "",
    // Seção 5 – Escola (preenchido na última etapa)
    turma: "", horario: "", dias_semana: "", mensalidade: "",
  });

  const toggleModalidade = (m: string) =>
    setModalidades((prev) => prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]);

  const handleMatriculaSubmit = async () => {
    if (!mForm.nome_aluna.trim()) { toast.error("Nome da aluna é obrigatório."); return; }
    setSavingMatricula(true);
    try {
      const result = await criarMatricula({ ...mForm, modalidades });
      setMatriculaToken(result.token);
      setMatriculaDone(true);
      toast.success("Matrícula registrada! Agora assine o documento. 🩰");
    } catch (err: any) {
      toast.error("Erro ao salvar matrícula: " + err.message);
    } finally {
      setSavingMatricula(false);
    }
  };

  const assinaturaLink = matriculaToken
    ? `${window.location.origin}/balletdararocha/assinar/${matriculaToken}`
    : "";

  const handleCopyLink = () => {
    navigator.clipboard.writeText(assinaturaLink);
    toast.success("Link copiado!");
  };

  const handleResetMatricula = () => {
    setMatriculaStep(1);
    setMatriculaDone(false);
    setMatriculaToken("");
    setModalidades([]);
    setMForm({
      nome_aluna: "", apelido: "", data_nascimento: "", cpf_aluna: "",
      endereco: "", numero: "", bairro: "", cidade: "Itaitinga", cep: "",
      nome_mae: "", nome_pai: "", whatsapp_mae: "", whatsapp_pai: "",
      email_responsavel: "", cpf_responsavel: "",
      nome_financeiro: "", cpf_financeiro: "", whatsapp_financeiro: "",
      turma: "", horario: "", dias_semana: "", mensalidade: "",
    });
    setIsMatriculaModalOpen(false);
  };


  useEffect(() => {
    const fetchGaleria = async () => {
      const { data } = await supabase.storage.from('alunas-media').list('galeria', {
        limit: 15,
        sortBy: { column: 'name', order: 'desc' },
      });
      if (data && data.length > 0) {
        const files = data.filter(f => f.name !== '.emptyFolderPlaceholder');
        const urls = files.map(f => {
          const { data: { publicUrl } } = supabase.storage.from('alunas-media').getPublicUrl(`galeria/${f.name}`);
          return { src: publicUrl, alt: "Momento Ballet Dara Rocha" };
        });
        if (urls.length > 0) setDynamicGaleria(urls);
      }
    };
    fetchGaleria();
  }, []);

  const currentGaleria = dynamicGaleria.length > 0 ? dynamicGaleria : galeriaImgs;

  const handleAgendar = () => {
    setIsScheduleModalOpen(true);
  };

  const handleSubmitSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createTrialClass({
        nome_mae: formData.mae,
        nome_crianca: formData.crianca,
        whatsapp: formData.whatsapp,
        turma: formData.turma,
        data_aula: formData.data_aula
      });
      
      const formatMsg = `Olá Tia Dara! Me chamo ${formData.mae} e gostaria de agendar uma aula experimental de ballet para a ${formData.crianca} na turma ${formData.turma} no dia ${formData.data_aula.split('-').reverse().join('/')}.`;
      const redirectUrl = `https://wa.me/5585986031932?text=${encodeURIComponent(formatMsg)}`;
      
      toast.success("Aula experimental agendada! Redirecionando para o WhatsApp...");
      setIsScheduleModalOpen(false);
      setFormData({ mae: "", crianca: "", whatsapp: "", turma: "", data_aula: "" });
      
      setTimeout(() => {
        window.open(redirectUrl, '_blank');
      }, 1200);
    } catch (err: any) {
      toast.error("Erro ao registrar agendamento: " + err.message);
    }
  };

  const scrollToTurmas = () => {
    document.getElementById("turmas")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleInstagram = () => {
    window.open("https://www.instagram.com/balletdararocha/", "_blank");
  };

  const floatingWhatsApp = (
    <button 
      onClick={handleAgendar}
      className="fixed bottom-8 right-8 z-[100] bg-[#25D366] text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-all duration-300 group animate-bounce hover:animate-none"
      title="Falar no WhatsApp"
    >
      <Phone className="w-8 h-8 fill-white" />
      <span className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-white text-foreground px-4 py-2 rounded-lg text-sm font-bold shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-primary/10">
        Agende uma aula agora!
      </span>
    </button>
  );

  // ── Step labels ───────────────────────────────────────────────────────────
  const stepLabels = ["Aluna", "Responsáveis", "Financeiro", "Modalidade", "Escola"];


  return (
    <div className="min-h-screen bg-background selection:bg-primary/20">
      {/* Navbar com logo */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-primary/10 py-2 px-6 transition-all duration-300">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4 group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <img src={logoImg} alt="Ballet Dara Rocha logo" className="h-16 md:h-20 transition-transform group-hover:scale-105" />
          </div>
          <div className="hidden md:flex gap-8 text-sm font-medium tracking-wide uppercase text-foreground/70">
            <a href="#sobre" className="hover:text-primary transition-colors">Sobre</a>
            <a href="#turmas" className="hover:text-primary transition-colors">Turmas</a>
            <a href="#galeria" className="hover:text-primary transition-colors">Galeria</a>
            <a href="#contato" className="hover:text-primary transition-colors">Contato</a>
            <button onClick={() => navigate("/login")} className="text-secondary font-bold hover:text-secondary/80 transition-colors border-l border-muted pl-8 ml-4 hidden lg:block">
              Área de Acesso
            </button>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              onClick={handleAgendar}
              className="hidden sm:flex rounded-full bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20"
            >
              Agendar Aula
            </Button>
            <Button
              onClick={() => setIsMatriculaModalOpen(true)}
              variant="outline"
              className="hidden md:flex rounded-full border-[#E89A7B] text-[#E89A7B] hover:bg-[#E89A7B]/10 gap-2 font-bold"
            >
              <ClipboardList className="w-4 h-4" />
              Matricular
            </Button>
            <button 
              className="md:hidden p-2 text-primary"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
            </button>
          </div>
        </div>

        {/* Menu Mobile Overlay */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-primary/10 animate-fade-in shadow-xl">
            <div className="flex flex-col p-6 gap-4 text-lg font-medium">
              <a href="#sobre" onClick={() => setIsMenuOpen(false)} className="py-2 border-b border-muted">Sobre</a>
              <a href="#turmas" onClick={() => setIsMenuOpen(false)} className="py-2 border-b border-muted">Turmas</a>
              <a href="#galeria" onClick={() => setIsMenuOpen(false)} className="py-2 border-b border-muted">Galeria</a>
              <a href="#contato" onClick={() => setIsMenuOpen(false)} className="py-2 border-b border-muted">Contato</a>
              <a onClick={() => { setIsMenuOpen(false); navigate("/login"); }} className="py-2 text-secondary font-bold">Acessar Sistema</a>
              <Button onClick={() => { setIsMenuOpen(false); setIsMatriculaModalOpen(true); }} className="w-full rounded-full bg-[#E89A7B] text-white py-6 font-bold gap-2">
                <ClipboardList className="w-5 h-5" /> Realizar Matrícula
              </Button>
              <Button onClick={handleAgendar} className="w-full rounded-full bg-secondary text-white py-6 mt-2">
                Agendar Aula Experimental
              </Button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center pt-20">
        <div className="absolute inset-0">
          <img src={heroImg} alt="Ballet studio" className="w-full h-full object-cover" width={1920} height={1080} />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" />
        </div>

        <div className="relative z-10 container mx-auto px-6 py-20">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold uppercase tracking-wider mb-6 animate-fade-in">
              <Star className="w-3 h-3 fill-primary" />
              Escola de Ballet · Itaitinga, CE
            </div>
            <h1 className="text-4xl sm:text-6xl md:text-8xl font-bold leading-[1.1] mb-8 text-foreground animate-slide-up drop-shadow-sm">
              Onde cada passo <br />
              <span className="text-primary italic font-serif drop-shadow-md animate-float inline-block">conta uma história</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-10 font-light leading-relaxed max-w-xl animate-slide-up delay-100">
              Transformamos sonhos em movimento através de uma metodologia lúdica e acolhedora, focada no desenvolvimento integral de nossas bailarinas.
            </p>

            <div className="flex gap-12 mb-12 animate-slide-up delay-200">
              {stats.map((s) => (
                <div key={s.label} className="relative group">
                  <div className="text-5xl md:text-6xl font-serif text-primary leading-none">{s.value}</div>
                  <div className="text-xs text-muted-foreground uppercase tracking-[0.2em] mt-2 font-bold">{s.label}</div>
                  <div className="absolute -left-4 top-0 w-1 h-full bg-primary/20 scale-y-0 group-hover:scale-y-100 transition-transform origin-top" />
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-4 animate-slide-up delay-300">
              <Button 
                onClick={handleAgendar}
                size="lg" 
                className="bg-secondary hover:bg-secondary/90 text-white text-lg px-10 py-7 rounded-full shadow-xl shadow-secondary/30 transition-all hover:scale-105"
              >
                🩰 Agendar Aula Experimental
              </Button>
              <Button 
                onClick={() => setIsMatriculaModalOpen(true)}
                variant="outline"
                size="lg" 
                className="border-[#E89A7B] text-[#E89A7B] hover:bg-[#E89A7B]/10 text-lg px-10 py-7 rounded-full gap-2 font-bold"
              >
                <ClipboardList className="w-5 h-5" /> Realizar Matrícula
              </Button>
              <Button 
                onClick={scrollToTurmas}
                variant="outline" 
                size="lg" 
                className="border-primary/20 hover:bg-primary/5 text-primary text-lg px-10 py-7 rounded-full"
              >
                Conhecer Turmas
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Diferenciais */}
      <section id="sobre" className="py-32 bg-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/5 -skew-x-12 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-3xl mb-20">
            <p className="text-primary font-semibold tracking-widest uppercase text-sm mb-4">Essência & Propósito</p>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground">Por que escolher o <span className="font-serif italic">Ballet Dara Rocha</span>?</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {diferenciais.map((d, i) => (
              <div key={d.title} className="group">
                <div className="w-16 h-16 rounded-2xl bg-secondary/20 flex items-center justify-center mb-8 group-hover:bg-primary transition-colors duration-500">
                  <d.icon className="w-8 h-8 text-primary group-hover:text-white transition-colors duration-500" />
                </div>
                <h3 className="text-2xl font-serif mb-4 text-foreground">{d.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{d.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Turmas */}
      <section id="turmas" className="py-32 bg-muted/30">
        <div className="container mx-auto px-6 text-center mb-20">
          <p className="text-primary font-semibold tracking-widest uppercase text-sm mb-4">Nossas Turmas</p>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">Encontre o <span className="font-serif italic">ritmo ideal</span></h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">Horários pensados para conciliar com a rotina escolar, em turmas divididas por faixa etária e nível técnico.</p>
        </div>

        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {turmas.map((t) => (
              <Card key={t.title} className="overflow-hidden border-none shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-white group">
                <CardContent className="p-0">
                  <div className="h-2 bg-primary/20 group-hover:bg-primary transition-all duration-500" />
                  <div className="p-8">
                    <div className="flex justify-between items-start mb-6">
                      <span className="text-xs font-bold text-primary uppercase tracking-wider px-3 py-1 rounded-full bg-primary/5">
                        {t.idade}
                      </span>
                      <span className="text-2xl font-serif text-foreground/30">{t.horario}</span>
                    </div>
                    <h3 className="text-2xl font-bold mb-4 text-foreground">{t.title}</h3>
                    <p className="text-muted-foreground text-sm mb-8 leading-relaxed line-clamp-3">{t.desc}</p>
                    <div className="pt-6 border-t border-muted flex justify-between items-center">
                      <span className="text-xs font-medium text-muted-foreground italic">{t.badge}</span>
                      <Button 
                        onClick={handleAgendar}
                        variant="ghost" 
                        size="sm" 
                        className="text-primary hover:text-primary/80 p-0"
                      >
                        Saber mais <ChevronRight className="ml-1 w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Galeria */}
      <section id="galeria" className="py-32 overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div className="max-w-2xl">
              <p className="text-primary font-semibold tracking-widest uppercase text-sm mb-4">Nosso dia a dia</p>
              <h2 className="text-4xl md:text-5xl font-bold text-foreground">Momentos <span className="font-serif italic">mágicos</span> no estúdio</h2>
            </div>
            <Button 
              onClick={handleInstagram}
              variant="outline" 
              className="rounded-full border-primary/20 hover:bg-primary/5"
            >
              Ver Instagram
            </Button>
          </div>

          <Carousel opts={{ align: "start", loop: true }} className="w-full">
            <CarouselContent className="-ml-4">
              {currentGaleria.map((img, i) => (
                <CarouselItem key={i} className="pl-4 basis-full md:basis-1/2 lg:basis-1/3">
                  <div className="overflow-hidden rounded-2xl aspect-[4/5] shadow-lg">
                    <img
                      src={img.src}
                      alt={img.alt}
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
                      loading="lazy"
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="flex justify-center gap-4 mt-12">
              <CarouselPrevious className="static translate-y-0" />
              <CarouselNext className="static translate-y-0" />
            </div>
          </Carousel>
        </div>
      </section>

      {/* Depoimentos */}
      <section className="py-32 bg-secondary/10 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200%] h-20 bg-white rounded-[100%] -translate-y-1/2" />
        <div className="container mx-auto px-6 relative">
          <div className="text-center mb-20">
            <div className="flex justify-center gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-primary text-primary" />
              ))}
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">O que dizem nossas famílias</h2>
            <p className="text-muted-foreground">Reconhecimento de quem vive a nossa escola todos os dias.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {depoimentos.map((d) => (
              <Card key={d.nome} className="border-none shadow-xl shadow-primary/5 hover:shadow-2xl transition-all duration-500 bg-white p-8">
                <CardContent className="p-0">
                  <p className="text-foreground/80 italic mb-8 leading-relaxed">"{d.texto}"</p>
                  <div className="flex items-center gap-4 pt-6 border-t border-muted">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold font-serif">
                      {d.nome[0]}
                    </div>
                    <div>
                      <span className="block font-bold text-foreground">{d.nome}</span>
                      <span className="text-xs text-muted-foreground uppercase tracking-widest">Família Ballet</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Localização & Contato */}
      <section id="contato" className="py-32 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div>
              <p className="text-primary font-semibold tracking-widest uppercase text-sm mb-4">Onde estamos</p>
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-8 italic font-serif">Venha nos visitar</h2>
              
              <div className="space-y-8 mb-12">
                <div className="flex gap-6">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <MapPin className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-foreground mb-1">Endereço</h4>
                    <p className="text-muted-foreground">Itaitinga, Ceará - Brasil<br />(Entre em contato para endereço exato)</p>
                  </div>
                </div>
                
                <div className="flex gap-6">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Phone className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-foreground mb-1">WhatsApp</h4>
                    <p className="text-muted-foreground">(85) 98603-1932</p>
                  </div>
                </div>

                <div 
                  onClick={handleInstagram}
                  className="flex gap-6 cursor-pointer group"
                >
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary transition-colors">
                    <Instagram className="w-6 h-6 text-primary group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-foreground mb-1">Instagram</h4>
                    <p className="text-muted-foreground group-hover:text-primary transition-colors">@balletdararocha</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <Button 
                  onClick={handleAgendar}
                  className="rounded-full px-8 py-6 bg-secondary hover:bg-secondary/90 text-white shadow-xl shadow-secondary/20"
                >
                  Falar no WhatsApp
                </Button>
                <Button variant="outline" className="rounded-full px-8 py-6 border-primary/20">Ver no Maps</Button>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-primary/5 rounded-3xl -rotate-3 scale-105" />
              <div className="relative bg-muted rounded-3xl overflow-hidden aspect-square shadow-2xl">
                {/* Google Maps Placeholder */}
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15925.326848243!2d-38.5284384!3d-3.966784!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x7c73703c7343e77%3A0x6b77777777777777!2sItaitinga%2C%20CE!5e0!3m2!1spt-BR!2sbr!4v1715174400000!5m2!1spt-BR!2sbr" 
                  width="100%" 
                  height="100%" 
                  style={{ border: 0 }} 
                  allowFullScreen 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 bg-foreground text-white">
        <div className="container mx-auto px-6 text-center">
          <img src={logoImg} alt="Ballet Dara Rocha" className="w-48 mx-auto mb-12 invert brightness-0" />
          
          <div className="flex justify-center gap-8 mb-12">
            <Instagram 
              onClick={handleInstagram}
              className="w-6 h-6 cursor-pointer hover:text-primary transition-colors" 
            />
            <Phone 
              onClick={handleAgendar}
              className="w-6 h-6 cursor-pointer hover:text-primary transition-colors" 
            />
            <Mail className="w-6 h-6 cursor-pointer hover:text-primary transition-colors" />
          </div>

          <div className="border-t border-white/10 pt-12 text-sm text-white/40">
            <p>© {new Date().getFullYear()} Ballet Dara Rocha. Desenvolvido com carinho para nossas bailarinas.</p>
          </div>
        </div>
      </footer>
      {floatingWhatsApp}

      {/* ── Modal: Aula Experimental ────────────────────────────────────── */}
      <Dialog open={isScheduleModalOpen} onOpenChange={setIsScheduleModalOpen}>
        <DialogContent className="max-w-md bg-[#FDFBF7] rounded-[2.5rem] border-none p-0 overflow-hidden shadow-2xl">
          <DialogHeader className="bg-[#4A5D23] p-8 text-white">
            <DialogTitle className="text-3xl font-serif italic text-white flex items-center gap-2">
              <span>🩰</span> Aula Experimental
            </DialogTitle>
            <DialogDescription className="text-white/70 text-xs">
              Preencha os dados abaixo para agendarmos a aula experimental da sua bailarina!
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmitSchedule} className="p-8 space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[#4A5D23]/60 px-1">Seu Nome (Mãe/Responsável)</label>
              <Input
                value={formData.mae}
                onChange={(e) => setFormData({ ...formData, mae: e.target.value })}
                placeholder="Ex: Ana Silva"
                className="rounded-2xl border-[#4A5D23]/10 bg-[#FDFBF7] h-12"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[#4A5D23]/60 px-1">Nome da Bailarina</label>
              <Input
                value={formData.crianca}
                onChange={(e) => setFormData({ ...formData, crianca: e.target.value })}
                placeholder="Ex: Beatriz Silva"
                className="rounded-2xl border-[#4A5D23]/10 bg-[#FDFBF7] h-12"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[#4A5D23]/60 px-1">WhatsApp Contato</label>
                <Input
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                  placeholder="85 9..."
                  className="rounded-2xl border-[#4A5D23]/10 bg-[#FDFBF7] h-12"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[#4A5D23]/60 px-1">Data Desejada</label>
                <Input
                  type="date"
                  value={formData.data_aula}
                  onChange={(e) => setFormData({ ...formData, data_aula: e.target.value })}
                  className="rounded-2xl border-[#4A5D23]/10 bg-[#FDFBF7] h-12 text-[#4A5D23] font-bold"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[#4A5D23]/60 px-1">Turma de Interesse</label>
              <Select
                value={formData.turma}
                onValueChange={(val) => setFormData({ ...formData, turma: val })}
                required
              >
                <SelectTrigger className="rounded-2xl border-[#4A5D23]/10 bg-[#FDFBF7] h-12 text-left">
                  <SelectValue placeholder="Selecione a turma" />
                </SelectTrigger>
                <SelectContent className="bg-[#FDFBF7] border-[#4A5D23]/10 rounded-xl">
                  <SelectItem value="Baby Class (4-5 anos)">Baby Class (4 a 5 anos)</SelectItem>
                  <SelectItem value="Preliminar (6-9 anos)">Preliminar I e II (6 a 9 anos)</SelectItem>
                  <SelectItem value="Básico (10-15 anos)">Básico I e II (10 a 15 anos)</SelectItem>
                  <SelectItem value="Ballet Adulto (16+ anos)">Ballet Adulto (16+ anos)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="w-full bg-[#4A5D23] hover:bg-[#3A491B] text-white h-14 rounded-2xl shadow-lg transition-all font-bold text-base mt-2">
              🩰 Confirmar &amp; Enviar no WhatsApp
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Modal: Matrícula Completa (Multi-Etapas) ─────────────────────── */}
      <Dialog open={isMatriculaModalOpen} onOpenChange={(open) => { if (!open) handleResetMatricula(); else setIsMatriculaModalOpen(true); }}>
        <DialogContent className="max-w-2xl bg-[#FDFBF7] rounded-[2.5rem] border-none p-0 overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">

          {/* Header */}
          <DialogHeader className="bg-[#4A5D23] px-8 py-6 text-white shrink-0">
            <DialogTitle className="text-2xl font-serif italic text-white flex items-center gap-3">
              <ClipboardList className="w-6 h-6 text-[#E89A7B]" />
              Ficha de Matrícula
            </DialogTitle>
            <DialogDescription className="text-white/60 text-xs mt-1">
              Preencha todos os dados para realizar a matrícula oficial.
            </DialogDescription>

            {/* Stepper */}
            {!matriculaDone && (
              <div className="flex items-center gap-1 mt-5">
                {stepLabels.map((label, i) => {
                  const step = i + 1;
                  const active = step === matriculaStep;
                  const done = step < matriculaStep;
                  return (
                    <div key={label} className="flex items-center gap-1 flex-1 last:flex-none">
                      <div className={`flex flex-col items-center gap-1 flex-none`}>
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                          done ? 'bg-[#E89A7B] text-white' : active ? 'bg-white text-[#4A5D23]' : 'bg-white/20 text-white/50'
                        }`}>
                          {done ? <CheckCircle2 className="w-4 h-4" /> : step}
                        </div>
                        <span className={`text-[8px] uppercase tracking-wider font-bold whitespace-nowrap ${active ? 'text-white' : 'text-white/40'}`}>{label}</span>
                      </div>
                      {i < stepLabels.length - 1 && (
                        <div className={`h-0.5 flex-1 mb-4 rounded-full transition-all ${done ? 'bg-[#E89A7B]' : 'bg-white/10'}`} />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </DialogHeader>

          {/* Body */}
          <div className="overflow-y-auto flex-1 p-8">

            {/* ── Sucesso: link gerado ── */}
            {matriculaDone ? (
              <div className="space-y-6 text-center py-4">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-12 h-12 text-green-500" />
                </div>
                <div>
                  <h3 className="text-2xl font-serif font-bold text-[#4A5D23]">Matrícula registrada! 🩰</h3>
                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                    Envie o link abaixo para o responsável assinar digitalmente a ficha de matrícula:
                  </p>
                </div>

                <div className="bg-white border-2 border-[#4A5D23]/10 rounded-2xl p-4 text-left space-y-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#4A5D23]/50">Link de Assinatura</p>
                  <p className="text-xs font-mono text-[#4A5D23] break-all leading-relaxed">{assinaturaLink}</p>
                  <div className="flex gap-3">
                    <Button
                      onClick={handleCopyLink}
                      size="sm"
                      variant="outline"
                      className="rounded-xl border-[#4A5D23]/20 text-[#4A5D23] gap-2 flex-1"
                    >
                      <Copy className="w-3.5 h-3.5" /> Copiar Link
                    </Button>
                    <Button
                      size="sm"
                      className="rounded-xl bg-[#25D366] hover:bg-[#1DA851] text-white gap-2 flex-1"
                      onClick={() => {
                        const msg = `Olá! Segue o link para assinar a ficha de matrícula do Ballet Dara Rocha:\n\n${assinaturaLink}`;
                        window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
                      }}
                    >
                      <Phone className="w-3.5 h-3.5" /> Enviar WhatsApp
                    </Button>
                  </div>
                </div>

                <Button
                  onClick={handleResetMatricula}
                  variant="outline"
                  className="rounded-2xl border-[#4A5D23]/20 text-[#4A5D23] px-8 w-full"
                >
                  Fechar
                </Button>
              </div>
            ) : (
              <div className="space-y-6">

                {/* Etapa 1 – Dados da Aluna */}
                {matriculaStep === 1 && (
                  <div className="space-y-4">
                    <StepTitle>1. Dados Pessoais da Aluna</StepTitle>
                    <FormRow>
                      <FormField label="Nome Completo *">
                        <Input value={mForm.nome_aluna} onChange={(e) => setMForm({ ...mForm, nome_aluna: e.target.value })} placeholder="Nome completo" className={inputCls} required />
                      </FormField>
                      <FormField label="Apelido / Nome Artístico">
                        <Input value={mForm.apelido} onChange={(e) => setMForm({ ...mForm, apelido: e.target.value })} placeholder="Ex: Bela" className={inputCls} />
                      </FormField>
                    </FormRow>
                    <FormRow>
                      <FormField label="Data de Nascimento">
                        <Input type="date" value={mForm.data_nascimento} onChange={(e) => setMForm({ ...mForm, data_nascimento: e.target.value })} className={inputCls} />
                      </FormField>
                      <FormField label="CPF da Aluna">
                        <Input value={mForm.cpf_aluna} onChange={(e) => setMForm({ ...mForm, cpf_aluna: e.target.value })} placeholder="000.000.000-00" className={inputCls} />
                      </FormField>
                    </FormRow>
                    <FormField label="Endereço (Rua)">
                      <Input value={mForm.endereco} onChange={(e) => setMForm({ ...mForm, endereco: e.target.value })} placeholder="Ex: Rua das Flores" className={inputCls} />
                    </FormField>
                    <FormRow>
                      <FormField label="Número">
                        <Input value={mForm.numero} onChange={(e) => setMForm({ ...mForm, numero: e.target.value })} placeholder="Ex: 123" className={inputCls} />
                      </FormField>
                      <FormField label="Bairro">
                        <Input value={mForm.bairro} onChange={(e) => setMForm({ ...mForm, bairro: e.target.value })} placeholder="Ex: Centro" className={inputCls} />
                      </FormField>
                    </FormRow>
                    <FormRow>
                      <FormField label="Cidade">
                        <Input value={mForm.cidade} onChange={(e) => setMForm({ ...mForm, cidade: e.target.value })} placeholder="Itaitinga" className={inputCls} />
                      </FormField>
                      <FormField label="CEP">
                        <Input value={mForm.cep} onChange={(e) => setMForm({ ...mForm, cep: e.target.value })} placeholder="00000-000" className={inputCls} />
                      </FormField>
                    </FormRow>
                  </div>
                )}

                {/* Etapa 2 – Dados dos Responsáveis */}
                {matriculaStep === 2 && (
                  <div className="space-y-4">
                    <StepTitle>2. Dados dos Responsáveis</StepTitle>
                    <FormRow>
                      <FormField label="Nome da Mãe">
                        <Input value={mForm.nome_mae} onChange={(e) => setMForm({ ...mForm, nome_mae: e.target.value })} placeholder="Nome completo" className={inputCls} />
                      </FormField>
                      <FormField label="WhatsApp da Mãe">
                        <Input value={mForm.whatsapp_mae} onChange={(e) => setMForm({ ...mForm, whatsapp_mae: e.target.value })} placeholder="85 9..." className={inputCls} />
                      </FormField>
                    </FormRow>
                    <FormRow>
                      <FormField label="Nome do Pai">
                        <Input value={mForm.nome_pai} onChange={(e) => setMForm({ ...mForm, nome_pai: e.target.value })} placeholder="Nome completo" className={inputCls} />
                      </FormField>
                      <FormField label="WhatsApp do Pai">
                        <Input value={mForm.whatsapp_pai} onChange={(e) => setMForm({ ...mForm, whatsapp_pai: e.target.value })} placeholder="85 9..." className={inputCls} />
                      </FormField>
                    </FormRow>
                    <FormRow>
                      <FormField label="E-mail do Responsável">
                        <Input type="email" value={mForm.email_responsavel} onChange={(e) => setMForm({ ...mForm, email_responsavel: e.target.value })} placeholder="email@exemplo.com" className={inputCls} />
                      </FormField>
                      <FormField label="CPF do Responsável">
                        <Input value={mForm.cpf_responsavel} onChange={(e) => setMForm({ ...mForm, cpf_responsavel: e.target.value })} placeholder="000.000.000-00" className={inputCls} />
                      </FormField>
                    </FormRow>
                  </div>
                )}

                {/* Etapa 3 – Responsável Financeiro */}
                {matriculaStep === 3 && (
                  <div className="space-y-4">
                    <StepTitle>3. Responsável Financeiro</StepTitle>
                    <p className="text-xs text-muted-foreground italic">Preencha se o responsável financeiro for diferente dos responsáveis acima.</p>
                    <FormField label="Nome do Responsável Financeiro">
                      <Input value={mForm.nome_financeiro} onChange={(e) => setMForm({ ...mForm, nome_financeiro: e.target.value })} placeholder="Nome completo" className={inputCls} />
                    </FormField>
                    <FormRow>
                      <FormField label="CPF">
                        <Input value={mForm.cpf_financeiro} onChange={(e) => setMForm({ ...mForm, cpf_financeiro: e.target.value })} placeholder="000.000.000-00" className={inputCls} />
                      </FormField>
                      <FormField label="WhatsApp">
                        <Input value={mForm.whatsapp_financeiro} onChange={(e) => setMForm({ ...mForm, whatsapp_financeiro: e.target.value })} placeholder="85 9..." className={inputCls} />
                      </FormField>
                    </FormRow>
                  </div>
                )}

                {/* Etapa 4 – Modalidade */}
                {matriculaStep === 4 && (
                  <div className="space-y-4">
                    <StepTitle>4. Modalidade Escolhida</StepTitle>
                    <p className="text-xs text-muted-foreground italic">Selecione uma ou mais modalidades:</p>
                    <div className="grid grid-cols-1 gap-3">
                      {['Ballet Clássico', 'Alongamento', 'Forró'].map((mod) => {
                        const active = modalidades.includes(mod);
                        return (
                          <button
                            key={mod}
                            type="button"
                            onClick={() => toggleModalidade(mod)}
                            className={`w-full text-left px-6 py-4 rounded-2xl border-2 transition-all font-semibold flex items-center gap-4 ${
                              active ? 'border-[#4A5D23] bg-[#4A5D23]/5 text-[#4A5D23]' : 'border-[#4A5D23]/10 bg-white text-muted-foreground hover:border-[#4A5D23]/30'
                            }`}
                          >
                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${
                              active ? 'bg-[#4A5D23] border-[#4A5D23]' : 'border-[#4A5D23]/30'
                            }`}>
                              {active && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                            </div>
                            {mod === 'Ballet Clássico' && '🩰 '}
                            {mod === 'Alongamento' && '🤸 '}
                            {mod === 'Forró' && '💃 '}
                            {mod}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Etapa 5 – Dados da Escola */}
                {matriculaStep === 5 && (
                  <div className="space-y-4">
                    <StepTitle>5. Dados da Escola</StepTitle>
                    <p className="text-xs text-muted-foreground italic">Estes dados serão preenchidos pela administração (opcional aqui).</p>
                    <FormRow>
                      <FormField label="Turma / Nível">
                        <Select value={mForm.turma} onValueChange={(v) => setMForm({ ...mForm, turma: v })}>
                          <SelectTrigger className={inputCls + " h-12"}><SelectValue placeholder="Selecione" /></SelectTrigger>
                          <SelectContent className="bg-[#FDFBF7] border-[#4A5D23]/10 rounded-xl">
                            <SelectItem value="Baby Class (4-5 anos)">Baby Class (4-5 anos)</SelectItem>
                            <SelectItem value="Preliminar I e II (6-9 anos)">Preliminar I e II (6-9 anos)</SelectItem>
                            <SelectItem value="Básico I e II (10-15 anos)">Básico I e II (10-15 anos)</SelectItem>
                            <SelectItem value="Ballet Adulto (16+ anos)">Ballet Adulto (16+ anos)</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormField>
                      <FormField label="Horário">
                        <Input value={mForm.horario} onChange={(e) => setMForm({ ...mForm, horario: e.target.value })} placeholder="Ex: 17:00" className={inputCls} />
                      </FormField>
                    </FormRow>
                    <FormRow>
                      <FormField label="Dias da Semana">
                        <Input value={mForm.dias_semana} onChange={(e) => setMForm({ ...mForm, dias_semana: e.target.value })} placeholder="Ex: Terças e Quintas" className={inputCls} />
                      </FormField>
                      <FormField label="Mensalidade (R$)">
                        <Input type="number" value={mForm.mensalidade} onChange={(e) => setMForm({ ...mForm, mensalidade: e.target.value })} placeholder="Ex: 115" className={inputCls} />
                      </FormField>
                    </FormRow>
                  </div>
                )}

                {/* Navegação entre etapas */}
                <div className="flex gap-3 justify-between pt-4 border-t border-[#4A5D23]/5">
                  <Button
                    variant="outline"
                    onClick={() => setMatriculaStep(s => s - 1)}
                    disabled={matriculaStep === 1}
                    className="rounded-2xl border-[#4A5D23]/20 text-[#4A5D23] px-6"
                  >
                    Voltar
                  </Button>

                  {matriculaStep < TOTAL_STEPS ? (
                    <Button
                      onClick={() => {
                        if (matriculaStep === 1 && !mForm.nome_aluna.trim()) {
                          toast.error("Digite o nome da aluna para continuar.");
                          return;
                        }
                        setMatriculaStep(s => s + 1);
                      }}
                      className="bg-[#4A5D23] hover:bg-[#3A491B] text-white rounded-2xl px-8 font-bold gap-2"
                    >
                      Próximo <ChevronRight className="w-4 h-4" />
                    </Button>
                  ) : (
                    <Button
                      onClick={handleMatriculaSubmit}
                      disabled={savingMatricula}
                      className="bg-[#E89A7B] hover:bg-[#D4896D] text-white rounded-2xl px-8 font-bold gap-2"
                    >
                      {savingMatricula ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Salvando...</>
                      ) : (
                        <><CheckCircle2 className="w-4 h-4" /> Concluir Matrícula</>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// ── Helper mini-components ───────────────────────────────────────────────────
const inputCls = "rounded-2xl border-[#4A5D23]/10 bg-white h-12 text-sm";

const StepTitle = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-base font-bold text-[#4A5D23] font-serif italic border-b border-[#4A5D23]/5 pb-2">{children}</h3>
);

const FormRow = ({ children }: { children: React.ReactNode }) => (
  <div className="grid grid-cols-2 gap-4">{children}</div>
);

const FormField = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-bold uppercase tracking-widest text-[#4A5D23]/60 px-1">{label}</label>
    {children}
  </div>
);

export default Index;
