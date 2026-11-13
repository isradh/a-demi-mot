# À Demi-Mot
Site de création de coffret cadeau (projet d'école).

Structure : `index.html` (le site) + `api/letter.js` (fonction serveur qui appelle l'IA Mistral).
Variables d'environnement Vercel : `MISTRAL_API_KEY` (obligatoire), `MISTRAL_MODEL` (facultatif, défaut mistral-small-latest).
Si l'IA est indisponible, le site affiche un brouillon automatique.
Ne jamais écrire la clé dans les fichiers du dépôt.
