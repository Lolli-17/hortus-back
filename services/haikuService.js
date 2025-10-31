const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Inizializza il client QUI
const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

// Carica TUTTI i prompt qui
const PROMPT_NOTIZIE = fs.readFileSync(path.join(process.cwd(), 'prompt_template_notizie.txt'), 'utf8');
const PROMPT_CHAT = fs.readFileSync(path.join(process.cwd(), 'prompt_template_chat.txt'), 'utf8');


// Servizio 1: Analisi Sentiment Notizie
async function analyzeNewsSentiment(articles) {
    const formattedArticles = articles
        .filter(article => article.title && article.abstract)
        .slice(0, 20)
        .map((article, index) => {
            return `${index + 1}. Titolo: ${article.title}\n   Abstract: ${article.abstract}\n`;
        }).join('\n');

    const finalPrompt = PROMPT_NOTIZIE.replace('{{ARTICOLI_QUI}}', formattedArticles);

    console.log("Sto chiamando l'API di Haiku per l'analisi (per-articolo)...");

    try {
        const message = await anthropic.messages.create({
            model: "claude-3-haiku-20240307",
            max_tokens: 4096,
            messages: [{ role: "user", content: finalPrompt }]
        });

        const jsonResponseText = message.content[0].text;
        return JSON.parse(jsonResponseText); // Restituisce l'array JSON

    } catch (error) {
        console.error(`Errore nel chiamare Anthropic API (Sentiment): ${error.message}`);
        return { error: "Errore durante l'analisi IA.", details: error.message };
    }
}

// Servizio 2: Gestione Chat
async function getChatResponse(messageHistory) {
    console.log("Sto chiamando l'API di Haiku per la chat...");

    try {
        const message = await anthropic.messages.create({
            model: "claude-3-haiku-20240307",
            max_tokens: 1024,
            system: PROMPT_CHAT, // <-- Qui usiamo il prompt di sistema!
            messages: messageHistory // <-- Qui passiamo la cronologia
        });

        return message.content[0].text; // Restituisce la risposta di testo
        
    } catch (error) {
        console.error(`Errore nel chiamare Anthropic API (Chat): ${error.message}`);
        return { error: "Errore durante la chat con l'IA.", details: error.message };
    }
}

// Esportiamo entrambe le funzioni
module.exports = {
    analyzeNewsSentiment,
    getChatResponse
};