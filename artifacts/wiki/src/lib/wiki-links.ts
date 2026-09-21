const WIKI_ARTICLE_PATH = /^\/wiki\/([^/]+)\/([^/]+)\/?$/;

export function wikiArticleHref(category: string, slug: string) {
  return `/wiki/${category}/${slug}`;
}

function pathAndHash(href: string): { pathname: string; hash: string } | null {
  const trimmed = href.trim();
  if (!trimmed || trimmed.startsWith("mailto:") || trimmed.startsWith("javascript:")) {
    return null;
  }
  if (trimmed.startsWith("#")) {
    return { pathname: "", hash: trimmed };
  }

  try {
    if (/^[a-zA-Z][a-zA-Z\d+.-]*:/.test(trimmed)) {
      const url = new URL(trimmed);
      return { pathname: url.pathname, hash: url.hash };
    }
    const hashIndex = trimmed.indexOf("#");
    if (hashIndex >= 0) {
      return { pathname: trimmed.slice(0, hashIndex), hash: trimmed.slice(hashIndex) };
    }
    return { pathname: trimmed, hash: "" };
  } catch {
    return null;
  }
}

/** Returns an in-app path like `/wiki/category/slug` (optional hash) when the href points at a wiki article. */
export function parseWikiArticleHref(href: string | null | undefined): string | null {
  if (!href) return null;
  const parsed = pathAndHash(href);
  if (!parsed?.pathname) return null;
  const match = parsed.pathname.match(WIKI_ARTICLE_PATH);
  if (!match?.[1] || !match[2]) return null;
  return `/wiki/${match[1]}/${match[2]}${parsed.hash}`;
}

type ClickLike = {
  target: EventTarget | null;
  button: number;
  metaKey: boolean;
  ctrlKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
  defaultPrevented: boolean;
  preventDefault: () => void;
};

export function handleWikiContentClick(event: ClickLike, navigate: (path: string) => void): boolean {
  if (event.defaultPrevented || event.button !== 0) return false;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false;

  const anchor = event.target instanceof Element ? event.target.closest("a") : null;
  if (!anchor) return false;

  const href = anchor.getAttribute("href");
  if (!href || href.startsWith("#")) return false;

  const wikiPath = parseWikiArticleHref(href);
  if (wikiPath) {
    event.preventDefault();
    navigate(wikiPath);
    return true;
  }

  const target = anchor.getAttribute("target");
  if (target && target !== "_self") return false;

  return false;
}
