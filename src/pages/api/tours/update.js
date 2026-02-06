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

    const tourData = req.body;
    const conn = await pool.getConnection();

    try {
        await conn.beginTransaction();

        await conn.query(`
            UPDATE Tours SET
            titre = ?,
            descr = ?,
            codeUnique = ?,
            type = ?,
            njours = ?,
            img = ?,
            places = ?,
            minSpots = ?,
            dateStart = ?,
            price = ?
            WHERE id = ?
        `, [
            tourData.title,
            tourData.description,
            tourData.code,
            tourData.type,
            tourData.days,
            tourData.image
                ? Buffer.from(tourData.image.split(',')[1], 'base64')
                : null,
            tourData.places.join(','),
            tourData.minSpots,
            tourData.daily ? tourData.dailyStartDate : null,
            tourData.daily ? tourData.dailyPrice : null,
            tourData.id
        ]);

        // Gallery
        await conn.query('DELETE FROM Imgs WHERE tourID = ?', [tourData.id]);
        for (const img of tourData.gallery || []) {
            if (!img?.startsWith('data:image')) continue;
            await conn.query(
                'INSERT INTO Imgs (tourID, contenu) VALUES (?, ?)',
                [tourData.id, Buffer.from(img.split(',')[1], 'base64')]
            );
        }

        // Program
        await conn.query('DELETE FROM Jours WHERE tourID = ?', [tourData.id]);
        for (const day of tourData.program) {
            await conn.query(
                'INSERT INTO Jours (tourID, titre, descr, inclus, places) VALUES (?, ?, ?, ?, ?)',
                [tourData.id, day.title, day.description, day.included.join(','), day.places.join(',')]
            );
        }

        // Highlights
        await conn.query('DELETE FROM Highlights WHERE tourID = ?', [tourData.id]);
        for (const h of tourData.highlights) {
            await conn.query(
                'INSERT INTO Highlights (tourID, titre, texte) VALUES (?, ?, ?)',
                [tourData.id, h.substring(0, 50), h]
            );
        }

        // Dates (si pas daily)
        if (!tourData.daily) {
            await conn.query('DELETE FROM Dates WHERE tourID = ?', [tourData.id]);
            for (const d of tourData.availableDates) {
                await conn.query(
                    'INSERT INTO Dates (tourID, dateDeb, dateFin, prix, ndispo) VALUES (?, ?, ?, ?, ?)',
                    [tourData.id, d.startDate, d.endDate, d.price, d.spots]
                );
            }
        }

        await conn.commit();
        res.status(200).json({ success: true });

    } catch (error) {
        if (conn) {
            try {
                await conn.rollback();
            } catch (_) {
                console.error('Rollback impossible (connexion déjà fermée)');
            }
        }
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur', error: error.message });

    } finally {
        if (conn) conn.release();
    }
}