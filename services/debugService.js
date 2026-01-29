// services/debugService.js

// Questa variabile vive nella memoria del server finché non si riavvia
let globalDebugMode = false;

function isDebugActive() {
    return globalDebugMode;
}

function setDebugActive(value) {
    globalDebugMode = value;
}

function toggleDebug() {
    globalDebugMode = !globalDebugMode;
    return globalDebugMode;
}

module.exports = { isDebugActive, setDebugActive, toggleDebug };