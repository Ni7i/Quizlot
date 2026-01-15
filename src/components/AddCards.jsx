import React, { useState } from "react";
import { parseBulkLines } from "../lib/utils.js";
import { fetchOpenTDBCards } from "../lib/api.js";

export default function AddCards({ onAddCards }) {
    const [text, setText] = useState("");
    const [loadingApi, setLoadingApi] = useState(false);
    const [apiError, setApiError] = useState("");

    function submit() {
        const cards = parseBulkLines(text);
        if (!cards.length) return;
        onAddCards(cards);
        setText("");
    }

    async function addFromApi() {
        try {
            setApiError("");
            setLoadingApi(true);
            const cards = await fetchOpenTDBCards(10);
            onAddCards(cards);
        } catch {
            setApiError("API konnte nicht geladen werden.");
        } finally {
            setLoadingApi(false);
        }
    }

    return (
        <div>
            <div className="sectionTitle">Woerter hinzufuegen</div>
            <div className="small">
                Format pro Zeile: <b>Front;Back</b> (oder <b>|</b> oder Tab). Beispiel:{" "}
                <code>Hund;كَلْبٌ</code>
            </div>

            <textarea
                className="textarea"
                placeholder={"Hund;كَلْبٌ\nHaus;بَيْتٌ\nlernen;تَعَلَّمَ"}
                value={text}
                onChange={(e) => setText(e.target.value)}
            />

            <div className="actions" style={{ marginTop: 10 }}>
                <button className="btn" onClick={submit}>
                    Karten importieren
                </button>

                <button className="btn secondary" onClick={addFromApi} disabled={loadingApi}>
                    {loadingApi ? "Laedt Quiz..." : "Quiz aus API laden (10)"}
                </button>

                {apiError ? <span className="small">{apiError}</span> : null}
            </div>
        </div>
    );
}
