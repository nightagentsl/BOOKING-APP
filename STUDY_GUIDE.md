# 📅 Système de Réservation de Services

**TP Refactoring - Bonnes Pratiques de Conception**

## 🎯 Objectif

Refondre une application PHP monolithique en appliquant les bonnes pratiques de développement :
- Architecture en 3 couches (Controller → Service → Repository)
- Séparation des responsabilités
- Code lisible et maintenable
- Validation des données
- Gestion d'erreurs propre

## ✨ Fonctionnalités

- ✅ **Authentification** : Connexion par email (simulée, sans mot de passe)
- ✅ **Gestion des services** : Créer, lister, supprimer des services
- ✅ **Gestion des créneaux** : Ajouter des créneaux avec date/heure et capacité
- ✅ **Réservations** : Réserver un créneau, consulter et annuler ses réservations
- ✅ **Contrôle d'accès** : Rôles admin/utilisateur avec droits spécifiques
- ✅ **Validation** : Empêcher le double booking, vérifier les données entrantes
- ✅ **Persistance** : Stockage en localStorage

## 🏗️ Architecture

### Structure 3 couches

```
src/
├── components/          # 🎨 Présentation (Vue)
│   ├── AuthForm.vue
│   ├── ServiceList.vue
│   ├── BookingForm.vue
│   ├── MyBookings.vue
│   └── AdminPanel.vue
│
├── services/           # 💼 Logique métier
│   ├── AuthService.js
│   ├── ServiceService.js
│   └── BookingService.js
│
├── repositories/       # 💾 Accès données
│   └── DataRepository.js
│
├── models/             # 📋 Types/Structures
│   └── types.js
│
├── utils/              # 🛠️ Helpers
│   └── validators.js
│
└── App.vue             # 🎯 Composant principal
```

### Flux de données

```
Vue Component (Présentation)
         ↓
    Service (Logique métier)
         ↓
  Repository (Accès données)
         ↓
   localStorage (Persistance)
```

**Avantages** :
- ✅ Testable : chaque couche indépendante
- ✅ Maintenable : modifications isolées
- ✅ Réutilisable : services appelables de plusieurs composants
- ✅ Lisible : responsabilités claires

## 🛠️ Choix technologiques

### Vue.js 3 (avec Vite)

**Justification** :
- Framework moderne et actif pour UI réactive
- Courbe d'apprentissage douce
- Écosystème riche (outillage, plugins)
- Hot Module Replacement (HMR) rapide avec Vite

### JavaScript ES6+

**Justification** :
- Langage natif du navigateur
- Classes et modules natifs
- Destructuration et spread operator simplifiés
- Async/await pour les opérations asynchrones

### localStorage

**Justification** :
- Simple pour un prototype pédagogique
- Pas de serveur backend requis
- Persistance entre les sessions
- Alternative : facile de migrer vers une API REST

## 📦 Installation

