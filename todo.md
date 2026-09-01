# Refonte design — TODO

- [x] Remplacer le hero en deux colonnes par une scène vidéo plein écran.
- [x] Préparer une vidéo hero noir et blanc, orientée danse, avec contraste lisible pour le texte.
- [x] Repositionner le logo et le wordmark comme une vraie signature institutionnelle.
- [x] Simplifier la navigation et la hiérarchie du hero pour éviter la sensation de page morcelée.
- [x] Rééquilibrer les sections qui suivent afin qu’elles prolongent le hero au lieu de le concurrencer.
- [x] Vérifier les états mobile, pause/lecture vidéo et contraste texte/image.
- [x] Refaire une passe de build et de captures avant livraison.

## Refonte logo

- [x] Générer une variante PNG transparente sans carré de fond.
- [x] Remplacer la référence du logo dans le header, le hero et le footer.
- [x] Supprimer les filtres qui déforment ou blanchissent le symbole.
- [x] Ajuster les cadres, tailles et contrastes sur fonds clair, vidéo et anthracite.
- [x] Vérifier visuellement tous les emplacements et enregistrer une nouvelle version.

## Logo joint, YouTube et favicon

- [x] Copier et uploader le fichier logo joint comme asset officiel.
- [x] Remplacer les logos générés par le logo joint dans header, hero, réservation et footer.
- [x] Présenter le logo avec un encadrement ivoire propre et sans déformation.
- [x] Ajouter un lien YouTube officiel derrière la partie vidéo/portfolio.
- [x] Ajouter le logo joint comme favicon dans le document HTML.
- [x] Vérifier les liens, le contraste et le rendu responsive.

## Pages des activités

- [x] Définir le contenu professionnel des trois pages de cours.
- [x] Créer la page cours particuliers à domicile.
- [x] Créer la page cours en studio.
- [x] Créer la page masterclass et coaching en ligne.
- [x] Relier chaque ligne « Choose your entry point » à sa page dédiée.
- [x] Ajouter des CTA de réservation et des liens de retour cohérents.
- [x] Vérifier les trois routes sur desktop et mobile.

## Réservation fonctionnelle et visuels par activité

- [x] Générer ou préparer un visuel dédié pour domicile, studio et coaching en ligne.
- [x] Construire un formulaire de contact avec activité préselectionnée.
- [x] Relier chaque CTA de réservation au formulaire correspondant.
- [x] Ajouter confirmation, validation et gestion d’erreur côté interface.
- [x] Vérifier les médias, les routes et le responsive.

## Skill, envoi serveur, preuve sociale et calendrier

- [x] Initialiser une compétence réutilisable basée sur le workflow Georges West Dance.
- [x] Lire la documentation full-stack et préparer l’upgrade serveur.
- [x] Configurer l’envoi serveur des formulaires avec secret d’email documenté.
- [x] Ajouter un calendrier interactif pour les cours collectifs.
- [x] Ajouter une section de confiance prête pour des avis clients réels, sans contenu inventé.
- [x] Valider la compétence et le site, puis enregistrer une nouvelle version.

## Livraison email réelle

- [x] Intégrer un fournisseur email serveur et envoyer les demandes directement vers l’adresse du studio.
- [x] Documenter les variables RESEND_API_KEY et CONTACT_EMAIL requises.
- [x] Ajouter un test Vitest couvrant la configuration email et l’appel serveur.
- [x] Ajouter une documentation persistante décrivant RESEND_API_KEY, CONTACT_EMAIL et la procédure de configuration email.

## Google Calendar, formulaire et avis

- [x] Reporter la synchronisation Google Calendar après le choix « skip ».
- [x] Conserver les créneaux indicatifs après le choix « skip ».
- [x] Ajouter une animation de chargement au formulaire de réservation.
- [x] Ajouter un message de succès personnalisé après envoi.
- [x] Reporter le carrousel d’avis après le choix « skip » et l’absence d’avis authentiques.
- [x] Vérifier les états confirmés, documenter le périmètre reporté et enregistrer un checkpoint.

