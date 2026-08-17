import React, { useRef } from "react";
import { Download, Plus, Search, Shuffle, Upload } from "lucide-react";
import { formatCardCount } from "../lib/utils.js";

export function StudyControls({
    query,
    shuffle,
    onQueryChange,
    onShuffleChange,
}) {
    return (
        <div className="studyControls">
            <label className="searchField">
                <Search size={17} aria-hidden="true" />
                <span className="srOnly">Karten durchsuchen</span>
                <input
                    id="card-search"
                    type="search"
                    placeholder="Karten durchsuchen"
                    value={query}
                    onChange={(event) => onQueryChange(event.target.value)}
                />
                <kbd>⌘ K</kbd>
            </label>
            <button
                className={"shuffleButton" + (shuffle ? " active" : "")}
                type="button"
                aria-pressed={shuffle}
                onClick={onShuffleChange}
            >
                <Shuffle size={17} />
                <span>Mischen</span>
            </button>
        </div>
    );
}

export default function Topbar({
    deckName,
    cardCount,
    hasActiveDeck,
    onOpenComposer,
    onExportJSON,
    onImportJSON,
}) {
    const fileRef = useRef(null);

    function selectImport(event) {
        const file = event.target.files?.[0] ?? null;
        onImportJSON(file);
        event.target.value = "";
    }

    return (
        <header className="topbar">
            <div className="deckTitle">
                <p className="eyebrow">Aktuelles Deck</p>
                <div className="titleLine">
                    <h1>{deckName}</h1>
                    {hasActiveDeck && <span>{formatCardCount(cardCount)}</span>}
                </div>
            </div>

            <div className="topActions">
                <div className="dataActions" aria-label="Datensicherung">
                    <button type="button" onClick={onExportJSON}>
                        <Download size={17} />
                        <span>Sichern</span>
                    </button>
                    <button type="button" onClick={() => fileRef.current?.click()}>
                        <Upload size={17} />
                        <span>Importieren</span>
                    </button>
                    <input
                        ref={fileRef}
                        className="srOnly"
                        type="file"
                        accept="application/json,.json"
                        onChange={selectImport}
                    />
                </div>
                <button
                    className="primaryButton"
                    type="button"
                    disabled={!hasActiveDeck}
                    onClick={onOpenComposer}
                >
                    <Plus size={18} />
                    Karten hinzufügen
                </button>
            </div>
        </header>
    );
}
