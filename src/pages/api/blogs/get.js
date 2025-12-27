import pool from '../_lib/connect';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }

  try {
    const [blogs] = await pool.query(`
      SELECT id, img, titre AS title, contenu AS excerpt, dateB AS date
      FROM Blogs
      ORDER BY dateB DESC
    `);

    const formattedBlogs = blogs.map(blog => ({
      ...blog,
      img: blog.img
        ? `data:image/jpeg;base64,${blog.img}`
        : 'https://via.placeholder.com/800x600?text=No+Image',
      date: blog.date.toISOString().split('T')[0],
    }));

    res.status(200).json({ blogs: formattedBlogs });
  } catch (error) {
    console.error('Erreur lors de la récupération des blogs :', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
}