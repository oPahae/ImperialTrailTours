import nodemailer from 'nodemailer';
import { footerInfos } from '@/utils/constants';

export default async function handler(req, res) {
    const { email, tour, travelers } = req.body;

    if (!email || !tour || !travelers || travelers.length === 0) {
        return res.status(400).json({ status: "failed", message: "Missing data" });
    }

    if (req.method === 'POST') {
        const transporter = nodemailer.createTransport({
            host: process.env.OVH_SMTP,
            port: 587,
            secure: false,
            auth: {
                user: process.env.OVH_SMTP_USER,
                pass: process.env.OVH_SMTP_PASS,
            },
            tls: {
                rejectUnauthorized: false,
            },
        });

        try {
            await transporter.verify();
            const travelersInfo = travelers.map((traveler, index) => `
                <tr>
                    <td style="padding: 0 0 20px 0;">
                        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
                            <tr>
                                <td style="padding: 24px;">
                                    <table cellpadding="0" cellspacing="0" border="0" width="100%">
                                        <tr>
                                            <td style="padding-bottom: 16px; border-bottom: 2px solid #f59e0b;">
                                                <h3 style="margin: 0; color: #1f2937; font-size: 18px; font-weight: 600;">
                                                    <span style="display: inline-block; width: 32px; height: 32px; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; border-radius: 50%; text-align: center; line-height: 32px; margin-right: 10px; font-size: 14px;">${index + 1}</span>
                                                    ${traveler.prefix} ${traveler.firstName} ${traveler.lastName}
                                                </h3>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td style="padding-top: 20px;">
                                                <table cellpadding="0" cellspacing="0" border="0" width="100%">
                                                    <tr>
                                                        <td width="50%" style="padding: 0 10px 16px 0; vertical-align: top;">
                                                            <div style="background-color: #fef3c7; padding: 12px 16px; border-radius: 8px; border-left: 3px solid #f59e0b;">
                                                                <p style="margin: 0 0 4px 0; color: #78716c; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Date of Birth</p>
                                                                <p style="margin: 0; color: #1f2937; font-size: 15px; font-weight: 500;">${traveler.birthDate}</p>
                                                            </div>
                                                        </td>
                                                        <td width="50%" style="padding: 0 0 16px 10px; vertical-align: top;">
                                                            <div style="background-color: #fef3c7; padding: 12px 16px; border-radius: 8px; border-left: 3px solid #f59e0b;">
                                                                <p style="margin: 0 0 4px 0; color: #78716c; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Nationality</p>
                                                                <p style="margin: 0; color: #1f2937; font-size: 15px; font-weight: 500;">${traveler.nationality}</p>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                    ${traveler.phone ? `
                                                    <tr>
                                                        <td width="50%" style="padding: 0 10px 16px 0; vertical-align: top;">
                                                            <div style="background-color: #fef3c7; padding: 12px 16px; border-radius: 8px; border-left: 3px solid #f59e0b;">
                                                                <p style="margin: 0 0 4px 0; color: #78716c; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Phone</p>
                                                                <p style="margin: 0; color: #1f2937; font-size: 15px; font-weight: 500;">${traveler.phone}</p>
                                                            </div>
                                                        </td>
                                                        <td width="50%" style="padding: 0 0 16px 10px; vertical-align: top;">
                                                            <div style="background-color: #fef3c7; padding: 12px 16px; border-radius: 8px; border-left: 3px solid #f59e0b;">
                                                                <p style="margin: 0 0 4px 0; color: #78716c; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Email</p>
                                                                <p style="margin: 0; color: #1f2937; font-size: 15px; font-weight: 500;">${traveler.email}</p>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                    ` : `
                                                    <tr>
                                                        <td colspan="2" style="padding: 0 0 16px 0;">
                                                            <div style="background-color: #fef3c7; padding: 12px 16px; border-radius: 8px; border-left: 3px solid #f59e0b;">
                                                                <p style="margin: 0 0 4px 0; color: #78716c; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Email</p>
                                                                <p style="margin: 0; color: #1f2937; font-size: 15px; font-weight: 500;">${traveler.email}</p>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                    `}
                                                    ${traveler.passport ? `
                                                    <tr>
                                                        <td width="50%" style="padding: 0 10px 16px 0; vertical-align: top;">
                                                            <div style="background-color: #fef3c7; padding: 12px 16px; border-radius: 8px; border-left: 3px solid #f59e0b;">
                                                                <p style="margin: 0 0 4px 0; color: #78716c; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Passport</p>
                                                                <p style="margin: 0; color: #1f2937; font-size: 15px; font-weight: 500;">${traveler.passport}</p>
                                                            </div>
                                                        </td>
                                                        ${traveler.passportExpiry ? `
                                                        <td width="50%" style="padding: 0 0 16px 10px; vertical-align: top;">
                                                            <div style="background-color: #fef3c7; padding: 12px 16px; border-radius: 8px; border-left: 3px solid #f59e0b;">
                                                                <p style="margin: 0 0 4px 0; color: #78716c; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Passport Expiry</p>
                                                                <p style="margin: 0; color: #1f2937; font-size: 15px; font-weight: 500;">${traveler.passportExpiry}</p>
                                                            </div>
                                                        </td>
                                                        ` : '<td width="50%"></td>'}
                                                    </tr>
                                                    ` : ''}
                                                    <tr>
                                                        <td colspan="2" style="padding: 0;">
                                                            <div style="background-color: #fef3c7; padding: 12px 16px; border-radius: 8px; border-left: 3px solid #f59e0b;">
                                                                <p style="margin: 0 0 4px 0; color: #78716c; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Address</p>
                                                                <p style="margin: 0; color: #1f2937; font-size: 15px; font-weight: 500;">${traveler.address}</p>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            `).join('');

            const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Booking Confirmation - ${footerInfos.entreprise}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f3f4f6; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 650px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.07);">

                    <!-- Header with gradient -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 40px 30px; text-align: center;">
                            <div style="width: 80px; height: 80px; background-color: #ffffff; border-radius: 50%; margin: 0 auto 20px; display: inline-flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
                                <span style="font-size: 40px; color: #22c55e;">✓</span>
                            </div>
                            <h1 style="margin: 0 0 12px 0; color: #ffffff; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">Booking Confirmed</h1>
                            <p style="margin: 0; color: #fef3c7; font-size: 16px; font-weight: 400;">Thank you for your trust</p>
                        </td>
                    </tr>

                    <!-- Welcome message -->
                    <tr>
                        <td style="padding: 30px 30px 20px 30px;">
                            <p style="margin: 0 0 16px 0; color: #1f2937; font-size: 16px; line-height: 1.6;">
                                Hello,
                            </p>
                            <p style="margin: 0; color: #4b5563; font-size: 15px; line-height: 1.6;">
                                Your booking has been successfully confirmed! Below you will find all the details of your trip.
                            </p>
                        </td>
                    </tr>

                    <!-- Tour details -->
                    <tr>
                        <td style="padding: 20px 30px;">
                            <table cellpadding="0" cellspacing="0" border="0" width="100%">
                                <tr>
                                    <td style="padding-bottom: 20px;">
                                        <h2 style="margin: 0; color: #1f2937; font-size: 22px; font-weight: 700; border-bottom: 3px solid #f59e0b; padding-bottom: 12px; display: inline-block;">
                                            📋 Tour Details
                                        </h2>
                                    </td>
                                </tr>
                            </table>

                            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%); border-radius: 12px; overflow: hidden; border: 2px solid #fde68a;">
                                <tr>
                                    <td style="padding: 24px;">
                                        <table cellpadding="0" cellspacing="0" border="0" width="100%">
                                            <tr>
                                                <td width="50%" style="padding: 0 10px 16px 0;">
                                                    <div style="background-color: #ffffff; padding: 16px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                                                        <p style="margin: 0 0 6px 0; color: #78716c; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Tour Name</p>
                                                        <p style="margin: 0; color: #1f2937; font-size: 16px; font-weight: 600;">${tour.title}</p>
                                                    </div>
                                                </td>
                                                <td width="50%" style="padding: 0 0 16px 10px;">
                                                    <div style="background-color: #ffffff; padding: 16px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                                                        <p style="margin: 0 0 6px 0; color: #78716c; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Tour Type</p>
                                                        <p style="margin: 0; color: #1f2937; font-size: 16px; font-weight: 600;">${tour.type}</p>
                                                    </div>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td width="50%" style="padding: 0 10px 16px 0;">
                                                    <div style="background-color: #ffffff; padding: 16px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                                                        <p style="margin: 0 0 6px 0; color: #78716c; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Duration</p>
                                                        <p style="margin: 0; color: #1f2937; font-size: 16px; font-weight: 600;">${tour.days} Days</p>
                                                    </div>
                                                </td>
                                                <td width="50%" style="padding: 0 0 16px 10px;">
                                                    <div style="background-color: #ffffff; padding: 16px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                                                        <p style="margin: 0 0 6px 0; color: #78716c; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Dates</p>
                                                        <p style="margin: 0; color: #1f2937; font-size: 16px; font-weight: 600;">${tour.startDate} - ${tour.endDate}</p>
                                                    </div>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td width="50%" style="padding: 0 10px 0 0;">
                                                    <div style="background-color: #ffffff; padding: 16px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                                                        <p style="margin: 0 0 6px 0; color: #78716c; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Travelers</p>
                                                        <p style="margin: 0; color: #1f2937; font-size: 16px; font-weight: 600;">${tour.numTravelers} ${tour.numTravelers === 1 ? 'Person' : 'People'}</p>
                                                    </div>
                                                </td>
                                                <td width="50%" style="padding: 0 0 0 10px;">
                                                    <div style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); padding: 16px; border-radius: 10px; box-shadow: 0 4px 8px rgba(34,197,94,0.25);">
                                                        <p style="margin: 0 0 6px 0; color: #dcfce7; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Total Price</p>
                                                        <p style="margin: 0; color: #ffffff; font-size: 20px; font-weight: 700;">$${tour.totalPrice}</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Travelers information -->
                    <tr>
                        <td style="padding: 20px 30px;">
                            <table cellpadding="0" cellspacing="0" border="0" width="100%">
                                <tr>
                                    <td style="padding-bottom: 20px;">
                                        <h2 style="margin: 0; color: #1f2937; font-size: 22px; font-weight: 700; border-bottom: 3px solid #f59e0b; padding-bottom: 12px; display: inline-block;">
                                            👥 Travelers Information
                                        </h2>
                                    </td>
                                </tr>
                                ${travelersInfo}
                            </table>
                        </td>
                    </tr>

                    <!-- Next steps -->
                    <tr>
                        <td style="padding: 20px 30px;">
                            <div style="background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); padding: 24px; border-radius: 12px; border-left: 4px solid #3b82f6;">
                                <h3 style="margin: 0 0 12px 0; color: #1e40af; font-size: 18px; font-weight: 600;">📌 Next Steps</h3>
                                <ul style="margin: 0; padding-left: 20px; color: #1e3a8a;">
                                    <li style="margin-bottom: 8px; line-height: 1.6;">You will receive a confirmation email within 24 hours</li>
                                    <li style="margin-bottom: 8px; line-height: 1.6;">Our team will contact you to finalize the details</li>
                                    <li style="margin-bottom: 0; line-height: 1.6;">Prepare your travel documents</li>
                                </ul>
                            </div>
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
                from: process.env.OVH_SENDER,
                to: email,
                subject: `✓ Booking Confirmation - ${footerInfos.entreprise}`,
                text: `Your booking for the tour "${tour.title}" has been successfully validated.`,
                html: htmlContent,
            });

            return res.status(200).json({ message: 'Email sent!' });
        } catch (error) {
            console.log('Error sending email:', error);
            return res.status(500).json({ message: 'Failed to send email', details: error.message });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}