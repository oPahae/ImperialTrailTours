import nodemailer from 'nodemailer';
import { footerInfos } from '@/utils/constants';
import pool from '../_lib/connect';

export default async function handler(req, res) {
    const { to, subject, text, id } = req.body;

    if (!to || !subject || !text) {
        return res.status(400).json({ status: "failed", message: "Missing data: 'to', 'subject', or 'text' is required." });
    }

    if (req.method === 'POST') {
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

            const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${subject} - ${footerInfos.entreprise}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f3f4f6; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 650px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.07);">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 40px 30px; text-align: center;">
                            <div style="width: 80px; height: 80px; background-color: #ffffff; border-radius: 50%; margin: 0 auto 20px; display: inline-flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
                                <span style="font-size: 40px; color: #f59e0b;">💬</span>
                            </div>
                            <h1 style="margin: 0 0 12px 0; color: #ffffff; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">New Message</h1>
                            <p style="margin: 0; color: #fef3c7; font-size: 16px; font-weight: 400;">We have received your message</p>
                        </td>
                    </tr>
                    <!-- Message Content -->
                    <tr>
                        <td style="padding: 30px 30px 20px 30px;">
                            <p style="margin: 0 0 16px 0; color: #1f2937; font-size: 16px; line-height: 1.6;">
                                Hello,
                            </p>
                            <p style="margin: 0 0 24px 0; color: #4b5563; font-size: 15px; line-height: 1.6;">
                                ${text.replace(/\n/g, '<br>')}
                            </p>
                            <p style="margin: 0; color: #4b5563; font-size: 15px; line-height: 1.6;">
                                Best regards,<br>
                                <strong>${footerInfos.entreprise}</strong>
                            </p>
                        </td>
                    </tr>
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #1f2937; padding: 30px; text-align: center;">
                            <p style="margin: 0 0 8px 0; color: #9ca3af; font-size: 14px;">
                                Need help? Contact us
                            </p>
                            <p style="margin: 0 0 16px 0;">
                                <a href="mailto:${footerInfos.email}" style="color: #f59e0b; text-decoration: none; font-weight: 500;">${footerInfos.email}</a>
                            </p>
                            <p style="margin: 0; color: #6b7280; font-size: 13px;">
                                © 2025 ${footerInfos.entreprise}. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
            `;

            await transporter.sendMail({
                from: process.env.BREVO_SENDER,
                to: to,
                subject: subject,
                text: text,
                html: htmlContent,
            });

            const [result] = await pool.query(
                'DELETE FROM Contacts WHERE id = ?',
                [id]
            );

            return res.status(200).json({ message: 'Reply email sent successfully!' });
        } catch (error) {
            console.error('Error sending reply email:', error);
            return res.status(500).json({ message: 'Failed to send reply email', details: error.message });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}