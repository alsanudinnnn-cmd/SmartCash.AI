import { BUDGET_CATEGORIES } from "@/app/lib/budget-config";

const PAYMENT_METHODS = ["Tunai", "Bank", "Kad", "E-dompet", "Tidak Diketahui"] as const;
const DEFAULT_MODEL = "gemini-3.6-flash";

export type GeminiReceiptAnalysis = {
  merchant: string;
  date: string;
  amount: number;
  taxAmount: number;
  receiptNumber: string | null;
  paymentMethod: (typeof PAYMENT_METHODS)[number];
  category: (typeof BUDGET_CATEGORIES)[number];
  description: string;
  confidence: number;
  items: Array<{ name: string; quantity: number; unitPrice: number; total: number }>;
};

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
  }>;
  error?: { message?: string };
};

export async function analyzeReceiptWithGemini({
  file,
  apiKey,
  model = DEFAULT_MODEL,
  hints,
}: {
  file: File;
  apiKey: string;
  model?: string;
  hints?: {
    merchant?: string;
    date?: string;
    amount?: number;
    paymentMethod?: string;
  };
}): Promise<GeminiReceiptAnalysis> {
  const bytes = await file.arrayBuffer();
  const base64 = arrayBufferToBase64(bytes);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 35_000);

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  inlineData: {
                    mimeType: file.type,
                    data: base64,
                  },
                },
                {
                  text: buildPrompt(hints),
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.1,
            responseMimeType: "application/json",
            responseSchema: {
              type: "OBJECT",
              required: [
                "merchant",
                "date",
                "amount",
                "taxAmount",
                "receiptNumber",
                "paymentMethod",
                "category",
                "description",
                "confidence",
                "items",
              ],
              properties: {
                merchant: {
                  type: "STRING",
                  description: "Nama perniagaan atau peniaga pada resit.",
                },
                date: {
                  type: "STRING",
                  description: "Tarikh transaksi dalam format YYYY-MM-DD.",
                },
                amount: {
                  type: "NUMBER",
                  description: "Jumlah akhir yang dibayar, tanpa simbol mata wang.",
                },
                taxAmount: {
                  type: "NUMBER",
                  description: "Jumlah cukai yang dicetak pada resit, atau 0 jika tiada.",
                },
                receiptNumber: {
                  type: "STRING",
                  description: "Nombor resit atau invois, atau string kosong jika tidak kelihatan.",
                },
                paymentMethod: {
                  type: "STRING",
                  enum: PAYMENT_METHODS,
                },
                category: {
                  type: "STRING",
                  enum: BUDGET_CATEGORIES,
                },
                description: {
                  type: "STRING",
                  description: "Ringkasan ringkas pembelian dalam Bahasa Melayu.",
                },
                confidence: {
                  type: "NUMBER",
                  description: "Tahap keyakinan keseluruhan antara 0 dan 1.",
                },
                items: {
                  type: "ARRAY",
                  description: "Setiap barangan atau perkhidmatan yang kelihatan pada resit.",
                  items: {
                    type: "OBJECT",
                    required: ["name", "quantity", "unitPrice", "total"],
                    properties: {
                      name: { type: "STRING" },
                      quantity: { type: "NUMBER" },
                      unitPrice: { type: "NUMBER" },
                      total: { type: "NUMBER" },
                    },
                  },
                },
              },
            },
          },
        }),
      },
    );

    const payload = (await response.json()) as GeminiResponse;
    if (!response.ok) {
      throw new Error(payload.error?.message ?? `Gemini API gagal (${response.status}).`);
    }

    const text = payload.candidates?.[0]?.content?.parts?.find((part) => part.text)?.text;
    if (!text) throw new Error("Gemini tidak memulangkan hasil analisis.");

    return validateAnalysis(JSON.parse(text) as Record<string, unknown>);
  } finally {
    clearTimeout(timeout);
  }
}

export function accountForCategory(category: GeminiReceiptAnalysis["category"]) {
  const accounts: Record<GeminiReceiptAnalysis["category"], string> = {
    "Pembelian Barang": "Inventori",
    Utiliti: "Belanja Utiliti",
    Pengangkutan: "Belanja Pengangkutan",
    "Bekalan Pejabat": "Belanja Bekalan",
    Pemasaran: "Belanja Pemasaran",
    Sewa: "Belanja Sewa",
    Gaji: "Belanja Gaji",
    "Lain-lain": "Belanja Lain-lain",
  };
  return accounts[category];
}

