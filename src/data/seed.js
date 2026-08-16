import { uid } from "../lib/utils.js";

export function seedDecks() {
    return [
        {
            id: uid(),
            name: "Meine Karten",
            cards: [],
        },
    ];
}
