# Kahwa - Prototype Web Café (QR + Serveur + Barman + Admin)

Prototype front-end (HTML/CSS/JS) pour gérer un café :
- Commande client via QR code par table (`menu.html?table=X`)
- Interface serveur pour créer/servir/encaisser
- Interface barman pour préparer les commandes
- Interface admin pour menu, tables, caisse, statistiques

## Démarrage rapide

Ouvrez `index.html` dans un navigateur.

> Recommandé: lancer un serveur local pour avoir `location.origin` correct:

```bash
python3 -m http.server 8080
```

Puis ouvrir: `http://localhost:8080`.

## Logique des couleurs de table

- 🟢 `free`: table libre
- 🔴 `ordered`: commande passée / en préparation
- 🟠 `served`: commande servie, en attente de paiement

Quand une commande est payée (`paid`), la table revient automatiquement au vert si aucune autre commande ouverte n'existe.

## Limites du prototype

- Données stockées en `localStorage` (pas de backend multi-device en production).
- Synchronisation automatique entre onglets du même navigateur via event `storage`.
