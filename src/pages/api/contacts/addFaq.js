import pool from '../_lib/connect';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }

  const { nom, question, reponse } = req.body;

  if (!question || !reponse) {
    return res.status(400).json({ message: 'Question et réponse sont obligatoires' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO FAQs (nom, question, reponse) VALUES (?, ?, ?)',
      [nom || null, question, reponse]
    );

    res.status(201).json({
      success: true,
      message: 'FAQ ajoutée avec succès',
      faqId: result.insertId
    });
  } catch (error) {
    console.error('Erreur lors de l\'ajout de la FAQ :', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
}