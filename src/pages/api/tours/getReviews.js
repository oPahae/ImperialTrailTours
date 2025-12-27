import pool from '../_lib/connect';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ message: 'ID du tour manquant' });
  }

  try {
    const [reviews] = await pool.query(
      'SELECT id, nom, netoiles AS rating, dateR AS date, contenu AS comment FROM ReviewsTour WHERE tourID = ?',
      [id]
    );

    const formattedReviews = reviews.map(review => ({
      id: review.id,
      name: review.nom,
      rating: review.rating,
      date: review.date.toISOString().split('T')[0],
      comment: review.comment
    }));

    res.status(200).json({ reviews: formattedReviews.reverse() });

  } catch (error) {
    console.error('Erreur lors de la récupération des avis :', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
}