const express = require('express');
const router = express.Router();
const { getTopStories } = require('../services/nytService');
const { analyzeNewsSentiment } = require('../services/haikuService');

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
            analisi_generale: {
                sentiment_complessivo: "Calma", // O "Neutro"
                media_score_negatività: 0,
                categoria_dominante: "Nessuna"
            },
            pensieri_criptici: [
                "Il giardino riposa.",
                "Le voci del mondo sono lontane.",
                "Tutto è immobile sotto la luce."
            ],
            // Restituiamo un array vuoto o mappiamo gli articoli senza sentiment
            analisi_individuale: [] 
        };
    }

    // 4. Gestione errori (solo se l'IA ha fallito nel caso attivo)
    if (analysis.error) {
        return res.status(500).json(analysis);
    }

    // 5. Risposta al Frontend
    res.json({
        sorgente: "API Backend Node.js",
        hortus_active: isModeActive, 
        sezione: section,
        analisi_ia: analysis,
    });
});

module.exports = router;