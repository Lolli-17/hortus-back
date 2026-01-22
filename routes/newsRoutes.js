const express = require('express');
const router = express.Router();
const { getTopStories } = require('../services/nytService');
const { analyzeNewsSentiment } = require('../services/haikuService');
const { checkHortusActiveWindow } = require('../services/timeService');

router.get('/:section', async (req, res) => {
    const { section } = req.params;
    
    // 1. Controlliamo se è il momento magico
    // '?debug=true' forza l'attivazione per i test
    const forceActive = req.query.debug === 'true'; 
    const hortusStatus = checkHortusActiveWindow();
    const isModeActive = hortusStatus.isActive || forceActive;

    // 2. Scarichiamo comunque le notizie (serve per sapere che "c'è qualcosa", 
    // oppure potresti saltare anche questo se vuoi risparmiare chiamate al NYT)
    const articles = await getTopStories(section);
    if (!articles) return res.status(500).json({ error: "No NYT" });

    let analysis;

    // 3. LOGICA CONDIZIONALE: Chiamiamo Haiku SOLO se è attivo
    if (isModeActive) {
        console.log("⚡️ HORTUS ATTIVO: Sto chiamando l'IA per l'analisi...");
        analysis = await analyzeNewsSentiment(articles);
    } else {
        console.log("zzz HORTUS DORMIENTE: Restituisco analisi neutra (costo zero).");
        
        // Creiamo un oggetto "finto" che rispetta la struttura che il Frontend si aspetta
        analysis = {
            general_analysis: {
                overall_sentiment: "Calma", // O "Neutro"
                average_negativity_score: 0,
                dominant_category: "Nessuna"
            },
            cryptic_thoughts: [
                "Il giardino riposa.",
                "Le voci del mondo sono lontane.",
                "Tutto è immobile sotto la luce."
            ],
            // Restituiamo un array vuoto o mappiamo gli articoli senza sentiment
            individual_analysis: [] 
        };
    }

    // 4. Gestione errori (solo se l'IA ha fallito nel caso attivo)
    if (analysis.error) {
        return res.status(500).json(analysis);
    }

    // 5. Risposta al Frontend
    res.json({
        source: "API Backend Node.js",
        hortus_active: isModeActive, 
        section: section,
        ai_analysis: analysis,
    });
});

module.exports = router;