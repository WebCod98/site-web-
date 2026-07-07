# SCULPT'AURA — Guide de déploiement (mise en ligne gratuite)

> Objectif : obtenir un **lien public** (ex. `https://sculptaura.vercel.app`) que
> **n'importe qui peut ouvrir depuis son téléphone ou son ordinateur**, sans que
> ton PC soit allumé. Tout est **gratuit** pour démarrer.

## Ce qu'on va déployer

| Partie | Hébergeur | Résultat |
| --- | --- | --- |
| **Boutique** (`frontend/`) | **Vercel** | `https://sculptaura.vercel.app` |
| **Administration** (`admin/`) | **Vercel** (2e projet) | `https://sculptaura-admin.vercel.app` |
| **API** (`backend/`) | **Render** | `https://sculptaura-api.onrender.com` |

> 💡 Le code est déjà prêt : `frontend/vercel.json`, `admin/vercel.json` et
> `render.yaml` sont fournis. Tu n'as **rien à coder**.

Pré-requis : ton code est sur GitHub (`github.com/WebCod98/site-web-`) ✅

---

## Étape 1 — Déployer la BOUTIQUE sur Vercel

1. Va sur **https://vercel.com** → **Sign Up** → **Continue with GitHub**.
2. **Add New… → Project** → autorise Vercel à voir tes dépôts → choisis
   **`site-web-`** → **Import**.
3. **Réglage important** — dépose « Root Directory » sur le dossier de la boutique :
   - **Root Directory** → clique **Edit** → sélectionne **`frontend`**.
   - Framework : **Next.js** (détecté automatiquement).
4. **Environment Variables** (facultatif au début — la boutique tourne en mode
   démo sans elles) :
   | Nom | Valeur |
   | --- | --- |
   | `NEXT_PUBLIC_API_URL` | (l'URL Render de l'API — voir Étape 3, à remplir ensuite) |
   | `NEXT_PUBLIC_SITE_URL` | l'URL Vercel de la boutique |
   | `NEXT_PUBLIC_SUPABASE_URL` | (si Supabase configuré) |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | (si Supabase configuré) |
5. Clique **Deploy**. Après ~1 minute → **ton lien public est prêt** 🎉
   (ex. `https://site-web-xxxx.vercel.app`).

> Tu peux renommer le projet et le domaine dans **Settings → Domains**.

---

## Étape 2 — Déployer l'ADMINISTRATION sur Vercel

Répète l'Étape 1, mais avec le dossier admin :

1. **Add New… → Project** → même dépôt **`site-web-`** → **Import**.
2. **Root Directory** → **Edit** → sélectionne **`admin`**.
3. **Environment Variables** (si Supabase configuré) :
   | Nom | Valeur |
   | --- | --- |
   | `NEXT_PUBLIC_SUPABASE_URL` | ton URL Supabase |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ta clé anon |
   | `NEXT_PUBLIC_API_URL` | l'URL Render de l'API |
4. **Deploy**.

> Donne-lui un nom distinct (ex. `sculptaura-admin`) pour ne pas confondre les
> deux liens.

---

## Étape 3 — Déployer l'API sur Render

1. Va sur **https://render.com** → **Get Started** → **GitHub**.
2. **New → Blueprint** → choisis le dépôt **`site-web-`**.
   Render lit automatiquement le fichier **`render.yaml`** et propose le service
   `sculptaura-api`.
3. Clique **Apply** / **Create**. Le premier déploiement prend quelques minutes.
4. Une fois en ligne, note l'URL (ex. `https://sculptaura-api.onrender.com`).
5. Dans **Environment** du service, renseigne :
   | Nom | Valeur |
   | --- | --- |
   | `PUBLIC_API_URL` | l'URL Render ci-dessus |
   | `FRONTEND_ORIGIN` | l'URL Vercel de la boutique |
   | `ADMIN_ORIGIN` | l'URL Vercel de l'admin |
   | `PAYMENT_PROVIDER` | `demo` (ou `cinetpay` + clés) |
   | `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` | (si configuré) |
   | `RESEND_API_KEY` | (si configuré) |

> ⚠️ Offre gratuite Render : le service **se met en veille** après inactivité.
> La 1ʳᵉ requête après une pause peut prendre ~30 s à répondre (normal).

---

## Étape 4 — Relier la boutique à l'API

Pour que le paiement / les commandes fonctionnent en ligne :

1. Retourne sur **Vercel → projet boutique → Settings → Environment Variables**.
2. Mets `NEXT_PUBLIC_API_URL` = l'URL Render de l'API (Étape 3).
3. Onglet **Deployments → … → Redeploy** pour réappliquer la variable.
4. Fais de même pour le projet **admin** si besoin.

---

## Étape 5 — Partager le lien 📲

Envoie simplement l'URL de la boutique (ex. `https://sculptaura.vercel.app`) par
WhatsApp / SMS. La personne l'ouvre sur son téléphone — **rien à installer**.

- Le parcours complet fonctionne en **mode démo** (paiement simulé).
- Pour des **paiements réels** (Mobile Money) et de **vrais e-mails/factures**,
  suis d'abord [`SETUP.md`](./SETUP.md) puis renseigne les clés dans Vercel + Render.

---

## Déploiements automatiques

Une fois connecté, **chaque `git push`** sur GitHub redéploie automatiquement
Vercel et Render. Tu pousses une modif → le site public se met à jour tout seul.

---

## Récapitulatif des variables par service

**Vercel — Boutique (`frontend`)**
```
NEXT_PUBLIC_API_URL=https://sculptaura-api.onrender.com
NEXT_PUBLIC_SITE_URL=https://sculptaura.vercel.app
NEXT_PUBLIC_SUPABASE_URL=...        (optionnel)
NEXT_PUBLIC_SUPABASE_ANON_KEY=...   (optionnel)
```

**Vercel — Admin (`admin`)**
```
NEXT_PUBLIC_API_URL=https://sculptaura-api.onrender.com
NEXT_PUBLIC_SUPABASE_URL=...        (optionnel)
NEXT_PUBLIC_SUPABASE_ANON_KEY=...   (optionnel)
```

**Render — API (`backend`)**
```
PUBLIC_API_URL=https://sculptaura-api.onrender.com
FRONTEND_ORIGIN=https://sculptaura.vercel.app
ADMIN_ORIGIN=https://sculptaura-admin.vercel.app
PAYMENT_PROVIDER=demo
SUPABASE_URL=...                    (optionnel)
SUPABASE_SERVICE_ROLE_KEY=...       (SECRET, optionnel)
RESEND_API_KEY=...                  (SECRET, optionnel)
CINETPAY_API_KEY=...                (SECRET, si cinetpay)
CINETPAY_SITE_ID=...                (si cinetpay)
```

---

## Dépannage

| Problème | Solution |
| --- | --- |
| Build Vercel échoue | Vérifie que **Root Directory** = `frontend` (ou `admin`), pas la racine. |
| « Failed to fetch » au paiement | `NEXT_PUBLIC_API_URL` (Vercel) doit pointer vers l'URL Render, puis **Redeploy**. |
| Erreur CORS | Sur Render, `FRONTEND_ORIGIN` / `ADMIN_ORIGIN` doivent être les URLs Vercel exactes (avec `https://`). |
| L'API répond lentement au 1er appel | Normal en offre gratuite Render (réveil du service). |

---

<div align="center">

_Besoin d'aide sur une étape ? Donne-moi l'URL Render + les URLs Vercel obtenues
et je te dis exactement quelles variables coller où._

**SCULPT'AURA — Douala · Cameroun · XAF**

</div>
