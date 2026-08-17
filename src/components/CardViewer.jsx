import React, { useEffect, useRef, useState } from "react";
import {
    ArrowLeft,
    ArrowRight,
    Check,
    CheckCircle2,
    Layers3,
    Plus,
    RotateCcw,
    Trash2,
    XCircle,
} from "lucide-react";
import { normalizeAnswer } from "../lib/utils.js";

export default function CardViewer({
    mode,
    cardsCount,
    deckCardsCount,
    index,
    card,
    showBack,
    onFlip,
    onNext,
    onPrev,
    onDeleteCard,
    onAddCard,
    onClearQuery,
}) {
    const [answerState, setAnswerState] = useState({ cardId: null, value: "" });
    const [feedbackState, setFeedbackState] = useState({ cardId: null, value: null });
    const [score, setScore] = useState({ correct: 0, total: 0 });
    const inputRef = useRef(null);

    const answer = answerState.cardId === card?.id ? answerState.value : "";
    const feedback = feedbackState.cardId === card?.id ? feedbackState.value : null;

    useEffect(() => {
        if (mode !== "test" || showBack) return undefined;
        const timeout = setTimeout(() => inputRef.current?.focus(), 0);
        return () => clearTimeout(timeout);
    }, [card?.id, mode, showBack]);

    function checkAnswer(event) {
        event.preventDefault();
        if (!card || !answer.trim() || feedback) return;

        const isCorrect = normalizeAnswer(answer) === normalizeAnswer(card.back);
        setFeedbackState({ cardId: card.id, value: { isCorrect } });
        setScore((current) => ({
            correct: current.correct + (isCorrect ? 1 : 0),
            total: current.total + 1,
        }));
        if (!showBack) onFlip();
    }

    if (!card) {
        const emptyDeck = deckCardsCount === 0;
        return (
            <div className="emptyState">
                <div className="emptyIcon"><Layers3 size={26} /></div>
                <p className="eyebrow">{emptyDeck ? "Bereit für den Anfang" : "Keine Treffer"}</p>
                <h2>{emptyDeck ? "Die erste Karte gibt deinem Deck Form." : "Nichts Passendes gefunden."}</h2>
                <p>
                    {emptyDeck
                        ? "Lege Frage und Antwort an – einzeln oder als komplette Liste."
                        : "Versuche einen anderen Suchbegriff oder zeige wieder alle Karten."}
                </p>
                <button
                    className="primaryButton"
                    type="button"
                    onClick={emptyDeck ? onAddCard : onClearQuery}
                >
                    {emptyDeck ? <Plus size={18} /> : <RotateCcw size={17} />}
                    {emptyDeck ? "Erste Karte anlegen" : "Suche zurücksetzen"}
                </button>
            </div>
        );
    }

    return (
        <div className="viewer">
            <div className="sessionMeta">
                <span>
                    Karte <strong>{index + 1}</strong> von {cardsCount}
                </span>
                <div className="sessionMetaEnd">
                    {mode === "test" && (
                        <span className="score">
                            <CheckCircle2 size={15} />
                            {score.correct} von {score.total} richtig
                        </span>
                    )}
                    <button
                        className="removeCard"
                        type="button"
                        onClick={() => onDeleteCard(card.id)}
                    >
                        <Trash2 size={15} />
                        <span>Karte entfernen</span>
                    </button>
                </div>
            </div>

            <button
                className={"flashcard" + (showBack ? " showingBack" : "")}
                type="button"
                aria-label={showBack ? "Vorderseite anzeigen" : "Antwort anzeigen"}
                onClick={onFlip}
            >
                <span className="cardSide">{showBack ? "Antwort" : "Frage"}</span>
                <span className="cardText" dir="auto">
                    {showBack ? card.back : card.front}
                </span>
                {Array.isArray(card.tags) && card.tags.length > 0 && (
                    <span className="cardTags">
                        {card.tags.map((tag) => <span key={tag}>{tag}</span>)}
                    </span>
                )}
                <span className="flipHint">
                    <RotateCcw size={15} />
                    Karte umdrehen
                </span>
            </button>

            {mode === "test" && !showBack && (
                <form className="answerForm" onSubmit={checkAnswer}>
                    <label htmlFor={"answer-" + card.id}>Deine Antwort</label>
                    <div className="answerRow">
                        <input
                            ref={inputRef}
                            id={"answer-" + card.id}
                            autoComplete="off"
                            placeholder="Antwort eingeben"
                            value={answer}
                            onChange={(event) => setAnswerState({
                                cardId: card.id,
                                value: event.target.value,
                            })}
                        />
                        <button type="submit" disabled={!answer.trim()}>
                            Prüfen
                            <Check size={17} />
                        </button>
                    </div>
                    <p>Groß- und Kleinschreibung wird nicht bewertet.</p>
                </form>
            )}

            {mode === "test" && showBack && (
                feedback ? (
                    <div className={"answerFeedback " + (feedback.isCorrect ? "correct" : "incorrect")}>
                        {feedback.isCorrect
                            ? <CheckCircle2 size={20} />
                            : <XCircle size={20} />}
                        <div>
                            <strong>{feedback.isCorrect ? "Genau richtig." : "Fast – schau dir die Antwort an."}</strong>
                            <p>
                                {feedback.isCorrect
                                    ? "Weiter zur nächsten Karte, wenn du bereit bist."
                                    : "Deine Eingabe: " + answer}
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="answerFeedback neutral">
                        <RotateCcw size={20} />
                        <div>
                            <strong>Selbst aufgedeckt.</strong>
                            <p>Diese Karte fließt nicht in deine Wertung ein.</p>
                        </div>
                    </div>
                )
            )}

            <div className="cardNavigation">
                <button type="button" onClick={onPrev} disabled={index <= 0}>
                    <ArrowLeft size={18} />
                    Vorherige
                </button>
                <button className="revealButton" type="button" onClick={onFlip}>
                    {showBack ? "Frage zeigen" : "Antwort zeigen"}
                </button>
                <button type="button" onClick={onNext} disabled={index >= cardsCount - 1}>
                    Nächste
                    <ArrowRight size={18} />
                </button>
            </div>

            <p className="keyboardHint" aria-hidden="true">
                Leertaste zum Umdrehen · Pfeiltasten zum Navigieren
            </p>
        </div>
    );
}
