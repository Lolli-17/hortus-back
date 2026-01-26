// routes/newsletterRoutes.js
const express = require('express');
const router = express.Router();

const { subscribeToMailerLite } = require('../services/newsletterService');

router.post('/subscribe', async (req, res) => {
    const { email, attributes } = req.body;

    const name = attributes.FIRSTNAME
    const last_name = attributes.LASTNAME

    if (!email || !email.includes('@')) {
        return res.status(400).json({ error: "Inserisci un indirizzo email valido." });
    }

    try {
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