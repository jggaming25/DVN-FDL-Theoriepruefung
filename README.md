# DVN-FDL Theorieprüfung

Roblox-gestützte Theorieprüfungs-Plattform mit HR-Verwaltung.

## Features

- Roblox OAuth Login mit Captcha-Schutz
- 9 Fragetypen: Single/Multiple Choice, Freitext, Dropdown, Sterne, Zahlenskala, Datum, Uhrzeit, Datei-Upload
- Bilder pro Frage (optional)
- Punkte pro Frage konfigurierbar
- HR-Bereich mit Auswertung, Punktevergabe und individuellem Feedback
- Bestanden/Nicht bestanden inkl. Roblox-Benachrichtigung
- 2 Versuche pro Benutzer (HR ausgenommen)
- Appeal-System für zusätzliche Versuche
- Serverseitige Validierung (manipulationssicher)

## Voraussetzungen

- Node.js 18+
- npm
- Roblox OAuth App (Client ID + Client Secret)
- Optional: Roblox Open Cloud API-Key für Benachrichtigungen

## Installation

```bash
cd pruefung
npm install
```

## Konfiguration

1. `config/app.json` anpassen:

| Wert | Beschreibung |
|------|-------------|
| `roblox.clientId` | Deine Roblox OAuth Client ID |
| `roblox.clientSecret` | Dein Roblox OAuth Client Secret |
| `roblox.redirectUri` | Callback-URL (z.B. `http://localhost:3000/auth/callback`) |
| `hrRoles` | Array mit Roblox-User-IDs der HR-Mitarbeiter |
| `roblox.notificationApiKey` | API-Key für Roblox-Benachrichtigungen (optional) |
| `sessionSecret` | Sicheres Geheimnis für Sessions |

2. **Roblox OAuth einrichten:**
   - Gehe zu https://create.roblox.com/dashboard/credentials
   - Erstelle eine neue OAuth App
   - Füge `http://localhost:3000/auth/callback` als Redirect URI hinzu
   - Setze die Scopes: `openid`, `profile`

3. **Fragen konfigurieren:**
   - Bearbeite `config/questions.js`
   - Siehe Fragen-Format unten

## Starten

```bash
npm start
```

Öffne http://localhost:3000

## Fragetypen

| Typ | Beschreibung |
|-----|-------------|
| `singleChoice` | Eine richtige Antwort (Radio-Buttons) |
| `multipleChoice` | Mehrere richtige Antworten (Checkboxen) |
| `freetext` | Freitext mit optionalem Zeichenlimit |
| `dropdown` | Dropdown-Auswahl |
| `stars` | Sterne-Bewertung (1-5) |
| `numberScale` | Zahlenskala mit konfigurierbaren Schritten |
| `date` | Datumsauswahl |
| `time` | Uhrzeitauswahl |
| `file` | Datei-Upload (JPEG, PNG, PDF) |

### Fragen-Format (config/questions.js)

```javascript
{
  id: 1,
  type: "singleChoice",
  title: "Fragentext",
  options: ["Antwort A", "Antwort B", "Antwort C"],
  correctAnswer: 1,            // Index der richtigen Antwort
  maxPoints: 5,
  imageUrl: "/images/bild.jpg" // Optional: null für kein Bild
}
```

## Projektstruktur

```
pruefung/
├── config/
│   ├── app.json           # App-Konfiguration
│   └── questions.js       # Fragenkatalog
├── middleware/
│   └── auth.js            # Auth-Middleware
├── public/
│   ├── css/style.css      # Rot-Weiß-Theme
│   └── js/main.js         # Client-JS
├── routes/
│   ├── auth.js            # Roblox OAuth-Routen
│   ├── exam.js            # Prüfungs-Routen
│   └── hr.js              # HR-Verwaltungs-Routen
├── views/
│   ├── login.ejs          # Login-Seite mit Captcha
│   ├── dashboard.ejs      # Benutzer-Dashboard
│   ├── exam.ejs           # Prüfungsseite
│   ├── exam_result.ejs    # Prüfungsergebnis
│   ├── hrarea.ejs         # HR-Bereich Übersicht
│   ├── hr_evaluate.ejs    # Einzelauswertung
│   ├── blocked.ejs        # Sperrseite mit Appeal
│   └── partials/          # Header, Navbar, Footer
├── uploads/               # Hochgeladene Dateien
├── server.js              # Hauptserver
├── database.js            # Datenbank-Setup
└── package.json
```

## Lizenz

MIT
