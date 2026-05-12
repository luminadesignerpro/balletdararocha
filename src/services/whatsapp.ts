import { supabase } from '@/integrations/supabase/client';

/**
 * Envia uma mensagem via a função Edge do Supabase que utiliza a API Evolution.
 * @param conversationId - ID da conversa existente (opcional se phoneNumber for usado)
 * @param phoneNumber - Número de telefone no formato internacional sem o "+" (ex: 5585986031932)
 * @param message - Texto da mensagem (opcional se mediaUrl for usado)
 * @param mediaUrl - URL pública do arquivo a ser enviado (opcional)
 * @param fileName - Nome do arquivo (opcional, usado quando mediaUrl é fornecido)
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
  const payload: any = {
    conversationId,
    phoneNumber,
    message,
    mediaUrl,
    fileName,
  };

  // Remove undefined fields
  Object.keys(payload).forEach((k) => payload[k] === undefined && delete payload[k]);

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
  return data;
}
