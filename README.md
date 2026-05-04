# 🧠 DataBrain Hub

Plateforme de gestion pour la Masterclass **REBOOT BUSINESS — Brazzaville Décembre**.

## ⚡ Démarrage rapide

### 1. Installer les dépendances

```bash
npm install
```

### 2. Configurer les variables d'environnement

```bash
cp .env.example .env.local
```

Ouvrez `.env.local` et ajoutez votre clé API Anthropic :

```
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxx
```

Obtenez votre clé sur → [console.anthropic.com](https://console.anthropic.com)

### 3. Lancer le serveur de développement

```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000)

---

## 🏗️ Structure du projet

```
databrain-hub/
├── app/
│   ├── page.tsx                   # Login (sélection rôle)
│   ├── client/                    # Espace équipe (lecture)
│   │   ├── page.tsx               # Dashboard principal
│   │   ├── finances/page.tsx      # Transparence financière
│   │   ├── billets/page.tsx       # Billets & revenus
│   │   ├── reunions/page.tsx      # Comptes rendus
│   │   ├── planning/page.tsx      # Calendrier & deadlines
│   │   ├── equipe/page.tsx        # Statut de l'équipe
│   │   └── rapports/page.tsx      # Rapports de synthèse
│   ├── staff/                     # Espace secrétaire (opérations)
│   │   ├── page.tsx               # Dashboard + accès rapides
│   │   ├── notes/page.tsx         # Prise de notes + IA
│   │   ├── depenses/page.tsx      # Saisie des dépenses
│   │   ├── billets/page.tsx       # Saisie des ventes
│   │   ├── planning/page.tsx      # Planifier réunions + IA
│   │   └── assistant/page.tsx     # Chat IA complet
│   └── api/
│       ├── ai/chat/route.ts       # Claude API — assistant
│       ├── notes/generate/route.ts # Claude API — compte rendu
│       └── planning/suggest/route.ts # Claude API — ordre du jour
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx            # Navigation (client & staff)
│   │   └── Header.tsx             # En-tête avec countdown
│   └── ui/index.tsx               # Composants UI réutilisables
├── contexts/AppContext.tsx         # État global (useReducer)
└── lib/
    ├── types.ts                    # Types TypeScript
    ├── data.ts                     # Données initiales
    └── utils.ts                    # Fonctions utilitaires
```

---

## 🎯 Fonctionnalités

### Espace Équipe (Client)
| Page | Description |
|------|-------------|
| Dashboard | Vue d'ensemble : revenus, dépenses, billets, countdown |
| Finances | Dépenses par catégorie, revenus, solde net |
| Billets | Suivi des ventes par type et canal |
| Réunions | Historique + comptes rendus + suivi des actions |
| Planning | Calendrier + deadlines importantes |
| Équipe | Statut des membres (slides prêtes, tâches) |
| Rapports | Synthèse complète imprimable |

### Espace Secrétaire (Staff)
| Page | Description |
|------|-------------|
| Dashboard | Accès rapides + tâches du jour |
| Notes | Saisie libre → compte rendu généré par IA |
| Dépenses | Formulaire rapide + historique |
| Billets | Saisie ventes + suivi progression |
| Planning | Créer réunions + ordre du jour IA |
| Assistant IA | Chat complet avec Claude (contexte enrichi) |

---

## 🤖 Fonctions IA (Claude API)

1. **Compte rendu automatique** — La secrétaire tape librement ses notes, Claude structure le résumé, les décisions et les actions.

2. **Ordre du jour suggéré** — Claude propose un agenda basé sur le titre de la réunion et les actions en attente.

3. **Assistant chat** — Claude répond à toutes les questions avec le contexte complet de l'événement (finances, réunions, équipe, billets).

---

## 🚀 Déploiement sur Vercel

```bash
npm run build   # Vérifier que ça compile
vercel deploy   # Déployer
```

Ajoutez `ANTHROPIC_API_KEY` dans les variables d'environnement Vercel.

---

## 🔮 Phase 3 — Connexion Supabase

Pour persister les données en base de données (au lieu de l'état React) :

1. Créer un projet sur [supabase.com](https://supabase.com)
2. Ajouter les clés dans `.env.local`
3. Remplacer le `useReducer` dans `AppContext.tsx` par des appels Supabase

---

**DataBrain Hub** · REBOOT BUSINESS · Brazzaville Décembre 🇨🇬
