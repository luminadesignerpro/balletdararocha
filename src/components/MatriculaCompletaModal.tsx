import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, ClipboardList, Send, ArrowRight } from "lucide-react";
import { criarMatricula } from "@/services/matriculas";
import { toast } from "sonner";

interface MatriculaCompletaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function MatriculaCompletaModal({ isOpen, onClose, onSuccess }: MatriculaCompletaModalProps) {
  const TOTAL_STEPS = 5;
  const [matriculaStep, setMatriculaStep] = useState(1);
  const [savingMatricula, setSavingMatricula] = useState(false);
  const [matriculaToken, setMatriculaToken] = useState("");
  const [matriculaDone, setMatriculaDone] = useState(false);
  const [modalidades, setModalidades] = useState<string[]>([]);

  const [mForm, setMForm] = useState({
    nome_aluna: "", apelido: "", data_nascimento: "", cpf_aluna: "",
    endereco: "", numero: "", bairro: "", cidade: "Itaitinga", cep: "",
    nome_mae: "", nome_pai: "", whatsapp_mae: "", whatsapp_pai: "",
    email_responsavel: "", cpf_responsavel: "",
    nome_financeiro: "", cpf_financeiro: "", whatsapp_financeiro: "",
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
      onSuccess();
      toast.success("Matrícula registrada! Agora você pode enviar o link de assinatura.");
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
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleResetMatricula(); }}>
      <DialogContent className="max-w-2xl bg-[#FDFBF7] rounded-[2.5rem] border-none p-0 overflow-hidden shadow-2xl max-h-[90vh] flex flex-col z-50">
        <DialogHeader className="bg-[#4A5D23] px-8 py-6 text-white shrink-0">
          <DialogTitle className="text-2xl font-serif italic text-white flex items-center gap-3">
            <ClipboardList className="w-6 h-6 text-[#E89A7B]" />
            Ficha de Matrícula Completa
          </DialogTitle>
          <DialogDescription className="text-white/60 text-xs mt-1">
            Preencha todos os dados para registrar a matrícula oficial.
          </DialogDescription>

          {!matriculaDone && (
            <div className="flex items-center gap-1 mt-5">
              {["Aluna", "Responsáveis", "Financeiro", "Modalidade", "Escola"].map((label, i) => {
                const step = i + 1;
                const active = step === matriculaStep;
                const done = step < matriculaStep;
                return (
                  <div key={label} className="flex items-center gap-1 flex-1 last:flex-none">
                    <div className={`flex flex-col items-center gap-1 flex-none`}>
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        done ? 'bg-[#E89A7B] text-white' : active ? 'bg-white text-[#4A5D23]' : 'bg-white/20 text-white/50'
                      }`}>
                        {done ? <Check className="w-4 h-4" /> : step}
                      </div>
                      <span className={`text-[8px] uppercase tracking-wider font-bold whitespace-nowrap ${active ? 'text-white' : 'text-white/40'}`}>{label}</span>
                    </div>
                    {i < 4 && <div className={`h-0.5 flex-1 mb-4 rounded-full transition-all ${done ? 'bg-[#E89A7B]' : 'bg-white/10'}`} />}
                  </div>
                );
              })}
            </div>
          )}
        </DialogHeader>

        <div className="overflow-y-auto flex-1 p-8">
          {matriculaDone ? (
            <div className="space-y-6 text-center py-4">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <Check className="w-12 h-12 text-green-500" />
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
                  <Button onClick={handleCopyLink} size="sm" variant="outline" className="rounded-xl border-[#4A5D23]/20 text-[#4A5D23] gap-2 flex-1">
                    <ArrowRight className="w-3.5 h-3.5" /> Copiar Link
                  </Button>
                  <Button size="sm" className="rounded-xl bg-[#25D366] hover:bg-[#1DA851] text-white gap-2 flex-1" onClick={() => {
                      const msg = `Olá! Segue o link para assinar a ficha de matrícula do Ballet Dara Rocha:\n\n${assinaturaLink}`;
                      window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
                    }}>
                    <Send className="w-3.5 h-3.5" /> Enviar WhatsApp
                  </Button>
                </div>
              </div>
              <Button onClick={handleResetMatricula} variant="outline" className="rounded-2xl border-[#4A5D23]/20 text-[#4A5D23] px-8 w-full">
                Fechar
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
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
              {matriculaStep === 3 && (
                <div className="space-y-4">
                  <StepTitle>3. Responsável Financeiro</StepTitle>
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
              {matriculaStep === 4 && (
                <div className="space-y-4">
                  <StepTitle>4. Modalidade Escolhida</StepTitle>
                  <div className="grid grid-cols-1 gap-3">
                    {['Ballet Clássico', 'Alongamento', 'Forró'].map((mod) => {
                      const active = modalidades.includes(mod);
                      return (
                        <button key={mod} type="button" onClick={() => toggleModalidade(mod)} className={`w-full text-left px-6 py-4 rounded-2xl border-2 transition-all font-semibold flex items-center gap-4 ${active ? 'border-[#4A5D23] bg-[#4A5D23]/5 text-[#4A5D23]' : 'border-[#4A5D23]/10 bg-white text-muted-foreground'}`}>
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${active ? 'bg-[#4A5D23] border-[#4A5D23]' : 'border-[#4A5D23]/30'}`}>
                            {active && <Check className="w-3.5 h-3.5 text-white" />}
                          </div>
                          {mod}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
              {matriculaStep === 5 && (
                <div className="space-y-4">
                  <StepTitle>5. Dados da Escola</StepTitle>
                  <FormRow>
                    <FormField label="Turma / Nível">
                      <Select value={mForm.turma} onValueChange={(v) => setMForm({ ...mForm, turma: v })}>
                        <SelectTrigger className={inputCls + " h-12"}><SelectValue placeholder="Selecione" /></SelectTrigger>
                        <SelectContent className="bg-[#FDFBF7] border-[#4A5D23]/10 rounded-xl z-50">
                          <SelectItem value="Baby Class (4-5 anos)">Baby Class</SelectItem>
                          <SelectItem value="Preliminar I e II (6-9 anos)">Preliminar</SelectItem>
                          <SelectItem value="Básico I e II (10-15 anos)">Básico</SelectItem>
                          <SelectItem value="Ballet Adulto (16+ anos)">Adulto</SelectItem>
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
              <div className="flex gap-3 justify-between pt-4 border-t border-[#4A5D23]/5">
                <Button variant="outline" onClick={() => setMatriculaStep(s => s - 1)} disabled={matriculaStep === 1} className="rounded-2xl border-[#4A5D23]/20 text-[#4A5D23] px-6">
                  Voltar
                </Button>
                {matriculaStep < TOTAL_STEPS ? (
                  <Button onClick={() => setMatriculaStep(s => s + 1)} className="bg-[#4A5D23] hover:bg-[#3A491B] text-white rounded-2xl px-8 font-bold">
                    Próximo
                  </Button>
                ) : (
                  <Button onClick={handleMatriculaSubmit} disabled={savingMatricula} className="bg-[#E89A7B] hover:bg-[#D4896D] text-white rounded-2xl px-8 font-bold">
                    {savingMatricula ? "Salvando..." : "Concluir Matrícula"}
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

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
