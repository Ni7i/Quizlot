# Quizlot

![Quizlot – Einfach besser lernen](./public/og.png)

Quizlot ist eine fokussierte Karteikarten-App für Menschen, die ohne Einrichtung direkt
lernen möchten. Sie funktioniert ohne Konto, speichert jedes Deck privat im jeweiligen
Browser und verbindet eine ruhige Oberfläche mit bewusst kleinen, verlässlichen
Interaktionen.

[Live ausprobieren](https://quizlot.vercel.app/) · [Quellcode](https://github.com/Ni7i/Quizlot)

## Was das Produkt kann

- Decks und Karten ohne Anmeldung anlegen
- zwischen freiem Lernen und geprüftem Abfragemodus wechseln
- Antworten unabhängig von Großschreibung und mehrfachen Leerzeichen vergleichen
- Karten durchsuchen, mischen und vollständig per Tastatur bedienen
- einzelne Karten oder komplette Listen importieren
- versehentlich gelöschte Karten wiederherstellen
- alle Decks als JSON sichern und später wieder importieren
- mehrere offene Tabs desselben Browsers synchron halten

## Produkt- und Designentscheidungen

Die Oberfläche ist bewusst kein klassisches Dashboard. Eine zurückhaltende Papierpalette,
redaktionelle Typografie und eine einzelne große Lernfläche rücken die aktuelle Karte in
den Mittelpunkt. Sekundäre Funktionen bleiben erreichbar, konkurrieren aber nicht mit der
Lernaufgabe. Auf kleinen Bildschirmen wird die Deck-Bibliothek zu einer horizontalen,
kompakten Navigation.

Für die Bedienbarkeit wurden unter anderem sichtbare Fokuszustände, semantische Dialoge,
Fokusführung, reduzierte Animationen bei entsprechender Systemeinstellung und große
Touch-Ziele umgesetzt.

## Datenschutz und Speicherung

Beim ersten Öffnen erzeugt Quizlot eine zufällige anonyme Browser-ID. Decks werden unter
dieser ID in `localStorage` gespeichert und niemals an einen Quizlot-Server übertragen.
Verschiedene Browser greifen deshalb nicht aufeinander zu. Mehrere Tabs desselben Browsers
werden über das Storage-Event synchronisiert.

Die bewusste Einschränkung: Wer Website-Daten löscht oder den Browser wechselt, verliert
ohne vorherigen JSON-Export den Zugriff auf die lokalen Decks. Bestehende Daten aus älteren
Quizlot-Versionen werden automatisch migriert.

## Technischer Aufbau

- React 19 und Vite 7
- komponentenbasierte Oberfläche ohne UI-Framework
- Lucide-Icons sowie lokal ausgelieferte variable Schriften
- versionierter, benutzerspezifischer Browser-Speicher
- deterministisches Mischen für stabile Lernsitzungen
- Node-Test-Runner für Speicher-, Import- und Lernlogik
- Deployment über Vercel

## Lokal starten

```bash
npm ci
npm run dev
```

Vor einem Release laufen alle Qualitätsprüfungen gemeinsam:

```bash
npm test
npm run lint
npm run build
```
