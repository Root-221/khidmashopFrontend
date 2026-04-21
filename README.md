# KHIDMA SHOP

Khidma Shop est une expérience e-commerce complète bâtie avec **Next.js 14**, **TypeScript**, **Tailwind CSS**, **TanStack Query** et **Zustand**. Le repo contient :

- un **site client** (catalogue, panier, checkout, historique, profil) livré depuis `app/(public)`;
- un **dashboard admin** (statistiques, gestion produits/catégories/commandes/utilisateurs, génération de PDF) isolé dans `app/(admin)`;
- un **middleware** qui protège les routes `/admin` en vérifiant les cookies JWT (`khidma_role`, `refresh_token`).

## Stack & intégrations
- **Next.js 14 App Router** (groupes `(public)` / `(admin)` + nested layouts)
- **TanStack Query** + `QueryClientProvider` pour le cache côté client
- **Zustand (persist)** pour `auth`, `cart`, `order` et `ui` (localStorage via `getSafeStorage`)
- **Framer Motion, React Hot Toast, Lucide** pour l’UI animée et les notifications
- **jsPDF** pour exporter les factures
- **Tailwind CSS** avec utilitaires personnalisés (`.btn-base`, `.card-base`, `.section-title`)
- **services/api.client.ts** : `fetch` centralisé avec `credentials: 'include'`, rafraîchissement automatique (`/auth/refresh`) et gestion des en-têtes

