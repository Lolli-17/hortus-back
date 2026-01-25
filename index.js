const express = require('express');
require('dotenv').config();

// Importa le tue rotte
const newsRoutes = require('./routes/newsRoutes');
const chatRoutes = require('./routes/chatRoutes');
const newsletterRoutes = require('./routes/newsletterRoutes');
const { checkHortusActiveWindow, formatTimeInZone } = require('./services/timeService');

const app = express();
const PORT = process.env.PORT || 3001;

// --- MIDDLEWARE ---
// Abilita il server a leggere JSON inviati nel "body"
// FONDAMENTALE per la chat!
app.use(express.json()); 

// Abilita CORS (Accesso da altri domini)
// FONDAMENTALE perché il tuo React (su Netlify) chiami questa API (su Render)
const cors = require('cors');
app.use(cors());


// --- REGISTRAZIONE DELLE ROTTE ---
// Collega il router delle notizie al percorso /api/notizie
app.use('/api/notizie', newsRoutes);

app.get("/health", (req, res) => {
    res.status(200).send("OK (Server is awake!)");
});

app.get("/status", (req, res) => {
    const status = checkHortusActiveWindow();
    const romeZone = 'Europe/Rome';
    const utcZone = 'UTC';

    const startUtc = formatTimeInZone(status.startMinute, utcZone);
    const endUtc = formatTimeInZone(status.startMinute + 10, utcZone);
    const startIt = formatTimeInZone(status.startMinute, romeZone);
    const endIt = formatTimeInZone(status.startMinute + 10, romeZone);

    const now = new Date();
    const nowUtc = now.toLocaleTimeString('en-GB', { timeZone: utcZone, hour: '2-digit', minute: '2-digit' });
    const nowIt = now.toLocaleTimeString('en-GB', { timeZone: romeZone, hour: '2-digit', minute: '2-digit' });

    res.json({
        is_active: status.isActive,
        current_time: { utc: nowUtc, italy: nowIt },
        active_window: {
            duration_minutes: 10,
            utc: { start: startUtc, end: endUtc },
            italy: { start: startIt, end: endIt }
        },
        message: status.isActive ? "SYSTEM ACTIVE ⚡️" : `System sleeping.`
    });
});

// Collega il router della chat al percorso /api/chat
app.use('/api/chat', chatRoutes);

app.use('/api/newsletter', newsletterRoutes);


// --- AVVIO DEL SERVER ---
app.listen(PORT, () => {
    console.log(`🚀 Server backend in ascolto sulla porta ${PORT}`);
    console.log(`   Endpoint Notizie: http://localhost:${PORT}/api/notizie/world`);
    console.log(`   Endpoint Chat (usa POST): http://localhost:${PORT}/api/chat`);
});