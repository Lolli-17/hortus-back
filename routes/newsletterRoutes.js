// routes/newsletterRoutes.js
const express = require('express');
const router = express.Router();
const { subscribeToMailerLite } = require('../services/newsletterService');

// POST /api/newsletter/subscribe
router.post('/subscribe', async (req, res) => {
    const { email } = req.body;

    // Validazione base
    if (!email || !email.includes('@')) {
        return res.status(400).json({ error: "Inserisci un indirizzo email valido." });
    }

    try {
        const result = await subscribeToMailerLite(email);
        
        console.log(`✅ Nuovo iscritto: ${email}`);
        res.status(200).json({ 
            success: true, 
            message: "Iscrizione avvenuta con successo!",
            data: result.data 
        });

    } catch (error) {
        console.error("❌ Errore MailerLite:", error.message);
        
        // Se l'errore è dovuto a dati non validi (es. email fake), restituisci 422
        // Altrimenti restituisci 500 (errore server)
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

module.exports = router;