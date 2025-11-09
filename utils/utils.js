function isNatural(value) {
    return Number.isFinite(value)
        && Number.isInteger(value)
        && value >= 0;
}

function mergeTickets(tickets) {
    let parsed;
    try { parsed = JSON.parse(tickets); }
    catch (error) {
        console.error('Error durante el parseo: ', error);
        return [];
    }

    if(parsed.propios && parsed.ajenos && parsed.propios.length && parsed.ajenos.length) {
        const merged = [... parsed.propios, ... ajenos];

        merged.sort((a,b) => b.id - a.id);
        return merged;
    }

    if(parsed.propios?.length) return parsed.propios;
    if(parsed.ajenos?.length) return parsed.ajenos;

    return [];
}

function jsonToObject(value) {
    try { return JSON.parse(value); }
    catch { return value; }
}

function destroySession(req) {
    return new Promise((resolve, reject) => {
        req.session.destroy( error => {
            if (error) reject(error);
            else resolve();
        });
    });
}

module.exports = {
    destroySession,
    isNatural,
    jsonToObject,
    mergeTickets,
}