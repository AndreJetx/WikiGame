const SUFFIXES = [
  { code: "dc", exp: 33 },
  { code: "no", exp: 30 },
  { code: "oc", exp: 27 },
  { code: "sp", exp: 24 },
  { code: "sx", exp: 21 },
  { code: "qi", exp: 18 },
  { code: "qa", exp: 15 },
  { code: "q", exp: 15 },
  { code: "t", exp: 12 },
  { code: "b", exp: 9 },
  { code: "m", exp: 6 },
  { code: "k", exp: 3 },
] as const;

const EXP_TO_CODE = new Map<number, string>();
for (const suffix of SUFFIXES) {
  if (!EXP_TO_CODE.has(suffix.exp)) EXP_TO_CODE.set(suffix.exp, suffix.code);
}

const MAX_MAGNITUDE = 36;
const FRACTION_DIGITS = 3;

export function normalizePower(input: string): string | null {
  const raw = input.trim().toLowerCase().replace(/\s+/g, "");
  if (!raw || raw.length > 48) return null;

  const suffix = SUFFIXES.find((item) => raw.endsWith(item.code));
  const number = suffix ? raw.slice(0, -suffix.code.length) : raw;
  if (!number) return null;

  const parsed = parseNumber(number);
  if (!parsed) return null;
  return formatDecimal(parsed.digits, parsed.scale - (suffix?.exp ?? 0));
}

function parseNumber(number: string): { digits: string; scale: number } | null {
  if (!/^[\d.,]+$/.test(number)) return null;
  const commas = number.split(",").length - 1;
  if (commas > 1) return null;

  if (number.includes(",")) {
    const [whole, frac] = number.split(",");
    if (whole.includes(".") && !/^\d{1,3}(?:\.\d{3})*$/.test(whole)) return null;
    const intDigits = whole.replace(/\./g, "");
    if (!/^\d*$/.test(intDigits) || !/^\d+$/.test(frac)) return null;
    return joinDigits(intDigits, frac);
  }

  if (/^\d{1,3}(?:\.\d{3})+$/.test(number)) {
    return joinDigits(number.replace(/\./g, ""), "");
  }
  if (/^\d+\.\d+$/.test(number)) {
    const [whole, frac] = number.split(".");
    return joinDigits(whole, frac);
  }
  if (/^\d+$/.test(number)) return joinDigits(number, "");
  return null;
}

function joinDigits(whole: string, frac: string): { digits: string; scale: number } | null {
  if (frac.length > 12) return null;
  const digits = `${whole}${frac}`.replace(/^0+(?=\d)/, "") || "0";
  return { digits, scale: frac.length };
}

function formatDecimal(digits: string, scale: number): string | null {
  if (scale < 0) {
    digits += "0".repeat(-scale);
    scale = 0;
  }
  digits = digits.replace(/^0+(?=\d)/, "") || "0";
  while (scale > 0 && digits.endsWith("0")) {
    digits = digits.slice(0, -1) || "0";
    scale -= 1;
  }
  if (digits === "0") return "0";

  const magnitude = digits.length - 1 - scale;
  if (magnitude > MAX_MAGNITUDE || magnitude < -6) return null;
  let exp = [...EXP_TO_CODE.keys()].filter((value) => value <= magnitude).sort((a, b) => b - a)[0] ?? 0;
  const point = digits.length - scale - exp;
  const formatted = formatSignificand(digits, point);
  const nextExp = exp + formatted.carryExp;
  const code = EXP_TO_CODE.get(nextExp) ?? EXP_TO_CODE.get(exp) ?? "";
  const text = EXP_TO_CODE.has(nextExp) || formatted.carryExp === 0 ? formatted.text : `1000${formatted.text.slice(1)}`;
  return `${text}${code}`;
}

function formatSignificand(digits: string, point: number): { text: string; carryExp: number } {
  let whole: string;
  let frac: string;
  if (point <= 0) {
    whole = "0";
    frac = `${"0".repeat(-point)}${digits}`;
  } else if (point >= digits.length) {
    whole = `${digits}${"0".repeat(point - digits.length)}`;
    frac = "";
  } else {
    whole = digits.slice(0, point) || "0";
    frac = digits.slice(point);
  }

  let carryExp = 0;
  if (frac.length > FRACTION_DIGITS) {
    const next = frac[FRACTION_DIGITS] ?? "0";
    frac = frac.slice(0, FRACTION_DIGITS);
    if (next >= "5") {
      const bumped = increment(`${whole}${frac}`);
      if (bumped.length > whole.length + frac.length) {
        whole = "1";
        frac = "";
        carryExp = 3;
      } else {
        whole = bumped.slice(0, bumped.length - frac.length) || "0";
        frac = bumped.slice(bumped.length - frac.length);
      }
    }
  }

  frac = frac.replace(/0+$/, "");
  whole = whole.replace(/^0+(?=\d)/, "") || "0";
  return { text: frac ? `${whole},${frac}` : whole, carryExp };
}

function increment(digits: string): string {
  const chars = digits.split("");
  for (let index = chars.length - 1; index >= 0; index -= 1) {
    if (chars[index] !== "9") {
      chars[index] = String(Number(chars[index]) + 1);
      return chars.join("");
    }
    chars[index] = "0";
  }
  return `1${chars.join("")}`;
}