## Périmètre reporté après « skip »

- [x] Ajouter un état de chargement animé au formulaire.
- [x] Ajouter un message de succès personnalisé après envoi réussi.
- [x] Laisser le calendrier Google Calendar en attente d’une source ICS ou d’une connexion dédiée.
- [x] Laisser le carrousel d’avis en attente d’avis clients authentiques.
- [x] Enregistrer un checkpoint après l’animation de chargement et le message de succès personnalisé.

## Affinage logo et rédaction

- [x] Réduire la taille du logo joint dans le header et le footer.
- [x] Repositionner la plaque logo du hero sans concurrencer le message principal.
- [x] Harmoniser le logo sur les pages de cours et la réservation.
- [x] Relire et réécrire les textes de l’accueil avec une voix professionnelle et cohérente.
- [x] Relire et réécrire les textes des trois pages de cours.
- [x] Vérifier le rendu responsive et enregistrer un checkpoint.
- [x] Réécrire explicitement les textes de ClassDetail.tsx pour Private, Studio et Online.
- [x] Enregistrer un nouveau checkpoint après les corrections de logo et de rédaction.

## Header fixe et déploiement Vercel

- [x] Rendre le header fixe au défilement sur la homepage et les pages internes.
- [x] Intégrer le logo dans le header fixe avec une taille et un contraste professionnels.
- [x] Diagnostiquer l’erreur de déploiement Vercel fournie en pièce jointe.
- [x] Adapter le build/configuration uniquement si nécessaire et documenter les limites full-stack.
- [x] Vérifier le rendu, le build et enregistrer un checkpoint.
- [x] Corriger les rewrites Vercel pour préserver `/api/trpc` et `/api/oauth/callback`.
- [x] Revalider explicitement la configuration Vercel sans prétendre à un déploiement réel non exécuté.
- [x] Effectuer une nouvelle vérification desktop/mobile du header puis créer un checkpoint.
- [x] Exclure explicitement `/api` du rewrite SPA Vercel et tester la configuration localement.
- [x] Ajouter un test de contrat pour la configuration Vercel et documenter l’absence de déploiement distant exécuté.
- [x] Faire une capture desktop finale du header fixe avant le checkpoint.
- [x] Vérifier localement les routes `/api/trpc`, `/api/oauth/callback` et `/manus-storage/*` avec l’application Express.
- [x] Documenter explicitement que la validation Vercel est locale et qu’aucun déploiement distant n’a été confirmé.

## Interactions du header

- [x] Ajouter la réduction fluide du header au défilement vers le bas.
- [x] Ajouter les effets de survol du logo et des liens de navigation.
- [x] Remplacer le menu mobile par un panneau latéral animé et accessible.
- [x] Gérer la fermeture du panneau par lien, bouton et clic extérieur.
- [x] Respecter prefers-reduced-motion et vérifier desktop/mobile.

## Nouvelle erreur Vercel

- [x] Identifier l’erreur exacte dans le rapport Vercel joint.
- [x] Corriger la configuration ou le code responsable sans casser Manus.
- [x] Revalider tests, typecheck et build localement.
- [x] Documenter si le fichier joint ne contient pas le journal complet du déploiement.
- [x] Enregistrer un checkpoint après correction.

## Vercel affiche le bundle serveur

- [x] Vérifier la sortie frontend générée dans `dist/public` et le fichier d’entrée Vercel.
- [x] Empêcher Vercel de servir `dist/index.js` comme page publique.
- [x] Configurer la racine pour servir `dist/public/index.html` et conserver l’API en serverless.
- [x] Revalider le build et documenter les réglages Vercel requis.
- [x] Retirer la référence résiduelle à `api/index.ts` dans `vercel.json`.
- [x] Relancer `pnpm test`, `pnpm check` et `pnpm build` après la correction finale.
- [x] Enregistrer un nouveau checkpoint après la correction finale Vercel.
- [x] Documenter clairement que la validation Vercel reste locale sans déploiement distant confirmé.
- [x] Enregistrer un checkpoint après la correction finale de `vercel.json` et la validation complète.

