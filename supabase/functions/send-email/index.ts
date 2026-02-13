const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface EmailRequest {
  to: string;
  type: 'aprovada' | 'recusada';
  fornecedorNome: string;
  dataAgendada?: string;
  horarioAgendado?: string;
}

function buildApprovedHtml(nome: string, data: string, horario: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #16a34a; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
        <h1 style="color: #fff; margin: 0; font-size: 22px;">✅ Solicitação Aprovada</h1>
      </div>
      <div style="border: 1px solid #e5e7eb; border-top: none; padding: 24px; border-radius: 0 0 8px 8px;">
        <p style="font-size: 16px; color: #374151;">Olá, <strong>${nome}</strong>!</p>
        <p style="font-size: 15px; color: #374151;">Sua solicitação de entrega foi <strong style="color: #16a34a;">aprovada</strong>.</p>
        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin: 16px 0;">
          <p style="margin: 4px 0; font-size: 15px;"><strong>📅 Data:</strong> ${data}</p>
          <p style="margin: 4px 0; font-size: 15px;"><strong>🕐 Horário:</strong> ${horario}</p>
        </div>
        <p style="font-size: 14px; color: #6b7280;">Por favor, compareça no horário agendado. Em caso de dúvidas, entre em contato conosco.</p>
      </div>
    </div>
  `;
}

function buildRejectedHtml(nome: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #dc2626; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
        <h1 style="color: #fff; margin: 0; font-size: 22px;">❌ Solicitação Recusada</h1>
      </div>
      <div style="border: 1px solid #e5e7eb; border-top: none; padding: 24px; border-radius: 0 0 8px 8px;">
        <p style="font-size: 16px; color: #374151;">Olá, <strong>${nome}</strong>!</p>
        <p style="font-size: 15px; color: #374151;">Infelizmente, sua solicitação de entrega foi <strong style="color: #dc2626;">recusada</strong>.</p>
        <p style="font-size: 14px; color: #6b7280;">Para mais informações ou para realizar uma nova solicitação, entre em contato conosco.</p>
      </div>
    </div>
  `;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, type, fornecedorNome, dataAgendada, horarioAgendado } = await req.json() as EmailRequest;

    if (!to || !type || !fornecedorNome) {
      return new Response(JSON.stringify({ error: 'Campos obrigatórios: to, type, fornecedorNome' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (!RESEND_API_KEY) {
      return new Response(JSON.stringify({ error: 'RESEND_API_KEY não configurada' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const subject = type === 'aprovada'
      ? `Solicitação de Entrega Aprovada - ${fornecedorNome}`
      : `Solicitação de Entrega Recusada - ${fornecedorNome}`;

    const html = type === 'aprovada'
      ? buildApprovedHtml(fornecedorNome, dataAgendada || '', horarioAgendado || '')
      : buildRejectedHtml(fornecedorNome);

    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Agendamento <onboarding@resend.dev>',
        to: [to],
        subject,
        html,
      }),
    });

    const resendData = await resendRes.text();

    if (!resendRes.ok) {
      console.error('Resend error:', resendData);
      return new Response(JSON.stringify({ error: 'Falha ao enviar e-mail', details: resendData }), {
        status: resendRes.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true, data: JSON.parse(resendData) }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(JSON.stringify({ error: 'Erro interno' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
