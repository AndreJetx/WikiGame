export type NegotiatedType = "markdown" | "html" | "not_acceptable";

type AcceptOffer = {
  type: string;
  subtype: string;
  q: number;
  specificity: number;
  index: number;
};

function parseAcceptList(header: string): AcceptOffer[] {
  const offers: AcceptOffer[] = [];
  const parts = header.split(",");
  for (let i = 0; i < parts.length; i++) {
    const raw = parts[i]?.trim();
    if (!raw) continue;
    const [media, ...params] = raw.split(";").map((p) => p.trim());
    const [type, subtype] = (media ?? "*/*").toLowerCase().split("/");
    if (!type || !subtype) continue;
    let q = 1;
    for (const param of params) {
      const [key, value] = param.split("=").map((p) => p.trim());
      if (key === "q" && value) {
        const parsed = Number(value);
        if (!Number.isNaN(parsed)) q = parsed;
      }
    }
    if (q <= 0) continue;
    const specificity = (type === "*" ? 0 : 2) + (subtype === "*" ? 0 : 1);
    offers.push({ type, subtype, q, specificity, index: i });
  }
  offers.sort((a, b) => {
    if (b.q !== a.q) return b.q - a.q;
    if (b.specificity !== a.specificity) return b.specificity - a.specificity;
    return a.index - b.index;
  });
  return offers;
}

function matches(offer: AcceptOffer, type: string, subtype: string): boolean {
  if (offer.type === "*" && offer.subtype === "*") return true;
  if (offer.type === type && offer.subtype === "*") return true;
  return offer.type === type && offer.subtype === subtype;
}

export function negotiateAccept(header: string | undefined | null): NegotiatedType {
  const raw = header?.trim();
  if (!raw) return "html";

  const offers = parseAcceptList(raw);
  if (offers.length === 0) return "html";

  for (const offer of offers) {
    if (matches(offer, "text", "markdown")) return "markdown";
    if (matches(offer, "text", "html")) return "html";
    if (matches(offer, "application", "xhtml+xml")) return "html";
  }

  return "not_acceptable";
}
