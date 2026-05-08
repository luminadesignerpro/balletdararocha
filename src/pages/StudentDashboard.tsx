import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LogOut, Heart, Image as ImageIcon, TrendingUp, Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";

const StudentDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Sidebar Mobile / Topbar */}
      <aside className="w-full md:w-64 bg-secondary text-white p-6 flex flex-col">
        <div className="flex items-center gap-4 mb-10">
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center font-bold text-xl">M</div>
          <div>
            <h2 className="font-bold">Olá, Maria!</h2>
            <p className="text-xs text-white/60 uppercase tracking-widest">Baby Class</p>
          </div>
        </div>
        
        <nav className="space-y-2 flex-1">
          <Button variant="ghost" className="w-full justify-start hover:bg-white/10 text-white"><ImageIcon className="mr-2 w-4 h-4" /> Minhas Fotos</Button>
          <Button variant="ghost" className="w-full justify-start hover:bg-white/10 text-white"><TrendingUp className="mr-2 w-4 h-4" /> Meu Progresso</Button>
          <Button variant="ghost" className="w-full justify-start hover:bg-white/10 text-white"><Bell className="mr-2 w-4 h-4" /> Avisos</Button>
        </nav>

        <Button variant="ghost" onClick={() => navigate("/")} className="mt-auto justify-start hover:bg-white/10 text-white">
          <LogOut className="mr-2 w-4 h-4" /> Sair
        </Button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-12 overflow-y-auto">
        <header className="mb-12">
          <h1 className="text-4xl font-serif font-bold text-primary mb-2">Meu Diário de Ballet</h1>
          <p className="text-muted-foreground italic">Acompanhe sua jornada mágica passo a passo.</p>
        </header>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Progress Card */}
          <Card className="border-none shadow-xl bg-primary text-white overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="font-serif italic text-2xl">Desenvolvimento</CardTitle>
              <Heart className="w-6 h-6 fill-secondary text-secondary" />
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Flexibilidade</span>
                  <span>80%</span>
                </div>
                <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-secondary w-[80%] transition-all" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Técnica (Pliés)</span>
                  <span>65%</span>
                </div>
                <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-secondary w-[65%] transition-all" />
                </div>
              </div>
              <p className="text-xs italic text-white/60 pt-4">"Maria está evoluindo muito bem na postura!" - Profa. Dara</p>
            </CardContent>
          </Card>

          {/* Photos Card */}
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-primary font-serif">Últimas Fotos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="aspect-square bg-muted rounded-xl border-2 border-dashed border-primary/10 flex items-center justify-center text-primary/20">
                    <ImageIcon className="w-8 h-8" />
                  </div>
                ))}
              </div>
              <Button variant="link" className="w-full mt-6 text-secondary">Ver galeria completa</Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;
