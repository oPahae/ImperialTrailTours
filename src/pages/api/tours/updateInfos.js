import pool from '../_lib/connect';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Méthode non autorisée' });
    }

    const { id, code, title, type, days, minSpots, description, daily, dailyStartDate, dailyPrice } = req.body;

    if (!id) {
        return res.status(400).json({ message: 'ID du tour requis' });
    }

    const conn = await pool.getConnection();

    try {
        await conn.query(`
            UPDATE Tours SET
            titre = ?,
            descr = ?,
            codeUnique = ?,
            type = ?,
            njours = ?,
            minSpots = ?,
            dateStart = ?,
            price = ?
            WHERE id = ?
        `, [
            title,
            description,
            code,
            type,
            days,
            minSpots,
            daily ? dailyStartDate : null,
            daily ? dailyPrice : null,
            id
        ]);

        res.status(200).json({ success: true, message: 'Informations générales mises à jour' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur', error: error.message });

    } finally {
        if (conn) conn.release();
    }
}
