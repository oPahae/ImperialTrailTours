import pool from '../_lib/connect';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "50mb",
    },
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }

  try {
    const {
      title,
      description,
      type,
      days,
      minSpots,
      daily,
      dailyStartDate,
      dailyPrice,
      mainImage,
      gallery,
      places,
      program,
      highlights,
      availableDates,
    } = req.body;

    // Validation
    if (!title || !description || !type || !days || !mainImage || !gallery || !places || !program || !highlights || !minSpots) {
      return res.status(400).json({ message: 'All fields must be filled' });
    }

    if (places.length < 3) {
      return res.status(400).json({ message: "At least 2 destinations, because tour's code is generated basing on destinations" });
    }

    // For daily tours, validate dailyStartDate and dailyPrice
    if (daily && (!dailyStartDate || !dailyPrice)) {
      return res.status(400).json({ message: 'Daily tour requires start date and price' });
    }

    // For non-daily tours, validate availableDates
    if (!daily && !availableDates) {
      return res.status(400).json({ message: 'Non-daily tour requires available dates' });
    }

    // Generate unique code
    const codeUnique = places.length > 1
      ? `TOUR${parseInt(Math.random() * 100)}-${new Date(Date.now()).toLocaleDateString('FR-fr').replaceAll("/", "")}-${places[0].toUpperCase().slice(0, 3)}-${places[1].toUpperCase().slice(0, 3)}-${places[places.length - 1].toUpperCase().slice(0, 3)}`
      : `TOUR${parseInt(Math.random() * 100)}-${new Date(Date.now()).toLocaleDateString('FR-fr').replaceAll("/", "")}-${places[0].toUpperCase().slice(0, 3)}`;

    // Insert tour with daily and minSpots fields
    const [tourResult] = await pool.query(
      `INSERT INTO Tours (titre, descr, codeUnique, njours, img, places, type, daily, dateStart, minSpots, price) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        description,
        codeUnique,
        days,
        mainImage ? Buffer.from(mainImage, 'base64') : null,
        places.join(','),
        type,
        daily ? 1 : 0,
        daily ? dailyStartDate : null,
        minSpots,
        daily ? dailyPrice : null,
      ]
    );

    const tourId = tourResult.insertId;

    // Insert gallery images
    if (gallery && gallery.length > 0) {
      for (const img of gallery) {
        await pool.query(
          'INSERT INTO Imgs (tourID, contenu) VALUES (?, ?)',
          [tourId, Buffer.from(img.data, 'base64')]
        );
      }
    }

    // Insert program days
    for (const day of program) {
      await pool.query(
        'INSERT INTO Jours (tourID, titre, descr, inclus, places) VALUES (?, ?, ?, ?, ?)',
        [
          tourId,
          day.title,
          day.description,
          day.included.join(','),
          day.places.join(','),
        ]
      );
    }

    // Insert available dates only if NOT a daily tour
    if (!daily && availableDates && availableDates.length > 0) {
      for (const date of availableDates) {
        await pool.query(
          'INSERT INTO Dates (tourID, dateDeb, dateFin, ndispo, prix) VALUES (?, ?, ?, ?, ?)',
          [
            tourId,
            date.startDate,
            date.endDate,
            date.spots,
            date.price,
          ]
        );
      }
    }

    // Insert highlights
    for (const highlight of highlights) {
      await pool.query(
        'INSERT INTO Highlights (tourID, titre, texte) VALUES (?, ?, ?)',
        [
          tourId,
          highlight.substring(0, 50),
          highlight,
        ]
      );
    }

    res.status(201).json({ success: true, tourId });
  } catch (error) {
    console.error('Erreur lors de l\'ajout du tour :', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }

}
