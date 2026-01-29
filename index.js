const express = require('express');
require('dotenv').config();

// Importa le tue rotte
const newsRoutes = require('./routes/newsRoutes');
const chatRoutes = require('./routes/chatRoutes');
const newsletterRoutes = require('./routes/newsletterRoutes');
const { checkHortusActiveWindow, formatTimeInZone } = require('./services/timeService');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json()); 

const cors = require('cors');
app.use(cors());


app.get('/', (req, res) => {
    res.send(`
        <div style="font-family: monospace; text-align: center; margin-top: 50px;">
            <h1>🌿 Hortus Backend</h1>
            <p>Il server è attivo.</p>
            <a href="/debug">Vai alla Control Room</a>
        </div>
    `);
});

app.get('/debug', (req, res) => {
    const isDebug = isDebugActive();
    const statusColor = isDebug ? '#4CAF50' : '#f44336';
    const statusText = isDebug ? 'ATTIVO (FORZATO)' : 'DISATTIVO (STANDARD)';

    res.send(`
        <html>
            <body style="font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; background: #f0f0f0;">
                <div style="background: white; padding: 40px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); text-align: center;">
                    <h1>🛠 Hortus Control Room</h1>
                    <p>Stato attuale del Debug Mode:</p>
                    <h2 style="color: ${statusColor}; font-size: 24px; border: 2px solid ${statusColor}; padding: 10px; border-radius: 5px;">
                        ${statusText}
                    </h2>
                    
                    <form action="/debug/toggle" method="POST" style="margin-top: 20px;">
                        <button type="submit" style="cursor: pointer; padding: 15px 30px; font-size: 18px; background: #333; color: white; border: none; border-radius: 5px;">
                            ${isDebug ? 'SPEGNI DEBUG' : 'ACCENDI DEBUG'}
                        </button>
                    </form>
                    
                    <p style="margin-top: 30px; color: #666; font-size: 12px;">
                        Nota: Se attivi il debug, il sito risponderà sempre come se fosse l'orario attivo, <br>
                        ignorando l'algoritmo temporale reale.
                    </p>
                    <a href="/" style="color: #333;">Torna alla Home</a>
                </div>
            </body>
        </html>
    `);
});

app.post('/debug/toggle', (req, res) => {
    toggleDebug();
    res.redirect('/debug');
});

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

app.use('/api/chat', chatRoutes);

app.use('/api/newsletter', newsletterRoutes);


app.listen(PORT, () => {
    console.log(`🚀 Server backend in ascolto sulla porta ${PORT}`);
    console.log(`   Endpoint Notizie: http://localhost:${PORT}/api/notizie/world`);
    console.log(`   Endpoint Chat (usa POST): http://localhost:${PORT}/api/chat`);
});