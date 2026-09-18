import React, { useEffect, useMemo, useState } from "react";
import { BookOpen, Plus, RotateCcw } from "lucide-react";

import AddCards from "./components/AddCards.jsx";
import CardViewer from "./components/CardViewer.jsx";
import ConfirmDialog from "./components/ConfirmDialog.jsx";
import Sidebar from "./components/Sidebar.jsx";
import Topbar, { StudyControls } from "./components/Topbar.jsx";
import { seedDecks } from "./data/seed.js";
import {
    getOrCreateOwnerId,
    listenForDeckChanges,
    loadDecks,
    saveDecks,
} from "./lib/storage.js";
import { buildCardOrder, clamp, uid } from "./lib/utils.js";

function cleanImportedDecks(value) {
    if (!Array.isArray(value)) return [];

    return value
        .filter((deck) => deck?.id && deck?.name && Array.isArray(deck.cards))
        .map((deck) => ({
            id: String(deck.id),
            name: String(deck.name),
            cards: deck.cards
                .filter((card) => card?.id && card?.front && card?.back)
                .map((card) => ({
                    id: String(card.id),
                    front: String(card.front),
                    back: String(card.back),
                    tags: Array.isArray(card.tags) ? card.tags.map(String) : [],
                })),
        }))
        .filter((deck) => deck.name.trim());
}

