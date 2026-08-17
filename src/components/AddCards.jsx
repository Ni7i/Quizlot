import React, { useEffect, useMemo, useRef, useState } from "react";
import { Layers3, LockKeyhole, Plus, X } from "lucide-react";
import { parseBulkLines, uid } from "../lib/utils.js";

export default function AddCards({
    isOpen,
    deckName,
    onAddCards,
    onClose,
}) {
    const [entryMode, setEntryMode] = useState("single");
    const [front, setFront] = useState("");
    const [back, setBack] = useState("");
    const [tags, setTags] = useState("");
    const [bulkText, setBulkText] = useState("");
    const firstInputRef = useRef(null);
    const dialogRef = useRef(null);

    const bulkCards = useMemo(() => parseBulkLines(bulkText), [bulkText]);

    useEffect(() => {
        if (!isOpen) return undefined;

        const previouslyFocused = document.activeElement;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        const focusTimeout = setTimeout(() => firstInputRef.current?.focus(), 0);

        function handleEscape(event) {
            if (event.key === "Escape") onClose();

            if (event.key === "Tab") {
                const focusable = [...(dialogRef.current?.querySelectorAll(
                    "button:not([disabled]), input:not([disabled]), textarea:not([disabled])",
                ) ?? [])];
                if (!focusable.length) return;

                const first = focusable[0];
                const last = focusable[focusable.length - 1];
                if (event.shiftKey && document.activeElement === first) {
                    event.preventDefault();
                    last.focus();
                } else if (!event.shiftKey && document.activeElement === last) {
                    event.preventDefault();
                    first.focus();
                }
            }
        }

        window.addEventListener("keydown", handleEscape);
        return () => {
            clearTimeout(focusTimeout);
            document.body.style.overflow = previousOverflow;
            window.removeEventListener("keydown", handleEscape);
            previouslyFocused?.focus?.();
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    function submitSingle(event) {
        event.preventDefault();
        const cleanFront = front.trim();
        const cleanBack = back.trim();
        if (!cleanFront || !cleanBack) return;

        onAddCards([{
            id: uid(),
            front: cleanFront,
            back: cleanBack,
            tags: tags
                .split(",")
                .map((tag) => tag.trim())
                .filter(Boolean),
        }]);
        setFront("");
        setBack("");
        setTags("");
    }

    function submitBulk(event) {
        event.preventDefault();
        if (!bulkCards.length) return;
        onAddCards(bulkCards);
        setBulkText("");
    }

    return (
        <div
            className="modalBackdrop"
            role="presentation"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) onClose();
            }}
        >
            <section
                ref={dialogRef}
                className="cardComposer"
                role="dialog"
                aria-modal="true"
                aria-labelledby="composer-title"
            >
                <header className="composerHeader">
                    <div className="composerTitle">
                        <span className="composerIcon" aria-hidden="true"><Layers3 size={20} /></span>
                        <div>
                            <p className="eyebrow">Deck · {deckName}</p>
                            <h2 id="composer-title">Karten hinzufügen</h2>
                        </div>
                    </div>
                    <button className="modalClose" type="button" aria-label="Dialog schließen" onClick={onClose}>
                        <X size={20} />
                    </button>
                </header>

                <div className="entryTabs" role="tablist" aria-label="Eingabeart">
                    <button
                        className={entryMode === "single" ? "active" : ""}
                        type="button"
                        role="tab"
                        aria-selected={entryMode === "single"}
                        onClick={() => setEntryMode("single")}
                    >
                        Einzelne Karte
                    </button>
                    <button
                        className={entryMode === "bulk" ? "active" : ""}
                        type="button"
                        role="tab"
                        aria-selected={entryMode === "bulk"}
                        onClick={() => setEntryMode("bulk")}
                    >
                        Mehrere Karten
                    </button>
                </div>

                {entryMode === "single" ? (
                    <form className="composerForm" onSubmit={submitSingle}>
                        <label>
                            <span>Vorderseite</span>
                            <textarea
                                ref={firstInputRef}
                                rows="3"
                                placeholder="Was möchtest du lernen?"
                                value={front}
                                onChange={(event) => setFront(event.target.value)}
                                required
                            />
                        </label>
                        <label>
                            <span>Rückseite</span>
                            <textarea
                                rows="3"
                                placeholder="Die passende Antwort"
                                value={back}
                                onChange={(event) => setBack(event.target.value)}
                                required
                            />
                        </label>
                        <label>
                            <span>Tags <small>optional, mit Komma trennen</small></span>
                            <input
                                type="text"
                                placeholder="Biologie, Prüfung 1"
                                value={tags}
                                onChange={(event) => setTags(event.target.value)}
                            />
                        </label>
                        <div className="composerFooter">
                            <p><LockKeyhole size={15} /> Wird nur in deinem Browser gespeichert.</p>
                            <button className="primaryButton" type="submit" disabled={!front.trim() || !back.trim()}>
                                <Plus size={18} />
                                Karte anlegen
                            </button>
                        </div>
                    </form>
                ) : (
                    <form className="composerForm" onSubmit={submitBulk}>
                        <label>
                            <span>Kartenliste</span>
                            <textarea
                                ref={firstInputRef}
                                className="bulkTextarea"
                                rows="10"
                                placeholder={"Photosynthese;Umwandlung von Lichtenergie\nH₂O;Wasser\nKapital Frankreichs;Paris"}
                                value={bulkText}
                                onChange={(event) => setBulkText(event.target.value)}
                            />
                        </label>
                        <div className="bulkHelp">
                            <strong>Eine Karte pro Zeile</strong>
                            <p>Trenne Vorder- und Rückseite mit Semikolon, senkrechtem Strich oder Tab.</p>
                        </div>
                        <div className="composerFooter">
                            <p>
                                {bulkCards.length === 0
                                    ? "Noch keine vollständige Karte erkannt."
                                    : bulkCards.length + (bulkCards.length === 1 ? " Karte erkannt." : " Karten erkannt.")}
                            </p>
                            <button className="primaryButton" type="submit" disabled={!bulkCards.length}>
                                <Plus size={18} />
                                {bulkCards.length === 1 ? "Karte anlegen" : "Karten anlegen"}
                            </button>
                        </div>
                    </form>
                )}
            </section>
        </div>
    );
}
