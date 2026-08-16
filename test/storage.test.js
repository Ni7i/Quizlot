import assert from "node:assert/strict";
import test from "node:test";

import { seedDecks } from "../src/data/seed.js";
import {
    getDecksStorageKey,
    getOrCreateOwnerId,
    loadDecks,
    saveDecks,
} from "../src/lib/storage.js";

class MemoryStorage {
    #values = new Map();

    getItem(key) {
        return this.#values.has(key) ? this.#values.get(key) : null;
    }

    setItem(key, value) {
        this.#values.set(key, String(value));
    }

    removeItem(key) {
        this.#values.delete(key);
    }
}

test("each browser keeps a stable, distinct anonymous identity", () => {
    const firstBrowser = new MemoryStorage();
    const secondBrowser = new MemoryStorage();

    const firstOwner = getOrCreateOwnerId(firstBrowser);
    const secondOwner = getOrCreateOwnerId(secondBrowser);

    assert.equal(getOrCreateOwnerId(firstBrowser), firstOwner);
    assert.notEqual(secondOwner, firstOwner);
    assert.deepEqual(seedDecks()[0].cards, []);
});

test("owners cannot read or overwrite each other's decks", () => {
    const storage = new MemoryStorage();
    const firstDecks = [{ id: "deck-a", name: "A", cards: [] }];
    const secondDecks = [{ id: "deck-b", name: "B", cards: [] }];

    saveDecks("owner-a", firstDecks, storage);
    saveDecks("owner-b", secondDecks, storage);

    assert.deepEqual(loadDecks("owner-a", storage), firstDecks);
    assert.deepEqual(loadDecks("owner-b", storage), secondDecks);
    assert.notEqual(getDecksStorageKey("owner-a"), getDecksStorageKey("owner-b"));
});

test("existing decks survive the upgrade to owner-scoped storage", () => {
    const storage = new MemoryStorage();
    const legacyDecks = [{ id: "old-deck", name: "Alt", cards: [] }];
    storage.setItem("flashcards_decks_v1", JSON.stringify(legacyDecks));

    assert.deepEqual(loadDecks("owner-a", storage), legacyDecks);
    assert.equal(storage.getItem("flashcards_decks_v1"), null);
    assert.deepEqual(
        JSON.parse(storage.getItem(getDecksStorageKey("owner-a"))),
        legacyDecks,
    );
});
