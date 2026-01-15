import React, { useRef } from "react";

export default function Topbar({
                                   deckName,
                                   mode,
                                   onModeChange,
                                   shuffle,
                                   onShuffleChange,
                                   query,
                                   onQueryChange,
                                   progress,
                                   onExportJSON,
                                   onImportJSON,
                               }) {
    const fileRef = useRef(null);

    return (
        <div className="topbar">
            <div className="row" style={{ flexWrap: "wrap" }}>
                <div className="h1">{deckName}</div>

                <div className="pills">
                    <button
                        className={`pill ${mode === "cards" ? "active" : ""}`}
                        onClick={() => onModeChange("cards")}
                    >
                        Karten
                    </button>
                    <button
                        className={`pill ${mode === "test" ? "active" : ""}`}
                        onClick={() => onModeChange("test")}
                    >
                        Test
                    </button>
                </div>

                <label className="toggle">
                    <input
                        type="checkbox"
                        checked={shuffle}
                        onChange={(e) => onShuffleChange(e.target.checked)}
                    />
                    <span>Shuffle</span>
                </label>
            </div>

            <div className="row" style={{ flexWrap: "wrap" }}>
                <input
                    className="input"
                    style={{ minWidth: 240 }}
                    placeholder="Suche (front/back/tags)..."
                    value={query}
                    onChange={(e) => onQueryChange(e.target.value)}
                />

                <div className="progressWrap" title={`${progress}%`}>
                    <div className="progressBar" style={{ width: `${progress}%` }} />
                </div>

                <div className="row">
                    <button className="btn secondary" onClick={onExportJSON}>
                        Export JSON
                    </button>

                    <button className="btn secondary" onClick={() => fileRef.current?.click()}>
                        Import JSON
                    </button>

                    <input
                        ref={fileRef}
                        type="file"
                        accept="application/json"
                        style={{ display: "none" }}
                        onChange={(e) => onImportJSON(e.target.files?.[0] ?? null)}
                    />
                </div>
            </div>
        </div>
    );
}
