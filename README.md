# Ipséité

Site vitrine pour Ipséité, prothésiste ongulaire au Perréon.

## Contenu

- `index.html`: page principale du site
- `styles.css`: identité visuelle campagne chic
- `script.js`: menu mobile et filtres d'inspirations
- `assets/`: logo et visuels éditoriaux

Le site est statique et peut être hébergé directement via GitHub Pages, Netlify, Vercel ou tout hébergement HTML classique.

## Administration

Un espace d'administration Decap CMS est préparé sur `/admin/`.

Important: avec GitHub Pages seul, Decap CMS a besoin d'un service d'authentification OAuth GitHub pour écrire dans le dépôt. Le site contient la configuration du CMS, mais la connexion devra être finalisée via Netlify Identity/Git Gateway ou un fournisseur OAuth compatible.

## Référencement

Le site contient les bases SEO:

- balises `title`, `description`, canonical, Open Graph et Twitter Card
- données structurées `BeautySalon`
- `robots.txt`
- `sitemap.xml`
