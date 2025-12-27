import pool from '../_lib/connect';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { nom, dateR, contenu, netoiles } = req.body;

  if (!nom || !dateR || !contenu || !netoiles) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO Reviews (nom, dateR, contenu, netoiles) VALUES (?, ?, ?, ?)',
      [nom, dateR, contenu, netoiles]
    );

    return res.status(200).json({ message: 'success', id: result.insertId });
  } catch (error) {
    console.error('Error inserting review:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}