### Prérequis
- **Node.js** v18+ ([télécharger](https://nodejs.org))
- **npm** (livré avec Node.js)

### Étapes

1. **Cloner le projet** (si applicable)
```bash
git clone <url-du-repo>
cd booking-app
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Lancer le serveur de développement**
```bash
npm run dev
```

4. **Ouvrir dans le navigateur**
```
http://localhost:5173
```

## 🚀 Utilisation

### Comptes de test

| Email | Rôle | Accès |
|-------|------|-------|
| `admin@example.com` | Admin | Services, créneaux, réservations |
| `user@example.com` | Utilisateur | Réservations uniquement |
| N'importe quel email | Utilisateur | Auto-création du compte |

### Workflow

#### 👤 En tant qu'administrateur

1. Se connecter avec `admin@example.com`
2. Créer un service (ex: "Massage", "30 min")
3. Ajouter un créneau (date/heure future)
4. Voir le service dans la liste

#### 👥 En tant qu'utilisateur

1. Se connecter avec `user@example.com`
2. Voir les services disponibles
3. Sélectionner un service → choisir un créneau
4. Réserver
5. Voir la réservation dans "Mes réservations"
6. Annuler si souhaité

## 🧪 Tests

Les fonctionnalités principales sont testées manuellement :
- ✅ Authentification et gestion des rôles
- ✅ Création/suppression de services
- ✅ Création/suppression de créneaux
- ✅ Réservation/annulation
- ✅ Validation (pas de double booking, email valide, etc.)

**Pour des tests automatisés**, utiliser **Vitest** :
```bash
npm run test
```

## 📝 Qualité du code

### Linter

ESLint est configuré pour vérifier la qualité du code :
```bash
npm run lint
```

### Formateur

Prettier est configuré pour formater le code :
```bash
npm run format
```

## 📂 Structure des données

### Services
```javascript
{
  id: "svc_1234567890",
  name: "Massage",
  description: "30 min relaxant",
  duration: 30,
  createdAt: "2025-11-12T10:00:00Z"
}
```

### Créneaux
```javascript
{
  id: "slt_1234567890",
  serviceId: "svc_1234567890",
  datetime: "2025-11-20T14:00:00Z",
  capacity: 1,
  available: 1,
  createdAt: "2025-11-12T10:00:00Z"
}
```

### Réservations
```javascript
{
  id: "res_1234567890",
  slotId: "slt_1234567890",
  userEmail: "alice@example.com",
  status: "confirmed",
  createdAt: "2025-11-12T10:00:00Z"
}
```

## 🔒 Sécurité

⚠️ **Note** : Cette application est un prototype pédagogique. Pour la production :
- Implémenter une authentification sécurisée (JWT, OAuth)
- Valider côté serveur (ne pas faire confiance au client)
- Utiliser HTTPS
- Protéger les données sensibles
- Implémenter CSRF tokens

## 🐛 Problèmes rencontrés et solutions

### 1. **Erreur : "Failed to resolve import @/components/..."**

**Cause** : L'alias `@` n'était pas configuré correctement dans Vite.

**Solution** :
- Ajouter la configuration dans `vite.config.js` :
```javascript
import path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```
- Ou utiliser des chemins relatifs : `import { Auth } from '../services/AuthService.js'`

### 2. **Formulaire "Ajouter créneau" ne répondait pas**

**Cause** : Problème de liaison des données (v-model) et structure du formulaire.

**Solution** :
- Simplifier la structure du formulaire
- Ajouter des validations explicites dans les méthodes
- Utiliser `alert()` pour confirmer les actions
- Vérifier que tous les champs du formulaire sont correctement liés avec `v-model`

### 4. **Date/heure du créneau invisible (texte blanc sur blanc)**

**Cause** : Pas de couleur de texte définie sur `.booking-card`.

**Solution** :
```css
.booking-card {
  color: #333;  /* Ajouter cette ligne */
}

.booking-card p {
  color: #333;  /* Ajouter cette couleur */
}
```

### 5. **Node.js non accessible via `code .` command**

**Cause** : VS Code n'était pas dans le PATH du système.

**Solution** :
- Utiliser **File → Open Folder** dans VS Code
- Ou installer VS Code CLI : `Shell Command: Install 'code' command in PATH`

### 6. **Terminal toujours dans le dossier racine au lieu de `booking-app`**

**Cause** : Navigation manuelle vers le mauvais dossier.

**Solution** :
```bash
cd booking-app
npm run dev
```

## 💡 Leçons apprises

✅ **Toujours commencer simple** : Tester les imports avec une version minimaliste avant d'ajouter la complexité

✅ **Vérifier l'ordre de création** : Les fichiers services doivent exister avant les composants qui les utilisent

✅ **Utiliser des chemins relatifs** : Plus fiable que les alias pour les petits projets

✅ **Hot Reload** : Vite compile automatiquement → toujours recharger le navigateur après les modifications

✅ **Les erreurs console sont tes amies** : DevTools (Cmd+Alt+I) aide à identifier les vrais problèmes

✅ **Tester avec des données réelles** : Créer un service et un créneau pour s'assurer que tout fonctionne

## 📚 Concepts appliqués

- **Architecture en couches** : Séparation présentation/métier/données
- **Single Responsibility Principle (SRP)** : Chaque classe/fonction a une responsabilité
- **DRY (Don't Repeat Yourself)** : Pas de code dupliqué
- **Validation centralisée** : Tous les contrôles au même endroit
- **Gestion d'erreurs** : Messages clairs pour l'utilisateur
- **Nommage explicite** : Variables et fonctions autodocumentées

## 🤝 Contribution

Ce projet est un TP en module bonne pratique dev

## 📄 Licence

Projet pédagogique 

## 👨‍💻 Auteur

Gracia NAMBEA Bachelor 2 Cybersécurité
