# Déploiement Vercel

Le projet garde l’entrée Manus `server/_core/index.ts` pour le développement et l’hébergement full-stack. L’application Express est également exposée par `server/_core/app.ts`, qui ne lance pas `listen()` et peut donc être importée par la fonction Vercel `api/[...path].ts`.

## Configuration

`vercel.json` utilise `pnpm build`, publie explicitement `dist/public` et laisse la fonction catch-all `api/[...path].ts` recevoir les requêtes API. Le fallback SPA exclut `/api`, afin que la racine et les routes React servent `dist/public/index.html` sans exposer le bundle serveur. Les variables serveur doivent être ajoutées dans les réglages Vercel, notamment `DATABASE_URL`, `JWT_SECRET`, `OAUTH_SERVER_URL`, `VITE_APP_ID`, `RESEND_API_KEY` et `CONTACT_EMAIL` si les formulaires et l’authentification sont utilisés.

## Point important

Vercel ne doit pas démarrer `dist/index.js` comme un serveur Express longue durée. La fonction `api/[...path].ts` exporte l’application Express afin que Vercel gère le cycle de requête, tandis que `dist/index.js` reste uniquement un artefact serveur pour l’hébergement Manus. Pour l’hébergement Manus, le script `pnpm start` et `server/_core/index.ts` restent inchangés dans leur rôle.

Le fichier fourni ressemblait à une sortie bundle du serveur, pas à un journal d’erreur Vercel complet. La correction traite donc l’incompatibilité structurelle la plus probable : l’appel local à `server.listen()` dans un environnement serverless.

## État de validation

La configuration a été vérifiée localement avec le serveur Express : `/api/trpc/system.health` répond en HTTP 200, `/api/oauth/callback` répond en HTTP 400 lorsqu’il manque les paramètres attendus, et `/manus-storage/*` atteint bien le proxy de stockage. Aucun déploiement Vercel distant n’a été exécuté ni confirmé depuis ce projet ; il faut donc renseigner les variables d’environnement dans Vercel et lancer un déploiement de préproduction pour valider le comportement réel de la plateforme.
