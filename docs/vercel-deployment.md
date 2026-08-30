# Déploiement Vercel

Le projet garde l’entrée Manus `server/_core/index.ts` pour le développement et l’hébergement full-stack. L’application Express est également exposée par `server/_core/app.ts`, qui ne lance pas `listen()` et peut donc être importée par la fonction Vercel `api/[...path].ts`.

## Configuration

`vercel.json` utilise `pnpm build`, copie explicitement `dist/public` vers `public` et publie uniquement `public`. La fonction catch-all `api/[...path].ts` reçoit les requêtes API. Le fallback SPA exclut `/api`, afin que la racine et les routes React servent `public/index.html` sans exposer `dist/index.js`. Les variables serveur doivent être ajoutées dans les réglages Vercel, notamment `DATABASE_URL`, `JWT_SECRET`, `OAUTH_SERVER_URL`, `VITE_APP_ID`, `RESEND_API_KEY` et `CONTACT_EMAIL` si les formulaires et l’authentification sont utilisés.

## Point important

Vercel ne doit pas démarrer `dist/index.js` comme un serveur Express longue durée. La fonction `api/[...path].ts` exporte l’application Express afin que Vercel gère le cycle de requête, tandis que `dist/index.js` reste uniquement un artefact serveur pour l’hébergement Manus. Pour l’hébergement Manus, le script `pnpm start` et `server/_core/index.ts` restent inchangés dans leur rôle.

Le fichier fourni ressemblait à une sortie bundle du serveur, pas à un journal d’erreur Vercel complet. La correction traite donc l’incompatibilité structurelle la plus probable : l’appel local à `server.listen()` dans un environnement serverless.

## État de validation

La configuration a été vérifiée localement avec le serveur Express : `/api/trpc/system.health` répond en HTTP 200, `/api/oauth/callback` répond en HTTP 400 lorsqu’il manque les paramètres attendus, et `/manus-storage/*` atteint bien le proxy de stockage. Aucun déploiement Vercel distant n’a été exécuté ni confirmé depuis ce projet ; il faut donc renseigner les variables d’environnement dans Vercel et lancer un déploiement de préproduction pour valider le comportement réel de la plateforme.

## Procédure de redéploiement

1. Dans Vercel, ouvrir le projet relié au dépôt `SERGELEBON/henri-charrier` et vérifier que le répertoire racine correspond bien au projet, sans sélectionner `dist` comme répertoire public manuel.
2. Vérifier les réglages du projet : commande d’installation `pnpm install --frozen-lockfile`, commande de build `pnpm build`, et sortie `public`. Le fichier `vercel.json` du dépôt doit être pris en compte.
3. Vérifier les variables d’environnement du projet Vercel, notamment `DATABASE_URL`, `JWT_SECRET`, `OAUTH_SERVER_URL`, `VITE_APP_ID`, `RESEND_API_KEY` et `CONTACT_EMAIL`, pour les environnements Preview et Production selon le besoin.
4. Lancer un nouveau déploiement depuis le commit contenant `vercel.json`, `api/[...path].ts` et le build frontend. Après le build, Vercel doit publier `public/index.html`, et non `dist/index.js`.
5. Contrôler la racine `/` : elle doit afficher l’interface Georges West Dance. Contrôler ensuite une route React, puis `/api/trpc` ou `/api/oauth/callback` afin de vérifier que les routes API ne sont pas absorbées par le fallback SPA.
6. Si l’ancien bundle s’affiche encore, supprimer puis recréer le déploiement Vercel afin de purger l’ancien artefact, puis vérifier que le déploiement utilise bien le dernier commit et non un ancien cache.

La validation effectuée dans le sandbox confirme la structure et le build local ; elle ne constitue pas une confirmation d’un déploiement Vercel distant réussi.