## Logo circulaire professionnel

- [x] Créer un médaillon circulaire propre pour le logo du header.
- [x] Créer un médaillon circulaire cohérent pour le footer.
- [x] Préserver la lisibilité du logo joint sans déformation.
- [x] Vérifier le rendu desktop/mobile et enregistrer un checkpoint.
- [x] Faire une capture explicite du footer sur desktop et mobile pour valider le médaillon circulaire.
- [x] Enregistrer un nouveau checkpoint après validation visuelle complète du header et du footer.

## Bundle serveur encore affiché sur Vercel

- [x] Comparer le fichier servi avec la sortie `dist/public/index.html` et le bundle `dist/index.js`.
- [x] Corriger la configuration de déploiement pour que la racine serve uniquement le frontend.
- [x] Vérifier l’entrée serverless et les routes API sans exposer le bundle serveur.
- [x] Revalider le build et documenter la procédure de redéploiement Vercel.
- [x] Enregistrer un checkpoint après correction.
- [x] Ajouter dans la documentation la procédure de redéploiement Vercel et les contrôles post-déploiement.

## Correction runtime Vercel

- [x] Retirer `runtime: nodejs22.x` de `vercel.json`.
- [x] Définir Node 22 via `package.json` avec la clé engines.
- [x] Mettre à jour le test de configuration et la documentation Vercel.
- [x] Relancer tests, typecheck et build.
- [x] Enregistrer un nouveau checkpoint après correction.
- [x] Enregistrer un nouveau checkpoint après la correction du runtime Vercel et la validation complète.

## WhatsApp, réservation modale et section témoignages

- [x] Ajouter un bouton WhatsApp flottant lié au numéro +233 54 403 6021.
- [x] Réduire et simplifier le footer en conservant uniquement les informations essentielles.
- [x] Transformer « Book a class » et les CTA de réservation en ouverture de pop-up.
- [x] Préremplir le formulaire modale avec l’activité choisie et envoyer la demande côté serveur vers CONTACT_EMAIL ; le changement vers plusdesavoirs01@gmail.com est reporté.
- [x] Ajouter les états de chargement, succès et erreur dans la réservation modale.
- [x] Préparer une section témoignages en carrousel horizontal gauche-droite sans inventer d’avis clients.
- [x] Générer des visuels éditoriaux de danse non présentés comme des photos de témoins réels.
- [x] Vérifier le rendu responsive, l’accessibilité clavier et les tests Vitest.
- [x] Enregistrer un checkpoint après validation complète.

## Synchronisation GitHub et images Vercel

- [x] Auditer les références d’images après la synchronisation GitHub.
- [x] Corriger les références d’assets afin qu’elles utilisent des URLs persistantes compatibles avec Vercel.
- [x] Vérifier que les images générées et les visuels existants répondent correctement après build de production.
- [x] Revalider le déploiement statique local avec la sortie public/index.html.

## Vérifications finales supplémentaires

- [x] Vérifier au clavier l’ouverture et la fermeture de la réservation modale, les contrôles du carrousel, les CTA et le lien WhatsApp.
- [x] Tester après build le logo, la vidéo hero, les trois images de cours et les trois visuels éditoriaux via les routes de stockage locales.
- [x] Effectuer un parcours clavier e2e réel de la modale, du carrousel, des CTA et du lien WhatsApp, puis documenter le résultat.

## Couverture e2e complémentaire

- [x] Étendre le parcours e2e clavier à tous les CTA de réservation principaux de la homepage et d’une page de cours.
- [x] Valider au clavier le contrôle précédent du carrousel témoignages et documenter le résultat.

## Report confirmé

- [x] Reporter le changement de CONTACT_EMAIL vers plusdesavoirs01@gmail.com ; conserver l’adresse serveur actuelle jusqu’à une prochaine validation du secret.
