import pool from '../_lib/connect';

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ message: 'ID du blog manquant' });
  }

  try {
    const [result] = await pool.query('DELETE FROM Blogs WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Blog non trouvé' });
    }

    res.status(200).json({ success: true, message: 'Blog supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du blog :', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
}