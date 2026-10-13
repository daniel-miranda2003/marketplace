import { GoogleGenAI, type GenerateContentResponse } from "@google/genai";

export interface ColorimetryResult {
  season: "spring" | "summer" | "autumn" | "winter";
  subtype: string;
  undertone: "warm" | "cool" | "neutral";
  contrast: "low" | "medium" | "high";
  recommended_palette: string[];
  avoid_palette: string[];
  explanation: string;
}

export type ColorimetryAiOutcome =
  | { success: true; analysis: ColorimetryResult }
  | { success: false; errorType: "HIGH_DEMAND" };

const FALLBACK_MODELS = [
  "gemini-3.8-flash",
  "gemini-3.7-flash",
  "gemini-3.6-flash",
  "gemini-3.5-flash-lite",
];
const MIN_RECOMMENDED_COLORS = 5;
const MIN_AVOID_COLORS = 3;

const HEX_COLOR_PATTERN = /#[0-9a-fA-F]{6}\b/g;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function stripCodeFences(text: string): string {
  const trimmed = text.trim();
  const fence = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
  return fence ? fence[1].trim() : trimmed;
}

function sanitizePalette(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  const colors: string[] = [];
  for (const item of value) {
    if (typeof item !== "string") {
      continue;
    }
    const matches = item.match(HEX_COLOR_PATTERN);
    if (!matches) {
      continue;
    }
    for (const match of matches) {
      const normalized = match.toUpperCase();
      if (!colors.includes(normalized)) {
        colors.push(normalized);
      }
    }
  }
  return colors;
}

const SYSTEM_PROMPT = `Eres un asesor de imagen profesional especializado en análisis de colorimetría facial.
Analiza la fotografía proporcionada y determina la estación cromática de la persona.

Instrucciones estrictas:
- Evalúa el subtono de la piel (cálido, frío o neutro).
- Analiza el contraste entre la esclerótica (blanco del ojo), el iris, el tono capilar y la tez.
- Ignora por completo fondos, ropa, accesorios o maquillaje visible.
- Devuelve SOLO el JSON estructurado sin texto adicional.
- La explicación debe ser empática, profesional y en español (máximo 300 caracteres).
- recommended_palette debe contener al menos 5 códigos hexadecimales válidos (#RRGGBB).
- avoid_palette debe contener al menos 3 códigos hexadecimales.
- season debe ser uno de: spring, summer, autumn, winter.
- undertone debe ser uno de: warm, cool, neutral.
- contrast debe ser uno de: low, medium, high.`;

let _client: GoogleGenAI | null = null;

function getClient(): GoogleGenAI {
  if (_client) return _client;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is not set. Add it to your environment variables.",
    );
  }

  _client = new GoogleGenAI({ apiKey });
  return _client;
}

export async function analyzeFaceColorimetry(
  imageBuffer: Buffer,
  mimeType: string,
): Promise<ColorimetryAiOutcome> {
  const client = getClient();

  const base64Image = imageBuffer.toString("base64");

  for (let i = 0; i < FALLBACK_MODELS.length; i += 1) {
    const modelName = FALLBACK_MODELS[i];
    try {
      const analysis = await requestAnalysis(
        client,
        modelName,
        base64Image,
        mimeType,
      );
      return { success: true as const, analysis };
    } catch (error) {
      const errorMessage =
        (error as { message?: string })?.message || String(error);
      const status =
        (error as { status?: number })?.status ||
        (error as { response?: { status?: number } })?.response?.status;

      console.warn(`[colorimetry] Falló ${modelName}:`, errorMessage);

      if (i === FALLBACK_MODELS.length - 1) {
        return { success: false as const, errorType: "HIGH_DEMAND" as const };
      }

      const isRateLimitOrOverloaded =
        status === 429 ||
        status === 503 ||
        errorMessage.includes("429") ||
        errorMessage.includes("TooManyRequests") ||
        errorMessage.includes("quota") ||
        errorMessage.includes("exhausted");

      if (isRateLimitOrOverloaded) {
        console.log(
          `[colorimetry] Límite alcanzado o saturación en ${modelName}. Esperando 2s antes del siguiente modelo...`,
        );
        await delay(2000);
        continue;
      }

      await delay(2000);
    }
  }

  return { success: false as const, errorType: "HIGH_DEMAND" as const };
}

