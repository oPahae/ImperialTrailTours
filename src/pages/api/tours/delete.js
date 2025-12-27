import pool from '../_lib/connect';

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ message: 'ID du tour manquant' });
  }

  try {
    await pool.query('START TRANSACTION');

    await pool.query('DELETE FROM Imgs WHERE tourID = ?', [id]);
    await pool.query('DELETE FROM Jours WHERE tourID = ?', [id]);
    await pool.query('DELETE FROM Dates WHERE tourID = ?', [id]);
    await pool.query('DELETE FROM Highlights WHERE tourID = ?', [id]);
    await pool.query('DELETE FROM ReviewsTour WHERE id = ?', [id]);

    const [result] = await pool.query('DELETE FROM Tours WHERE id = ?', [id]);
    await pool.query('COMMIT');

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Tour non trouvé' });
    }

    res.status(200).json({ success: true, message: 'Tour supprimé avec succès' });

  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Erreur lors de la suppression du tour :', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
}