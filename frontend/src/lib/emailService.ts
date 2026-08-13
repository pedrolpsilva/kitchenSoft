import emailjs from '@emailjs/browser';

const SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || '';
const TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || '';
const PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || '';

export async function sendConfirmationEmail(
  toName: string,
  toEmail: string,
  confirmationLink: string
): Promise<void> {
  try {
    await emailjs.send(
      SERVICE_ID,
      TEMPLATE_ID,
      {
        to_name: toName,
        to_email: toEmail,
        confirmation_link: confirmationLink,
      },
      PUBLIC_KEY
    );
  } catch (error) {
    console.error('[EmailJS] Erro ao enviar email de confirmação:', error);
    throw error;
  }
}
