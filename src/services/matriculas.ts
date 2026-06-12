import { supabase } from '@/integrations/supabase/client';

export interface Matricula {
  id: string;
  token: string;
  // Dados da aluna
  nome_aluna: string;
  apelido?: string;
  data_nascimento?: string;
  cpf_aluna?: string;
  endereco?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  cep?: string;
  // Dados dos responsáveis
  nome_mae?: string;
  nome_pai?: string;
  whatsapp_mae?: string;
  whatsapp_pai?: string;
  email_responsavel?: string;
  cpf_responsavel?: string;
  // Responsável financeiro
  nome_financeiro?: string;
  cpf_financeiro?: string;
  whatsapp_financeiro?: string;
  // Modalidade e turma
  modalidades?: string[];
  turma?: string;
  horario?: string;
  dias_semana?: string;
  mensalidade?: string;
  // Status e assinatura
  status: 'Pendente' | 'Assinado' | 'Contrato Enviado';
  assinatura_url?: string;
  created_at: string;
}

export type NovaMatricula = Omit<Matricula, 'id' | 'token' | 'status' | 'created_at' | 'assinatura_url'>;

const LOCAL_KEY = 'ballet_matriculas';

function generateToken(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(18)))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function getLocal(): Matricula[] {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setLocal(data: Matricula[]) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(data));
}

export async function criarMatricula(dados: NovaMatricula): Promise<Matricula> {
  const nova: Matricula = {
    ...dados,
    id: crypto.randomUUID ? crypto.randomUUID() : 'mat-' + Math.random().toString(36).slice(2),
    token: generateToken(),
    status: 'Pendente',
    created_at: new Date().toISOString(),
  };

  try {
    const { data, error } = await supabase
      .from('matriculas')
      .insert([{
        ...nova,
        modalidades: nova.modalidades ?? [],
      }])
      .select()
      .single();

    if (error) {
      if (error.code === '42P01') {
        // Tabela não existe → salva localmente
        const local = getLocal();
        setLocal([nova, ...local]);
        return nova;
      }
      throw error;
    }
    return data as Matricula;
  } catch {
    const local = getLocal();
    setLocal([nova, ...local]);
    return nova;
  }
}

export async function getMatriculas(): Promise<Matricula[]> {
  try {
    const { data, error } = await supabase
      .from('matriculas')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      if (error.code === '42P01') return getLocal();
      throw error;
    }
    return (data as Matricula[]) || [];
  } catch {
    return getLocal();
  }
}

export async function getMatriculaByToken(token: string): Promise<Matricula | null> {
  try {
    const { data, error } = await supabase
      .from('matriculas')
      .select('*')
      .eq('token', token)
      .single();

    if (error) {
      if (error.code === '42P01' || error.code === 'PGRST116') {
        return getLocal().find((m) => m.token === token) ?? null;
      }
      throw error;
    }
    return data as Matricula;
  } catch {
    return getLocal().find((m) => m.token === token) ?? null;
  }
}

export async function assinarMatricula(token: string, assinaturaBase64: string): Promise<boolean> {
  // Upload da assinatura para o Supabase Storage
  let assinatura_url = '';
  try {
    const blob = await fetch(assinaturaBase64).then((r) => r.blob());
    const fileName = `assinaturas/${token}.png`;
    const { error: uploadError } = await supabase.storage
      .from('alunas-media')
      .upload(fileName, blob, { contentType: 'image/png', upsert: true });

    if (!uploadError) {
      const { data: { publicUrl } } = supabase.storage
        .from('alunas-media')
        .getPublicUrl(fileName);
      assinatura_url = publicUrl;
    }
  } catch {
    // Se Storage não disponível, salva o base64 direto
    assinatura_url = assinaturaBase64;
  }

  // Atualiza o status no Supabase
  try {
    const { error } = await supabase
      .from('matriculas')
      .update({ status: 'Assinado', assinatura_url })
      .eq('token', token);

    if (error && error.code !== '42P01') throw error;
  } catch {
    // Atualiza localmente
  }

  // Sempre atualiza localStorage também
  const local = getLocal();
  const updated = local.map((m) =>
    m.token === token ? { ...m, status: 'Assinado' as const, assinatura_url } : m
  );
  setLocal(updated);
  return true;
}

export async function atualizarStatusMatricula(
  id: string,
  status: Matricula['status']
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('matriculas')
      .update({ status })
      .eq('id', id);

    if (error && error.code !== '42P01') throw error;
  } catch {
    // fallthrough to local
  }

  const local = getLocal();
  setLocal(local.map((m) => (m.id === id ? { ...m, status } : m)));
  return true;
}
