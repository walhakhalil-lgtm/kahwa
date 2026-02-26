# Kahwa Live Football Overlay & Stats

Application professionnelle de gestion live de match de football, orientée **production TV** et **interaction tactile mobile/tablette**.

## Architecture détaillée

- **Frontend (`/frontend`)**: Angular standalone, mobile-first PWA-ready.
  - Console **Réalisateur** en **page unique**.
  - Workflow **Commentateur** en étapes simples.
  - Connexion REST + Socket.IO au backend.
- **Backend (`/backend`)**: NestJS.
  - REST pour commandes d'arbitrage (timer, score, événements).
  - WebSocket (Socket.IO) pour diffusion temps réel vers front et overlay.
  - Timer côté serveur = source de vérité.
  - Webhook sortant configurable à chaque événement.
- **Overlay (`/overlay`)**: HTML5 ultra léger, transparent 1920x1080.
  - Scoreboard en direct.
  - Alertes animées (but/carton/changement/corner).
  - Consommation WebSocket directe, optimisée Browser Source OBS/vMix.
- **DB**: prévue PostgreSQL (ou MongoDB) — l'implémentation actuelle fonctionne avec stockage mémoire pour un bootstrap rapide.

## Arborescence

```text
/backend      # API NestJS + websocket + timer + seed
/frontend     # Angular mobile-first (réalisateur/commentateur)
/overlay      # Overlay HTML5 1920x1080 transparent
.env.example  # variables d'environnement
```

## Temps réel Socket.IO

Room utilisée:

- `match:<id>`

Événements émis:

- `timer:update`
- `score:update`
- `match:event:new`
- `overlay:command`

## API sortante (webhook)

A chaque événement match, backend envoie un `POST` vers `OUTBOUND_WEBHOOK_URL`:

```json
{
  "matchId": "demo-match-1",
  "score": { "teamA": 1, "teamB": 0 },
  "minute": 12,
  "eventType": "GOAL",
  "team": "A",
  "player": "A Player 9",
  "stats": {
    "corners": { "A": 2, "B": 1 },
    "fouls": { "A": 4, "B": 3 },
    "offsides": { "A": 1, "B": 0 }
  }
}
```

## Setup local

### 1) Backend

```bash
cd backend
npm install
npm run start:dev
```

Backend sur `http://localhost:3000`.

### 2) Frontend

```bash
cd frontend
npm install
npm start
```

Frontend sur `http://localhost:4200`.

### 3) Overlay

Servir le dossier `overlay` (simple serveur statique):

```bash
cd overlay
python3 -m http.server 8081
```

Puis ouvrir `http://localhost:8081/index.html`.

## Seed data

```bash
cd backend
npm run seed
```

Produit un fichier `backend/seed-data.json` avec le match de démonstration (`demo-match-1`, code `A1B2C`).

## UI Réalisateur (page unique)

- Zone haute: chrono, période, play/pause, +temps additionnel, reset mi-temps, score global.
- Zone basse en 2 colonnes: Équipe A et Équipe B.
- Gros boutons tactiles: carton jaune/rouge, changement, corner, but rapide.
- Design sombre diffusion, portrait & paysage, sans navigation multi-pages.

## Interface Commentateur (mobile)

Flux simple par étapes:

1. Code match (5 caractères)
2. Titulaires/remplaçants
3. Vérification numéros
4. Formation
5. Affectation des postes

## Instructions OBS / vMix

1. Lancer backend + overlay.
2. Dans OBS: `Sources > Browser`.
3. URL: `http://<machine-ip>:8081/index.html`.
4. Dimensions: `1920x1080`.
5. Cocher transparence et rafraîchissement si nécessaire.
6. Utiliser la console réalisateur mobile pour piloter le flux live.
