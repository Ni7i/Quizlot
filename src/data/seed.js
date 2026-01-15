import { uid } from "../lib/utils.js";

export function seedDecks() {
    return [
        {
            id: uid(),
            name: "Demo Deck",
            cards: [
                { id: uid(), front: "Buch", back: "كِتَابٌ", tags: [] },
                { id: uid(), front: "Haus", back: "بَيْتٌ", tags: [] },
                { id: uid(), front: "lernen", back: "تَعَلَّمَ", tags: [] },
            ],
        },
    ];
}
