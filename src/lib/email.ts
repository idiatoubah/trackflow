import nodemailer from 'nodemailer';

// In a real production environment, you would use environment variables (e.g., SMTP_HOST)
// For this MVP, we can use a test account or a simpler configuration.
// If not configured, we'll just log the email to the console.

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_PORT === '465',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendStatusUpdateEmail = async (
  to: string,
  trackingNumber: string,
  status: string,
  notes?: string | null
) => {
  // Translate standard statuses for the email
  const statusTranslations: Record<string, string> = {
    PREPARATION: 'En préparation',
    SHIPPED: 'Expédié',
    IN_TRANSIT: 'En cours de livraison',
    DELIVERED: 'Livré',
    DELAYED: 'Retardé',
  };

  const humanStatus = statusTranslations[status] || status;

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <h2 style="color: #2563eb;">Mise à jour de votre livraison</h2>
      <p>Bonjour,</p>
      <p>Le statut de votre colis <strong>${trackingNumber}</strong> a été mis à jour.</p>
      <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0; font-size: 18px;">Nouveau statut : <strong>${humanStatus}</strong></p>
        ${notes ? `<p style="margin-top: 10px; color: #555;">Note : ${notes}</p>` : ''}
      </div>
      <p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/track/${trackingNumber}" 
           style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Suivre mon colis
        </a>
      </p>
      <p style="font-size: 12px; color: #888; margin-top: 30px;">
        Ceci est un message automatique, merci de ne pas y répondre.
      </p>
    </div>
  `;

  try {
    if (!process.env.SMTP_USER) {
      console.log('======= SIMULATION EMAIL =======');
      console.log(`To: ${to}`);
      console.log(`Subject: Mise à jour livraison - ${trackingNumber}`);
      console.log(`Status: ${humanStatus}`);
      console.log('================================');
      return true;
    }

    await transporter.sendMail({
      from: `"Trackflow" <${process.env.SMTP_FROM || 'no-reply@trackflow.com'}>`,
      to,
      subject: `Votre colis ${trackingNumber} est ${humanStatus.toLowerCase()}`,
      html,
    });
    return true;
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error);
    return false;
  }
};

export const sendPackageCreatedEmail = async (
  to: string,
  trackingNumber: string,
  status: string
) => {
  const statusTranslations: Record<string, string> = {
    PREPARATION: 'En préparation',
    SHIPPED: 'Expédié',
    IN_TRANSIT: 'En cours de livraison',
    DELIVERED: 'Livré',
    DELAYED: 'Retardé',
  };

  const humanStatus = statusTranslations[status] || status;

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <h2 style="color: #2563eb;">Votre colis a été enregistré</h2>
      <p>Bonjour,</p>
      <p>Nous vous informons que votre colis <strong>${trackingNumber}</strong> a été enregistré dans notre système.</p>
      <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0; font-size: 18px;">Statut actuel : <strong>${humanStatus}</strong></p>
      </div>
      <p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/track/${trackingNumber}" 
           style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Suivre mon colis
        </a>
      </p>
      <p style="font-size: 12px; color: #888; margin-top: 30px;">
        Ceci est un message automatique, merci de ne pas y répondre.
      </p>
    </div>
  `;

  try {
    if (!process.env.SMTP_USER) {
      console.log('\n======= SIMULATION EMAIL (CRÉATION) =======');
      console.log(`To: ${to}`);
      console.log(`Subject: Votre colis ${trackingNumber} a été enregistré`);
      console.log(`Tracking Number: ${trackingNumber}`);
      console.log(`Initial Status: ${humanStatus}`);
      console.log(`Tracking Link: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/track/${trackingNumber}`);
      console.log('===========================================\n');
      return true;
    }

    await transporter.sendMail({
      from: `"Trackflow" <${process.env.SMTP_FROM || 'no-reply@trackflow.com'}>`,
      to,
      subject: `Votre colis ${trackingNumber} a été enregistré`,
      html,
    });
    return true;
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email de création:', error);
    return false;
  }
};
