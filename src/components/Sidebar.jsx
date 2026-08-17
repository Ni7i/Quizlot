import React, { useState } from "react";
import { Layers3, Plus, ShieldCheck, Trash2 } from "lucide-react";
import { formatCardCount } from "../lib/utils.js";

export default function Sidebar({
    decks,
    activeDeckId,
    totalCards,
    onSelectDeck,
    onCreateDeck,
    onDeleteDeck,
}) {
    const [name, setName] = useState("");

    function submit(event) {
        event.preventDefault();
        const trimmedName = name.trim();
        if (!trimmedName) return;
        onCreateDeck(trimmedName);
        setName("");
    }

    return (
        <aside className="sidebar">
            <a className="brand" href="/" aria-label="Quizlot Startseite">
                <span className="brandMark" aria-hidden="true">
                    <img src="/quizlot-logo.png" alt="" />
                </span>
                <span className="brandName">Quizlot</span>
            </a>

            <div className="libraryHeading">
                <div>
                    <h2>Meine Decks</h2>
                </div>
                <span className="libraryCount" aria-label={formatCardCount(totalCards)}>
                    {totalCards}
                </span>
            </div>

            <form className="deckCreate" onSubmit={submit}>
                <label className="srOnly" htmlFor="new-deck-name">Neues Deck</label>
                <input
                    id="new-deck-name"
                    autoComplete="off"
                    placeholder="Neues Deck"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                />
                <button type="submit" aria-label="Deck erstellen" disabled={!name.trim()}>
                    <Plus size={18} strokeWidth={2} />
                </button>
            </form>

            <nav className="deckList" aria-label="Kartendecks">
                {decks.map((deck) => {
                    const isActive = deck.id === activeDeckId;
                    return (
                        <div className={"deckItem" + (isActive ? " active" : "")} key={deck.id}>
                            <button
                                className="deckSelect"
                                type="button"
                                aria-current={isActive ? "page" : undefined}
                                onClick={() => onSelectDeck(deck.id)}
                            >
                                <span className="deckIcon" aria-hidden="true">
                                    <Layers3 size={17} />
                                </span>
                                <span className="deckCopy">
                                    <strong>{deck.name}</strong>
                                    <small>{formatCardCount(deck.cards.length)}</small>
                                </span>
                            </button>
                            <button
                                className="deckDelete"
                                type="button"
                                aria-label={"Deck " + deck.name + " löschen"}
                                onClick={() => onDeleteDeck(deck.id)}
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    );
                })}
            </nav>

            <div className="privacyNote">
                <ShieldCheck size={19} aria-hidden="true" />
                <div>
                    <strong>Lokal & privat</strong>
                    <p>Deine Karten bleiben in diesem Browser – ganz ohne Konto.</p>
                </div>
            </div>
        </aside>
    );
}
