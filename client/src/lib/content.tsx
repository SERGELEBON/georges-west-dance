import { useQuery } from "@tanstack/react-query";
import { createContext, useContext, useEffect, useMemo } from "react";
import { DEFAULT_CONTENT, normalizeContent, whatsappUrl, type SiteContent } from "@shared/siteContent";

const CACHE_KEY = "gwd-content-v1";

function readCache(): SiteContent | undefined {
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    return raw ? normalizeContent(JSON.parse(raw)) : undefined;
  } catch {
    return undefined;
  }
}

type ContentContextValue = { content: SiteContent; whatsapp: string; isLoading: boolean };
const ContentContext = createContext<ContentContextValue>({ content: DEFAULT_CONTENT, whatsapp: whatsappUrl(DEFAULT_CONTENT), isLoading: false });

export function ContentProvider({ children }: { children: React.ReactNode }) {
  const query = useQuery({
    queryKey: ["site-content"],
    queryFn: async () => {
      const response = await fetch("/api/content", { headers: { Accept: "application/json" }, cache: "no-cache" });
      if (!response.ok) throw new Error(`content ${response.status}`);
      return normalizeContent(await response.json());
    },
    placeholderData: () => (typeof window === "undefined" ? undefined : readCache()),
    staleTime: 60_000,
    retry: 1,
  });

  useEffect(() => {
    if (!query.data || query.isPlaceholderData) return;
    try { window.localStorage.setItem(CACHE_KEY, JSON.stringify(query.data)); } catch { /* storage unavailable */ }
  }, [query.data, query.isPlaceholderData]);

  const content = query.data ?? DEFAULT_CONTENT;

  useEffect(() => {
    document.title = content.seo.title;
    document.querySelector('meta[name="description"]')?.setAttribute("content", content.seo.description);
  }, [content.seo.title, content.seo.description]);

  const value = useMemo(() => ({ content, whatsapp: whatsappUrl(content), isLoading: query.isLoading }), [content, query.isLoading]);
  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}

export const useSiteContent = () => useContext(ContentContext);
