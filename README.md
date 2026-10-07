# Extension consommation par pixel

Extension chrome permettant d'estimer la puissance par rapport au contenu d'une zone affiché sur un ecran OLED.

La puissance affiché est une approximation trouvé et ne permet pas de déterminer avec précision combien un ecran OLED consomme exactement pour se type d'affichage.

L'extension est conçu comme un **outil d'estimation et de comparaison**, et non comme un wattmètre
---

## 1. Fonctionnalités

L'extension permet actuellement de :

**SELECTION DE LA ZONE**
- sélectionner une zone de la page avec la souris ;
- sélectionner une zone correspondant à un élément HTML `<div>` ;
    - renseigner directement l'ID d'un `<div>` ;
    - lister les `<div>` possédant un ID sur la page ;

**CALCUL ET ANALYSE**
- analyser le contenu pixel d'une zone ;
- calculer des statistiques RGB et de luminance ;
- estimer une puissance associée au contenu affiché ;
- *choisir un modèle d'écran* ;
- analyser une interaction sur une zone donnée ;
- réaliser plusieurs captures pendant l'interaction ;
- calculer des statistiques sur l'ensemble des captures.

L'extension est actuellement développée pour Chrome avec Manifest V3.

---

## Installation :
**Prérequis**

- Google Chrome ou un navigateur Chromium compatible avec Manifest V3 ;
- accès au code source de l'extension.

**Installation en mode développeur**
- Ouvrir Chrome.
- Aller dans : chrome://extensions/
- Cliquer sur Charger l'extension non empaquetée.
- Sélectionner le dossier contenant manifest.json.

L'extension apparaît alors dans la liste des extensions.

Après une modification du code, utiliser le bouton Recharger depuis la page des extensions Chrome.

## Résultat

Les résultats de l'anaylse des pixels se trouvent dans la console du navigateur.

### Nombre de pixel
- pixelCount : nombre de pixel dans la zone
### Valeurs RGB
pour chauqe couleur(red, green, blue) :
- moyenne par pixel
- ecart-type
### Luminance
- moyenne par pixel
- ecart-type
### puissance estimé

- p_total_ecran : puissance estimée de l'écran entier à partir du contenu de la zone analysée 
- p_pixel : puissance estimée rapportée au nombre de pixels de la zone 
- mean_ratio : indice moyen utilisé par le modèle.