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
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }

  const { title, img, content, date } = req.body;

  if (!title || !img || !content || !date) {
    return res.status(400).json({ message: 'Tous les champs sont requis' });
  }

  try {
    // CORRECTION : ne pas convertir en Buffer ici
    const [result] = await pool.query(
      'INSERT INTO Blogs (titre, contenu, img, dateB) VALUES (?, ?, ?, ?)',
      [title, content, img, date]
    );

    res.status(201).json({
      success: true,
      message: 'Blog ajouté avec succès',
      blogId: result.insertId
    });
  } catch (error) {
    console.error('Erreur lors de l\'ajout du blog :', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
}