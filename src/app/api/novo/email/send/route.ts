"use server";

import { z } from "zod";
import { Resend } from "resend";
import { NextResponse } from "next/server";

// ── Validation Schema ──────────────────────────────────────────────────────
// Campos do formulário de contato do site (Zahir.02.05)
// Diferença da rota /api/email/send: sem arroba/telefone; tem nome, email e mensagem

const contactFormSchema = z.object({
  nome: z
    .string()
    .min(2, "O nome deve ter pelo menos 2 caracteres.")
    .nonempty("O campo 'nome' é obrigatório."),
  email: z
    .string()
    .email("Insira um endereço de email válido.")
    .nonempty("O campo 'email' é obrigatório."),
  mensagem: z
    .string()
    .min(10, "A mensagem deve ter pelo menos 10 caracteres.")
    .max(500, "A mensagem não pode ultrapassar 500 caracteres.")
    .nonempty("O campo 'mensagem' é obrigatório."),
});

// ── Email Template ──────────────────────────────────────────────────────────

const EmailTemplate = (nome: string, email: string, mensagem: string) => `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nova mensagem de contato — Zahir</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 0;
      background-color: #f4f4f4;
      color: #333;
      line-height: 1.6;
    }
    .email-container {
      max-width: 600px;
      margin: 20px auto;
      background: #fff;
      padding: 28px 32px;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    }
    .email-header {
      text-align: center;
      border-bottom: 2px solid #f4f4f4;
      padding-bottom: 16px;
      margin-bottom: 20px;
    }
    .email-header h1 {
      font-size: 22px;
      color: #A03510;
      margin: 0;
    }
    .email-body p {
      margin: 10px 0;
    }
    .label {
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #888;
      margin-bottom: 2px;
    }
    .value {
      font-size: 15px;
      color: #1a1a1a;
      margin-bottom: 16px;
    }
    .message-box {
      background: #f9f9f9;
      border-left: 3px solid #A03510;
      padding: 12px 16px;
      border-radius: 4px;
      font-size: 14px;
      color: #333;
      white-space: pre-wrap;
    }
    .email-footer {
      text-align: center;
      margin-top: 24px;
      font-size: 12px;
      color: #999;
      border-top: 1px solid #f0f0f0;
      padding-top: 14px;
    }
    @media (max-width: 600px) {
      .email-container { padding: 16px; }
      .email-header h1 { font-size: 18px; }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="email-header">
      <h1>📩 Nova mensagem de contato</h1>
    </div>
    <div class="email-body">
      <p class="label">Nome</p>
      <p class="value">${nome}</p>
      <p class="label">E-mail do remetente</p>
      <p class="value">${email}</p>
      <p class="label">Mensagem</p>
      <div class="message-box">${mensagem}</div>
    </div>
    <div class="email-footer">
      <p>Este e-mail foi enviado automaticamente pelo site <strong>sitedozahir.com</strong>.</p>
    </div>
  </div>
</body>
</html>
`;

// ── Constants ────────────────────────────────────────────────────────────────

const resend        = new Resend(process.env.RESENT_API_KEY);
const emailContato  = process.env.CONTACT_RECEIVER_EMAIL || "zahircontato@outlook.com";

// ── Route Handler ────────────────────────────────────────────────────────────

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);

    if (!body) {
      return NextResponse.json(
        { error: "Corpo da requisição inválido ou ausente." },
        { status: 400 }
      );
    }

    // Validação Zod
    const parsedData = contactFormSchema.safeParse(body);
    if (!parsedData.success) {
      // Pega a primeira mensagem de erro definida no schema
      const firstError = parsedData.error.errors[0]?.message || "Dados inválidos.";
      
      return NextResponse.json(
        {
          error: firstError,
          details: parsedData.error.errors,
        },
        { status: 400 }
      );
    }

    const { nome, email, mensagem } = parsedData.data;

    // Envio via Resend
    const { data: emailData, error: emailError } = await resend.emails.send({
      from:    process.env.RESEND_FROM_EMAIL || "contact@sitedozahir.ruhtra.work",
      to:      [emailContato],         // notificação interna apenas
      replyTo: email,                  // permite responder diretamente ao usuário
      subject: `Nova mensagem de contato via site — ${nome}`,
      html:    EmailTemplate(nome, email, mensagem),
    });

    // O Resend pode retornar error mesmo com status 200 — checamos explicitamente
    if (emailError) {
      console.error("[/api/novo/email/send] Resend error:", emailError);
      return NextResponse.json(
        {
          error:
            "Ocorreu uma instabilidade ao enviar o e-mail. Por favor, aguarde alguns minutos e tente novamente.",
        },
        { status: 502 }
      );
    }

    return NextResponse.json(
      { message: "Mensagem enviada com sucesso!", data: { id: emailData?.id } },
      { status: 200 }
    );
  } catch (error) {
    console.error("[/api/novo/email/send] Unexpected error:", error);
    return NextResponse.json(
      {
        error:
          "Ocorreu um erro inesperado. Por favor, tente novamente em alguns minutos.",
      },
      { status: 500 }
    );
  }
}
