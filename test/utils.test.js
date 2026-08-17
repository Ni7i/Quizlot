import assert from "node:assert/strict";
import test from "node:test";

import {
    buildCardOrder,
    clamp,
    formatCardCount,
    normalizeAnswer,
    parseBulkLines,
} from "../src/lib/utils.js";

test("answer comparison ignores casing and repeated whitespace", () => {
    assert.equal(normalizeAnswer("  Die   Antwort\n"), "die antwort");
    assert.equal(normalizeAnswer("ＰＡＲＩＳ"), "paris");
});

test("bulk import accepts semicolons, pipes and tabs", () => {
    const cards = parseBulkLines("Frage 1;Antwort 1\nFrage 2|Antwort 2\nFrage 3\tAntwort 3");

    assert.equal(cards.length, 3);
    assert.deepEqual(
        cards.map(({ front, back, tags }) => ({ front, back, tags })),
        [
            { front: "Frage 1", back: "Antwort 1", tags: [] },
            { front: "Frage 2", back: "Antwort 2", tags: [] },
            { front: "Frage 3", back: "Antwort 3", tags: [] },
        ],
    );
});

test("shuffling is stable for a study session and keeps every card", () => {
    const cards = ["a", "b", "c", "d"].map((id) => ({ id }));
    const first = buildCardOrder({ cards, shuffle: true, seed: "deck-1" });
    const second = buildCardOrder({ cards, shuffle: true, seed: "deck-1" });

    assert.deepEqual(first, second);
    assert.deepEqual([...first].sort(), ["a", "b", "c", "d"]);
});

test("small display helpers handle edge cases", () => {
    assert.equal(formatCardCount(1), "1 Karte");
    assert.equal(formatCardCount(0), "0 Karten");
    assert.equal(clamp(12, 0, 5), 5);
});
