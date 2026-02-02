import pool from '../_lib/connect';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }

  try {
    await pool.query(`
      UPDATE Reservations r
      JOIN Dates d ON r.dateR = d.id
      SET r.status = 'rejected'
      WHERE r.status = 'pending'
      AND r.dateReserv > d.dateDeb
    `);

    const [reservations] = await pool.query(`
      SELECT
        r.id,
        r.status,
        r.dateR AS dateId,
        r.tourID AS tourId,
        t.titre AS tourTitle,
        t.type AS tourType,
        t.njours AS days,
        d.dateDeb AS startDate,
        d.dateFin AS endDate,
        d.prix AS price,
        r.dateReserv AS bookingDate,
        r.payment_method,
        r.paid_amount,
        r.currency,
        r.img,
        (SELECT COUNT(*) FROM Voyageurs WHERE reservID = r.id) AS numTravelers,
        (d.prix * (SELECT COUNT(*) FROM Voyageurs WHERE reservID = r.id)) AS totalPrice
      FROM Reservations r
      JOIN Tours t ON r.tourID = t.id
      JOIN Dates d ON r.dateR = d.id
      ORDER BY r.dateReserv DESC
    `);

    const reservationsWithDetails = await Promise.all(
      reservations.map(async (reservation) => {
        const [travelers] = await pool.query(`
          SELECT
            id,
            prefix,
            nom AS lastName,
            prenom AS firstName,
            email,
            tel AS phone,
            nationalite AS nationality,
            dateN AS birthDate,
            pays AS country,
            ville AS city,
            adresse AS address,
            province,
            codePostal AS postalCode
          FROM Voyageurs
          WHERE reservID = ?
        `, [reservation.id]);

        let imgBase64 = null;
        if (reservation.img) {
          imgBase64 = `data:image/jpeg;base64,${reservation.img.toString('base64')}`;
        }

        return {
          ...reservation,
          img: imgBase64,
          bookingRef: `BK-${new Date(reservation.bookingDate).getFullYear()}-${String(reservation.id).padStart(3, '0')}`,
          travelers: travelers.map(traveler => ({
            ...traveler,
            birthDate: traveler.birthDate ? traveler.birthDate.toISOString().split('T')[0] : null
          }))
        };
      })
    );

    res.status(200).json(reservationsWithDetails.filter(e => e.travelers.length > 0));
    // .filter(e => e.travelers.length > 0)
  } catch (error) {
    console.error('Erreur lors de la récupération des réservations :', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
}