const LS_KEY = "flashcards_decks_v1";

export function loadDecks() {
    try {
        const raw = localStorage.getItem(LS_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

export function saveDecks(decks) {
    try {
        localStorage.setItem(LS_KEY, JSON.stringify(decks));
    } catch {
        // ignore
    }
}
