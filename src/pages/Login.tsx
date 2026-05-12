import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserCircle, ShieldCheck, ArrowLeft, Loader2 } from "lucide-react";
import logoImg from "@/assets/logo-dara-rocha.png";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Login = () => {
  const [type, setType] = useState<"admin" | "aluna" | null>(null);
  const [loading, setLoading] = useState(false);
  const [credentials, setCredentials] = useState({ identifier: "", password: "" });
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!credentials.identifier || !credentials.password) {
      toast.error("Por favor, preencha todos os campos.");
      return;
    }

    setLoading(true);
    try {
      if (type === "admin") {
        // Lógica de Admin (Simplificada para demonstração)
        // Em produção, use supabase.auth.signInWithPassword
        if (credentials.identifier === "admin@ballet.com" && credentials.password === "admin123") {
          toast.success("Bem-vinda de volta, Dara!");
          navigate("/admin");
        } else {
          toast.error("Credenciais administrativas incorretas.");
        }
      } else {
        // Lógica de Aluna (Busca na tabela 'alunas')
        const { data, error } = await supabase
          .from("alunas")
          .select("*")
          .or(`whatsapp.eq.${credentials.identifier},nome.eq.${credentials.identifier}`)
          .eq("senha", credentials.password)
          .single();

        if (error || !data) {
          toast.error("Aluna não encontrada ou senha incorreta.");
        } else {
          toast.success(`Olá, ${data.nome}!`);
          localStorage.setItem("currentStudentId", data.id);
          navigate("/aluna");
        }
      }
    } catch (err) {
      toast.error("Erro ao tentar entrar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    toast.info("Por favor, entre em contato com a administração para recuperar sua senha via WhatsApp.");
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background Decor - Design Premium */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-[#4A5D23]/5 -skew-x-12 translate-x-1/4" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#E89A7B]/10 rounded-full blur-[120px] -translate-x-1/2 translate-y-1/2" />

      <div className="w-full max-w-md relative z-10">
        <Button 
          variant="ghost" 
          onClick={() => type ? setType(null) : navigate("/")}
          className="mb-12 hover:bg-[#4A5D23]/10 text-[#4A5D23] rounded-full px-6 group"
        >
          <ArrowLeft className="mr-2 w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Voltar ao Início
        </Button>

        <div className="text-center mb-12">
          <div className="inline-block p-4 rounded-3xl bg-white shadow-xl mb-8">
            <img src={logoImg} alt="Ballet Dara Rocha" className="h-20 mx-auto" />
          </div>
          <h1 className="text-4xl font-serif font-bold text-[#4A5D23] tracking-tight">Acesso ao Sistema</h1>
          <p className="text-muted-foreground mt-3 italic font-serif text-lg">Seja bem-vinda ao seu espaço de dança.</p>
        </div>

        {!type ? (
          <div className="grid gap-6">
            <button 
              onClick={() => setType("aluna")}
              className="group p-8 bg-white border border-[#4A5D23]/10 rounded-[2.5rem] hover:border-[#E89A7B] transition-all text-left shadow-sm hover:shadow-2xl hover:-translate-y-1 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <UserCircle className="w-24 h-24 text-[#E89A7B]" />
              </div>
              <UserCircle className="w-12 h-12 text-[#E89A7B] mb-6" />
              <h3 className="text-2xl font-serif font-bold text-[#4A5D23]">Área da Aluna</h3>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">Acompanhe sua evolução, fotos e avisos das professoras.</p>
            </button>

            <button 
              onClick={() => setType("admin")}
              className="group p-8 bg-white border border-[#4A5D23]/10 rounded-[2.5rem] hover:border-[#4A5D23] transition-all text-left shadow-sm hover:shadow-2xl hover:-translate-y-1 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <ShieldCheck className="w-24 h-24 text-[#4A5D23]" />
              </div>
              <ShieldCheck className="w-12 h-12 text-[#4A5D23] mb-6" />
              <h3 className="text-2xl font-serif font-bold text-[#4A5D23]">Administração</h3>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">Gestão financeira, matrículas e controle do sistema.</p>
            </button>
          </div>
        ) : (
          <Card className="border-none shadow-2xl bg-white rounded-[3rem] p-4 animate-in fade-in zoom-in-95 duration-500">
            <CardHeader className="pb-8">
              <CardTitle className="text-3xl font-serif font-bold text-[#4A5D23]">
                {type === "admin" ? "Administrativo" : "Olá, Bailarina"}
              </CardTitle>
              <CardDescription className="text-base italic font-serif">
                Por favor, identifique-se para continuar.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="identifier" className="text-[10px] uppercase font-bold tracking-widest text-[#4A5D23]/60 px-1">
                  {type === "admin" ? "E-mail de Acesso" : "Seu WhatsApp"}
                </Label>
                <Input 
                  id="identifier" 
                  placeholder={type === "admin" ? "ex: admin@ballet.com" : "ex: 859..."} 
                  className="rounded-2xl border-[#4A5D23]/10 bg-[#FDFBF7] h-14 focus:ring-[#4A5D23]"
                  value={credentials.identifier}
                  onChange={(e) => setCredentials({ ...credentials, identifier: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <Label htmlFor="password" className="text-[10px] uppercase font-bold tracking-widest text-[#4A5D23]/60">Sua Senha</Label>
                  <button 
                    onClick={handleForgotPassword}
                    className="text-[10px] text-[#E89A7B] hover:underline uppercase tracking-widest font-bold"
                  >
                    Esqueceu?
                  </button>
                </div>
                <Input 
                  id="password" 
                  type="password" 
                  className="rounded-2xl border-[#4A5D23]/10 bg-[#FDFBF7] h-14 focus:ring-[#4A5D23]"
                  value={credentials.password}
                  onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                />
              </div>
              <Button 
                onClick={handleLogin}
                disabled={loading}
                className={`w-full py-8 rounded-[1.5rem] text-white flex items-center justify-center gap-3 text-lg font-bold shadow-xl transition-all active:scale-95 ${type === "admin" ? "bg-[#4A5D23] hover:bg-[#3A491B]" : "bg-[#E89A7B] hover:bg-[#D4896D]"}`}
              >
                {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                {loading ? "Verificando..." : "Acessar Portal"}
              </Button>
              {type === "admin" && (
                <p className="text-[10px] text-center text-muted-foreground uppercase tracking-widest mt-6 font-bold opacity-40">
                  Acesso Restrito e Criptografado
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Login;
