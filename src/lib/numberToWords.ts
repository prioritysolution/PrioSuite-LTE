const ONES = [
  "",
  "One",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine",
  "Ten",
  "Eleven",
  "Twelve",
  "Thirteen",
  "Fourteen",
  "Fifteen",
  "Sixteen",
  "Seventeen",
  "Eighteen",
  "Nineteen",
];

const TENS = [
  "",
  "",
  "Twenty",
  "Thirty",
  "Forty",
  "Fifty",
  "Sixty",
  "Seventy",
  "Eighty",
  "Ninety",
];

/** Convert 0–99 to words */
const twoDigits = (n: number): string => {
  if (n < 20) return ONES[n];
  const ten = Math.floor(n / 10);
  const one = n % 10;
  return one ? `${TENS[ten]} ${ONES[one]}` : TENS[ten];
};

/** Convert 0–999 to words */
const threeDigits = (n: number): string => {
  if (n === 0) return "";
  const hundred = Math.floor(n / 100);
  const rest = n % 100;
  if (hundred && rest) return `${ONES[hundred]} Hundred ${twoDigits(rest)}`;
  if (hundred) return `${ONES[hundred]} Hundred`;
  return twoDigits(rest);
};

/**
 * Indian numbering system: Crore / Lakh / Thousand.
 * e.g. 45036400 → "Four Crore Fifty Lakh Thirty Six Thousand Four Hundred"
 */
export function numberToIndianWords(value: number): string {
  const amount = Math.round(Math.abs(Number(value) || 0));
  if (amount === 0) return "Zero";

  const crore = Math.floor(amount / 1_00_00_000);
  const lakh = Math.floor((amount % 1_00_00_000) / 1_00_000);
  const thousand = Math.floor((amount % 1_00_000) / 1_000);
  const hundred = amount % 1_000;

  const parts: string[] = [];

  if (crore) {
    parts.push(
      `${crore >= 100 ? threeDigits(crore) : twoDigits(crore)} Crore`,
    );
  }
  if (lakh) parts.push(`${twoDigits(lakh)} Lakh`);
  if (thousand) parts.push(`${twoDigits(thousand)} Thousand`);
  if (hundred) parts.push(threeDigits(hundred));

  return parts.join(" ");
}

/** Currency amount in Indian words, e.g. "... Rupees Only" */
export function amountToIndianWords(value: number): string {
  return `${numberToIndianWords(value)} Rupees Only`;
}
