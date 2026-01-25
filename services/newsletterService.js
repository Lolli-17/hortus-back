// services/newsletterService.js
require('dotenv').config();

const MAILERLITE_API_URL = 'https://connect.mailerlite.com/api/subscribers';

// Aggiorniamo la firma della funzione per accettare anche nome e cognome
async function subscribeToMailerLite(email, name, lastName) {
    if (!process.env.MAILERLITE_API_KEY) {
        throw new Error("Manca la MAILERLITE_API_KEY nel file .env");
    }

    // Costruiamo il payload ESATTO richiesto da MailerLite
    const payload = {
        email: email,
        fields: {
            name: name || "",       // Se null/undefined, manda stringa vuota
            last_name: lastName || "" 
        },
        groups: ["177583144646477616"], // Il tuo ID gruppo
        status: "active" // Come richiesto dal tuo esempio
    };

    const response = await fetch(MAILERLITE_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.MAILERLITE_API_KEY}`,
            'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Errore durante iscrizione MailerLite');
    }

    return await response.json();
}

module.exports = { subscribeToMailerLite };