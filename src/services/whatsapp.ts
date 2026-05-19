import { supabase } from '@/integrations/supabase/client';

export interface EvolutionConfig {
  apiUrl: string;
  apiKey: string;
  instanceName: string;
}

export interface ChatbotFlow {
  welcome: string;
  trialInfo: string;
  scheduleInfo: string;
  priceInfo: string;
  locationInfo: string;
  humanContact: string;
}

export interface TrialClass {
  id: string;
  nome_mae: string;
  nome_crianca: string;
  whatsapp: string;
  turma: string;
  data_aula: string;
  status: 'Pendente' | 'Confirmado' | 'Cancelado';
  created_at: string;
}

// Default chatbot flow templates
const DEFAULT_FLOW: ChatbotFlow = {
  welcome: `Olá! Seja muito bem-vinda ao Ballet Dara Rocha! 🩰✨\n\nEu sou a *Bella*, a assistente virtual do estúdio. Como posso te ajudar hoje?\n\nDigite o número da opção desejada:\n*1* - 🩰 Agendar Aula Experimental\n*2* - 📅 Horários e Turmas\n*3* - 💰 Mensalidades e Matrículas\n*4* - 📍 Localização e Contato\n*5* - 👩‍🏫 Falar com a Professora Dara`,
  trialInfo: `Que maravilhoso que você quer agendar uma aula experimental! 🌸\n\nPara fazermos isso, preciso de algumas informações:\n1. Nome e idade da bailarina.\n2. Qual turma ela gostaria de participar.\n\n_Turmas disponíveis:_\n• Baby Class (4-5 anos) - Terças/Quintas às 17h\n• Preliminar I e II (6-9 anos) - Terças/Quintas às 18h\n• Básico I e II (10-15 anos) - Terças/Quintas às 19h\n• Ballet Adulto (16+ anos) - Terças/Quintas às 20h\n\nPor favor, envie o *nome da criança, idade e a turma desejada*!`,
  scheduleInfo: `📅 *Nossos Horários e Turmas:*\n\n• *Baby Class (4 a 5 anos)*: Terças e Quintas às 17h00. (Introdução lúdica ao movimento e ritmo)\n• *Preliminar I e II (6 a 9 anos)*: Terças e Quintas às 18h00. (Técnica clássica básica, postura e leveza)\n• *Básico I e II (10 a 15 anos)*: Terças e Quintas às 19h00. (Aperfeiçoamento técnico e expressividade)\n• *Ballet Adulto (16+ anos)*: Terças e Quintas às 20h00. (Para iniciantes e intermediários adultos)\n\nDeseja agendar uma aula experimental para alguma dessas turmas? Digite *1*!`,
  priceInfo: `💰 *Valores e Mensalidades:*\n\n• Mensalidade: *R$ 115,00*\n• Taxa de matrícula: *Isenta* para novos alunos esta semana!\n\n🔑 *Chaves PIX para pagamento:*\n• E-mail: \`balletdararocha@gmail.com\`\n• Celular: \`(85) 98992-5987\`\n\nApós o pagamento, envie o comprovante por aqui para efetuarmos a matrícula da sua bailarina! ✨`,
  locationInfo: `📍 *Nossa Localização:*\n\nEstamos localizados na cidade de *Itaitinga, Ceará*.\n\n📍 *Link do Google Maps:* https://maps.app.goo.gl/dara-rocha-ballet-placeholder\n\nVenha nos fazer uma visita! Recomendamos agendar um horário antes para podermos te receber com toda a atenção que você e sua bailarina merecem. 💕`,
  humanContact: `Sem problemas! Estou transferindo você para falar com a *Professora Dara*. 👩‍🏫✨\n\nEm instantes ela ou alguém da nossa equipe irá te responder por aqui. Se preferir ligar, nosso telefone é *(85) 98603-1932*.\n\nObrigado pela paciência!`,
};

// ----------------------------------------------------
// Evolution API config storage helpers
// ----------------------------------------------------

export function getEvolutionConfig(): EvolutionConfig | null {
  const local = localStorage.getItem('whatsapp_evolution_config');
  if (local) {
    try {
      return JSON.parse(local);
    } catch (e) {
      return null;
    }
  }
  return null;
}

export function saveEvolutionConfig(config: EvolutionConfig) {
  localStorage.setItem('whatsapp_evolution_config', JSON.stringify(config));
}

// ----------------------------------------------------
// Chatbot Flow config storage helpers
// ----------------------------------------------------

export function getChatbotFlow(): ChatbotFlow {
  const local = localStorage.getItem('whatsapp_chatbot_flow');
  if (local) {
    try {
      return { ...DEFAULT_FLOW, ...JSON.parse(local) };
    } catch (e) {
      return DEFAULT_FLOW;
    }
  }
  return DEFAULT_FLOW;
}

export function saveChatbotFlow(flow: ChatbotFlow) {
  localStorage.setItem('whatsapp_chatbot_flow', JSON.stringify(flow));
}

