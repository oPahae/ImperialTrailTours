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
    await pool.query('START TRANSACTION');

    const [travelers] = await pool.query(
      'SELECT COUNT(*) AS count FROM Voyageurs WHERE reservID = ?',
      [id]
    );

    const [reservation] = await pool.query(
      'SELECT dateR FROM Reservations WHERE id = ?',
      [id]
    );

    if (reservation.length === 0) {
      await pool.query('ROLLBACK');
      return res.status(404).json({ message: 'Réservation non trouvée' });
    }

    await pool.query(
      'UPDATE Reservations SET status = "rejected" WHERE id = ?',
      [id]
    );

    await pool.query(
      'UPDATE Dates SET ndispo = ndispo + ? WHERE id = ?',
      [travelers[0].count, reservation[0].dateR]
    );

    await pool.query('COMMIT');

    res.status(200).json({ success: true, message: 'Réservation rejetée avec succès' });

  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Erreur lors du rejet de la réservation :', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
}