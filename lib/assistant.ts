import type {
  AssistantMessage,
  AssistantProduct,
  AssistantReply,
  AssistantSuggestion,
} from "@/types/assistant";
import { assistantName, assistantQuickPrompts } from "@/constants/assistant";

type BackendEnvelope<T> = {
  data?: T;
  success?: boolean;
  message?: string;
};

type BackendCategory = {
  id: string;
  name: string;
  slug: string;
  active?: boolean;
};

type BackendProduct = {
  id: string;
  name: string;
  price: number;
  images?: string[];
  category?: BackendCategory | null;
  categoryName?: string;
  brand: string;
  description: string;
  slug?: string;
  active?: boolean;
  featured?: boolean;
};

export type CatalogSnapshot = {
  products: AssistantProduct[];
  featuredProducts: AssistantProduct[];
  categories: BackendCategory[];
  brands: string[];
};

export type AssistantIntent =
  | "greeting"
  | "search"
  | "catalog"
  | "checkout"
  | "orders"
  | "cancel"
  | "login"
  | "pin"
  | "support";

const CACHE_TTL_MS = 60_000;
let cachedCatalog: CatalogSnapshot | null = null;
let cachedAt = 0;

const FALLBACK_IMAGE = "/assets/products/chemise-1.jpg";

const STOP_WORDS = new Set([
  "a",
  "alors",
  "au",
  "aux",
  "avec",
  "ce",
  "ces",
  "cette",
  "dans",
  "de",
  "des",
  "du",
  "elle",
  "en",
  "et",
  "es",
  "est",
  "eu",
  "il",
  "je",
  "la",
  "le",
  "les",
  "leur",
  "lui",
  "ma",
  "mais",
  "me",
  "mes",
  "moi",
  "mon",
  "ne",
  "nos",
  "notre",
  "nous",
  "on",
  "ou",
  "par",
  "pas",
  "pour",
  "qu",
  "que",
  "qui",
  "se",
  "ses",
  "son",
  "sur",
  "ta",
  "te",
  "tes",
  "toi",
  "ton",
  "tu",
  "un",
  "une",
  "vos",
  "votre",
  "vous",
  "quoi",
  "comment",
  "bonjour",
  "salut",
  "coucou",
  "merci",
  "svp",
  "stp",
]);

const DIACRITICS_RE = /[\u0300-\u036f]/g;

function getBackendBaseUrl() {
  const configured =
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.BACKEND_URL ||
    process.env.API_URL ||
    "";

  if (configured.trim()) {
    return configured.replace(/\/$/, "");
  }

  return process.env.NODE_ENV === "development" ? "http://localhost:3001" : "";
}

function unwrapResponse<T>(payload: BackendEnvelope<T> | T | null) {
  if (!payload) return null;
  if (typeof payload === "object" && "data" in payload) {
    return (payload as BackendEnvelope<T>).data ?? null;
  }
  return payload as T;
}

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(DIACRITICS_RE, "")
    .toLowerCase();
}

function tokenize(value: string) {
  return normalizeText(value)
    .split(/[^a-z0-9]+/g)
    .map((token) => token.trim())
    .filter((token) => token.length > 1 && !STOP_WORDS.has(token));
}

function formatCurrency(value: number) {
  return `${new Intl.NumberFormat("fr-FR").format(Math.round(value))} FCFA`;
}

function normalizeProduct(product: BackendProduct): AssistantProduct {
  const category = product.category ?? undefined;
  return {
    id: product.id,
    name: product.name,
    brand: product.brand || "Khidma Shop",
    price: Number(product.price) || 0,
    image: product.images?.find(Boolean) || FALLBACK_IMAGE,
    href: `/products/${product.id}`,
    categoryName: category?.name ?? product.categoryName ?? undefined,
    description: product.description?.trim() || undefined,
  };
}

