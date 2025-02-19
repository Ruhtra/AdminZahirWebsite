"use server";

import { z } from "zod";
// import { db } from "@/lib/db";
import { Resend } from "resend";
import { NextResponse } from "next/server";

const getAllFollowersSchema = z.object({
  nome: z
    .string()
    .min(2, "O nome deve ter pelo menos 2 caracteres.")
    .nonempty("O campo 'nome' é obrigatório."),
  arroba: z
    .string()
    .min(2, "O arroba deve ter pelo menos 2 caracteres.")
    .nonempty("O campo 'arroba' é obrigatório."),
  email: z
    .string()
    .email("Insira um endereço de email válido.")
    .nonempty("O campo 'email' é obrigatório."),
  telefone: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, "Insira um número de telefone válido.")
    .nonempty("O campo 'telefone' é obrigatório."),
  mensagem: z
    .string()
    .min(10, "A mensagem deve ter pelo menos 10 caracteres.")
    .nonempty("O campo 'mensagem' é obrigatório."),
});

const EmailTemplate = (
  nome: string,
  arroba: string,
  email: string,
  telefone: string,
  mensagem: string,
  to: string
) => `
<!DOCTYPE html>
<html lang="pt-BR">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirmação de Envio</title>
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
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }

        .email-header {
            text-align: center;
            border-bottom: 2px solid #f4f4f4;
            padding-bottom: 10px;
        }

        .email-header h1 {
            font-size: 24px;
            color: #007BFF;
        }

        .email-body {
            margin: 20px 0;
        }

        .email-body p {
            margin: 10px 0;
        }

        .email-footer {
            text-align: center;
            margin-top: 20px;
            font-size: 12px;
            color: #777;
        }

        .highlight {
            color: #007BFF;
            font-weight: bold;
        }

        @media (max-width: 600px) {
            .email-container {
                padding: 10px;
            }

            .email-header h1 {
                font-size: 20px;
            }
        }
    </style>
</head>

<body>
    <div class="email-container">
        <div class="email-header">
            <h1>Mensagem Enviada com Sucesso</h1>
        </div>
        <div class="email-body">
            <p>Olá, ${nome}</p>
            <p>Estamos felizes em informar que sua mensagem foi enviada com sucesso para ${to}.</p>
            <p>Confira abaixo os detalhes enviados:</p>
            <ul>
                <li><strong>Nome:</strong> ${nome}</li>
                <li><strong>@:</strong> ${arroba}</li>
                <li><strong>Email:</strong> ${email}</li>
                <li><strong>Telefone:</strong> ${telefone}</li>
                <li><strong>Mensagem:</strong> ${mensagem}</li>
            </ul>
            <p>Por gentileza, note que este endereço de e-mail é exclusivamente para envio. Não será possível visualizar respostas ou mensagens adicionais enviadas para este endereço.</p>
            <p>Se você identificar algum erro nos dados enviados, pedimos que envie uma nova mensagem através do nosso site de contato: <a href="https://sitedozahir.com/anuncie" class="highlight">sitedozahir.com/anuncie</a>.</p>
            <p>Obrigado por entrar em contato!</p>
        </div>
        <div class="email-footer">
            <p>Este é um e-mail automático, por favor, não responda.</p>
        </div>
    </div>
</body>

</html>
`;

const resend = new Resend(process.env.RESENT_API_KEY);
const emailcontato = "zahircontato@outlook.com";

export async function POST(request: Request) {
  try {
    const parsedData = getAllFollowersSchema.safeParse(await request.json());
    if (!parsedData.success)
      return NextResponse.json(
        { error: parsedData.error.errors },
        { status: 400 }
      );

    const { arroba, email, mensagem, nome, telefone } = parsedData.data;

    // Configuração do email
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: "zahirApp <contact@sitedozahir.com>",
      to: [email, emailcontato],
      subject: `Confirmação de contato para Zahir`,
      html: EmailTemplate(
        nome,
        arroba,
        email,
        telefone,
        mensagem,
        emailcontato
      ),
      replyTo: emailcontato, // O usuário pode responder diretamente
    });

    if (emailError) {
      return NextResponse.json({ error: emailError }, { status: 400 });
    }

    return NextResponse.json(
      { message: "Email enviado com sucesso!", data: emailData },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to process POST request:", error);
    return NextResponse.json(
      { error: "Failed to process POST request" },
      { status: 500 }
    );
  }
}
