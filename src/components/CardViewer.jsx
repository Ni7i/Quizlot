import React, { useEffect, useRef, useState } from "react";

export default function CardViewer({
                                       mode,
                                       cardsCount,
                                       index,
                                       card,
                                       showBack,
                                       onFlip,
                                       onNext,
                                       onPrev,
                                       onDeleteCard,
                                   }) {
    // Test mode state
    const [answer, setAnswer] = useState("");
    const [score, setScore] = useState({ correct: 0, total: 0 });
    const inputRef = useRef(null);

    // Reset score when switching mode or deck changes (cardsCount changes)
    useEffect(() => {
        setAnswer("");
        setScore({ correct: 0, total: 0 });
    }, [mode, cardsCount]);

    // Focus answer input on each new card in test mode
    useEffect(() => {
        setAnswer("");
        if (mode === "test") {
            setTimeout(() => inputRef.current?.focus(), 0);
        }
    }, [index, mode]);

    function check() {
        if (!card) return;

        const given = answer.trim().toLowerCase();
        const expected = String(card.back ?? "").trim().toLowerCase();

        const ok = given === expected;
        setScore((s) => ({ correct: s.correct + (ok ? 1 : 0), total: s.total + 1 }));

        // show back shortly, then advance
        if (!showBack) onFlip();
        setTimeout(() => onNext(), 450);
    }

    if (!card) {
        return (
            <div className="empty">
                <div style={{ fontSize: 18, fontWeight: 900 }}>Keine Karten gefunden</div>
                <div className="small">Fuege unten Karten hinzu oder pruefe die Suche.</div>
            </div>
        );
    }

    return (
        <div className="viewer">
            <div className="metaRow">
                <div className="meta">
                    Karte {cardsCount ? index + 1 : 0} / {cardsCount}
                </div>
                <button className="btnDanger" onClick={() => onDeleteCard(card.id)}>
                    Karte loeschen
                </button>
            </div>

            <div className="card" onClick={onFlip} title="Klicken zum Flippen">
                <div className="cardLabel">{showBack ? "Rueckseite" : "Vorderseite"}</div>
                <div className="cardText">{showBack ? card.back : card.front}</div>

                {mode === "test" && !showBack && (
                    <div className="panel" style={{ padding: 12 }} onClick={(e) => e.stopPropagation()}>
                        <div className="actions">
                            <input
                                ref={inputRef}
                                className="input"
                                style={{ width: "100%" }}
                                placeholder="Antwort eingeben und Enter..."
                                value={answer}
                                onChange={(e) => setAnswer(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && check()}
                            />
                        </div>

                        <div className="row" style={{ justifyContent: "space-between", marginTop: 8 }}>
                            <span className="small">Score: {score.correct}/{score.total}</span>
                            <span className="small">Vergleich ist aktuell strikt</span>
                        </div>
                    </div>
                )}
            </div>

            <div className="navRow">
                <button className="btn secondary" onClick={onPrev} disabled={index <= 0}>
                    ← Vorherige
                </button>
                <button className="btn" onClick={onFlip}>
                    Flip
                </button>
                <button className="btn secondary" onClick={onNext} disabled={index >= cardsCount - 1}>
                    Naechste →
                </button>
            </div>
        </div>
    );
}
