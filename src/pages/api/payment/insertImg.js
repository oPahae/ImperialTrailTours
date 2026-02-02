import pool from '../_lib/connect';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "20mb"
    }
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { reservationId, image, amount } = req.body;

    if (!reservationId || !image) {
      return res.status(400).json({ message: 'Missing reservationId or image' });
    }

    const imageBuffer = Buffer.from(image, 'base64');

    await pool.query(
      "UPDATE Reservations SET img = ?, paid = ?, payment_method = 'bank', paid_amount = ? WHERE id = ?",
      [imageBuffer, true, amount, reservationId]
    );

    return res.status(200).json({ message: 'Image uploaded successfully' });
  } catch (error) {
    console.error('Image upload error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}