import pool from '../_lib/connect';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Méthode non autorisée' });
    }

    const { id } = req.query;

    if (!id) {
        return res.status(400).json({ message: 'ID du tour requis' });
    }

    const conn = await pool.getConnection();

    try {
        // Get tour title
        const [tourRows] = await conn.query(
            'SELECT titre FROM Tours WHERE id = ?',
            [id]
        );

        if (tourRows.length === 0) {
            return res.status(404).json({ message: 'Tour non trouvé' });
        }

        // Get gallery images
        const [imgRows] = await conn.query(
            'SELECT contenu FROM Imgs WHERE tourID = ? ORDER BY id',
            [id]
        );

        const gallery = imgRows.map(row => {
            const base64 = row.contenu.toString('base64');
            return `data:image/jpeg;base64,${base64}`;
        });

        res.status(200).json({
            success: true,
            tourId: id,
            title: tourRows[0].titre,
            gallery
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur', error: error.message });

    } finally {
        if (conn) conn.release();
    }
}