// 1. Importa le librerie
const express = require('express');
const axios = require('axios');
const Anthropic = require('@anthropic-ai/sdk');
require('dotenv').config(); // Carica le variabili dal file .env
const fs = require('fs'); // Aggiunto File System per leggere file
const path = require('path'); // Aggiunto Path per gestire percorsi file

// 2. Inizializzazione
const app = express();
const PORT = process.env.PORT || 3001; 

// 3. Prendi le API key dal file .env
const NYT_API_KEY = process.env.NYT_API_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

// Controlla che le chiavi siano caricate
if (!NYT_API_KEY || !ANTHROPIC_API_KEY) {
    console.error("ERRORE: API key mancanti. Assicurati di aver creato il file .env");
    process.exit(1); 
}

// 4. Inizializza il client di Anthropic (Haiku)
const anthropic = new Anthropic({
    apiKey: ANTHROPIC_API_KEY,
});

// ===============================================================
// NUOVO: Carica il template del prompt dal file
// ===============================================================
const promptTemplatePath = path.join(__dirname, 'prompt_template.txt');
let PROMPT_TEMPLATE;
try {
    PROMPT_TEMPLATE = fs.readFileSync(promptTemplatePath, 'utf8');
    console.log("Template del prompt caricato con successo.");
} catch (error) {
    console.error(`ERRORE: Impossibile leggere il file 'prompt_template.txt'. Assicurati che esista.`, error);
    process.exit(1);
}

// ===============================================================
// FUNZIONE 1: Chiamare l'API del New York Times (invariata)
// ===============================================================
async function getTopStories(section) {
    const url = `https://api.nytimes.com/svc/topstories/v2/${section}.json`;
    const params = { 'api-key': NYT_API_KEY };

    console.log(`Sto chiamando l'API NYT per la sezione: ${section}`);

    try {
        const response = await axios.get(url, { params });
        return response.data.results; 
    } catch (error) {
        console.error(`Errore nel chiamare NYT API: ${error.message}`);
        return null;
    }
}

// ===============================================================
// FUNZIONE 2: Chiamare l'API di Haiku (MODIFICATA per ARRAY JSON)
// ===============================================================
async function analyzeWithHaiku(articles) {
    
    // Formattiamo gli articoli per includere l'ID numerico (l'indice)
    // come richiesto nel nuovo prompt
    const formattedArticles = articles
        .filter(article => article.title && article.abstract) // Filtra articoli vuoti
        .slice(0, 20) // Prendiamo solo i primi 20
        .map((article, index) => {
            // Usiamo (index + 1) come id_notizia
            return `${index + 1}. Titolo: ${article.title}\n   Abstract: ${article.abstract}\n`;
        }).join('\n'); // Separiamo gli articoli

    // Inseriamo gli articoli nel template
    const finalPrompt = PROMPT_TEMPLATE.replace('{{ARTICOLI_QUI}}', formattedArticles);

    console.log("Sto chiamando l'API di Haiku per l'analisi (per-articolo)...");

    try {
        const message = await anthropic.messages.create({
            model: "claude-3-haiku-20240307",
            max_tokens: 4096, // Aumentiamo i token per sicurezza, un array è lungo
            messages: [
                {
                    role: "user",
                    content: finalPrompt
                }
            ]
        });

        // Estraiamo il testo (che dovrebbe essere SOLO un array JSON)
        const jsonResponseText = message.content[0].text;
        
        // Trasformiamo il testo JSON in un vero array JavaScript
        try {
            const parsedJsonArray = JSON.parse(jsonResponseText);
            return parsedJsonArray; // Ora questo è un array [ {...}, {...} ]
        } catch (parseError) {
            console.error("Errore nel PARSING JSON dalla risposta di Haiku:", parseError);
            console.log("Risposta ricevuta da Haiku (non è JSON valido):", jsonResponseText);
            return { error: "L'IA non ha restituito un JSON array valido." };
        }

    } catch (error) {
        console.error(`Errore nel chiamare Anthropic API: ${error.message}`);
        return { error: "Errore durante la chiamata all'IA." };
    }
}

// ===============================================================
// L'ENDPOINT API CHE IL TUO REACT CHIAMERÀ (MODIFICATO)
// ===============================================================
app.get('/api/notizie/:section', async (req, res) => {
    
    const { section } = req.params;
    const articles = await getTopStories(section);

    if (!articles) {
        return res.status(500).json({ error: "Impossibile recuperare le notizie dal NYT." });
    }
    
    // Ora 'analysis' sarà un oggetto JSON
    const analysis = await analyzeWithHaiku(articles);

    if (analysis.error) {
        // Se c'è stato un errore nell'IA o nel parsing, lo inoltriamo
        return res.status(500).json(analysis);
    }

    // Invia la risposta finale al tuo frontend React
    res.json({
        sorgente: "API Backend Node.js",
        sezione: section,
        analisi_ia: analysis, // 'analysis' è GIÀ un oggetto JSON
        articoli: articles 
    });
});

// ===============================================================
// AVVIO DEL SERVER (invariato)
// ===============================================================
app.listen(PORT, () => {
    console.log(`🚀 Server backend in ascolto sulla porta ${PORT}`);
    console.log(`Testa l'endpoint su: http://localhost:${PORT}/api/notizie/world`);
});