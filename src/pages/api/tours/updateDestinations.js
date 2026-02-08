import pool from '../_lib/connect';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Méthode non autorisée' });
    }

    const { id, places } = req.body;

    if (!id) {
        return res.status(400).json({ message: 'ID du tour requis' });
    }

    if (!Array.isArray(places)) {
        return res.status(400).json({ message: 'Places doit être un tableau' });
    }

    const conn = await pool.getConnection();

    try {
        await conn.query(`
            UPDATE Tours SET places = ? WHERE id = ?
        `, [
            places.join(','),
            id
        ]);

        res.status(200).json({ success: true, message: 'Destinations mises à jour' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur', error: error.message });

    } finally {
        if (conn) conn.release();
    }
}
