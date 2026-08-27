# Direction créative — Georges West Dance

## Trois approches envisagées

### Approche 1 — Galerie Brutaliste Dorée
Une direction institutionnelle et architecturale : ivoire, anthracite, or ghanéen, typographie condensée et compositions éditoriales décentrées. L’image noir et blanc devient une matière de galerie, jamais un simple décor.

**Probability:** 0.06

### Approche 2 — Studio Solaire Contemporain
Une direction lumineuse, chaleureuse et tactile, inspirée des studios baignés de soleil : sable, miel clair, photos documentaires et interfaces très accueillantes. L’accent se déplace vers la proximité et l’apprentissage.

**Probability:** 0.03

### Approche 3 — Signal Nocturne Urbain
Une direction sombre et expressive, mêlant noir profond, or vif, grands recadrages et détails de mouvement presque cinématographiques. Le site ressemble à une affiche de performance contemporaine.

**Probability:** 0.08

## Approche retenue — Galerie Brutaliste Dorée

### Design Movement
Brutalisme éditorial adouci par une sensibilité de galerie d’art et par le langage gestuel de la danse contemporaine. Le site doit évoquer une institution culturelle exigeante, tout en restant lisible, local et accessible.

### Core Principles
1. **Le mouvement comme structure :** diagonales, débordements, lignes de trajectoire et cadrages décentrés remplacent les grilles monotones.
2. **Le contraste comme hiérarchie :** ivoire dominant, charbon pour la lecture, or/ocre en ponctuation rare et mémorable.
3. **La photographie comme preuve :** portraits noir et blanc éditoriaux, avec des sujets de divers héritages visibles et dignes.
4. **Le fonctionnel sans décor superflu :** réservation, portfolio et création d’image doivent être accessibles en un geste.

### Color Philosophy
L’ivoire donne de l’espace aux corps et rappelle le papier d’archive. L’anthracite crée la rigueur institutionnelle et la lisibilité. L’or ghanéen est réservé aux gestes importants — curseur, bouton, ligne, accent — pour qu’il conserve une valeur de signature plutôt qu’une présence décorative constante.

### Layout Paradigm
Une composition en bandes éditoriales asymétriques : hero en deux champs avec texte à gauche et corps en mouvement à droite, sections alternant pleine largeur et modules étroits, chiffres placés en marge, et cartes qui s’alignent comme des affiches de programme. Le contenu ne doit pas être enfermé dans une succession de boîtes centrées.

### Signature Elements
- Des **lignes de trajectoire** fines en or qui traversent certains blocs, inspirées du trait continu du logo.
- Des **numéros de section surdimensionnés** en filigrane, comme dans un catalogue d’exposition.
- Des **cadres photo à bords francs**, avec légendes en petites capitales et micro-accents ocre.

### Interaction Philosophy
Chaque clic doit ressembler à une prise de position : les CTA sont courts, directs et accompagnés d’une flèche. Les sélecteurs et onglets répondent avec un déplacement horizontal ou une inversion charbon/or, jamais par une animation molle ou une pluie d’effets.

### Animation
Entrées courtes en fondu + translation latérale, 180–260 ms, avec des décalages de 40 ms entre éléments. Les lignes de trajectoire peuvent se dessiner à l’entrée. Le générateur montre une progression sobre et un état de résultat qui s’ouvre par glissement vertical. Respecter `prefers-reduced-motion`.

### Typography System
Titres : **Barlow Condensed** en 700/800, capitales, interlettrage légèrement resserré pour le côté affiche. Corps et navigation : **Manrope** en 400/600/700, avec italique uniquement pour les notes éditoriales. Le H1 est massif mais compact, le corps conserve une hauteur de ligne généreuse (1.55).

### Brand Essence
**Georges West Dance transforme l’énergie de la danse en pratique accessible, professionnelle et ancrée au Ghana, pour les élèves, artistes et événements qui veulent bouger avec intention.**

Personnalité : **énergique · exigeante · humaine**

### Brand Voice
Les titres sont affirmatifs, physiques et imagés. Les CTA sont précis et actifs. Les microcopies rassurent sans devenir administratives.

- « Make room for movement. »
- « Compose a portrait in monochrome → »

### Wordmark & Logo
Utiliser le mark fourni comme symbole principal : deux silhouettes en trait continu, posées au-dessus d’un wordmark empilé en capitales. Dans l’interface, le mark reste visible et suffisamment grand pour exister comme emblème, tandis que le wordmark s’affiche en Barlow Condensed avec une largeur de ligne maîtrisée.

### Signature Brand Color
**Or ghanéen — `#D4AF37`**. Il est utilisé comme un geste précis : jamais un remplissage massif sur toute la page, mais une marque de mouvement immédiatement associable à Georges West Dance.

## Architecture de la page d’accueil

La page s’ouvre sur une barre de langue compacte, suivie d’un header fixe visuellement solide. Le hero met en avant la phrase « MAKE ROOM FOR MOVEMENT » et le studio image lab : générer un portrait noir et blanc devient la porte d’entrée créative. La suite présente les trois formats de cours, un portfolio performant, une bande réservation, un bloc à propos, des liens pour les événements et entreprises, puis un footer riche avec contact, réseaux et langues.

## Notes d’implémentation

La première version est un frontend statique interactif. Le générateur fonctionne comme une expérience locale de composition : l’utilisateur choisit un sujet, une ambiance, une pose et un format, puis obtient une carte de résultat avec un visuel éditorial préchargé et une copie de prompt prête à l’emploi. La réservation et les boutons de portfolio sont présentés comme des parcours d’interface et donnent un feedback clair via toast tant qu’aucun backend n’est connecté.