export default function App() {
    const [ownerId] = useState(() => getOrCreateOwnerId());
    const [decks, setDecks] = useState(() => {
        const loaded = loadDecks(ownerId);
        return loaded.length ? loaded : seedDecks();
    });
    const [selectedDeckId, setActiveDeckId] = useState(() => decks[0]?.id ?? null);
    const [mode, setMode] = useState("learn");
    const [shuffle, setShuffle] = useState(false);
    const [query, setQuery] = useState("");
    const [index, setIndex] = useState(0);
    const [showBack, setShowBack] = useState(false);
    const [composerOpen, setComposerOpen] = useState(false);
    const [deckPendingDelete, setDeckPendingDelete] = useState(null);
    const [undo, setUndo] = useState(null);
    const [notice, setNotice] = useState(null);

    useEffect(() => saveDecks(ownerId, decks), [decks, ownerId]);
    useEffect(() => listenForDeckChanges(ownerId, setDecks), [ownerId]);

    // Fall back to the first deck when the selected one no longer exists.
    const activeDeckId = decks.some((deck) => deck.id === selectedDeckId)
        ? selectedDeckId
        : (decks[0]?.id ?? null);

    useEffect(() => {
        if (!undo) return undefined;
        const timeout = setTimeout(() => setUndo(null), 7000);
        return () => clearTimeout(timeout);
    }, [undo]);

    useEffect(() => {
        if (!notice) return undefined;
        const timeout = setTimeout(() => setNotice(null), 4500);
        return () => clearTimeout(timeout);
    }, [notice]);

    const activeDeck = useMemo(
        () => decks.find((deck) => deck.id === activeDeckId) ?? null,
        [activeDeckId, decks],
    );

    const totalCards = useMemo(
        () => decks.reduce((sum, deck) => sum + deck.cards.length, 0),
        [decks],
    );

    const filteredCards = useMemo(() => {
        if (!activeDeck) return [];
        const normalizedQuery = query.trim().toLocaleLowerCase("de");
        if (!normalizedQuery) return activeDeck.cards;

        return activeDeck.cards.filter((card) => {
            const searchable = [
                card.front,
                card.back,
                ...(Array.isArray(card.tags) ? card.tags : []),
            ]
                .join(" ")
                .toLocaleLowerCase("de");
            return searchable.includes(normalizedQuery);
        });
    }, [activeDeck, query]);

    const cardOrder = useMemo(
        () => buildCardOrder({
            cards: filteredCards,
            shuffle,
            seed: [activeDeckId ?? "none", query].join("|"),
        }),
        [activeDeckId, filteredCards, query, shuffle],
    );

    const currentCard = useMemo(() => {
        if (!activeDeck || cardOrder.length === 0) return null;
        const cardId = cardOrder[clamp(index, 0, cardOrder.length - 1)];
        return activeDeck.cards.find((card) => card.id === cardId) ?? null;
    }, [activeDeck, cardOrder, index]);

    const progress = cardOrder.length
        ? Math.round(((clamp(index, 0, cardOrder.length - 1) + 1) / cardOrder.length) * 100)
        : 0;

    function resetStudy() {
        setIndex(0);
        setShowBack(false);
    }

    function selectDeck(deckId) {
        setActiveDeckId(deckId);
        setQuery("");
        resetStudy();
    }

    function changeMode(nextMode) {
        setMode(nextMode);
        resetStudy();
    }

    function changeQuery(nextQuery) {
        setQuery(nextQuery);
        resetStudy();
    }

    function toggleShuffle() {
        setShuffle((current) => !current);
        resetStudy();
    }

    function updateActiveDeck(updater) {
        setDecks((currentDecks) => currentDecks.map(
            (deck) => (deck.id === activeDeckId ? updater(deck) : deck),
        ));
    }

    function createDeck(name) {
        const trimmedName = name.trim();
        if (!trimmedName) return;

        const deck = { id: uid(), name: trimmedName, cards: [] };
        setDecks((currentDecks) => [deck, ...currentDecks]);
        setActiveDeckId(deck.id);
        setQuery("");
        resetStudy();
    }

    function requestDeleteDeck(deckId) {
        const deck = decks.find((candidate) => candidate.id === deckId);
        if (!deck) return;

        setDeckPendingDelete(deck);
    }

    function confirmDeleteDeck() {
        if (!deckPendingDelete) return;

        setDecks((currentDecks) => currentDecks.filter(
            (candidate) => candidate.id !== deckPendingDelete.id,
        ));
        setDeckPendingDelete(null);
        setNotice({ type: "neutral", message: "Deck gelöscht." });
    }

    function addCards(newCards) {
        if (!activeDeckId || newCards.length === 0) return;

        updateActiveDeck((deck) => ({ ...deck, cards: [...newCards, ...deck.cards] }));
        setComposerOpen(false);
        setQuery("");
        resetStudy();
        setNotice({
            type: "success",
            message: newCards.length === 1
                ? "Eine neue Karte wurde angelegt."
                : newCards.length + " neue Karten wurden angelegt.",
        });
    }

    function deleteCard(cardId) {
        if (!activeDeck) return;
        const position = activeDeck.cards.findIndex((card) => card.id === cardId);
        if (position < 0) return;

        setUndo({
            deckId: activeDeck.id,
            card: activeDeck.cards[position],
            position,
        });
        updateActiveDeck((deck) => ({
            ...deck,
            cards: deck.cards.filter((card) => card.id !== cardId),
        }));
        setIndex((current) => clamp(current, 0, Math.max(0, cardOrder.length - 2)));
        setShowBack(false);
    }

    function restoreCard() {
        if (!undo) return;

        setDecks((currentDecks) => currentDecks.map((deck) => {
            if (deck.id !== undo.deckId) return deck;
            const cards = [...deck.cards];
            cards.splice(Math.min(undo.position, cards.length), 0, undo.card);
            return { ...deck, cards };
        }));
        setUndo(null);
        setNotice({ type: "success", message: "Karte wiederhergestellt." });
    }

    function exportJSON() {
        const blob = new Blob([JSON.stringify(decks, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "quizlot-decks.json";
        link.click();
        URL.revokeObjectURL(url);
        setNotice({ type: "success", message: "Sicherung wurde heruntergeladen." });
    }

    function importJSON(file) {
        if (!file) return;
        const reader = new FileReader();

        reader.onload = () => {
            try {
                const importedDecks = cleanImportedDecks(JSON.parse(String(reader.result)));
                if (!importedDecks.length) throw new Error("empty import");

                setDecks(importedDecks);
                setActiveDeckId(importedDecks[0].id);
                setQuery("");
                resetStudy();
                setNotice({ type: "success", message: "Sicherung erfolgreich importiert." });
            } catch {
                setNotice({ type: "error", message: "Diese Datei enthält keine gültigen Decks." });
            }
        };

        reader.onerror = () => {
            setNotice({ type: "error", message: "Die Datei konnte nicht gelesen werden." });
        };
        reader.readAsText(file);
    }

    function flip() {
        if (currentCard) setShowBack((current) => !current);
    }

    function next() {
        if (!cardOrder.length) return;
        setIndex((current) => clamp(current + 1, 0, cardOrder.length - 1));
        setShowBack(false);
    }

    function previous() {
        if (!cardOrder.length) return;
        setIndex((current) => clamp(current - 1, 0, cardOrder.length - 1));
        setShowBack(false);
    }

    useEffect(() => {
        function handleKeyDown(event) {
            if ((event.metaKey || event.ctrlKey) && event.key.toLocaleLowerCase("de") === "k") {
                event.preventDefault();
                document.getElementById("card-search")?.focus();
                return;
            }

            const tagName = event.target?.tagName?.toUpperCase();
            const isTyping = tagName === "INPUT" || tagName === "TEXTAREA";
            if (isTyping || composerOpen) return;

            if (event.key === " " || event.key === "Enter") {
                event.preventDefault();
                setShowBack((current) => !current);
            } else if (event.key === "ArrowRight") {
                setIndex((current) => clamp(current + 1, 0, cardOrder.length - 1));
                setShowBack(false);
            } else if (event.key === "ArrowLeft") {
                setIndex((current) => clamp(current - 1, 0, cardOrder.length - 1));
                setShowBack(false);
            }
        }

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [cardOrder.length, composerOpen]);

    return (
        <div className="appShell">
            <Sidebar
                activeDeckId={activeDeckId}
                decks={decks}
                totalCards={totalCards}
                onCreateDeck={createDeck}
                onDeleteDeck={requestDeleteDeck}
                onSelectDeck={selectDeck}
            />

            <main className="workspace">
                <Topbar
                    cardCount={activeDeck?.cards.length ?? 0}
                    deckName={activeDeck?.name ?? "Noch kein Deck"}
                    hasActiveDeck={Boolean(activeDeck)}
                    onExportJSON={exportJSON}
                    onImportJSON={importJSON}
                    onOpenComposer={() => setComposerOpen(true)}
                />

                {activeDeck ? (
                    <section className="studyArea" aria-label={"Deck " + activeDeck.name}>
                        <div className="studyToolbar">
                            <div className="modeTabs" role="tablist" aria-label="Lernmodus">
                                <button
                                    className={"modeTab" + (mode === "learn" ? " active" : "")}
                                    type="button"
                                    role="tab"
                                    aria-selected={mode === "learn"}
                                    onClick={() => changeMode("learn")}
                                >
                                    Lernen
                                </button>
                                <button
                                    className={"modeTab" + (mode === "test" ? " active" : "")}
                                    type="button"
                                    role="tab"
                                    aria-selected={mode === "test"}
                                    onClick={() => changeMode("test")}
                                >
                                    Abfragen
                                </button>
                            </div>

                            <StudyControls
                                query={query}
                                shuffle={shuffle}
                                onQueryChange={changeQuery}
                                onShuffleChange={toggleShuffle}
                            />
                        </div>

                        <div className="studyProgress" aria-label={"Fortschritt " + progress + " Prozent"}>
                            <span style={{ width: progress + "%" }} />
                        </div>

                        <CardViewer
                            key={[activeDeckId, mode].join("|")}
                            card={currentCard}
                            cardsCount={cardOrder.length}
                            deckCardsCount={activeDeck.cards.length}
                            index={clamp(index, 0, Math.max(0, cardOrder.length - 1))}
                            mode={mode}
                            showBack={showBack}
                            onAddCard={() => setComposerOpen(true)}
                            onClearQuery={() => changeQuery("")}
                            onDeleteCard={deleteCard}
                            onFlip={flip}
                            onNext={next}
                            onPrev={previous}
                        />
                    </section>
                ) : (
                    <section className="noDeckState">
                        <div className="emptyIcon"><BookOpen size={28} /></div>
                        <h2>Noch keine Decks</h2>
                        <p>
                            Erstelle links ein Deck und füge danach deine Karten hinzu.
                        </p>
                        <div className="emptyPrompt">
                            <Plus size={18} aria-hidden="true" />
                            Neues Deck in der Seitenleiste erstellen
                        </div>
                    </section>
                )}
            </main>

            <AddCards
                deckName={activeDeck?.name ?? ""}
                isOpen={composerOpen && Boolean(activeDeck)}
                onAddCards={addCards}
                onClose={() => setComposerOpen(false)}
            />

            <ConfirmDialog
                isOpen={Boolean(deckPendingDelete)}
                title="Deck wirklich löschen?"
                description={deckPendingDelete
                    ? "„" + deckPendingDelete.name + "“ und alle enthaltenen Karten werden dauerhaft entfernt."
                    : ""}
                confirmLabel="Deck löschen"
                onCancel={() => setDeckPendingDelete(null)}
                onConfirm={confirmDeleteDeck}
            />

            {(undo || notice) && (
                <div
                    className={"toast " + (notice?.type ?? "neutral")}
                    role={notice?.type === "error" ? "alert" : "status"}
                >
                    <span>{undo ? "Karte entfernt." : notice?.message}</span>
                    {undo && (
                        <button type="button" onClick={restoreCard}>
                            <RotateCcw size={15} />
                            Rückgängig
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
