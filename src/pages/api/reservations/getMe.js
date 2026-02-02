import pool from '../_lib/connect';
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { id } = req.query;

  try {
    const [userReservations] = await pool.query(`
      SELECT r.id, r.status, r.dateReserv, r.paid, r.payment_method, paid_amount,
             d.id as dateId, d.dateDeb, d.dateFin, d.prix,
             t.id as tourId, t.titre, t.descr, t.places
      FROM Reservations r
      JOIN Dates d ON r.dateR = d.id
      JOIN Tours t ON r.tourID = t.id
      WHERE r.userID = ?
      GROUP BY r.id
    `, [id]);

    if (userReservations.length === 0) {
      return res.status(200).json({ reservations: [] });
    }

    const reservationsWithVoyageurs = await Promise.all(
      userReservations.map(async (reservation) => {
        const [voyageurs] = await pool.query('SELECT * FROM Voyageurs WHERE reservID = ?', [reservation.id]);
        return { ...reservation, voyageurs };
      })
    );

    return res.status(200).json({ reservations: reservationsWithVoyageurs.reverse() });
  } catch (error) {
    console.error('Erreur lors de la récupération des réservations :', error);
    return res.status(500).json({ message: 'Une erreur est survenue lors de la récupération de vos réservations.' });
  }
}