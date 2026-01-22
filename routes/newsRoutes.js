const express = require('express');
const router = express.Router();
const { getTopStories } = require('../services/nytService');
const { analyzeNewsSentiment } = require('../services/haikuService');
const { checkHortusActiveWindow } = require('../services/timeService');

// --- VARIABILI PER LA CACHE ---
let cache = {
    data: null,      // Qui salviamo la risposta pronta
    lastFetch: 0,    // Quando l'abbiamo salvata
    section: null    // Per quale sezione (es. "world")
};
const CACHE_DURATION = 10 * 60 * 1000; // 10 minuti in millisecondi

router.get('/:section', async (req, res) => {
    const { section } = req.params;
    const now = Date.now();
    
    // 1. CONTROLLO CACHE: Se abbiamo dati freschi (meno di 10 min) per la stessa sezione, usiamoli!
    if (cache.data && cache.section === section && (now - cache.lastFetch < CACHE_DURATION)) {
        console.log("🚀 CACHE HIT: Restituisco dati salvati istantaneamente.");
        
        // Ricalcoliamo solo lo stato attivo/inattivo per essere precisi al secondo
        // (La cache contiene le notizie e l'analisi IA, ma l'orario cambia)
        const currentStatus = checkHortusActiveWindow();
        
        // Se lo stato di attivazione nella cache è diverso da quello attuale, invalida la cache
        if(cache.data.hortus_active !== currentStatus.isActive) {
             console.log("🔄 Cambio di stato (Attivo/Dormiente): Ricarico tutto.");
             // Non facciamo nulla qui, il codice proseguirà sotto a ricaricare
        } else {
             return res.json(cache.data);
        }
    }

    // --- SE NON C'È CACHE, ESEGUIAMO IL LAVORO PESANTE ---
    console.log("🐢 CACHE MISS: Devo scaricare notizie e interrogare l'IA...");

    const forceActive = req.query.debug === 'true'; 
    const hortusStatus = checkHortusActiveWindow();
    const isModeActive = hortusStatus.isActive || forceActive;

    const articles = await getTopStories(section);
    if (!articles) return res.status(500).json({ error: "No NYT" });

    let analysis;

    if (isModeActive) {
        analysis = await analyzeNewsSentiment(articles);
    } else {
        analysis = {
            analisi_generale: {
                sentiment_complessivo: "Calma",
                media_score_negatività: 0,
                categoria_dominante: "Nessuna"
            },
            pensieri_criptici: [
                "Il giardino riposa.",
                "Le voci del mondo sono lontane.",
                "Tutto è immobile sotto la luce."
            ],
            analisi_individuale: [] 
        };
    }

    if (analysis.error) return res.status(500).json(analysis);

    // Costruiamo la risposta
    const responseData = {
        sorgente: "API Backend Node.js",
        hortus_active: isModeActive, 
        sezione: section,
        analisi_ia: analysis,
    };

    // 2. SALVIAMO IN CACHE
    cache = {
        data: responseData,
        lastFetch: now,
        section: section
    };

    res.json(responseData);
});

module.exports = router;