async function fetchCatalogResource<T>(path: string): Promise<T | null> {
  const baseUrl = getBackendBaseUrl();
  if (!baseUrl) {
    return null;
  }

  try {
    const response = await fetch(`${baseUrl}${path}`, {
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    });

    const payload = (await response.json().catch(() => null)) as BackendEnvelope<T> | T | null;
    if (!response.ok) {
      return null;
    }

    return unwrapResponse<T>(payload);
  } catch {
    return null;
  }
}

function createEmptySnapshot(): CatalogSnapshot {
  return {
    products: [],
    featuredProducts: [],
    categories: [],
    brands: [],
  };
}

export async function loadCatalogSnapshot(): Promise<CatalogSnapshot> {
  const now = Date.now();
  if (cachedCatalog && now - cachedAt < CACHE_TTL_MS) {
    return cachedCatalog;
  }

  const [productsData, featuredData, categoriesData, brandsData] = await Promise.all([
    fetchCatalogResource<BackendProduct[]>("/products"),
    fetchCatalogResource<BackendProduct[]>("/products/featured"),
    fetchCatalogResource<BackendCategory[]>("/categories"),
    fetchCatalogResource<string[]>("/products/brands"),
  ]);

  const snapshot: CatalogSnapshot = {
    products: (productsData ?? []).map(normalizeProduct),
    featuredProducts: (featuredData ?? []).map(normalizeProduct),
    categories: categoriesData ?? [],
    brands: (brandsData ?? []).filter(Boolean),
  };

  cachedCatalog = snapshot;
  cachedAt = now;

  return snapshot;
}

function scoreProduct(product: AssistantProduct, message: string, tokens: string[]) {
  const haystack = normalizeText(
    [
      product.name,
      product.brand,
      product.categoryName,
      product.description,
      product.href,
    ]
      .filter(Boolean)
      .join(" "),
  );

  let score = 0;

  for (const token of tokens) {
    if (haystack.includes(token)) {
      score += token.length > 4 ? 4 : 2;
    }
  }

  const normalizedMessage = normalizeText(message);
  if (normalizedMessage.includes(normalizeText(product.name))) {
    score += 8;
  }

  if (normalizedMessage.includes(normalizeText(product.brand))) {
    score += 5;
  }

  if (product.categoryName && normalizedMessage.includes(normalizeText(product.categoryName))) {
    score += 4;
  }

  return score;
}

function detectCategoryMatch(snapshot: CatalogSnapshot, message: string) {
  const normalized = normalizeText(message);
  return snapshot.categories.find((category) => {
    const normalizedName = normalizeText(category.name);
    const normalizedSlug = normalizeText(category.slug);
    return normalized.includes(normalizedName) || normalized.includes(normalizedSlug);
  });
}

function detectBrandMatch(snapshot: CatalogSnapshot, message: string) {
  const normalized = normalizeText(message);
  return snapshot.brands.find((brand) => normalized.includes(normalizeText(brand)));
}

export function detectAssistantIntent(message: string): AssistantIntent {
  const text = normalizeText(message);

  if (!text) return "support";
  if (/(annuler|annulation|cancel)/.test(text)) return "cancel";
  if (
    /(comment\s+)?(commander|acheter|payer|finaliser|valider|passer\s+commande)/.test(text) ||
    /(panier|checkout|paiement|commande\s+maintenant)/.test(text)
  ) {
    return "checkout";
  }
  if (
    /(suivi|suivre|retrouver|historique|mes commandes|voir mes commandes|détails? de commande|detail de commande|num[eé]ro de commande|id de commande)/.test(text) &&
    /(commande|order|orders|id|num[eé]ro|numero)/.test(text)
  ) {
    return "orders";
  }
  if (/(pin|code pin|mot de passe|mdp)/.test(text)) return "pin";
  if (/(connexion|connecter|login|compte|se connecter|me connecter)/.test(text)) return "login";
  if (/(catalogue|produit|produits|article|marque|categorie|catégorie|recherche|cherche|trouve|montre|recommande|chauss|chemise|polo|watch|sneaker|headphone)/.test(text)) {
    return "search";
  }
  if (/(bonjour|salut|coucou|hello|bonsoir)/.test(text)) return "greeting";
  return "support";
}

