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
    /(suivi|suivre|retrouver|details? de commande|commande)/.test(text) &&
    /(commande|order|orders|id)/.test(text)
  ) {
    return "orders";
  }
  if (/(pin|code pin|mot de passe|mdp)/.test(text)) return "pin";
  if (/(connexion|connecter|login|compte|se connecter|me connecter)/.test(text)) return "login";
  if (/(panier|checkout|payer|paiement|valider|commander|passer commande)/.test(text)) return "checkout";
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
        { label: "Ouvrir le panier", href: "/cart" },
        { label: "Passer au checkout", href: "/checkout" },
        { label: "Voir les commandes", href: "/orders" },
      ];
    case "orders":
      return [
        { label: "Mes commandes", href: "/orders" },
        { label: "Voir le catalogue", href: "/products" },
        { label: "Ouvrir le panier", href: "/cart" },
      ];
    case "cancel":
      return [
        { label: "Mes commandes", href: "/orders" },
        { label: "Voir le catalogue", href: "/products" },
      ];
    case "login":
      return [
        { label: "Suivre une commande", href: "/orders" },
        { label: "Voir le catalogue", href: "/products" },
      ];
    case "pin":
      return [
        { label: "Ouvrir le checkout", href: "/checkout" },
        { label: "Voir les commandes", href: "/orders" },
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
        { label: "Suivre une commande", href: "/orders" },
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
      return `Bonjour 👋 Je suis ${assistantName}. Je peux t’aider à trouver un produit, à ouvrir le panier, à comprendre le checkout ou à retrouver une commande.`;
    case "checkout":
      return "Pour commander, ajoute d’abord les articles au panier, puis ouvre /cart et valide dans /checkout. Si c’est ta première commande, le parcours peut te guider pour initialiser le PIN client.";
    case "orders":
      return "Tu peux consulter tes commandes dans /orders si tu es connecté. Avec l’ID de commande, la page publique /orders/[id] permet aussi d’ouvrir le détail.";
    case "cancel":
      return "Une commande peut être annulée seulement si elle est encore en attente (PENDING) et dans les 30 minutes suivant sa création.";
    case "login":
      return "Le client se connecte avec son numéro de téléphone et son PIN. L’administration utilise un email et un mot de passe.";
    case "pin":
      return "Le PIN sert à reconnecter rapidement un client. Il peut être défini pendant le premier parcours de commande.";
    case "support":
      return `Je suis ${assistantName} et je peux t’aider sur le catalogue, les filtres, le panier, le checkout et les commandes. Dis-moi ce que tu cherches, et je te guide.`;
    case "catalog":
      return "Le catalogue est disponible dans /products. Tu peux filtrer par catégorie, marque et budget pour aller plus vite.";
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

        return `J’ai trouvé ${matches.length} produit${matches.length > 1 ? "s" : ""} qui semblent correspondre:\n${list}\n\nOuvre un produit pour voir les détails, ou précise la marque, la couleur ou le budget si tu veux que je resserre la recherche.`;
      }

      if (category || brand) {
        return "Je n’ai pas trouvé de produit exact pour ce filtre, mais tu peux ouvrir le catalogue et explorer les autres critères. Essaie aussi une autre orthographe ou un budget plus large.";
      }

      return "Je n’ai pas trouvé de correspondance exacte. Essaie une catégorie, une marque ou un budget. Exemple: \"chaussures noires\", \"Nike\" ou \"moins de 30 000 FCFA\".";
  }
}

function buildFallbackMessage(message: string) {
  const trimmed = message.trim();
  if (!trimmed) {
    return "Je peux t’aider à trouver un produit, ouvrir le panier ou suivre une commande.";
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
