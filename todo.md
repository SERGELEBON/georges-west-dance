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
