import pool from '../_lib/connect';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }

  const { tourId, dateId, travelers, userID } = req.body;

  if (!tourId || !dateId || !travelers || travelers.length === 0) {
    return res.status(400).json({ message: 'Données manquantes' });
  }

  try {
    await pool.query('START TRANSACTION');

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

    await pool.query(
      'UPDATE Dates SET ndispo = ndispo - ? WHERE id = ?',
      [travelers.length, dateId]
    );

    await pool.query('COMMIT');

    res.status(201).json({ success: true, reservationId });

  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Erreur lors de l\'ajout de la réservation :', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
}