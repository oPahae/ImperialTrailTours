import pool from '../_lib/connect';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }

  try {
    const [faqs] = await pool.query(`
      SELECT id, nom AS category, question, reponse AS answer
      FROM FAQs
      ORDER BY id DESC
    `);

    res.status(200).json({ faqs });
  } catch (error) {
    console.error('Erreur lors de la récupération des FAQs :', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
}