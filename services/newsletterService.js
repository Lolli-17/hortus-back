// services/newsletterService.js
require('dotenv').config();

const MAILERLITE_API_URL = 'https://connect.mailerlite.com/api/subscribers';

async function subscribeToMailerLite(email) {
    if (!process.env.MAILERLITE_API_KEY) {
        throw new Error("Manca la MAILERLITE_API_KEY nel file .env");
    }

    const response = await fetch(MAILERLITE_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.MAILERLITE_API_KEY}`,
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            "groups": ["177583144646477616"],
            email: email,
        })
    });

    // MailerLite restituisce 200 o 201 se va tutto bene
    if (!response.ok) {
        const errorData = await response.json();
        // Lancia un errore leggibile (es. "Email invalid" o "Already exists")
        throw new Error(errorData.message || 'Errore durante iscrizione MailerLite');
    }

    return await response.json();
}

module.exports = { subscribeToMailerLite };