import React, { useEffect, useMemo, useState } from "react";

import Sidebar from "./components/Sidebar.jsx";
import Topbar from "./components/Topbar.jsx";
import CardViewer from "./components/CardViewer.jsx";
import AddCards from "./components/AddCards.jsx";

import { loadDecks, saveDecks } from "./lib/storage.js";
import { buildCardOrder, clamp, uid } from "./lib/utils.js";
import { seedDecks } from "./data/seed.js";

export default function App() {
    const [decks, setDecks] = useState(() => {
        const loaded = loadDecks();
        return loaded.length ? loaded : seedDecks();
    });

    const [activeDeckId, setActiveDeckId] = useState(() => decks[0]?.id ?? null);

    const [mode, setMode] = useState("cards"); // "cards" | "test"
    const [shuffle, setShuffle] = useState(true);
    const [query, setQuery] = useState("");

    const [index, setIndex] = useState(0);
    const [showBack, setShowBack] = useState(false);

    // Persist
    useEffect(() => saveDecks(decks), [decks]);

    const activeDeck = useMemo(
        () => decks.find((d) => d.id === activeDeckId) ?? null,
        [decks, activeDeckId]
    );

    const filteredCards = useMemo(() => {
        if (!activeDeck) return [];
        const q = query.trim().toLowerCase();
        if (!q) return activeDeck.cards;

        return activeDeck.cards.filter((c) => {
            const f = (c.front ?? "").toLowerCase();
            const b = (c.back ?? "").toLowerCase();
            const tags = Array.isArray(c.tags) ? c.tags.join(" ").toLowerCase() : "";
            return f.includes(q) || b.includes(q) || tags.includes(q);
        });
    }, [activeDeck, query]);

    const cardOrder = useMemo(() => {
        return buildCardOrder({
            cards: filteredCards,
            shuffle,
            seed: `${activeDeckId ?? "none"}|${query}`,
        });
    }, [filteredCards, shuffle, activeDeckId, query]);

    const currentCard = useMemo(() => {
        if (!activeDeck || cardOrder.length === 0) return null;
        const safeIndex = clamp(index, 0, cardOrder.length - 1);
        const id = cardOrder[safeIndex];
        return activeDeck.cards.find((c) => c.id === id) ?? null;
    }, [activeDeck, cardOrder, index]);

    const progress = useMemo(() => {
        if (!cardOrder.length) return 0;
        return Math.round(((index + 1) / cardOrder.length) * 100);
    }, [index, cardOrder.length]);

    // Reset viewer state when deck/query/order/mode changes
    useEffect(() => {
        setIndex(0);
        setShowBack(false);
    }, [activeDeckId, query, shuffle, mode]);

    function updateActiveDeck(updater) {
        setDecks((prev) => prev.map((d) => (d.id === activeDeckId ? updater(d) : d)));
    }

    // Deck ops
    function createDeck(name) {
        const trimmed = name.trim();
        if (!trimmed) return;
        const deck = { id: uid(), name: trimmed, cards: [] };
        setDecks((prev) => [deck, ...prev]);
        setActiveDeckId(deck.id);
    }

    function deleteDeck(id) {
        setDecks((prev) => prev.filter((d) => d.id !== id));
        if (activeDeckId === id) {
            const next = decks.find((d) => d.id !== id)?.id ?? null;
            setActiveDeckId(next);
        }
    }

    // Card ops
    function addCards(newCards) {
        if (!activeDeckId || newCards.length === 0) return;
        updateActiveDeck((d) => ({ ...d, cards: [...newCards, ...d.cards] }));
    }

    function deleteCard(cardId) {
        updateActiveDeck((d) => ({ ...d, cards: d.cards.filter((c) => c.id !== cardId) }));
    }

    // Export / Import JSON
    function exportJSON() {
        const data = JSON.stringify(decks, null, 2);
        const blob = new Blob([data], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "flashcards_decks.json";
        a.click();
        URL.revokeObjectURL(url);
    }

    function importJSON(file) {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            try {
                const parsed = JSON.parse(String(reader.result));
                if (!Array.isArray(parsed)) return;

                const cleaned = parsed
                    .filter((d) => d && d.id && d.name && Array.isArray(d.cards))
                    .map((d) => ({
                        id: String(d.id),
                        name: String(d.name),
                        cards: d.cards
                            .filter((c) => c && c.id && c.front && c.back)
                            .map((c) => ({
                                id: String(c.id),
                                front: String(c.front),
                                back: String(c.back),
                                tags: Array.isArray(c.tags) ? c.tags.map(String) : [],
                            })),
                    }));

                if (!cleaned.length) return;
                setDecks(cleaned);
                setActiveDeckId(cleaned[0].id);
            } catch {
                // ignore invalid json
            }
        };
        reader.readAsText(file);
    }

    // Viewer navigation
    function flip() {
        setShowBack((s) => !s);
    }
    function next() {
        if (!cardOrder.length) return;
        setIndex((i) => clamp(i + 1, 0, cardOrder.length - 1));
        setShowBack(false);
    }
    function prev() {
        if (!cardOrder.length) return;
        setIndex((i) => clamp(i - 1, 0, cardOrder.length - 1));
        setShowBack(false);
    }

    // Global hotkeys (ignore when typing)
    useEffect(() => {
        function onKeyDown(e) {
            const tag = (e.target?.tagName ?? "").toUpperCase();
            const typing = tag === "INPUT" || tag === "TEXTAREA";

            if (typing) return;

            if (e.key === " " || e.key === "Enter") {
                e.preventDefault();
                flip();
            } else if (e.key === "ArrowRight") next();
            else if (e.key === "ArrowLeft") prev();
        }

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cardOrder.length]);

    return (
        <div className="app">
            <Sidebar
                decks={decks}
                activeDeckId={activeDeckId}
                onSelectDeck={setActiveDeckId}
                onCreateDeck={createDeck}
                onDeleteDeck={deleteDeck}
            />

            <main className="main">
                <Topbar
                    deckName={activeDeck?.name ?? "Kein Deck"}
                    mode={mode}
                    onModeChange={setMode}
                    shuffle={shuffle}
                    onShuffleChange={setShuffle}
                    query={query}
                    onQueryChange={setQuery}
                    progress={progress}
                    onExportJSON={exportJSON}
                    onImportJSON={importJSON}
                />

                <section className="panel">
                    <CardViewer
                        mode={mode}
                        cardsCount={cardOrder.length}
                        index={index}
                        card={currentCard}
                        showBack={showBack}
                        onFlip={flip}
                        onNext={next}
                        onPrev={prev}
                        onDeleteCard={deleteCard}
                    />
                </section>

                <section className="panel">
                    <AddCards onAddCards={addCards} />
                </section>
            </main>
        </div>
    );
}