function buildRecommendations(
  intent: AssistantIntent,
  matches: AssistantProduct[],
  snapshot: CatalogSnapshot,
  message: string,
) {
  const productMatches = matches.slice(0, 3);
  const fallbackProducts = (snapshot.featuredProducts.length > 0
    ? snapshot.featuredProducts
    : snapshot.products
  ).slice(0, 3);

  if (intent === "login" || intent === "pin" || intent === "orders" || intent === "cancel") {
    return [];
  }

  if (intent === "checkout") {
    return fallbackProducts;
  }

  if (productMatches.length > 0) {
    return productMatches;
  }

  if (intent === "greeting" || intent === "search" || intent === "catalog") {
    return fallbackProducts;
  }

  const category = detectCategoryMatch(snapshot, message);
  if (category) {
    return fallbackProducts;
  }

  return [];
}

function buildSuggestions(
  intent: AssistantIntent,
  matches: AssistantProduct[],
  snapshot: CatalogSnapshot,
  message: string,
): AssistantSuggestion[] {
  const category = detectCategoryMatch(snapshot, message);
  const brand = detectBrandMatch(snapshot, message);
  const search = encodeURIComponent(message.trim());

  switch (intent) {
    case "checkout":
      return [
        { label: "Voir le panier", href: "/cart" },
        { label: "Continuer vers la commande", href: "/checkout" },
        { label: "Voir mes commandes", href: "/orders" },
      ];
    case "orders":
      return [
        { label: "Voir mes commandes", href: "/orders" },
        { label: "Voir le catalogue", href: "/products" },
        { label: "Voir le panier", href: "/cart" },
      ];
    case "cancel":
      return [
        { label: "Voir mes commandes", href: "/orders" },
        { label: "Voir le catalogue", href: "/products" },
      ];
    case "login":
      return [
        { label: "Suivre une commande", href: "/orders" },
        { label: "Voir le catalogue", href: "/products" },
      ];
    case "pin":
      return [
        { label: "Continuer vers la commande", href: "/checkout" },
        { label: "Voir mes commandes", href: "/orders" },
      ];
    case "greeting":
      return assistantQuickPrompts;
    case "search":
    case "catalog":
      return [
        ...(matches[0]
          ? [{ label: "Voir le premier produit", href: matches[0].href }]
          : []),
        ...(category ? [{ label: `Voir ${category.name}`, href: `/products?categoryId=${category.id}` }] : []),
        ...(brand ? [{ label: `Marque ${brand}`, href: `/products?brand=${encodeURIComponent(brand)}` }] : []),
        { label: "Ouvrir le panier", href: "/cart" },
        { label: "Voir tout le catalogue", href: `/products${search ? `?search=${search}` : ""}` },
      ].slice(0, 4);
    default:
      return [
        { label: "Voir le catalogue", href: "/products" },
        { label: "Comment commander ?", href: "/checkout" },
        { label: "Voir mes commandes", href: "/orders" },
      ];
  }
}

