// routes/newsletterRoutes.js
const express = require('express');
const router = express.Router();
// Importiamo la funzione aggiornata
const { subscribeToMailerLite } = require('../services/newsletterService');

// POST /api/newsletter/subscribe
router.post('/subscribe', async (req, res) => {
    // 1. Estraiamo tutti i dati inviati dal frontend
    // Il frontend manda: { email, name, last_name }
    const { email, name, last_name } = req.body;

    // Validazione base solo sull'email (nome e cognome potrebbero essere opzionali)
    if (!email || !email.includes('@')) {
        return res.status(400).json({ error: "Inserisci un indirizzo email valido." });
    }

    try {
        // 2. Passiamo tutto al servizio
        const result = await subscribeToMailerLite(email, name, last_name);
        
        console.log(`✅ Nuovo iscritto: ${email} (${name} ${last_name})`);
        res.status(200).json({ 
            success: true, 
            message: "Iscrizione avvenuta con successo!",
            data: result.data 
        });

    } catch (error) {
        console.error("❌ Errore MailerLite:", error.message);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

module.exports = router;