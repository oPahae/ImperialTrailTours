import pool from '../_lib/connect';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { orderId, reservationId } = req.body;

  if (!orderId || !reservationId) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const auth = Buffer.from(
      `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
    ).toString('base64');

    const tokenRes = await fetch(
      `${process.env.PAYPAL_BASE_URL}/v1/oauth2/token`,
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials',
      }
    );

    const tokenData = await tokenRes.json();

    if (!tokenRes.ok || !tokenData.access_token) {
      return res.status(500).json({ message: 'Failed to get PayPal token' });
    }

    const captureRes = await fetch(
      `${process.env.PAYPAL_BASE_URL}/v2/checkout/orders/${orderId}/capture`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      }
    );

    const captureData = await captureRes.json();

    if (!captureRes.ok) {
      return res.status(400).json({
        message: 'PayPal capture failed',
        data: captureData,
      });
    }

    const capture =
      captureData.purchase_units?.[0]?.payments?.captures?.[0];

    if (!capture || capture.status !== 'COMPLETED') {
      await pool.query(
        "UPDATE reservations SET status = 'rejected' WHERE id = ?",
        [reservationId]
      );

      return res.status(400).json({
        message: 'Payment not completed',
        data: captureData,
      });
    }

    const paidAmount = capture.amount.value;
    const currency = capture.amount.currency_code;
    const transactionId = capture.id;

    await pool.query(
      `
      UPDATE reservations
      SET
        paid = ?,
        payment_method = 'paypal',
        paid_amount = ?,
        currency = ?
      WHERE id = ?
      `,
      [
        true,
        paidAmount,
        currency,
        reservationId,
      ]
    );

    return res.status(200).json({
      message: 'Payment captured and saved successfully',
      transactionId,
      amount: paidAmount,
      currency,
    });

  } catch (error) {
    console.error('Error capturing PayPal order:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}