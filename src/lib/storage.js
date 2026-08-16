const OWNER_KEY = "quizlot_anonymous_owner_v1";
const DECKS_KEY_PREFIX = "quizlot_decks_v2:";
const LEGACY_DECKS_KEY = "flashcards_decks_v1";

function createAnonymousOwnerId() {
    if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
    return `anonymous-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

function parseDecks(raw) {
    if (!raw) return [];

    try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

export function getDecksStorageKey(ownerId) {
    return `${DECKS_KEY_PREFIX}${ownerId}`;
}

export function getOrCreateOwnerId(storage = globalThis.localStorage) {
    try {
        const existing = storage.getItem(OWNER_KEY);
        if (existing) return existing;

        const ownerId = createAnonymousOwnerId();
        storage.setItem(OWNER_KEY, ownerId);
        return ownerId;
    } catch {
        // Persistence may be unavailable in restricted/private browser contexts.
        return createAnonymousOwnerId();
    }
}

export function loadDecks(ownerId, storage = globalThis.localStorage) {
    try {
        const key = getDecksStorageKey(ownerId);
        const scopedDecks = storage.getItem(key);
        if (scopedDecks !== null) return parseDecks(scopedDecks);

        // Keep existing users' cards when upgrading from the old unscoped key.
        const legacyDecks = storage.getItem(LEGACY_DECKS_KEY);
        if (legacyDecks === null) return [];

        const decks = parseDecks(legacyDecks);
        storage.setItem(key, JSON.stringify(decks));
        storage.removeItem(LEGACY_DECKS_KEY);
        return decks;
    } catch {
        return [];
    }
}

export function saveDecks(ownerId, decks, storage = globalThis.localStorage) {
    try {
        storage.setItem(getDecksStorageKey(ownerId), JSON.stringify(decks));
    } catch {
        // The app remains usable for the current session if persistence is unavailable.
    }
}

export function listenForDeckChanges(ownerId, onChange) {
    if (typeof window === "undefined") return () => {};

    const storageKey = getDecksStorageKey(ownerId);
    const listener = (event) => {
        if (event.storageArea !== globalThis.localStorage || event.key !== storageKey) return;
        onChange(parseDecks(event.newValue));
    };

    window.addEventListener("storage", listener);
    return () => window.removeEventListener("storage", listener);
}
