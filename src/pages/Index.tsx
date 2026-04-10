import { useState } from "react";
import { Shield, GraduationCap, Heart, Star, Clock, ChevronRight } from "lucide-react";
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
  { value: "10+", label: "anos de experiência" },
  { value: "200+", label: "alunas formadas" },
  { value: "4", label: "turmas disponíveis" },
];

const diferenciais = [
  { icon: Shield, title: "Ambiente Seguro", desc: "Estúdio com piso flutuante, espelhos protegidos e supervisão integral. Projetado exclusivamente para crianças e adolescentes." },
  { icon: GraduationCap, title: "Professora Qualificada", desc: "Dara Rocha tem formação em dança clássica e mais de 12 anos ensinando. Metodologia lúdica adaptada a cada faixa etária." },
  { icon: Heart, title: "Acolhimento Real", desc: "Cada aluna é tratada individualmente. Respeitamos o ritmo de cada criança, construindo autoconfiança passo a passo." },
];

const turmas = [
  { idade: "3 – 6 anos", badge: "Últimas vagas", title: "Pré-Ballet", desc: "Introdução lúdica ao movimento, coordenação motora e ritmo. Aulas com música, histórias e brincadeiras.", horario: "Ter e Qui · 18h" },
  { idade: "7 – 10 anos", badge: "5 vagas", title: "Ballet Infantil", desc: "Técnica clássica, postura e vocabulário do ballet. Equilíbrio entre rigor técnico e leveza.", horario: "Ter e Qui · 18h30" },
  { idade: "11 – 15 anos", badge: "Turma avançada", title: "Ballet Juvenil", desc: "Aperfeiçoamento técnico, expressividade artística e preparação para apresentações.", horario: "Ter e Qui · 19h30" },
  { idade: "Adultos", badge: "Turma aberta", title: "Ballet Adulto", desc: "Nunca é tarde para começar. Aulas voltadas para iniciantes e intermediários adultos.", horario: "Ter e Qui · 20h30" },
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
  const [formData, setFormData] = useState({ mae: "", crianca: "", whatsapp: "", turma: "" });

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar com logo */}
      <nav className="bg-card py-4 px-6 shadow-sm">
        <div className="container mx-auto flex justify-center">
          <img src={logoImg} alt="Ballet Dara Rocha logo" className="h-28 md:h-36 lg:h-44" />
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImg} alt="Ballet studio" className="w-full h-full object-cover" width={1920} height={1080} />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/50 to-transparent" />
        </div>

        <div className="relative z-10 container mx-auto px-6 py-20">
          <div className="max-w-2xl text-primary-foreground">
            <p className="text-primary-foreground/80 text-sm tracking-widest uppercase mb-4 font-light">
              Escola de Ballet · Itaitinga, CE
            </p>
            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
              Onde meninas <em className="font-normal">descobrem</em> a arte
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/90 mb-8 font-light leading-relaxed">
              O ballet ensina muito mais do que dança — desenvolve <strong>postura, disciplina e autoconfiança</strong> desde os primeiros passos.
            </p>

            <div className="flex gap-8 mb-10">
              {stats.map((s) => (
                <div key={s.label}>
                  <div className="text-3xl md:text-4xl font-bold">{s.value}</div>
                  <div className="text-sm text-primary-foreground/70">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 py-6 rounded-full shadow-lg">
                🩰 Agendar Aula Experimental Gratuita
              </Button>
              <Button variant="outline" size="lg" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 text-lg px-8 py-6 rounded-full">
                Conhecer as turmas
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Diferenciais */}
      <section className="py-24 bg-secondary/50">
        <div className="container mx-auto px-6">
          <p className="text-center text-sm tracking-widest uppercase text-muted-foreground mb-2">Por que nos escolher</p>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-foreground">Nossos Diferenciais</h2>

          <div className="grid md:grid-cols-3 gap-8">
            {diferenciais.map((d) => (
              <Card key={d.title} className="border-none shadow-md hover:shadow-xl transition-shadow bg-card">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                    <d.icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-foreground">{d.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{d.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Turmas */}
      <section id="turmas" className="py-24">
        <div className="container mx-auto px-6">
          <p className="text-center text-sm tracking-widest uppercase text-muted-foreground mb-2">Para cada fase</p>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-foreground">Nossas Turmas</h2>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {turmas.map((t) => (
              <Card key={t.title} className="overflow-hidden border hover:shadow-lg transition-shadow group">
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-sm font-medium text-muted-foreground">{t.idade}</span>
                    <span className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full font-medium">{t.badge}</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-foreground">{t.title}</h3>
                  <p className="text-muted-foreground mb-4 leading-relaxed">{t.desc}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                    <Clock className="w-4 h-4" />
                    {t.horario}
                  </div>
                  <a href="#agendar" className="inline-flex items-center text-primary font-medium hover:underline group-hover:gap-2 transition-all">
                    Agendar aula gratuita <ChevronRight className="w-4 h-4" />
                  </a>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Depoimentos */}
      <section className="py-24 bg-secondary/50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-4">
            <span className="text-sm text-muted-foreground">5.0 no Google</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-2 text-foreground">O que dizem nossas famílias</h2>
          <div className="flex justify-center gap-1 mb-12">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
            ))}
            <span className="text-sm text-muted-foreground ml-2">· 7 avaliações</span>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {depoimentos.map((d) => (
              <Card key={d.nome} className="border-none shadow-sm hover:shadow-md transition-shadow bg-card">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                      {d.nome[0]}
                    </div>
                    <span className="font-medium text-foreground">{d.nome}</span>
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed">"{d.texto}"</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Formulário */}
      <section id="agendar" className="py-24">
        <div className="container mx-auto px-6">
          <div className="max-w-xl mx-auto">
            <p className="text-center text-sm tracking-widest uppercase text-muted-foreground mb-2">Aula experimental gratuita</p>
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-foreground">Agende sua primeira aula</h2>
            <p className="text-center text-muted-foreground mb-10">
              Preencha abaixo e entraremos em contato em até 2 horas para confirmar seu horário.
            </p>

            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <Input
                placeholder="Nome da Mãe / Responsável"
                value={formData.mae}
                onChange={(e) => setFormData({ ...formData, mae: e.target.value })}
                className="py-6 bg-card"
              />
              <Input
                placeholder="Nome da Criança"
                value={formData.crianca}
                onChange={(e) => setFormData({ ...formData, crianca: e.target.value })}
                className="py-6 bg-card"
              />
              <Input
                placeholder="WhatsApp"
                value={formData.whatsapp}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                className="py-6 bg-card"
              />
              <Select onValueChange={(v) => setFormData({ ...formData, turma: v })}>
                <SelectTrigger className="py-6 bg-card">
                  <SelectValue placeholder="Selecione a turma ideal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pre">3 – 6 anos · Pré-Ballet</SelectItem>
                  <SelectItem value="infantil">7 – 10 anos · Ballet Infantil</SelectItem>
                  <SelectItem value="juvenil">11 – 15 anos · Ballet Juvenil</SelectItem>
                  <SelectItem value="adulto">Adulto</SelectItem>
                </SelectContent>
              </Select>
              <Button type="submit" className="w-full py-6 text-lg bg-primary hover:bg-primary/90 text-primary-foreground rounded-full shadow-lg">
                Agendar Aula Experimental Gratuita
              </Button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-6 text-center text-sm text-muted-foreground">
          <img src={logoImg} alt="Ballet Dara Rocha" className="w-32 mx-auto mb-4 opacity-60" />
          <p>© {new Date().getFullYear()} Ballet Dara Rocha. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
