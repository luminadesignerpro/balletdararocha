import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LogOut, Heart, Image as ImageIcon, TrendingUp, Bell, DollarSign, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [student, setStudent] = useState<any>(null);
  const fetchStudentData = async () => {
    const studentId = localStorage.getItem("currentStudentId");
    if (!studentId) {
      navigate("/login");
      return;
    }

    const { data, error } = await supabase
      .from('alunas')
      .select('*')
      .eq('id', studentId)
      .single();

    if (error) toast.error('Erro ao carregar seus dados');
    else setStudent(data);
  };

  useEffect(() => {
    fetchStudentData();
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };


  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col md:flex-row overflow-hidden font-sans">
      {/* Sidebar Elegante - Mobile Horizontal / Desktop Vertical */}
      <aside className="w-full md:w-80 bg-[#4A5D23] text-white p-8 flex flex-col shadow-2xl relative z-20">
        <div className="flex items-center gap-6 mb-12 bg-white/5 p-6 rounded-[2rem] border border-white/10">
          <div className="w-16 h-16 rounded-2xl bg-[#E89A7B] shadow-lg flex items-center justify-center font-serif font-bold text-2xl text-white transform -rotate-3 hover:rotate-0 transition-transform duration-500">
            {student?.nome?.[0] || "?"}
          </div>
          <div className="flex-1">
            <p className="text-[10px] uppercase tracking-[0.3em] text-white/40 mb-1 font-bold">Bailarina</p>
            <h2 className="font-serif text-xl font-bold leading-none">{student?.nome?.split(' ')[0] || "Aluna"}</h2>
            <p className="text-xs text-[#E89A7B] mt-2 font-medium italic">{student?.turma || "Carregando..."}</p>
          </div>
        </div>
        
        <nav className="space-y-3 flex-1">
          {[
            { label: 'Meu Diário', icon: ImageIcon, id: 'diario' },
            { label: 'Evolução', icon: TrendingUp, id: 'progresso' },
            { label: 'Avisos', icon: Bell, id: 'avisos' },
            { label: 'Financeiro', icon: DollarSign, id: 'financeiro' },
          ].map((item) => (
            <Button
              key={item.label}
              variant="ghost"
              onClick={() => scrollToSection(item.id)}
              className="w-full justify-start hover:bg-white/10 text-white/80 hover:text-white rounded-2xl py-6 transition-all group"
            >
              <item.icon className="mr-4 w-5 h-5 group-hover:scale-110 transition-transform" /> 
              {item.label}
            </Button>
          ))}
        </nav>

        <div className="pt-8 mt-8 border-t border-white/10">
          <Button variant="ghost" onClick={() => navigate("/")} className="w-full justify-start hover:bg-red-400/20 text-white/60 hover:text-white rounded-2xl py-6">
            <LogOut className="mr-4 w-5 h-5" /> Sair do Portal
          </Button>
        </div>
      </aside>

      {/* Main Content - Premium Journal Feel */}
      <main className="flex-1 p-8 md:p-16 overflow-y-auto bg-gradient-to-br from-[#FDFBF7] to-[#F5F1E9] scroll-smooth">
        <header id="diario" className="mb-16">
          <div className="inline-block px-4 py-1.5 rounded-full bg-[#E89A7B]/10 border border-[#E89A7B]/20 text-[#E89A7B] text-[10px] font-bold uppercase tracking-[0.2em] mb-4">
            Espaço da Aluna
          </div>
          <h1 className="text-5xl md:text-6xl font-serif font-bold text-[#4A5D23] mb-4 tracking-tight">Meu Diário de <span className="italic">Ballet</span></h1>
          <p className="text-lg text-muted-foreground/80 font-serif italic border-l-4 border-[#E89A7B] pl-4">Cada passo é uma conquista, cada movimento uma história.</p>
        </header>

        <div className="grid lg:grid-cols-12 gap-10">
          {/* Progress Card - Sophisticated Design */}
          <div id="progresso" className="lg:col-span-7">
            <Card className="border-none shadow-2xl bg-[#4A5D23] text-white rounded-[3rem] overflow-hidden relative group">
              <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:opacity-20 transition-opacity">
                 <Heart className="w-32 h-32 fill-white" />
              </div>
              <CardHeader className="p-10 pb-0 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="font-serif italic text-3xl">Meu Progresso</CardTitle>
                  <p className="text-white/50 text-xs mt-1 uppercase tracking-widest font-bold">Avaliação Técnica</p>
                </div>
              </CardHeader>
              <CardContent className="p-10 space-y-10 relative z-10">
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <span className="text-sm font-bold tracking-widest uppercase text-white/80">Flexibilidade</span>
                    <span className="text-2xl font-serif italic text-[#E89A7B]">{student?.flexibilidade || 0}%</span>
                  </div>
                  <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden p-0.5 border border-white/5">
                    <div className="h-full bg-gradient-to-r from-[#E89A7B] to-[#F5B198] rounded-full shadow-[0_0_10px_rgba(232,154,123,0.5)] transition-all duration-1000" style={{ width: `${student?.flexibilidade || 0}%` }} />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <span className="text-sm font-bold tracking-widest uppercase text-white/80">Técnica</span>
                    <span className="text-2xl font-serif italic text-[#E89A7B]">{student?.tecnica || 0}%</span>
                  </div>
                  <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden p-0.5 border border-white/5">
                    <div className="h-full bg-gradient-to-r from-[#E89A7B] to-[#F5B198] rounded-full shadow-[0_0_10px_rgba(232,154,123,0.5)] transition-all duration-1000" style={{ width: `${student?.tecnica || 0}%` }} />
                  </div>
                </div>

                <div className="mt-12 p-8 bg-white/5 rounded-[2rem] border border-white/10 backdrop-blur-sm">
                  <p className="text-lg italic font-serif text-white/90 leading-relaxed">
                    "{student?.feedback || "Sua evolução está começando! Continue se dedicando aos treinos."}"
                  </p>
                  <div className="mt-4 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#E89A7B] flex items-center justify-center font-bold text-xs">D</div>
                    <span className="text-xs uppercase tracking-widest font-bold text-white/40">Profa. Dara Rocha</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Finance Card - Premium Financial Look */}
          <div id="financeiro" className="lg:col-span-5 flex flex-col gap-10">
            <Card className="border-none shadow-xl bg-white rounded-[2.5rem] overflow-hidden group">
              <div className="bg-[#E89A7B] p-8 text-white flex justify-between items-center">
                <div>
                  <CardTitle className="font-serif italic text-2xl">Financeiro</CardTitle>
                  <p className="text-white/60 text-[10px] uppercase font-bold tracking-widest mt-1">Status da Mensalidade</p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
              </div>
              <CardContent className="p-8">
                 {student ? (
                   <div className="space-y-6">
                     <div className="p-6 bg-[#FDFBF7] rounded-[2rem] border border-[#E89A7B]/10 flex justify-between items-center">
                       <div>
                         <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Valor</p>
                         <p className="text-3xl font-serif font-bold text-[#4A5D23]">R$ {student.mensalidade || "0,00"}</p>
                       </div>
                       <div className="text-right">
                         <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Vencimento</p>
                         <p className="text-lg font-bold text-[#E89A7B]">{student.vencimento?.split('-').reverse().join('/') || "-"}</p>
                       </div>
                     </div>
                     
                     <div className="space-y-4">
                       <p className="text-xs font-bold text-[#4A5D23]/60 uppercase tracking-widest px-2">Pagamento via PIX</p>
                       
                       <div className="space-y-2">
                         {[
                           { type: 'E-mail', key: 'balletdararocha@gmail.com' },
                           { type: 'WhatsApp', key: '(85) 98992-5987' }
                         ].map((pix) => (
                           <div key={pix.type} className="bg-white p-4 rounded-2xl border border-[#4A5D23]/5 flex justify-between items-center group/item hover:border-[#E89A7B]/30 transition-all shadow-sm">
                             <div>
                               <p className="text-[10px] font-bold text-muted-foreground uppercase">{pix.type}</p>
                               <code className="text-xs text-[#4A5D23] font-bold">{pix.key}</code>
                             </div>
                             <Button variant="ghost" size="sm" onClick={() => {
                               navigator.clipboard.writeText(pix.key.replace(/\D/g, ''));
                               toast.success("Copiado!");
                             }} className="text-[#E89A7B] hover:bg-[#E89A7B]/5 font-bold">Copiar</Button>
                           </div>
                         ))}
                       </div>
                     </div>
                   </div>
                 ) : (
                   <div className="py-10 text-center text-muted-foreground italic">Carregando seus dados...</div>
                 )}
              </CardContent>
            </Card>

            {/* Photos Section - Real Gallery */}
            <div id="avisos"> {/* Usando ID avisos aqui ou adaptando conforme necessário */}
              <Card className="border-none shadow-xl bg-white rounded-[2.5rem] p-8 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-serif text-2xl font-bold text-[#4A5D23]">Minhas Fotos</h4>
                  <p className="text-xs text-muted-foreground italic">Registros da sua jornada mágica</p>
                </div>
                <ImageIcon className="w-6 h-6 text-[#E89A7B]" />
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {student?.fotos && student.fotos.length > 0 ? (
                  student.fotos.map((foto: string, idx: number) => (
                    <div key={idx} className="aspect-square rounded-2xl overflow-hidden shadow-sm hover:scale-[1.02] transition-transform cursor-pointer">
                      <img src={foto} alt={`Evolução ${idx + 1}`} className="w-full h-full object-cover" />
                    </div>
                  ))
                ) : (
                  <div className="col-span-full py-12 text-center bg-[#FDFBF7] rounded-[2rem] border-2 border-dashed border-[#4A5D23]/5">
                    <p className="text-muted-foreground italic text-sm">Suas fotos aparecerão aqui em breve!</p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;
