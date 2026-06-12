import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { CheckCircle, PenLine, RotateCcw, Loader2, AlertCircle, ShieldCheck } from "lucide-react";
import { getMatriculaByToken, assinarMatricula, type Matricula } from "@/services/matriculas";
import logoImg from "@/assets/logo-dara-rocha.png";

const Assinar = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [matricula, setMatricula] = useState<Matricula | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const [hasSigned, setHasSigned] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [canvasEmpty, setCanvasEmpty] = useState(true);
  const [alreadySigned, setAlreadySigned] = useState(false);

  useEffect(() => {
    if (!token) { setNotFound(true); setLoading(false); return; }
    getMatriculaByToken(token).then((data) => {
      if (!data) { setNotFound(true); }
      else {
        setMatricula(data);
        if (data.status === 'Assinado') setAlreadySigned(true);
      }
      setLoading(false);
    });
  }, [token]);

  // ── Canvas drawing helpers ────────────────────────────────────────────────

  const getPos = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ('touches' in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const pos = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    setIsDrawing(true);
    setCanvasEmpty(false);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const pos = getPos(e, canvas);
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#1a1a2e";
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  const endDraw = () => setIsDrawing(false);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setCanvasEmpty(true);
  };

  const handleConfirmar = async () => {
    if (canvasEmpty) { toast.error("Por favor, assine antes de confirmar."); return; }
    const canvas = canvasRef.current;
    if (!canvas || !token) return;

    setIsSigning(true);
    try {
      const dataUrl = canvas.toDataURL("image/png");
      await assinarMatricula(token, dataUrl);
      setHasSigned(true);
      toast.success("Assinatura confirmada com sucesso! ✅");
    } catch (err: any) {
      toast.error("Erro ao salvar assinatura: " + err.message);
    } finally {
      setIsSigning(false);
    }
  };

  // ── Render states ─────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7]">
        <Loader2 className="w-10 h-10 animate-spin text-[#4A5D23]" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDFBF7] gap-6 p-8 text-center">
        <AlertCircle className="w-16 h-16 text-red-400" />
        <h1 className="text-2xl font-bold text-[#4A5D23]">Link não encontrado</h1>
        <p className="text-muted-foreground max-w-sm">
          Este link de assinatura é inválido ou já expirou. Entre em contato com o estúdio.
        </p>
        <Button onClick={() => navigate("/")} className="bg-[#4A5D23] text-white rounded-full px-8">
          Voltar ao site
        </Button>
      </div>
    );
  }

  if (alreadySigned || hasSigned) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#FDFBF7] to-[#F0F5E8] gap-6 p-8 text-center">
        <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center shadow-lg">
          <CheckCircle className="w-14 h-14 text-green-500" />
        </div>
        <img src={logoImg} alt="Ballet Dara Rocha" className="h-16 mx-auto" />
        <h1 className="text-3xl font-serif font-bold italic text-[#4A5D23]">Assinatura Confirmada!</h1>
        <p className="text-muted-foreground max-w-sm leading-relaxed">
          A matrícula de <strong>{matricula?.nome_aluna}</strong> foi assinada digitalmente com sucesso. 
          Nossa equipe entrará em contato em breve para confirmar os detalhes. 🩰✨
        </p>
        <div className="flex items-center gap-2 text-xs text-[#4A5D23]/60 font-bold uppercase tracking-widest">
          <ShieldCheck className="w-4 h-4" />
          Documento assinado digitalmente
        </div>
      </div>
    );
  }

  const m = matricula!;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FDFBF7] to-[#F0F5E8] py-10 px-4">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Header */}
        <div className="text-center space-y-3">
          <img src={logoImg} alt="Ballet Dara Rocha" className="h-16 mx-auto" />
          <h1 className="text-3xl font-serif font-bold italic text-[#4A5D23]">Assinatura de Matrícula</h1>
          <p className="text-sm text-muted-foreground">
            Por favor, revise os dados abaixo e assine digitalmente para concluir a matrícula.
          </p>
        </div>

        {/* Resumo da Ficha */}
        <Card className="border-none shadow-xl rounded-[2rem] overflow-hidden">
          <div className="bg-[#4A5D23] px-8 py-5 text-white">
            <h2 className="text-lg font-serif italic font-bold">📋 Ficha de Inscrição</h2>
          </div>
          <CardContent className="p-8 space-y-6 text-sm">

            <Section title="Dados da Aluna">
              <Row label="Nome" value={m.nome_aluna} />
              {m.apelido && <Row label="Apelido" value={m.apelido} />}
              {m.data_nascimento && <Row label="Nascimento" value={m.data_nascimento.split('-').reverse().join('/')} />}
              {m.cpf_aluna && <Row label="CPF" value={m.cpf_aluna} />}
              {(m.endereco || m.bairro) && (
                <Row label="Endereço" value={[m.endereco, m.numero, m.bairro, m.cidade, m.cep].filter(Boolean).join(', ')} />
              )}
            </Section>

            {(m.nome_mae || m.nome_pai) && (
              <Section title="Responsáveis">
                {m.nome_mae && <Row label="Mãe" value={m.nome_mae} />}
                {m.whatsapp_mae && <Row label="WhatsApp da Mãe" value={m.whatsapp_mae} />}
                {m.nome_pai && <Row label="Pai" value={m.nome_pai} />}
                {m.whatsapp_pai && <Row label="WhatsApp do Pai" value={m.whatsapp_pai} />}
                {m.email_responsavel && <Row label="E-mail" value={m.email_responsavel} />}
                {m.cpf_responsavel && <Row label="CPF Responsável" value={m.cpf_responsavel} />}
              </Section>
            )}

            {m.nome_financeiro && (
              <Section title="Responsável Financeiro">
                <Row label="Nome" value={m.nome_financeiro} />
                {m.cpf_financeiro && <Row label="CPF" value={m.cpf_financeiro} />}
                {m.whatsapp_financeiro && <Row label="WhatsApp" value={m.whatsapp_financeiro} />}
              </Section>
            )}

            {m.modalidades && m.modalidades.length > 0 && (
              <Section title="Modalidade(s)">
                <Row label="Escolha" value={m.modalidades.join(' · ')} />
              </Section>
            )}

            {(m.turma || m.horario || m.mensalidade) && (
              <Section title="Dados da Escola">
                {m.turma && <Row label="Turma" value={m.turma} />}
                {m.horario && <Row label="Horário" value={m.horario} />}
                {m.dias_semana && <Row label="Dias" value={m.dias_semana} />}
                {m.mensalidade && <Row label="Mensalidade" value={`R$ ${m.mensalidade}`} />}
              </Section>
            )}
          </CardContent>
        </Card>

        {/* Canvas de Assinatura */}
        <Card className="border-none shadow-xl rounded-[2rem] overflow-hidden">
          <div className="bg-[#E89A7B] px-8 py-5 text-white flex items-center gap-3">
            <PenLine className="w-5 h-5" />
            <h2 className="text-lg font-serif italic font-bold">Assinatura do Responsável</h2>
          </div>
          <CardContent className="p-8 space-y-4">
            <p className="text-xs text-muted-foreground">
              Assine no espaço abaixo usando o dedo (celular) ou o mouse (computador):
            </p>
            <div className="relative border-2 border-dashed border-[#4A5D23]/20 rounded-2xl overflow-hidden bg-white">
              <canvas
                ref={canvasRef}
                width={600}
                height={220}
                className="w-full touch-none cursor-crosshair"
                onMouseDown={startDraw}
                onMouseMove={draw}
                onMouseUp={endDraw}
                onMouseLeave={endDraw}
                onTouchStart={startDraw}
                onTouchMove={draw}
                onTouchEnd={endDraw}
              />
              {canvasEmpty && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <p className="text-[#4A5D23]/20 text-sm font-bold italic select-none">Assine aqui...</p>
                </div>
              )}
            </div>

            <div className="flex gap-3 justify-between items-center">
              <Button
                variant="outline"
                size="sm"
                onClick={clearCanvas}
                className="rounded-xl border-[#4A5D23]/20 text-[#4A5D23] hover:bg-[#4A5D23]/5 gap-2"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Limpar
              </Button>

              <div className="flex items-center gap-2 text-[10px] text-muted-foreground uppercase tracking-widest">
                <ShieldCheck className="w-3.5 h-3.5 text-[#4A5D23]" />
                Assinatura com validade legal
              </div>
            </div>

            <Button
              onClick={handleConfirmar}
              disabled={isSigning || canvasEmpty}
              className="w-full bg-[#4A5D23] hover:bg-[#3A491B] text-white h-14 rounded-2xl shadow-lg font-bold text-base gap-2 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
            >
              {isSigning ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Salvando assinatura...</>
              ) : (
                <><CheckCircle className="w-5 h-5" /> Confirmar Assinatura</>
              )}
            </Button>

            <p className="text-[10px] text-center text-muted-foreground italic">
              Ao confirmar, você concorda com os termos da matrícula e o contrato de prestação de serviços do Ballet Dara Rocha.
            </p>
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

// ── Helper components ────────────────────────────────────────────────────────

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="space-y-3">
    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#4A5D23]/50 border-b border-[#4A5D23]/5 pb-2">
      {title}
    </h3>
    <div className="space-y-2">{children}</div>
  </div>
);

const Row = ({ label, value }: { label: string; value?: string }) =>
  value ? (
    <div className="flex gap-3">
      <span className="text-muted-foreground min-w-[130px] shrink-0">{label}:</span>
      <span className="font-semibold text-[#4A5D23]">{value}</span>
    </div>
  ) : null;

export default Assinar;
