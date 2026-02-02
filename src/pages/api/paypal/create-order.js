export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { totalPrice, reservationId } = req.body;

  const auth = Buffer.from(
    process.env.PAYPAL_CLIENT_ID + ':' + process.env.PAYPAL_CLIENT_SECRET
  ).toString('base64');

  const tokenRes = await fetch(`${process.env.PAYPAL_BASE_URL}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  const tokenData = await tokenRes.json();

  const orderRes = await fetch(`${process.env.PAYPAL_BASE_URL}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${tokenData.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [
        {
          reference_id: reservationId,
          amount: {
            currency_code: 'USD',
            value: totalPrice.toFixed(2),
          },
        },
      ],
    }),
  });

  const orderData = await orderRes.json();

  res.status(200).json(orderData);
}