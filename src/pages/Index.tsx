import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, GraduationCap, Heart, Star, Clock, ChevronRight, MapPin, Phone, Instagram, Mail, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
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
  const [formData, setFormData] = useState({ mae: "", crianca: "", whatsapp: "", turma: "" });
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const whatsappUrl = "https://wa.me/5585986031932";

  const handleAgendar = () => {
    window.open(whatsappUrl, "_blank");
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
          <div className="flex items-center gap-4">
            <Button 
              onClick={handleAgendar}
              className="hidden sm:flex rounded-full bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20"
            >
              Agendar Aula
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
              <Button onClick={handleAgendar} className="w-full rounded-full bg-secondary text-white py-6 mt-4">
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
              {galeriaImgs.map((img, i) => (
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
    </div>
  );
};

export default Index;
