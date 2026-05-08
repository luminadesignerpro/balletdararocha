import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserCircle, ShieldCheck, ArrowLeft } from "lucide-react";
import logoImg from "@/assets/logo-dara-rocha.png";

const Login = () => {
  const [type, setType] = useState<"admin" | "aluna" | null>(null);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/5 -skew-x-12 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/10 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />

      <div className="w-full max-w-md relative z-10">
        <Button 
          variant="ghost" 
          onClick={() => type ? setType(null) : navigate("/")}
          className="mb-8 hover:bg-primary/10 text-primary"
        >
          <ArrowLeft className="mr-2 w-4 h-4" /> Voltar
        </Button>

        <div className="text-center mb-10">
          <img src={logoImg} alt="Ballet Dara Rocha" className="h-24 mx-auto mb-6" />
          <h1 className="text-3xl font-serif font-bold text-primary">Portal do Ballet</h1>
          <p className="text-muted-foreground mt-2">Escolha como deseja acessar</p>
        </div>

        {!type ? (
          <div className="grid gap-4">
            <button 
              onClick={() => setType("aluna")}
              className="group p-8 bg-white border border-primary/10 rounded-2xl hover:border-secondary transition-all text-left shadow-sm hover:shadow-xl"
            >
              <UserCircle className="w-12 h-12 text-secondary mb-4" />
              <h3 className="text-xl font-bold text-primary">Área da Aluna</h3>
              <p className="text-sm text-muted-foreground mt-1">Veja seu desenvolvimento, fotos e avisos.</p>
            </button>

            <button 
              onClick={() => setType("admin")}
              className="group p-8 bg-white border border-primary/10 rounded-2xl hover:border-primary transition-all text-left shadow-sm hover:shadow-xl"
            >
              <ShieldCheck className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-xl font-bold text-primary">Administração</h3>
              <p className="text-sm text-muted-foreground mt-1">Gestão financeira, WhatsApp e matrículas.</p>
            </button>
          </div>
        ) : (
          <Card className="border-none shadow-2xl animate-fade-in">
            <CardHeader>
              <CardTitle className="text-2xl font-serif text-primary">
                Acesso {type === "admin" ? "Administrativo" : "da Aluna"}
              </CardTitle>
              <CardDescription>
                Entre com suas credenciais para continuar.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail ou CPF</Label>
                <Input id="email" placeholder="exemplo@email.com" className="rounded-xl border-primary/20" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input id="password" type="password" className="rounded-xl border-primary/20" />
              </div>
              <Button 
                onClick={() => navigate(type === "admin" ? "/admin" : "/aluna")}
                className={`w-full py-6 rounded-xl text-white ${type === "admin" ? "bg-primary" : "bg-secondary"}`}
              >
                Entrar no Sistema
              </Button>
              {type === "admin" && (
                <p className="text-[10px] text-center text-muted-foreground uppercase tracking-widest mt-4">
                  Acesso seguro e monitorado
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
