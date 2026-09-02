# Déploiement Vercel

Le projet conserve l’entrée Manus `server/_core/index.ts` pour le développement et l’hébergement full-stack. L’application Express est également exposée par `server/_core/app.ts`, qui ne lance pas `listen()` et peut donc être importée par la fonction Vercel `api/[...path].ts`.

## Configuration de build

`vercel.json` utilise `pnpm build`, copie explicitement `dist/public` vers `public` et publie uniquement `public`. La fonction catch-all `api/[...path].ts` reçoit les requêtes API. Les requêtes `/manus-storage/:path*` sont réécrites vers `/api/manus-storage/:path*`, puis servies par le proxy de stockage Express. Le fallback SPA exclut `/api` et `/manus-storage`, afin que les routes React servent `public/index.html` sans absorber les routes API ou les images.

Les variables serveur doivent être ajoutées dans les réglages Vercel, notamment `DATABASE_URL`, `JWT_SECRET`, `OAUTH_SERVER_URL`, `VITE_APP_ID`, `RESEND_API_KEY` et `CONTACT_EMAIL` si les formulaires et l’authentification sont utilisés. L’adresse email actuellement active reste documentée dans `docs/email-delivery.md` ; le changement demandé précédemment est reporté.

## Point important

Vercel ne doit pas démarrer `dist/index.js` comme un serveur Express longue durée. La fonction `api/[...path].ts` exporte l’application Express afin que Vercel gère le cycle de requête, tandis que `dist/index.js` reste uniquement un artefact serveur pour l’hébergement Manus. Pour l’hébergement Manus, `server/_core/index.ts` conserve son rôle actuel.

Le bloc `functions` de `vercel.json` ne déclare pas `runtime: nodejs22.x`, car Node.js est un runtime intégré et cette valeur n’est pas une déclaration de runtime communautaire valide. La version Node.js est définie dans `package.json` avec `engines.node: "22.x"`. Dans le tableau de bord Vercel, choisir Node 22 pour Preview et Production si le réglage est disponible.

## Validation finale locale

La validation de release a été exécutée après le build frontend et serverless. Les résultats sont les suivants :

| Contrôle | Résultat |
| --- | --- |
| `pnpm test` | 7 fichiers, 12 tests réussis |
| `pnpm check` | TypeScript sans erreur |
| `pnpm build` | Frontend `dist/public` et bundle serveur générés |
| Copie de production | `public/index.html` présent et publié comme sortie statique |
| Assets | Logo, hero, vidéo, trois images de cours et trois visuels éditoriaux : HTTP 200 localement |
| Proxy image | `/manus-storage/*` et `/api/manus-storage/*` atteignent le proxy ; contrôle HTTP 200 après redirection |
| Responsive | Homepage et Studio vérifiés en desktop 1280×720 et mobile 390×844 |
| Clavier | CTA homepage et Studio, ouverture/fermeture de la modale, contrôles précédent/suivant du carrousel et lien WhatsApp vérifiés dans Chromium |

Le test Resend peut afficher un avertissement de disponibilité réseau locale ; dans ce cas, il valide la forme des secrets et les tests de payload restent couverts. Cela ne remplace pas la vérification des secrets dans l’environnement Vercel.

## Procédure de redéploiement

1. Ouvrir le projet Vercel relié au dépôt `SERGELEBON/henri-charrier` et vérifier que le répertoire racine correspond au projet. Ne pas sélectionner `dist` comme répertoire public manuel.
2. Vérifier les réglages : installation `pnpm install --frozen-lockfile`, build `pnpm build` et sortie `public`. Le fichier `vercel.json` du dernier commit doit être pris en compte.
3. Dans **Project Settings → Node.js Version**, sélectionner **Node 22** pour Preview et Production lorsque l’option est disponible.
4. Vérifier les variables d’environnement dans les environnements concernés, notamment `DATABASE_URL`, `JWT_SECRET`, `OAUTH_SERVER_URL`, `VITE_APP_ID`, `RESEND_API_KEY` et `CONTACT_EMAIL`.
5. Lancer un nouveau déploiement depuis le commit du checkpoint contenant `vercel.json`, `api/[...path].ts`, le proxy de stockage et le build frontend. Vercel doit publier `public/index.html`, et non `dist/index.js`.
6. Contrôler `/` : la homepage Georges West Dance doit s’afficher avec le hero et les images. Contrôler ensuite `/classes/studio` et une autre route React.
7. Contrôler une URL image, par exemple `/manus-storage/gwd-official-logo_20959e49.jpg`. Elle doit retourner une image ou une redirection de stockage, jamais `index.html`. Contrôler aussi `/api/manus-storage/gwd-official-logo_20959e49.jpg`.
8. Contrôler `/api/trpc` ou `/api/oauth/callback`. Une réponse d’erreur de validation attendue confirme que la requête atteint l’API ; une page React à la place indique un mauvais rewrite.
9. Tester le bouton WhatsApp, ouvrir la réservation modale depuis la homepage et la page Studio, puis envoyer une demande de test uniquement si les secrets Resend sont confirmés.
10. Si l’ancien bundle s’affiche encore, vérifier que le déploiement utilise le dernier commit, puis recréer le déploiement pour purger l’ancien artefact ou cache. Aucun déploiement distant n’a été exécuté depuis le sandbox ; cette dernière étape doit être faite dans Vercel.

La validation locale confirme la structure, le routage, les assets et le build. Elle ne constitue pas une confirmation d’un déploiement Vercel distant réussi.

## Incident public du 2 septembre 2026 : images absentes

L’analyse de `https://georges-west-dance.vercel.app/` a confirmé que la page React était servie, mais que toutes les URLs relatives `/manus-storage/...` retournaient HTTP 404 `NOT_FOUND`. Les routes `/api/trpc/system.health` et `/api/oauth/callback` retournaient également HTTP 404 Vercel, preuve que la fonction serverless catch-all n’était pas présente dans le déploiement public actuellement observé.

Pour rendre les médias indépendants de cette fonction absente, les références frontend ont été remplacées par des URLs CDN absolues publiques `files.manuscdn.com`. Les 11 assets ont été contrôlés directement et retournent HTTP 200 avec le bon type MIME : dix images JPEG et une vidéo MP4. Le test `server/public-assets.test.ts` empêche le retour des chemins relatifs `/manus-storage` dans `Home.tsx`, `ClassDetail.tsx` et `client/index.html`.

Cette correction est présente dans le projet local et doit être redéployée dans Vercel. Tant que le dernier checkpoint n’est pas publié, le domaine `georges-west-dance.vercel.app` continuera d’afficher l’ancienne version et ses 404. Après redéploiement, recharger la page sans cache et vérifier que le hero, le logo, les pages de cours et les témoignages affichent leurs visuels. Les routes `/api` doivent également être recontrôlées séparément : elles nécessitent que Vercel prenne bien en compte `api/[...path].ts` et le répertoire racine correct.
