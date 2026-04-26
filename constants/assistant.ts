import type { AssistantSuggestion } from "@/types/assistant";

export const assistantName = "Jamih";

export const assistantQuickPrompts: AssistantSuggestion[] = [
  { label: "Trouver une chemise" },
  { label: "Voir les chaussures" },
  { label: "Comment commander ?" },
  { label: "Suivre une commande", href: "/orders" },
];

export const assistantWelcomeMessage =
  `Bonjour 👋 Je suis ${assistantName}, ton assistant boutique. Je peux t’aider à trouver un produit, finaliser ta commande, suivre tes achats ou retrouver le bon chemin dans la boutique.`;
