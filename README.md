# DVN FDL Theoriefragebogen

Roblox-gestützte Theorieprüfung für GitHub Pages + Render Backend.

## Struktur (alles flach, keine Unterordner)

| Datei | Zweck |
|-------|-------|
| `index.html` | Komplette Frontend-App (HTML + CSS + JS) |
| `server.js` | Backend zum Hosten (Render, Railway) |
| `fragen.js` | Fragen-Katalog (einfach editierbar) |
| `package.json` | Backend-Abhängigkeiten |
| `.gitignore` | Ausgeschlossene Dateien |
| `bilder/` | Logo + Verkehrszeichen-Bilder |

## Setup

1. `config/app.json` gab's nicht mehr – alles über Umgebungsvariablen:

   ```
   ROBLOX_CLIENT_ID=deine_id
   ROBLOX_CLIENT_SECRET=dein_secret
   ROBLOX_NOTIFY_KEY=optional
   HR_ROLES=12345678,87654321
    BASE_URL=https://dvn-pruefung-backend.onrender.com
    FRONTEND_URL=https://jggaming25.github.io/DVN-FDL-Theorie-Pruefung
   SESSION_SECRET=eigenes_geheimnis
   ```

2. **Frontend:** `index.html` + `fragen.js` + `bilder/` auf GitHub Pages hosten
3. **Backend:** `server.js` auf Render deployen (`npm start`)
4. `const API` in `index.html` zeigt bereits auf `https://dvn-pruefung-backend.onrender.com`
5. Eigenes Logo als `logo.png` oder `logo.svg` in `bilder/` ablegen

## Fragen bearbeiten

Einfach `fragen.js` öffnen und Einträge ändern/hinzufügen.
