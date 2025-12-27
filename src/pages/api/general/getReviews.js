import pool from '../_lib/connect';

export default async function handler(req, res) {
    try {
        const [reviews] = await pool.query("SELECT id, nom as name, dateR as date, contenu as text, netoiles as rating FROM Reviews");
        return res.status(200).json(reviews);
    } catch (err) {
        console.log(err);
        return res.status(500).json(err);
    }
}