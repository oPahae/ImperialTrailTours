import pool from '../_lib/connect';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }

  const { id, title, img, content, date } = req.body;

  if (!id || !title || !img || !content || !date) {
    return res.status(400).json({ message: 'Tous les champs sont requis' });
  }

  try {
    const [result] = await pool.query(
      'UPDATE Blogs SET titre = ?, contenu = ?, img = ?, dateB = ? WHERE id = ?',
      [
        title,
        content,
        img.startsWith('data:image/') ? img.split(',')[1] : img,
        date,
        id
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Blog non trouvé' });
    }

    res.status(200).json({
      success: true,
      message: 'Blog mis à jour avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour du blog :', error);
    res.status(500).json({
      message: 'Erreur serveur',
      error: error.message
    });
  }
}