import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutDashboard, Users, DollarSign, MessageSquare, LogOut, Settings, QrCode } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-muted/30 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-primary text-white p-6 hidden md:flex flex-col">
        <h2 className="text-xl font-serif font-bold mb-10 italic">Painel Admin</h2>
        <nav className="space-y-2 flex-1">
          <Button variant="ghost" className="w-full justify-start hover:bg-white/10 text-white"><LayoutDashboard className="mr-2 w-4 h-4" /> Geral</Button>
          <Button variant="ghost" className="w-full justify-start hover:bg-white/10 text-white"><MessageSquare className="mr-2 w-4 h-4" /> Atendimento</Button>
          <Button variant="ghost" className="w-full justify-start hover:bg-white/10 text-white"><Users className="mr-2 w-4 h-4" /> Alunas</Button>
          <Button variant="ghost" className="w-full justify-start hover:bg-white/10 text-white"><DollarSign className="mr-2 w-4 h-4" /> Financeiro</Button>
        </nav>
        <Button variant="ghost" onClick={() => navigate("/")} className="mt-auto justify-start hover:bg-white/10 text-white">
          <LogOut className="mr-2 w-4 h-4" /> Sair
        </Button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-serif font-bold text-primary">Gestão Ballet Dara Rocha</h1>
          <div className="flex gap-4">
            <Button variant="outline" className="rounded-full"><Settings className="w-4 h-4" /></Button>
            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center font-bold text-white">AD</div>
          </div>
        </header>

        <Tabs defaultValue="geral" className="space-y-8">
          <TabsList className="bg-white border p-1 rounded-xl">
            <TabsTrigger value="geral" className="rounded-lg">Geral</TabsTrigger>
            <TabsTrigger value="whatsapp" className="rounded-lg">WhatsApp Bot</TabsTrigger>
            <TabsTrigger value="financeiro" className="rounded-lg">Financeiro</TabsTrigger>
            <TabsTrigger value="alunas" className="rounded-lg">Alunas</TabsTrigger>
          </TabsList>

          <TabsContent value="geral" className="animate-fade-in">
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="border-none shadow-sm">
                <CardHeader><CardTitle className="text-sm uppercase tracking-widest text-muted-foreground">Total Alunas</CardTitle></CardHeader>
                <CardContent><p className="text-4xl font-bold text-primary">42</p></CardContent>
              </Card>
              <Card className="border-none shadow-sm">
                <CardHeader><CardTitle className="text-sm uppercase tracking-widest text-muted-foreground">Mensalidades do Mês</CardTitle></CardHeader>
                <CardContent><p className="text-4xl font-bold text-secondary">R$ 5.240</p></CardContent>
              </Card>
              <Card className="border-none shadow-sm">
                <CardHeader><CardTitle className="text-sm uppercase tracking-widest text-muted-foreground">Status Bot</CardTitle></CardHeader>
                <CardContent><p className="text-4xl font-bold text-green-500 italic">Online</p></CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="whatsapp" className="animate-fade-in">
            <Card className="border-none shadow-xl max-w-2xl mx-auto overflow-hidden">
              <div className="bg-primary p-8 text-white flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-serif">Conexão WhatsApp</h3>
                  <p className="text-white/60 text-sm">Escaneie o QR Code para ativar o robô</p>
                </div>
                <MessageSquare className="w-10 h-10 text-secondary" />
              </div>
              <CardContent className="p-10 text-center">
                <div className="bg-muted aspect-square w-64 mx-auto mb-8 flex items-center justify-center rounded-2xl border-2 border-dashed border-primary/20">
                  <QrCode className="w-48 h-48 text-primary/20" />
                  {/* Aqui entrará a lógica real do QR Code do robô */}
                </div>
                <p className="text-muted-foreground mb-6">Aguardando conexão com o servidor...</p>
                <Button className="bg-primary text-white px-10 rounded-full">Gerar Novo QR Code</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="financeiro">
            <Card className="border-none shadow-sm">
              <CardHeader><CardTitle className="text-primary font-serif">Controle de Fluxo de Caixa</CardTitle></CardHeader>
              <CardContent>
                <div className="text-center py-20 text-muted-foreground italic">
                  Área financeira sendo sincronizada com o banco de dados...
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;
