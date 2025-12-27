import pool from '../_lib/connect';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }

  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ message: 'ID de la réservation manquant' });
  }

  try {
    await pool.query(
      'UPDATE Reservations SET status = "approved" WHERE id = ?',
      [id]
    );

    res.status(200).json({ success: true, message: 'Réservation confirmée avec succès' });

  } catch (error) {
    console.error('Erreur lors de la confirmation de la réservation :', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
}