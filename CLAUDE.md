# Paris Ciné Aujourd'hui

Extension Chrome + site web listant les films à l'affiche à Paris (données : paris-cine.info).

## Structure du projet

- **Racine** : extension Chrome (`manifest.json`, `popup.html/js/css`).
- **`docs/`** : le site web (HTML/CSS/JS vanilla, pas de framework ni de build). Servi tel quel par Cloudflare Pages.
- **`functions/proxy/[[path]].js`** : Cloudflare Pages Function qui proxifie l'API paris-cine.info.
- **`docs/vendor/`** : Leaflet + markercluster vendorisés localement (pas de CDN, à cause de la CSP).

## Déploiement

Cloudflare Pages (`paris-cine-pages.pages.dev`), build dir `docs/`. Un simple `git push` sur `main` redéploie automatiquement — pas de GitHub Actions, pas d'étape de build.

## Contraintes à respecter (ne jamais violer)

### Sécurité
- **Le proxy n'accepte que 3 endpoints** : `get_movies.php`, `get_showtimes.php`, `get_poster.php` (404 sinon). Toute nouvelle route API doit être ajoutée explicitement dans `functions/proxy/[[path]].js`.
- **CSP stricte dans `docs/_headers`** (`script-src 'self'`, `connect-src 'self'`, `img-src` limité). Toute nouvelle ressource externe (ex. API TMDB) doit être ajoutée à la CSP, et tout nouveau `fetch` externe doit passer par le proxy + `connect-src`.
- Les URLs venant de l'API passent par `safeHttpUrl()` ; le contenu injecté dans les tooltips de la carte utilise `textContent` (jamais `innerHTML` avec des données externes).

### Responsive
- **Vérifier le rendu à toutes les tailles avant de considérer une modif terminée** : mobile ~360px, tablette, portable 13,6", desktop large (>1740px).
- **Le seuil "mobile" (1000px) existe en double** : `@media (max-width: 1000px)` dans `docs/style.css` ET `matchMedia("(max-width: 1000px)")` à 3 endroits dans `docs/app.js`. Toujours modifier les deux ensemble.
- `#layout` utilise des colonnes fluides (`clamp`/`minmax`) avec paliers à 1740px, 1450px, 1366px et 1000px — pas de largeurs fixes.
- **Ne pas retirer le `flex-wrap: wrap`** des pastilles de séances (`.showtimes li` et leur `a`) : sans lui, le contenu déborde sur la carte quand la colonne est étroite.
- **Le contenu de `#header-top` doit rester aligné à droite** (`flex-end`) : la date remonte sur cette ligne par marge négative et chevaucherait tout contenu placé à gauche.

## Points de repère dans le code

- Notes des films = **Letterboxd** (champ `lb_r` de l'API, attribut interne `dataset.rating`) — pas IMDb.
- Badges cartes ciné : points colorés `.card-dot` (bleu `#4da6ff` = UGC Illimité, jaune `#f0d045` = Pass Pathé), générés par `makeCardDot()` dans `docs/app.js`. Listes de partenaires en dur : `UGC_ILLIMITE_PARTNERS` / `PATHE_PASS_PARTNERS` — ces listes évoluent dans le temps, re-vérifier en ligne avant de les modifier.
- Carte Leaflet : tiles CARTO dark, anneau rouge = cinéma indépendant (vs UGC/Pathé/MK2/CGR).
- Lien plein air La Villette : `VILLETTE_INFO_URL` dans `docs/app.js`, pointe volontairement vers la page programme générale (pas de page par film chez eux).
- Markercluster vendorisé = version 1.5.3 (la chaîne "1.1.1" dans le bundle minifié vient d'une sous-dépendance, ce n'est pas la version du plugin).
