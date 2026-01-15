const express = require('express');
const router = express.Router();
const { getTopStories } = require('../services/nytService');
const { analyzeNewsSentiment } = require('../services/haikuService');

function checkHortusActiveWindow() {
    const now = new Date();
    
    // Convertiamo l'ora in UTC per evitare problemi di fuso orario
    // Creiamo una stringa univoca per oggi: "2023-10-25"
    const dateString = now.toISOString().split('T')[0];

    // --- MAGIA DEL "CASO DETERMINISTICO" ---
    // Trasformiamo la stringa della data in un numero
    let seed = 0;
    for (let i = 0; i < dateString.length; i++) {
        seed = ((seed << 5) - seed) + dateString.charCodeAt(i);
        seed |= 0; // Converte in 32bit integer
    }
    
    // Rendiamo il numero positivo
    seed = Math.abs(seed);

    // Ci sono 1440 minuti in un giorno.
    // Usiamo il seed per scegliere un minuto di inizio (tra 0 e 1430)
    const startMinuteOfDay = seed % 1430; 
    
    // Calcoliamo il minuto attuale del giorno (es. 14:00 = 840)
    const currentMinuteOfDay = (now.getUTCHours() * 60) + now.getUTCMinutes();

    // Controlliamo se siamo nei 10 minuti fortunati
    const isActive = currentMinuteOfDay >= startMinuteOfDay && currentMinuteOfDay < (startMinuteOfDay + 10);

    return {
        isActive: isActive,
        startMinute: startMinuteOfDay, // Solo per debug
        currentMinute: currentMinuteOfDay // Solo per debug
    };
}

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