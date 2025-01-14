import { MailerService } from '@nestjs-modules/mailer';

export const sendEmail = async (
  mailerService: MailerService,
  to: string,
  subject: string,
  text: string,
  html?: string,
) => {
  try {
    await mailerService.sendMail({
      to,
      subject,
      text,
      html,
    });
    return { success: true, message: 'Email sent successfully!' };
  } catch (error) {
    throw new Error(`Failed to send email ${error}`);
  }
};
