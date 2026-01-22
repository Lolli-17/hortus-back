function checkHortusActiveWindow() {
    const now = new Date();
    const dateString = now.toISOString().split('T')[0];

    let seed = 0;
    for (let i = 0; i < dateString.length; i++) {
        seed = ((seed << 5) - seed) + dateString.charCodeAt(i);
        seed |= 0;
    }
    seed = Math.abs(seed);

    const startMinuteOfDay = seed % 1430; 
    const currentMinuteOfDay = (now.getUTCHours() * 60) + now.getUTCMinutes();
    const isActive = currentMinuteOfDay >= startMinuteOfDay && currentMinuteOfDay < (startMinuteOfDay + 10);

    return {
        isActive: isActive,
        startMinute: startMinuteOfDay,
        currentMinute: currentMinuteOfDay
    };
}

function formatTimeInZone(utcMinutes, timeZone) {
    const date = new Date();
    date.setUTCHours(Math.floor(utcMinutes / 60));
    date.setUTCMinutes(utcMinutes % 60);
    return date.toLocaleTimeString('en-GB', {
        timeZone: timeZone,
        hour: '2-digit',
        minute: '2-digit'
    });
}

module.exports = { checkHortusActiveWindow, formatTimeInZone };