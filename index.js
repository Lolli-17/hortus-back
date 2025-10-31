const express = require('express');
require('dotenv').config();

// Importa le tue rotte
const newsRoutes = require('./routes/newsRoutes');
const chatRoutes = require('./routes/chatRoutes');

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

// Collega il router della chat al percorso /api/chat
app.use('/api/chat', chatRoutes);


// --- AVVIO DEL SERVER ---
app.listen(PORT, () => {
    console.log(`🚀 Server backend in ascolto sulla porta ${PORT}`);
    console.log(`   Endpoint Notizie: http://localhost:${PORT}/api/notizie/world`);
    console.log(`   Endpoint Chat (usa POST): http://localhost:${PORT}/api/chat`);
});