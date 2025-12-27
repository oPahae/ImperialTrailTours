import pool from '../_lib/connect';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }

  const { nom, email, msg, dateC } = req.body;

  if (!nom || !email || !msg) {
    return res.status(400).json({ message: 'Les champs nom, email et message sont obligatoires' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO Contacts (nom, email, msg, dateC) VALUES (?, ?, ?, ?)',
      [nom, email, msg, dateC]
    );

    res.status(201).json({
      success: true,
      message: 'Message envoyé avec succès',
      contactId: result.insertId
    });

  } catch (error) {
    console.error('Erreur lors de l\'ajout du contact :', error);
    res.status(500).json({
      message: 'Erreur serveur',
      error: error.message
    });
  }
}