const express = require('express');
const router = express.Router();
const { getTopStories } = require('../services/nytService');
const { analyzeNewsSentiment } = require('../services/haikuService');

// Nota: il percorso è ora '/' perché '/api/notizie' sarà gestito in index.js
router.get('/:section', async (req, res) => {
    
    const { section } = req.params;
    const articles = await getTopStories(section);

    if (!articles) {
        return res.status(500).json({ error: "Impossibile recuperare le notizie dal NYT." });
    }
    
    const analysis = await analyzeNewsSentiment(articles);

    if (analysis.error) {
        return res.status(500).json(analysis);
    }

    res.json({
        sorgente: "API Backend Node.js",
        sezione: section,
        analisi_ia: analysis,
        articoli: articles 
    });
});

module.exports = router;