function buildPrompt(hints?: {
  merchant?: string;
  date?: string;
  amount?: number;
  paymentMethod?: string;
}) {
  const suppliedHints = [
    hints?.merchant ? `Peniaga yang dimasukkan pengguna: ${hints.merchant}` : "",
    hints?.date ? `Tarikh yang dimasukkan pengguna: ${hints.date}` : "",
    hints?.amount ? `Jumlah yang dimasukkan pengguna: ${hints.amount}` : "",
    hints?.paymentMethod ? `Kaedah bayaran yang dimasukkan pengguna: ${hints.paymentMethod}` : "",
  ].filter(Boolean);

  return [
    "Baca resit ini sebagai rekod perbelanjaan perniagaan Malaysia.",
    "Ekstrak peniaga, tarikh transaksi, jumlah akhir, cukai, nombor resit dan kaedah bayaran.",
    "Ekstrak juga setiap barangan atau perkhidmatan dengan kuantiti, harga seunit dan jumlah baris. Jika item tidak jelas, pulangkan senarai items kosong.",
    "Pilih tepat satu kategori daripada senarai skema berdasarkan barang atau perkhidmatan yang dibeli.",
    "Jangan anggap cukai 6%; gunakan 0 jika cukai tidak dinyatakan.",
    "Jika tahun tidak jelas, gunakan tahun semasa hanya apabila ia munasabah.",
    "Gunakan petunjuk pengguna di bawah untuk menyelesaikan teks yang kabur, tetapi utamakan kandungan resit.",
    ...suppliedHints,
  ].join("\n");
}

function validateAnalysis(value: Record<string, unknown>): GeminiReceiptAnalysis {
  const merchant = cleanText(value.merchant, 120);
  const date = cleanText(value.date, 10);
  const amount = Number(value.amount);
  const taxAmount = Number(value.taxAmount);
  const description = cleanText(value.description, 180);
  const receiptNumber = value.receiptNumber === null
    ? null
    : cleanText(value.receiptNumber, 80) || null;
  const category = String(value.category);
  const paymentMethod = String(value.paymentMethod);
  const confidence = Number(value.confidence);
  const items = parseItems(value.items);

  if (!merchant || !description) throw new Error("Butiran utama resit tidak dapat dibaca.");
  if (!/^\d{4}-(0[1-9]|1[0-2])-([0-2]\d|3[01])$/.test(date)) {
    throw new Error("Tarikh resit tidak dapat dikenal pasti.");
  }
  if (!Number.isFinite(amount) || amount <= 0 || amount > 100_000_000) {
    throw new Error("Jumlah resit tidak dapat dikenal pasti.");
  }
  if (!Number.isFinite(taxAmount) || taxAmount < 0 || taxAmount > amount) {
    throw new Error("Jumlah cukai pada resit tidak sah.");
  }
  if (!BUDGET_CATEGORIES.includes(category as GeminiReceiptAnalysis["category"])) {
    throw new Error("Kategori resit tidak sah.");
  }
  if (!PAYMENT_METHODS.includes(paymentMethod as GeminiReceiptAnalysis["paymentMethod"])) {
    throw new Error("Kaedah bayaran resit tidak sah.");
  }

  return {
    merchant,
    date,
    amount: roundMoney(amount),
    taxAmount: roundMoney(taxAmount),
    receiptNumber,
    paymentMethod: paymentMethod as GeminiReceiptAnalysis["paymentMethod"],
    category: category as GeminiReceiptAnalysis["category"],
    description,
    confidence: Number.isFinite(confidence)
      ? Math.min(1, Math.max(0, confidence))
      : 0.7,
    items,
  };
}

function parseItems(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 60).flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const row = item as Record<string, unknown>;
    const name = cleanText(row.name, 120);
    const quantityValue = Number(row.quantity);
    const totalValue = Number(row.total);
    const quantity = Number.isFinite(quantityValue) && quantityValue > 0 ? quantityValue : 1;
    const total = Number.isFinite(totalValue) && totalValue >= 0 ? totalValue : 0;
    const unitPriceValue = Number(row.unitPrice);
    const unitPrice = Number.isFinite(unitPriceValue) && unitPriceValue >= 0
      ? unitPriceValue
      : total / quantity;
    return name ? [{ name, quantity, unitPrice: roundMoney(unitPrice), total: roundMoney(total) }] : [];
  });
}

function cleanText(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function roundMoney(value: number) {
  return Number(value.toFixed(2));
}

function arrayBufferToBase64(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  const chunkSize = 0x8000;
  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + chunkSize));
  }
  return btoa(binary);
}
