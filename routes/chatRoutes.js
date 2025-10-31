const express = require('express');
const router = express.Router();
const { getChatResponse } = require('../services/haikuService');

// Usiamo POST perché l'utente INVIA dati (la cronologia della chat)
// Il percorso sarà '/api/chat'
router.post('/', async (req, res) => {
    
    // Il frontend invierà la cronologia dei messaggi nel "body"
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: "Il campo 'messages' è richiesto e deve essere un array." });
    }

    const aiResponse = await getChatResponse(messages);

    if (aiResponse.error) {
        return res.status(500).json(aiResponse);
    }
    
    // Invia la risposta dell'IA al frontend
    res.json({
        role: "assistant",
        content: aiResponse
    });
});

module.exports = router;