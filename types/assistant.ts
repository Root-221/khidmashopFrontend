export type AssistantSuggestion = {
  label: string;
  href?: string;
};

export type AssistantProduct = {
  id: string;
  name: string;
  brand: string;
  price: number;
  image: string;
  href: string;
  categoryName?: string;
  description?: string;
};

export type AssistantMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: number;
  suggestions?: AssistantSuggestion[];
  products?: AssistantProduct[];
};

export type AssistantReply = {
  reply: string;
  suggestions: AssistantSuggestion[];
  products: AssistantProduct[];
  mode: "local" | "llm";
};
