import pool from '../_lib/connect';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ message: 'ID du blog manquant' });
  }

  try {
    const [blogs] = await pool.query(
      'SELECT id, titre AS title, img, contenu AS content, dateB AS date FROM Blogs WHERE id = ?',
      [id]
    );

    if (blogs.length === 0) {
      return res.status(404).json({ message: 'Blog non trouvé' });
    }

    const blog = blogs[0];

    const formattedBlog = {
      id: blog.id,
      title: blog.title,
      img: blog.img.startsWith('data:image/')
        ? blog.img
        : `data:image/jpeg;base64,${blog.img}`,
      content: blog.content,
      date: blog.date.toISOString().split('T')[0]
    };

    res.status(200).json({ blog: formattedBlog });

  } catch (error) {
    console.error('Erreur lors de la récupération du blog :', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
}