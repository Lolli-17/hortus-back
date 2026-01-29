const express = require('express');
const router = express.Router();
const { getTopStories } = require('../services/nytService');
const { analyzeNewsSentiment } = require('../services/haikuService');
const { checkHortusActiveWindow } = require('../services/timeService');
const { isDebugActive } = require('../services/debugService');

let cache = {
    data: null,      // Qui salviamo la risposta pronta
    lastFetch: 0,    // Quando l'abbiamo salvata
    section: null,    // Per quale sezione (es. "world")
    wasActive: false
};
const CACHE_DURATION = 10 * 60 * 1000; // 10 minuti in millisecondi

router.get('/:section', async (req, res) => {
    const { section } = req.params;
    const now = Date.now();

    const hortusStatus = checkHortusActiveWindow();
    const queryDebug = req.query.debug === 'true';
    const globalDebug = isDebugActive(); 
    
    const currentIsActive = hortusStatus.isActive || queryDebug || globalDebug;

    if (cache.data && 
        cache.section === section && 
        (now - cache.lastFetch < CACHE_DURATION) &&
        cache.wasActive === currentIsActive
    ) {
        console.log("🚀 CACHE HIT: Restituisco dati salvati istantaneamente.");
        
        const currentStatus = checkHortusActiveWindow();
        
        if(cache.data.hortus_active !== currentStatus.isActive) {
             console.log("🔄 Cambio di stato (Attivo/Dormiente): Ricarico tutto.");
        } else {
             return res.json(cache.data);
        }
    }

    console.log("🐢 CACHE MISS: Devo scaricare notizie e interrogare l'IA...");

    const articles = await getTopStories(section);
    if (!articles) return res.status(500).json({ error: "No NYT" });

    let analysis;

    if (globalDebug) console.log("⚠️ DEBUG GLOBALE ATTIVO: Forzo stato attivo.");

    if (currentIsActive) {
        console.log("⚡️ HORTUS ATTIVO: Sto chiamando l'IA per l'analisi...");
        analysis = await analyzeNewsSentiment(articles);
    } else {
        console.log("zzz HORTUS DORMIENTE: Restituisco analisi neutra (costo zero).");
        
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
            individual_analysis: [] 
        };
    }

    if (analysis.error) {
        return res.status(500).json(analysis);
    }

	const responseData = {
        source: "API Backend Node.js",
        hortus_active: currentIsActive, 
        section: section,
        ai_analysis: analysis,
    };

    cache = {
        data: responseData,
        lastFetch: now,
        section: section,
        wasActive: currentIsActive,
    };

    res.json(responseData);
});

module.exports = router;