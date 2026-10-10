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

const GEMINI_MODEL = "gemini-3.8-flash";

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
): Promise<ColorimetryResult> {
  const client = getClient();

  const base64Image = imageBuffer.toString("base64");

  let response: GenerateContentResponse;
  try {
    response = await client.models.generateContent({
      model: GEMINI_MODEL,
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
    throw new Error(`Gemini API request failed: ${message}`);
  }

  const text = response.text;
  if (!text) {
    throw new Error(
      "Gemini returned an empty response. The image may not contain a recognizable face.",
    );
  }

  const parsed: unknown = JSON.parse(text);

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

  if (
    !Array.isArray(result.recommended_palette) ||
    result.recommended_palette.length < 5
  ) {
    throw new Error("recommended_palette must contain at least 5 colors.");
  }

  if (!Array.isArray(result.avoid_palette) || result.avoid_palette.length < 3) {
    throw new Error("avoid_palette must contain at least 3 colors.");
  }

  return result;
}
