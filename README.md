# Scrapping Prospection App

Cette application permet de rechercher, filtrer et gérer des prospects (associations, commerces, etc.) à partir de recherches web automatisées via l'API Google Custom Search.

## Fonctionnalités principales
- Recherche de prospects par secteur, région, âge du site, mot-clé…
- Utilisation de l'API Google Custom Search pour obtenir de vrais sites web
- Recherche continue (scrapping en boucle jusqu'à arrêt manuel)
- Filtrage dynamique des résultats par nom, email, site, statut (contacté, intéressé, etc.)
- Export CSV des résultats
- Suivi du quota Google (100 requêtes/jour, persistant et reset à minuit)
- Dashboard de suivi et statistiques

## Installation

1. **Cloner le projet**
```bash
 git clone <repo-url>
 cd scrapping
```

2. **Installer les dépendances**
```bash
 npm install
```

3. **Configurer les variables d'environnement**

Crée un fichier `.env` à la racine avec :
```
VITE_GOOGLE_API_KEY=ta_clé_api_google
VITE_GOOGLE_CX=ton_id_custom_search
```
- Obtiens ta clé API sur [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
- Obtiens ton CX sur [Google Custom Search Engine](https://cse.google.com/cse/all)

4. **Lancer l'application**
```bash
 npm run dev
```

L'application sera accessible sur [http://localhost:5173](http://localhost:5173)

## Utilisation
- **Recherche simple** : choisis tes filtres et clique sur "Lancer la recherche".
- **Recherche continue** : clique sur "Recherche continue" pour scrapper en boucle (arrête avec le bouton "Arrêter").
- **Quota Google** : le nombre de requêtes utilisées/restantes s'affiche, et les boutons sont désactivés si tu atteins la limite.
- **Filtrage résultats** : utilise le champ texte pour filtrer par nom, email ou site, et le menu pour filtrer par statut.

## Limitations
- **Quota Google** : 100 requêtes/jour (API gratuite). Pour plus, il faut acheter du quota Google.
- **Résultats Google** : dépend de la pertinence de l'API Custom Search et du paramétrage du moteur.
- **Pas de scraping profond** : seules les URLs trouvées par Google sont analysées.

## Personnalisation
- Pour ajouter des secteurs/régions/villes, modifie `src/services/webScraper.ts` (voir `regionTerms` et `sectorTerms`).
- Pour changer le comportement du scrapping, adapte les méthodes du service `WebScraperService`.

## Sécurité & RGPD
- Les données collectées sont publiques (issues du web).
- Respecte la législation sur la prospection et la protection des données.

## Dépendances principales
- React, TypeScript, Vite
- Supabase (stockage prospects)
- Google Custom Search API
- TailwindCSS (UI)

---

**Développé pour la prospection intelligente et le suivi d'opportunités web.** 