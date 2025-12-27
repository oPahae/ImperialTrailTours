import nodemailer from 'nodemailer';

export default async function handler(req, res) {
    const { email, code } = req.query;
    if (!email || !code) return res.status(400).json({ message: 'Infos Manquantes' });

    const transporter = nodemailer.createTransport({
        host: process.env.BREVO_SMTP,
        port: 587,
        auth: {
            user: process.env.BREVO_USER,
            pass: process.env.BREVO_API,
        },
    });

    try {
        await transporter.verify();
        await transporter.sendMail({
            from: process.env.BREVO_SENDER,
            to: email,
            subject: 'Code de vérification',
            text: `Votre code de vérification est : ${code}`,
            html: `
                    <div style="font-family: Arial, sans-serif; color: #333; background-color: #f9f9f9; padding: 20px; border-radius: 8px; max-width: 600px; margin: auto; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
                        <h2 style="color: #4CAF50; text-align: center;">Code de vérification</h2>
                        <p style="font-size: 16px; line-height: 1.5; text-align: center;">
                            Bonjour,
                        </p>
                        <p style="font-size: 16px; line-height: 1.5; text-align: center;">
                            Voici votre code de vérification à entrer pour confirmer votre email :
                            <span style="display: block; font-size: 20px; font-weight: bold; color: #4CAF50; margin-top: 10px;">
                                ${code}
                            </span>
                            Ne partagez ce code avec personne.
                        </p>
                        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
                        <p style="font-size: 12px; text-align: center; color: #aaa;">
                            Cet email a été envoyé automatiquement, merci de ne pas y répondre.
                        </p>
                    </div>
                `
        });

        return res.status(200).json({ message: 'Email code sent!' });
    } catch (message) {
        console.log('Erreur lors de l\'envoi de l\'email :', message);
        return res.status(500).json({ message: 'Failed to send email', details: message.message });
    }
}