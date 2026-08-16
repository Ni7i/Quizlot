import React, { useState } from "react";

export default function Sidebar({
                                    decks,
                                    activeDeckId,
                                    onSelectDeck,
                                    onCreateDeck,
                                    onDeleteDeck,
                                }) {
    const [name, setName] = useState("");

    function add() {
        const trimmed = name.trim();
        if (!trimmed) return;
        onCreateDeck(trimmed);
        setName("");
    }

    return (
        <aside className="sidebar">
            <div className="brand">Flashcards</div>

            <div className="sectionTitle">Decks</div>

            <div className="row" style={{ marginBottom: 10 }}>
                <input
                    className="input"
                    placeholder="Neues Deck..."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && add()}
                />
                <button className="btn" onClick={add}>+</button>
            </div>

            <div className="deckList">
                {decks.map((d) => {
                    const active = d.id === activeDeckId;
                    return (
                        <div className="deckItem" key={d.id}>
                            <button
                                className={`deckBtn ${active ? "active" : ""}`}
                                onClick={() => onSelectDeck(d.id)}
                                title={d.name}
                            >
                                <div
                                    style={{
                                        fontWeight: 800,
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap",
                                    }}
                                >
                                    {d.name}
                                </div>
                                <div style={{ fontSize: 12, color: "rgba(255,255,255,.65)" }}>
                                    {d.cards.length} Karten
                                </div>
                            </button>

                            <button
                                className="iconBtn"
                                onClick={() => onDeleteDeck(d.id)}
                                title="Deck loeschen"
                            >
                                ✕
                            </button>
                        </div>
                    );
                })}
            </div>

            <div className="hint">
                Deine Karten werden anonym in diesem Browser gespeichert.
                <br />
                Hotkeys: Space/Enter = Flip · ←/→ = Navigation
            </div>
        </aside>
    );
}
