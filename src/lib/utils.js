export function uid() {
    return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

export function clamp(n, a, b) {
    return Math.max(a, Math.min(b, n));
}

// Stable shuffle with seeded PRNG
function hashSeed(seed) {
    let h = 0;
    for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
    return h >>> 0;
}
function nextRand(state) {
    return (state * 1664525 + 1013904223) >>> 0;
}

export function buildCardOrder({ cards, shuffle, seed }) {
    const ids = cards.map((c) => c.id);
    if (!shuffle) return ids;

    let s = hashSeed(seed);
    const arr = [...ids];
    for (let i = arr.length - 1; i > 0; i--) {
        s = nextRand(s);
        const j = s % (i + 1);
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

// Parse lines: front;back OR front|back OR front<TAB>back
export function parseBulkLines(text) {
    const lines = text
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);

    const cards = [];
    for (const line of lines) {
        const sep = line.includes(";") ? ";" : line.includes("|") ? "|" : "\t";
        const parts = line.split(sep).map((s) => s.trim());
        const front = parts[0] ?? "";
        const back = parts.slice(1).join(" ").trim();
        if (!front || !back) continue;

        cards.push({
            id: uid(),
            front,
            back,
            tags: [],
        });
    }
    return cards;
}
