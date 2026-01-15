import { uid } from "./utils.js";

function decodeHtml(str) {
    // OpenTDB liefert HTML-Entities (z.B. &quot;)
    const txt = document.createElement("textarea");
    txt.innerHTML = str;
    return txt.value;
}

export async function fetchOpenTDBCards(amount = 10) {
    const url = `https://opentdb.com/api.php?amount=${amount}&type=multiple`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("API Fehler");
    const data = await res.json();

    const results = Array.isArray(data.results) ? data.results : [];
    return results.map((q) => ({
        id: uid(),
        front: decodeHtml(q.question),
        back: decodeHtml(q.correct_answer),
        tags: ["api", "opentdb", decodeHtml(q.category || "quiz")],
    }));
}