async function requestAnalysis(
  client: GoogleGenAI,
  model: string,
  base64Image: string,
  mimeType: string,
): Promise<ColorimetryResult> {
  let response: GenerateContentResponse;
  try {
    response = await client.models.generateContent({
      model,
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                mimeType,
                data: base64Image,
              },
            },
            {
              text: "Analiza la colorimetría facial de esta persona y devuelve el diagnóstico en el formato JSON especificado.",
            },
          ],
        },
      ],
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.3,
        maxOutputTokens: 1000,
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            season: {
              type: "string",
              enum: ["spring", "summer", "autumn", "winter"],
              description: "The chromatic season of the person.",
            },
            subtype: {
              type: "string",
              description:
                "The subtype label in Spanish, e.g. Otoño Cálido, Invierno Brillante.",
            },
            undertone: {
              type: "string",
              enum: ["warm", "cool", "neutral"],
              description: "Skin undertone classification.",
            },
            contrast: {
              type: "string",
              enum: ["low", "medium", "high"],
              description:
                "Visual contrast level between hair, eyes, and skin.",
            },
            recommended_palette: {
              type: "array",
              items: { type: "string" },
              description:
                "Array of recommended hex color codes (#RRGGBB). Minimum 5.",
            },
            avoid_palette: {
              type: "array",
              items: { type: "string" },
              description:
                "Array of hex color codes to avoid (#RRGGBB). Minimum 3.",
            },
            explanation: {
              type: "string",
              description:
                "Professional explanation in Spanish, max 300 characters.",
            },
          },
          required: [
            "season",
            "subtype",
            "undertone",
            "contrast",
            "recommended_palette",
            "avoid_palette",
            "explanation",
          ],
        },
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown Gemini API error";
    const wrapped = new Error(`Gemini API request failed: ${message}`);
    const status = (error as { status?: number })?.status;
    if (status !== undefined) {
      (wrapped as { status?: number }).status = status;
    }
    throw wrapped;
  }

  const text = response.text;
  if (!text) {
    throw new Error(
      "Gemini returned an empty response. The image may not contain a recognizable face.",
    );
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(stripCodeFences(text));
  } catch {
    throw new Error("Gemini returned a non-JSON response.");
  }

  if (
    !parsed ||
    typeof parsed !== "object" ||
    !("season" in parsed) ||
    !("recommended_palette" in parsed) ||
    !("avoid_palette" in parsed)
  ) {
    throw new Error("Gemini returned an unexpected response structure.");
  }

  const result = parsed as ColorimetryResult;

  const validSeasons = ["spring", "summer", "autumn", "winter"] as const;
  if (!validSeasons.includes(result.season)) {
    throw new Error(`Invalid season value: ${result.season}`);
  }

  const recommendedPalette = sanitizePalette(result.recommended_palette);
  if (recommendedPalette.length < MIN_RECOMMENDED_COLORS) {
    throw new Error(
      `recommended_palette must contain at least ${MIN_RECOMMENDED_COLORS} valid hex colors (got ${recommendedPalette.length}).`,
    );
  }

  const avoidPalette = sanitizePalette(result.avoid_palette);
  if (avoidPalette.length < MIN_AVOID_COLORS) {
    throw new Error(
      `avoid_palette must contain at least ${MIN_AVOID_COLORS} valid hex colors (got ${avoidPalette.length}).`,
    );
  }

  return {
    ...result,
    recommended_palette: recommendedPalette,
    avoid_palette: avoidPalette,
  };
}