function buildReply(
  intent: AssistantIntent,
  message: string,
  matches: AssistantProduct[],
  snapshot: CatalogSnapshot,
) {
  const category = detectCategoryMatch(snapshot, message);
  const brand = detectBrandMatch(snapshot, message);

  switch (intent) {
    case "greeting":
      return `Bonjour 👋 Je suis ${assistantName}. Je peux t’aider à trouver un produit, voir ton panier, finaliser ta commande ou retrouver une commande.`;
    case "checkout":
      return [
        "Pour commander, c’est très simple :",
        "1. Choisis le produit qui t’intéresse et ajoute-le au panier.",
        "2. Ouvre ton panier pour vérifier tes articles.",
        "3. Clique sur le bouton pour continuer la commande.",
        "4. Indique ton numéro de téléphone et confirme-le.",
        "5. Si tu es nouveau client, ajoute ton prénom, ton nom et ton adresse.",
        "6. Autorise la localisation du téléphone pour aider la livraison.",
        "7. Vérifie le résumé puis confirme la commande.",
        "8. Si c’est ta première commande, choisis un code à 4 chiffres pour revenir plus vite la prochaine fois.",
      ].join("\n");
    case "orders":
      return "Tu peux voir tes commandes dans la page de tes commandes. Si tu as le numéro d’une commande, je peux aussi t’aider à la retrouver.";
    case "cancel":
      return "Une commande peut être annulée seulement si elle n’a pas encore été préparée et si elle date de moins de 30 minutes.";
    case "login":
      return "Le client se connecte avec son numéro de téléphone et son code à 4 chiffres. L’administration utilise un email et un mot de passe.";
    case "pin":
      return "Le code à 4 chiffres sert à te reconnecter plus vite lors de ta prochaine visite.";
    case "support":
      return `Je suis ${assistantName} et je peux t’aider sur les produits, les filtres, le panier, la commande et le suivi de tes achats. Dis-moi simplement ce que tu cherches.`;
    case "catalog":
      return "Tu peux parcourir tous les produits, puis filtrer par catégorie, marque ou budget pour aller plus vite.";
    case "search":
    default:
      if (matches.length > 0) {
        const list = matches
          .slice(0, 3)
          .map(
            (product, index) =>
              `${index + 1}. ${product.name} - ${formatCurrency(product.price)}${product.categoryName ? ` · ${product.categoryName}` : ""}`,
          )
          .join("\n");

        return `J’ai trouvé ${matches.length} produit${matches.length > 1 ? "s" : ""} qui peuvent t’intéresser:\n${list}\n\nOuvre un produit pour voir plus de détails, ou dis-moi une marque, une couleur ou un budget si tu veux que je cherche mieux.`;
      }

      if (category || brand) {
        return "Je n’ai pas trouvé le produit exact, mais je peux t’aider à chercher autrement. Essaie une autre orthographe ou un budget plus large.";
      }

      return "Je n’ai pas trouvé de correspondance exacte. Essaie par exemple \"chaussures noires\", \"Nike\" ou \"moins de 30 000 FCFA\".";
  }
}

function buildFallbackMessage(message: string) {
  const trimmed = message.trim();
  if (!trimmed) {
    return "Je peux t’aider à trouver un produit, voir ton panier ou suivre une commande.";
  }
  return trimmed;
}

export async function buildAssistantReply(
  message: string,
  history: Pick<AssistantMessage, "role" | "content">[] = [],
): Promise<AssistantReply> {
  const snapshot = await loadCatalogSnapshot().catch(() => createEmptySnapshot());
  const intent = detectAssistantIntent(message);
  const tokens = tokenize(message);
  const scoredMatches = snapshot.products
    .map((product) => ({
      product,
      score: scoreProduct(product, message, tokens),
    }))
    .filter(({ score }) => score > 0)
    .sort((left, right) => right.score - left.score)
    .map(({ product }) => product);

  const normalizedHistory = history
    .slice(-6)
    .map((item) => `${item.role === "user" ? "Client" : assistantName}: ${item.content}`)
    .join("\n");

  const reply = buildReply(intent, buildFallbackMessage(message), scoredMatches, snapshot);
  const products = buildRecommendations(intent, scoredMatches, snapshot, message);
  const suggestions = buildSuggestions(intent, scoredMatches, snapshot, message);

  if (normalizedHistory) {
    // History is kept for future upgrades and for a coherent contract with the client widget.
    void normalizedHistory;
  }

  return {
    reply,
    suggestions,
    products,
    mode: "local",
  };
}
