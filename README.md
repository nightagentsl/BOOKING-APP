# 📅 Système de Réservation de Services

**TP Refactoring - Bonnes Pratiques de Conception (Bachelor 2 Cybersécurité)**

## 🎯 Objectif

Refondre une application PHP monolithique en appliquant les bonnes pratiques :
- ✅ Architecture en **3 couches** (Présentation | Métier | Données)
- ✅ **Séparation des responsabilités**
- ✅ Code **lisible et maintenable**
- ✅ **Validation des données**
- ✅ **Gestion d'erreurs**

## ✨ Fonctionnalités

- 🔐 **Authentification** : Connexion par email (simulée)
- 📦 **Gestion des services** : Créer, lister, supprimer
- 📅 **Gestion des créneaux** : Ajouter avec date/heure et capacité
- 📝 **Réservations** : Réserver, consulter, annuler
- ✔️ **Validation** : Pas double booking, email valide, créneau disponible

## 🏗️ Architecture

```
src/
├── components/        # 🎨 Présentation (Vue)
├── services/         # 💼 Logique métier
├── repositories/     # 💾 Accès données (localStorage)
├── models/          # 📋 Types/Structures
└── utils/           # 🛠️ Helpers (validation)
```

## 🛠️ Stack Technologique

| Tech | Raison |
|------|--------|
| **Vue.js 3** | Framework moderne, réactif |
| **Vite** | Bundler ultra-rapide |
| **JavaScript ES6+** | Langage natif |
| **localStorage** | Persistance simple |

## 📦 Installation

### Prérequis
- Node.js v18+
- npm

### Étapes
```bash
# Cloner
git clone https://github.com/nightagentsl/booking-app.git
cd booking-app

# Installer
npm install

# Lancer
npm run dev
```

Ouvrir : **http://localhost:5173**

## 👤 Comptes de Test

| Email | Rôle | Accès |
|-------|------|-------|
| `admin@example.com` | Admin | Services, créneaux, réservations |
| `user@example.com` | User | Réservations |
| Autre email | Auto-création | Utilisateur normal |

## 🎬 Workflow

### En tant qu'admin
1. Créer un service ("Massage", "30 min")
2. Ajouter un créneau (date/heure future)
3. Voir le service dans la liste

### En tant qu'utilisateur
1. Se connecter
2. Voir les services disponibles
3. Réserver un créneau
4. Consulter "Mes réservations"
5. Annuler si besoin

## 📚 Concepts Appliqués

✅ **Architecture 3 couches** → Séparation responsabilités
✅ **SRP** (Single Responsibility) → Une classe = une responsabilité
✅ **DRY** (Don't Repeat Yourself) → Pas de duplication
✅ **Validation centralisée** → Un seul endroit
✅ **Gestion d'erreurs** → Messages clairs

## 🐛 Problèmes Rencontrés & Solutions

| Problème | Solution |
|----------|----------|
| Import alias `@/` | Config Vite + chemins relatifs |
| Formulaire inactif | Simplifier structure + validations |
| Texte invisible | Ajouter `color: #333` au CSS |
| Node `code .` | Utiliser File → Open Folder |

## 🔮 Améliorations Futures

- 🌐 Backend (Node.js/Express + PostgreSQL)
- 🔐 JWT tokens + hachage des mots de passe
- 📧 Notifications (Email, SMS)
- 🧪 Tests unitaires (Vitest)
- 📱 Responsive design amélioré

## 📝 Documentation

Pour la documentation complète et le guide d'étude, voir **`STUDY_GUIDE.md`**

## 🔒 Sécurité

⚠️ **Note** : Ceci est un prototype pédagogique.

**Problèmes actuels** :
- localStorage accessible au JS (XSS risk)
- Pas HTTPS
- Pas d'authentification robuste
- Pas de validation serveur

**Pour la production** :
- API REST sécurisée (HTTPS)
- JWT tokens (pas localStorage)
- Hachage des mots de passe
- Validation côté serveur
- CORS configuré

## 📂 Structure des Données

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
  available: 1
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

## 🤝 Contribution

C'est un projet pédagogique.

## 📄 Licence

Projet pédagogique

## 👨‍💻 Auteur

Gracia NAMBEA - Bachelor 2 Cybersécurité

**GitHub** : https://github.com/nightagentsl/booking-app
