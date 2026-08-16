# Quizlot

Eine einfache Karteikarten-App ohne Anmeldung.

Live: https://quizlot.vercel.app/

## Anonyme Speicherung

Beim ersten Öffnen erzeugt Quizlot eine zufällige anonyme ID für den Browser. Decks und
Karteikarten werden ausschließlich unter dieser ID im lokalen Browser-Speicher abgelegt.
Dadurch können verschiedene Personen die App gleichzeitig verwenden, ohne gegenseitig
ihre Karten zu sehen oder zu überschreiben.

Die Karten bleiben bei späteren Besuchen im selben Browser erhalten. Sie werden nicht
zwischen Geräten oder unterschiedlichen Browsern synchronisiert. Beim Löschen der
Website-Daten gehen die lokal gespeicherten Karten verloren; über den JSON-Export kann
vorher eine Sicherung erstellt werden.

Bestehende Daten aus der früheren, nicht benutzerspezifischen Speicherung werden beim
ersten Start automatisch in den anonymen Bereich des aktuellen Browsers übernommen.

## Entwicklung

```bash
npm ci
npm run dev
```

Qualitätsprüfungen:

```bash
npm test
npm run lint
npm run build
```