// ----------------------------------------------------
// Evolution API actions
// ----------------------------------------------------

/**
 * Fetches the connection status of the instance.
 */
export async function fetchEvolutionStatus(config: EvolutionConfig): Promise<'CONNECTED' | 'DISCONNECTED' | 'CONNECTING'> {
  const { apiUrl, apiKey, instanceName } = config;
  const cleanUrl = apiUrl.replace(/\/$/, '');
  
  try {
    const response = await fetch(`${cleanUrl}/instance/connectionState/${instanceName}`, {
      method: 'GET',
      headers: {
        'apikey': apiKey,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      return 'DISCONNECTED';
    }
    
    const data = await response.json();
    const state = data?.instance?.state || data?.state;
    if (state === 'open' || state === 'CONNECTED') {
      return 'CONNECTED';
    } else if (state === 'connecting' || state === 'CONNECTING') {
      return 'CONNECTING';
    }
    return 'DISCONNECTED';
  } catch (e) {
    console.error('Error fetching Evolution API status:', e);
    return 'DISCONNECTED';
  }
}

/**
 * Fetches the QR code image (base64) and connection code.
 */
export async function fetchEvolutionQR(config: EvolutionConfig): Promise<{ code?: string; base64?: string; error?: string }> {
  const { apiUrl, apiKey, instanceName } = config;
  const cleanUrl = apiUrl.replace(/\/$/, '');
  
  try {
    // Check state first. If connected, don't request QR
    const status = await fetchEvolutionStatus(config);
    if (status === 'CONNECTED') {
      return { error: 'ALREADY_CONNECTED' };
    }

    const response = await fetch(`${cleanUrl}/instance/connect/${instanceName}`, {
      method: 'GET',
      headers: {
        'apikey': apiKey,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorMsg = await response.text();
      return { error: `HTTP ${response.status}: ${errorMsg}` };
    }
    
    const data = await response.json();
    return {
      code: data?.code,
      base64: data?.base64 || data?.qrcode?.base64
    };
  } catch (e: any) {
    console.error('Error fetching Evolution QR Code:', e);
    return { error: e.message || 'Erro de rede ao conectar com a Evolution API' };
  }
}

/**
 * Disconnects/Logs out the Evolution API instance.
 */
export async function disconnectEvolution(config: EvolutionConfig): Promise<boolean> {
  const { apiUrl, apiKey, instanceName } = config;
  const cleanUrl = apiUrl.replace(/\/$/, '');
  
  try {
    const response = await fetch(`${cleanUrl}/instance/logout/${instanceName}`, {
      method: 'DELETE',
      headers: {
        'apikey': apiKey,
        'Content-Type': 'application/json'
      }
    });
    return response.ok;
  } catch (e) {
    console.error('Error disconnecting Evolution instance:', e);
    return false;
  }
}

/**
 * Sends a message directly through the Evolution API.
 */
export async function sendEvolutionMessage(config: EvolutionConfig, phoneNumber: string, message: string): Promise<boolean> {
  const { apiUrl, apiKey, instanceName } = config;
  const cleanUrl = apiUrl.replace(/\/$/, '');
  
  // Format phone to international format without + or spaces
  let formattedPhone = phoneNumber.replace(/\D/g, '');
  if (formattedPhone.length === 11 && !formattedPhone.startsWith('55')) {
    formattedPhone = '55' + formattedPhone;
  }
  
  try {
    const response = await fetch(`${cleanUrl}/message/sendText/${instanceName}`, {
      method: 'POST',
      headers: {
        'apikey': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        number: formattedPhone,
        text: message
      })
    });
    return response.ok;
  } catch (e) {
    console.error('Error sending message via Evolution API:', e);
    return false;
  }
}

// ----------------------------------------------------
// General message dispatcher (Compatibility fallback)
// ----------------------------------------------------

/**
 * Envia uma mensagem via a API de WhatsApp configurada.
 * Se houver uma Evolution API ativa e conectada, envia por lá.
 * Senão, tenta invocar a Edge Function do Supabase, ou joga um erro descriptivo.
 */
export async function sendWhatsAppMessage({
  conversationId,
  phoneNumber,
  message,
  mediaUrl,
  fileName,
}: {
  conversationId?: string;
  phoneNumber?: string;
  message?: string;
  mediaUrl?: string;
  fileName?: string;
}) {
  const config = getEvolutionConfig();
  
  // 1. Try sending via local Evolution API configuration
  if (config && phoneNumber && message) {
    const success = await sendEvolutionMessage(config, phoneNumber, message);
    if (success) {
      return { success: true, provider: 'evolution' };
    }
  }

  // 2. Fallback to Supabase Edge Function
  const payload: any = {
    conversationId,
    phoneNumber,
    message,
    mediaUrl,
    fileName,
  };

  // Remove undefined fields
  Object.keys(payload).forEach((k) => payload[k] === undefined && delete payload[k]);

  try {
    const { data, error } = await supabase.functions.invoke('whatsapp-send', {
      body: JSON.stringify(payload),
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (error) {
      throw new Error(error.message);
    }
    return { ...data, provider: 'supabase-edge' };
  } catch (e: any) {
    // If the edge function is not found or fails, we throw an error and let the UI fall back to wa.me link
    console.warn("Supabase Edge Function failed or not found, falling back. Error:", e.message);
    throw new Error(e.message || "Edge function failed");
  }
}

// ----------------------------------------------------
// Trial Classes (Aulas Experimentais) management
// ----------------------------------------------------

const LOCAL_TRIAL_CLASSES_KEY = 'whatsapp_trial_classes';

// Local storage fallback data helper
function getLocalTrialClasses(): TrialClass[] {
  const local = localStorage.getItem(LOCAL_TRIAL_CLASSES_KEY);
  if (local) {
    try {
      return JSON.parse(local);
    } catch (e) {
      return [];
    }
  }
  
  // Seed with some beautiful mock data if empty
  const mockClasses: TrialClass[] = [
    {
      id: 'trial-1',
      nome_mae: 'Clarissa Albuquerque',
      nome_crianca: 'Maria Julia Albuquerque',
      whatsapp: '85991827364',
      turma: 'Baby Class (4-5 anos)',
      data_aula: '2026-05-26',
      status: 'Pendente',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString() // 3 hours ago
    },
    {
      id: 'trial-2',
      nome_mae: 'Viviane Rocha',
      nome_crianca: 'Sophia Rocha',
      whatsapp: '85988776655',
      turma: 'Preliminar I e II (6-9 anos)',
      data_aula: '2026-05-21',
      status: 'Confirmado',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() // 1 day ago
    }
  ];
  localStorage.setItem(LOCAL_TRIAL_CLASSES_KEY, JSON.stringify(mockClasses));
  return mockClasses;
}

export async function getTrialClasses(): Promise<TrialClass[]> {
  try {
    const { data, error } = await supabase
      .from('aulas_experimentais')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
      // Postgres error code 42P01: relation does not exist
      if (error.code === '42P01') {
        return getLocalTrialClasses();
      }
      throw error;
    }
    return data || [];
  } catch (e) {
    console.log("Supabase 'aulas_experimentais' table not available, using localStorage fallback.");
    return getLocalTrialClasses();
  }
}

export async function createTrialClass(trial: Omit<TrialClass, 'id' | 'created_at' | 'status'>): Promise<TrialClass> {
  const newTrial: TrialClass = {
    ...trial,
    id: 'trial-' + Math.random().toString(36).substring(2, 9),
    status: 'Pendente',
    created_at: new Date().toISOString()
  };
  
  try {
    const { data, error } = await supabase
      .from('aulas_experimentais')
      .insert([newTrial])
      .select();
      
    if (error) {
      if (error.code === '42P01') {
        const local = getLocalTrialClasses();
        localStorage.setItem(LOCAL_TRIAL_CLASSES_KEY, JSON.stringify([newTrial, ...local]));
        return newTrial;
      }
      throw error;
    }
    return data[0];
  } catch (e) {
    const local = getLocalTrialClasses();
    localStorage.setItem(LOCAL_TRIAL_CLASSES_KEY, JSON.stringify([newTrial, ...local]));
    return newTrial;
  }
}

export async function updateTrialClassStatus(id: string, status: 'Pendente' | 'Confirmado' | 'Cancelado'): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('aulas_experimentais')
      .update({ status })
      .eq('id', id);
      
    if (error) {
      if (error.code === '42P01') {
        const local = getLocalTrialClasses();
        const updated = local.map(t => t.id === id ? { ...t, status } : t);
        localStorage.setItem(LOCAL_TRIAL_CLASSES_KEY, JSON.stringify(updated));
        return true;
      }
      throw error;
    }
    return true;
  } catch (e) {
    const local = getLocalTrialClasses();
    const updated = local.map(t => t.id === id ? { ...t, status } : t);
    localStorage.setItem(LOCAL_TRIAL_CLASSES_KEY, JSON.stringify(updated));
    return true;
  }
}

export async function deleteTrialClass(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('aulas_experimentais')
      .delete()
      .eq('id', id);
      
    if (error) {
      if (error.code === '42P01') {
        const local = getLocalTrialClasses();
        const filtered = local.filter(t => t.id !== id);
        localStorage.setItem(LOCAL_TRIAL_CLASSES_KEY, JSON.stringify(filtered));
        return true;
      }
      throw error;
    }
    return true;
  } catch (e) {
    const local = getLocalTrialClasses();
    const filtered = local.filter(t => t.id !== id);
    localStorage.setItem(LOCAL_TRIAL_CLASSES_KEY, JSON.stringify(filtered));
    return true;
  }
}
