const axios = require('axios');
require('dotenv').config();

const NYT_API_KEY = process.env.NYT_API_KEY;

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

// Esportiamo la funzione per usarla altrove
module.exports = { getTopStories };