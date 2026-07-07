# SCULPT'AURA — Guide de configuration & de démonstration

> Ce guide explique, **pas à pas et en langage simple**, comment lancer une
> démonstration de la boutique, puis comment créer les comptes (base de données,
> e-mails, paiement Mobile Money / carte) pour la mettre **réellement en ligne**.

---

## Sommaire

1. [Les deux modes : Démo et Réel](#1--les-deux-modes--démo-et-réel)
2. [Lancer une démo en 5 minutes (sans aucun compte)](#2--lancer-une-démo-en-5-minutes-sans-aucun-compte)
3. [Faire une démo complète du parcours d'achat](#3--faire-une-démo-complète-du-parcours-dachat)
4. [Passer en mode réel — vue d'ensemble](#4--passer-en-mode-réel--vue-densemble)
5. [Compte 1 — Supabase (base de données + comptes clients)](#5--compte-1--supabase-base-de-données--comptes-clients)
6. [Compte 2 — Resend (e-mails + factures)](#6--compte-2--resend-e-mails--factures)
7. [Compte 3 — Paiement (Mobile Money / carte)](#7--compte-3--paiement-mobile-money--carte)
8. [Où mettre chaque clé (récapitulatif des fichiers .env)](#8--où-mettre-chaque-clé-récapitulatif-des-fichiers-env)
9. [Vérifier que tout fonctionne](#9--vérifier-que-tout-fonctionne)
10. [Questions fréquentes / dépannage](#10--questions-fréquentes--dépannage)

---

## 1 · Les deux modes : Démo et Réel

Le site est conçu pour fonctionner de **deux façons**, selon que tu as fourni
des clés ou non. **Tu n'as rien à coder pour changer de mode** — tout dépend des
fichiers `.env`.

| | **Mode Démo** (par défaut) | **Mode Réel** |
| --- | --- | --- |
| Base de données | En mémoire (temporaire) | **Supabase** (permanent) |
| Comptes clients | Simulés | **Vrais comptes** (Supabase Auth) |
| Paiement | Page « Payer (démo) », **0 F débité** | **Mobile Money / carte** réel |
| E-mails & factures | Écrits dans les logs | **Envoyés** par Resend |
| Clés nécessaires | **Aucune** | Supabase + Resend + Paiement |

> 👉 Commence **toujours** par le mode Démo pour voir la boutique tourner, puis
> ajoute les comptes un par un.

---

## 2 · Lancer une démo en 5 minutes (sans aucun compte)

**Pré-requis :** avoir installé [Node.js](https://nodejs.org) (version 18 ou plus).

```bash
# 1. Depuis le dossier du projet, installer les dépendances
npm install

# 2. Démarrer l'API (dans un 1er terminal)
npm run dev:backend        # http://localhost:4000

# 3. Démarrer la boutique (dans un 2e terminal)
npm run dev:frontend       # http://localhost:3000

# 4. (Optionnel) Démarrer l'administration (3e terminal)
npm run dev:admin          # http://localhost:3001
```

Ouvre ensuite **http://localhost:3000** dans ton navigateur. 🎉

En mode démo, **rien n'est à configurer** : les produits, le panier, la carte de
livraison, le paiement (simulé) et la confirmation fonctionnent immédiatement.

---

## 3 · Faire une démo complète du parcours d'achat

Voici le scénario à montrer (il fonctionne dès le mode démo) :

1. **Page d'accueil** → fais défiler l'éditorial noir & blanc.
2. Clique **Collections** → la grille de produits.
3. Ouvre un produit → **avis vérifiés**, quantité, **Ajouter au panier**.
4. Le **panier** s'ouvre à droite → **Passer au paiement**.
5. Sur le **checkout** : remplis le formulaire, **clique sur la carte** pour
   poser le point de livraison (Leaflet), observe les **frais de port** qui
   s'adaptent au pays (gratuit au Cameroun au-dessus de 75 000 XAF).
6. Clique **Confirmer la commande** → tu arrives sur la page **« Paiement —
   Mode démonstration »**.
7. Clique **Payer (démo)** → redirection vers la page **« Merci pour votre
   commande »** avec la référence.
8. Bascule **FR / EN** en haut à droite → toute la boutique change de langue
   **sans rechargement**.
9. Ouvre l'**administration** (http://localhost:3001) → tableau de bord,
   commandes sur la **carte logistique**, produits, modération des avis.

> 💡 **Astuce démo** : en mode démo, la facture PDF et l'e-mail ne sont pas
> envoyés mais **générés** — tu peux tester la génération d'une facture avec :
> ```bash
> curl -X POST http://localhost:4000/api/invoices \
>   -H "Content-Type: application/json" \
>   -d '{"reference":"SA-2026-0001","items":[{"name":"Sérum","quantity":1,"unitPriceXAF":82000}],"subtotalXAF":82000,"shippingXAF":0,"totalXAF":82000}' \
>   --output facture-demo.pdf
> ```
> Ouvre `facture-demo.pdf` : c'est la facture noir & blanc de la maison.

---

## 4 · Passer en mode réel — vue d'ensemble

Pour vendre pour de vrai, il faut **3 comptes** (tous ont une offre gratuite pour
démarrer) :

| # | Service | À quoi ça sert | Coût pour démarrer |
| --- | --- | --- | --- |
| 1 | **Supabase** | Base de données + comptes clients | Gratuit |
| 2 | **Resend** | E-mails de confirmation + factures | Gratuit (100 e-mails/jour) |
| 3 | **CinetPay** (ou autre) | Encaisser Mobile Money / carte | Gratuit à l'inscription, commission par vente |

Tu crées les comptes, tu récupères des **clés**, et tu les colles dans les
fichiers `.env`. **Aucune modification de code n'est nécessaire.**

---

## 5 · Compte 1 — Supabase (base de données + comptes clients)

Supabase héberge tes produits, commandes, avis et les comptes clients.

### Étapes

1. Va sur **https://supabase.com** → **Start your project** → crée un compte
   (avec Google ou GitHub, c'est plus rapide).
2. Clique **New project**. Donne un nom (`sculptaura`), choisis une région
   proche (ex. *West EU* ou *Central US*), définis un **mot de passe de base de
   données** (garde-le précieusement).
3. Attends ~2 minutes que le projet se crée.
4. **Créer les tables** : dans le menu de gauche, ouvre **SQL Editor** →
   **New query**. Copie-colle tout le contenu du fichier
   [`supabase/schema.sql`](./supabase/schema.sql) → **Run**.
5. **Ajouter les produits de démo** : nouvelle requête, copie-colle
   [`supabase/seed.sql`](./supabase/seed.sql) → **Run**.
6. **Récupérer les clés** : menu **Project Settings** (⚙️) → **API**. Note :
   - **Project URL** → c'est ton `SUPABASE_URL`
   - **`anon` `public`** → c'est ta clé publique (`ANON_KEY`)
   - **`service_role` `secret`** → clé **secrète** (backend uniquement)

### Te nommer administrateur

Pour accéder à l'admin, ton compte doit être marqué comme admin :

1. Crée-toi un compte depuis la boutique (`/register`) **ou** dans Supabase →
   **Authentication** → **Add user**.
2. Dans **SQL Editor**, exécute (remplace l'e-mail) :
   ```sql
   update public.profiles set is_admin = true
   where id = (select id from auth.users where email = 'ton-email@exemple.com');
   ```

### Où coller les clés

- `frontend/.env.local` :
  ```
  NEXT_PUBLIC_SUPABASE_URL=<Project URL>
  NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon public>
  ```
- `admin/.env.local` : les deux mêmes lignes.
- `backend/.env` :
  ```
  SUPABASE_URL=<Project URL>
  SUPABASE_SERVICE_ROLE_KEY=<service_role secret>
  ```

> ⚠️ La clé **`service_role`** est **secrète** : elle ne va **que** dans le
> backend, **jamais** dans le frontend ni sur GitHub.

---

## 6 · Compte 2 — Resend (e-mails + factures)

Resend envoie l'e-mail de confirmation avec la facture PDF en pièce jointe.

### Étapes

1. Va sur **https://resend.com** → crée un compte.
2. **(Recommandé)** Menu **Domains** → **Add Domain** → saisis ton domaine
   (ex. `sculptaura.com`) et ajoute les enregistrements DNS indiqués chez ton
   hébergeur de domaine. Cela permet d'envoyer depuis `no-reply@sculptaura.com`.
   *(Tu peux tester sans domaine avec l'adresse de test fournie par Resend.)*
3. Menu **API Keys** → **Create API Key** → copie la clé (commence par `re_…`).
4. Colle-la dans `backend/.env` :
   ```
   RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
   ```
5. Si ton adresse d'envoi diffère de `no-reply@sculptaura.com`, modifie la
   constante `FROM` dans `backend/src/lib/mailer.js`.

> Tant que `RESEND_API_KEY` est vide, les e-mails sont simplement **écrits dans
> les logs** (mode démo) — pratique pour tester sans rien envoyer.

---

## 7 · Compte 3 — Paiement (Mobile Money / carte)

Le projet est livré prêt pour **CinetPay**, une passerelle africaine qui gère
**MTN Mobile Money, Orange Money et cartes** — idéale pour le Cameroun. Le code
prévoit aussi de brancher facilement d'autres prestataires.

### Option recommandée (Cameroun) — CinetPay

1. Va sur **https://cinetpay.com** → **Créer un compte marchand**.
2. Complète le dossier marchand (informations sur l'entreprise / l'activité).
   L'activation peut demander une validation par CinetPay.
3. Une fois le compte actif, dans le tableau de bord CinetPay → **Intégrations /
   API** → récupère :
   - **API Key** → `CINETPAY_API_KEY`
   - **Site ID** → `CINETPAY_SITE_ID`
4. Dans `backend/.env` :
   ```
   PAYMENT_PROVIDER=cinetpay
   CINETPAY_API_KEY=<ton api key>
   CINETPAY_SITE_ID=<ton site id>
   PUBLIC_API_URL=https://api.tondomaine.com   # URL publique de ton backend
   ```
5. **URL de notification (webhook)** : dans CinetPay, configure l'URL de
   notification sur :
   ```
   https://api.tondomaine.com/webhooks/payment
   ```
   C'est cette URL que CinetPay appelle après un paiement ; le backend vérifie la
   transaction puis marque la commande **payée** et envoie la facture.

### Autres prestataires possibles

- **Notch Pay** (https://notchpay.co) — Mobile Money Cameroun, intégration simple.
- **Flutterwave** (https://flutterwave.com) — large couverture Afrique + cartes.
- **Stripe** (https://stripe.com) — pour la clientèle **internationale** (cartes).

> Le code isole le paiement dans `backend/src/payments/`. Ajouter un prestataire
> = créer un fichier (ex. `notchpay.js`) qui expose `initPayment()` et
> `verifyWebhook()`, puis l'ajouter dans `payments/index.js`. Je peux le faire
> pour toi une fois le prestataire choisi.

---

## 8 · Où mettre chaque clé (récapitulatif des fichiers .env)

Copie d'abord les modèles :

```bash
cp frontend/.env.example frontend/.env.local
cp admin/.env.example    admin/.env.local
cp backend/.env.example  backend/.env
```

Puis remplis :

### `frontend/.env.local`
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_API_URL=http://localhost:4000     # ou l'URL publique de l'API
NEXT_PUBLIC_SITE_URL=http://localhost:3000    # ou ton domaine
```

### `admin/.env.local`
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_API_URL=http://localhost:4000
```

### `backend/.env`
```
PUBLIC_API_URL=http://localhost:4000
FRONTEND_ORIGIN=http://localhost:3000
ADMIN_ORIGIN=http://localhost:3001
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...        # SECRET
RESEND_API_KEY=...                   # SECRET
PAYMENT_PROVIDER=cinetpay            # ou "demo"
CINETPAY_API_KEY=...                 # SECRET
CINETPAY_SITE_ID=...
```

> 🔒 Les fichiers `.env` / `.env.local` sont **ignorés par Git** (voir
> `.gitignore`) : tes secrets ne partent jamais sur GitHub.

---

## 9 · Vérifier que tout fonctionne

Après avoir rempli les `.env`, redémarre les 3 services puis :

- [ ] La boutique affiche les produits **venant de Supabase** (modifie un prix
      dans Supabase → il change sur le site après quelques minutes).
- [ ] Créer un compte sur `/register` → tu reçois l'e-mail de confirmation
      Supabase.
- [ ] Passer une commande → tu es redirigé vers **la vraie page de paiement**
      (CinetPay) au lieu de la page démo.
- [ ] Après paiement, la commande passe en **« Payée »** dans l'admin et le
      client **reçoit l'e-mail + la facture PDF**.
- [ ] Un client ne peut laisser un avis **que** sur un produit qu'il a **payé**.

**Test rapide de l'API (sans navigateur) :**
```bash
# L'API répond ?
curl http://localhost:4000/health

# Calcul des frais de port (Cameroun, 80 000 XAF → gratuit)
curl -X POST http://localhost:4000/api/shipping/quote \
  -H "Content-Type: application/json" \
  -d '{"countryCode":"CM","subtotalXAF":80000}'
```

---

## 10 · Questions fréquentes / dépannage

**« Je n'ai pas encore de prestataire de paiement, puis-je quand même montrer le site ? »**
Oui — laisse `PAYMENT_PROVIDER=demo` (ou vide). Le parcours d'achat complet
fonctionne avec la page de paiement de démonstration.

**« Les e-mails ne partent pas. »**
Vérifie que `RESEND_API_KEY` est bien dans `backend/.env` et que ton domaine est
validé dans Resend. Sans clé, les e-mails sont volontairement seulement affichés
dans les logs.

**« L'admin me refuse l'accès. »**
Ton compte doit avoir `is_admin = true` dans la table `profiles` (voir §5).

**« Les produits ne changent pas après modification dans Supabase. »**
Les pages sont mises en cache quelques minutes (ISR, `revalidate = 300`).
Attends ~5 min ou redéploie.

**« Où héberger le tout en production ? »**
- `frontend` et `admin` → **Vercel** (un projet chacun).
- `backend` → **Render**, **Railway** ou **Fly.io**.
- Base de données → **Supabase** (déjà hébergée).
Pense à reporter toutes les variables `.env` dans les réglages de chaque
hébergeur, et à mettre à jour `PUBLIC_API_URL`, `FRONTEND_ORIGIN`, `ADMIN_ORIGIN`
et `NEXT_PUBLIC_API_URL` avec les vraies URLs.

---

<div align="center">

_Besoin d'aide pour une étape précise ? Indique le prestataire de paiement
retenu et je finalise son branchement._

**SCULPT'AURA — Douala · Cameroun · XAF**

</div>
