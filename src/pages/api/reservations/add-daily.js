import pool from '../_lib/connect';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }

  const { tourId, selectedDate, endDate, price, travelers, userID } = req.body;

  if (!tourId || !selectedDate || !travelers || travelers.length === 0) {
    return res.status(400).json({ message: 'Missing Infos' });
  }

  try {
    await pool.query('START TRANSACTION');

    const [dateResult] = await pool.query(
      'INSERT INTO Dates (tourID, dateDeb, dateFin, ndispo, prix) VALUES (?, ?, ?, ?, ?)',
      [tourId, selectedDate, endDate, 65535, price]
    );

    const dateId = dateResult.insertId;

    const [reservationResult] = await pool.query(
      'INSERT INTO Reservations (tourID, dateR, userID) VALUES (?, ?, ?)',
      [tourId, dateId, userID]
    );

    const reservationId = reservationResult.insertId;

    for (const traveler of travelers) {
      await pool.query(
        `INSERT INTO Voyageurs
          (reservID, prefix, nom, prenom, dateN, tel, email, nationalite, passport, passportExpir, pays, ville, adresse, province, codePostal)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          reservationId,
          traveler.prefix,
          traveler.lastName,
          traveler.firstName,
          traveler.birthDate,
          traveler.phone,
          traveler.email,
          traveler.nationality,
          traveler.passport,
          traveler.passportExpiry,
          traveler.country,
          traveler.city,
          traveler.address,
          traveler.province,
          traveler.postalCode
        ]
      );
    }

    await pool.query('COMMIT');

    res.status(201).json({ success: true, reservationId });

  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Erreur lors de l\'ajout de la réservation :', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
}