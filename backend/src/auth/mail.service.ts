import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class MailService {
  private resend = new Resend(process.env.RESEND_API_KEY);

  async enviarCodigoRecuperacion(email: string, codigo: string) {
    try {
      await this.resend.emails.send({
        // Nombre del remitente y mail permitido por Resend (Sandbox)
        from: 'CRUD Proyectos <onboarding@resend.dev>',
        to: email,
        subject: 'Restablecer Contraseña - CRUD Proyectos',
        html: `
          <div style="font-family: sans-serif; border: 1px solid #e5e7eb; padding: 25px; border-radius: 12px; max-width: 500px; margin: auto;">
            <h2 style="color: #6d28d9; text-align: center; margin-bottom: 10px;">CRUD Proyectos</h2>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
            
            <p style="font-size: 16px; color: #374151;">Hola,</p>
            <p style="font-size: 16px; color: #374151;">Recibimos una solicitud para restablecer tu contraseña. Utiliza el siguiente código de seguridad:</p>
            
            <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; font-size: 32px; font-weight: bold; text-align: center; letter-spacing: 8px; color: #1f2937; margin: 25px 0; border: 1px dashed #d1d5db;">
              ${codigo}
            </div>
            
            <p style="font-size: 14px; color: #6b7280; text-align: center;">Este código expirará en 10 minutos.</p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center;">
              <p style="font-size: 12px; color: #9ca3af;">Si no solicitaste este cambio, puedes ignorar este mensaje de forma segura.</p>
            </div>
          </div>
        `,
      });
    } catch (error) {
      console.error('Error enviando mail a través de Resend:', error);
    }
  }
}