## Structure clé
```
app/
├── (public)/       # pages client (home, catalogue, produit, panier, checkout, profil, commandes, auth)
├── (admin)/        # mise en page + login mobile-first
components/
├── layout/          # Navbar, Footer, AdminSidebar
├── auth/, cart/, product/, admin/  # composants UI réutilisables
services/            # abstractions HTTP (auth, products, categories, orders, users)
stores/              # Zustand (auth, cart, order, ui)
hooks/               # helpers (geolocation, toasts)
utils/               # helpers (format, jwt, cn, pdf, slugify, storage, identity)
data/                # `countries.ts`, `phone-lengths.ts` utilisés par l’OTP
public/assets/       # images locales (catégories, produits)
middleware.ts        # protège `/admin/*`
next.config.mjs      # remotePatterns + rewrites pour `/api`
scripts/             # `create-zip.sh`
```

## Fonctionnalités visibles
### Public
- **Home** : banner, catégories carrousel, produits vedettes.
- **Catalogue produit** : filtre texte, catégorie, marque, curseur prix, pagination côté client (8 articles/par page).
- **Fiche produit** : galerie d’images, sélection tailles/couleurs, ajout rapide au panier via `useCartStore`.
- **Panier** : drawer animé (`CartDrawer`), quantités ajustables, `StickyActionBar` pour confirmer.
- **Checkout** : géolocalisation `navigator.geolocation` obligatoire, update profil si nécessaire, vue `InvoiceView` + bouton PDF.
- **Commandes client** : fusionne commandes locales (`useOrderStore`) + serveurs, filtre par statut (`PENDING`, `CONFIRMED`, `DELIVERED`).
- **Profil** : informations utilisateur + déconnexion (`apiLogout`).

### Auth
- **OTP** (client) : `app/(public)/auth` utilise `countries.ts`, `phone-lengths.ts`, composant `OTPInput` et `sendOtp`/`verifyOtp` de `services/auth.service`; `useToast` pour les retours et `useAuthStore` pour stocker le token dans Zustand.
- **Admin login** : page `/admin` partage la même UI que `AdminRoot`, bascule sur `/admin/dashboard` après connexion réussie, `adminLogin` stocke token + charge le profil.
- `Providers` (app/providers.tsx) : garde un `QueryClient`, tente un `refreshTokens()` à l’initialisation, recharge `loadUserProfile()`.

### Admin
- **Layout** : `AdminSidebar` responsive, `middleware.ts` redirige les non-admins vers `/admin` en ajoutant `next`.
- **Dashboard** : stats produits, commandes, clients, graphiques simple, flux d’ordres récents.
- **Produits** : `AdminDataDisplay` propose vues grille/liste, modals `AdminInput`, upload images (conversion `FileReader` → `data:`), toggles `active`, suppression, création + update (désactive `categoryName`).
- **Catégories** : modals avec slug auto-généré, toggle `active` qui met aussi à jour les produits (`toggleCategoryActive`).
- **Commandes** : filtres par statut, stats, détail dans modal, génération de PDF (`generateInvoicePdf`), partage WhatsApp de la géolocalisation, `updateOrderStatus`.
- **Utilisateurs** : stats, affichage grid/list, badge `ADMIN` vs `CLIENT`.

## Données & flux
- **Services** utilisent `request` (headers, `Authorization`, `refresh` en cas de 401, `credentials: 'include'`).
- **Cart** : `useCartStore` persiste dans `localStorage` via `createJSONStorage(() => getSafeStorage())`, met à jour sous-total, gère dedup (taille/couleur).
- **Order store** : conserve jusqu’à 10 dernières commandes dans `orders`, stocke `currentOrder` après `createOrder`.
- **UI store** : gère `cartDrawerOpen`, toasts auto dismiss.
- **API** : `product.service.ts`, `category.service.ts`, `order.service.ts`, `user.service.ts`, `auth.service.ts` (OTP/admin/logout/profile).
- **Formats** : `formatCurrency`, `formatDate`, `orderLabel`, `orderStatusLabel`, `statusTone` pour les chips colorées.

## Routes principales
- `/` - landing page
- `/products` - catalogue (avec query `categoryId`, `search`)
- `/products/[id]` - détail produit + suggestions
- `/cart`, `/checkout`, `/orders`, `/profile`, `/auth`
- `/admin` - login
- `/admin/dashboard`, `/admin/products`, `/admin/categories`, `/admin/orders`, `/admin/users`

## Configuration & env
- `NEXT_PUBLIC_API_URL` (recommandé en prod) : URL du backend Render utilisée comme destination du proxy `/api` de Next.js (ex : `https://api.khidma.shop`). Si absent, `next.config.mjs` rewrite `/api/*` vers `http://localhost:3001` en dev.
- `NEXTAUTH` _non utilisé_ ; les cookies sont gérés côté backend.

## Démarrage local
1. `npm install`
2. Ajuster `NEXT_PUBLIC_API_URL` si besoin, surtout si tu veux pointer vers le backend Render.
3. `npm run dev` (http://localhost:3000)
4. `npm run build` / `npm run start` pour prod

## Scripts utiles
- `npm run dev` (Next dev)
- `npm run build`
- `npm run start`
- `npm run lint` (ESLint)
- `npm run zip` (script `scripts/create-zip.sh` crée un `.zip` excluding `node_modules`, `.next`, `.git`)

## Notes de production
- **Cookies** : le front appelle l'API via `/api/*` sur le domaine Vercel, qui relaie vers Render. Les cookies `khidma_access_token` + `khidma_role` + `refresh_token` restent donc first-party côté navigateur.
- **Middleware admin** : ne laisse passer `/admin/*` que si `khidma_role === 'ADMIN'` et qu’un `refresh_token` existe dans les cookies.
- **OTP** : vérifier les codes dans les logs backend quand Vonage n’est pas configuré.
- **Checkout** : bloque tant que la géolocalisation n’est pas obtenue, synchronise le profil (nom/adresse) si besoin.
- **Commandes** : l’interface client lie `ListOrders` + `useOrderStore` pour lisser les données même hors ligne, statuts stylés via `orderStatusLabel`.
- **Admin orders** : bouton “Partager WhatsApp” pour envoyer la local, “Télécharger PDF” via `jsPDF`.
- **Assets** : `public/assets/*` contient les visuels produits/catégories pour éviter les dépendances externes.
- **Data helpers** : `data/countries.ts` + `data/phone-lengths.ts` alimentent le sélecteur de pays et la validation OTP.

**Bon développement !**
