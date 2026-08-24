import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { properties } from "./src/data/properties.js";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Gemini Client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined in the environment. Please configure it in Settings > Secrets.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// API Routes

// Endpoint 1: Match properties based on natural language search
app.post("/api/match-properties", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt || typeof prompt !== "string" || prompt.trim() === "") {
      return res.status(400).json({ error: "Search prompt is required." });
    }

    const ai = getGeminiClient();

    // Model selection guide: Basic text task or standard matching -> gemini-3.5-flash
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        {
          text: `You are an elite real estate advisor and expert neighborhood matchmaker for CasaFinder operating exclusively in Gumaca, Quezon, Philippines.
Analyze the user's dream home preference or search criteria:
"${prompt}"

Evaluate every single one of the properties listed below.
Assign a matching score from 0 to 100 based on how well each property matches their request (facilities, price range in Pesos ₱, bedrooms, vibe, Barangay neighborhood features, year built, tags, and descriptive matching).
Be objective: a property that does not fit their requirements should receive a low score. A home that exactly fits their aesthetic and details should receive 90+.

Provide:
1. A warm, engaging, and professional 'advisorSummary' summarizing your general thoughts on what they are looking for, which properties are the strongest matches, and any Barangay-level or local Gumaca tips or considerations.
2. A list of 'matches' detailing the id of each property, its score, and a highly specific 'reason' (1-2 sentences) justifying why it received that score in relation to their exact prompt.

Below is the database of current active properties in Gumaca:
${JSON.stringify(properties, null, 2)}
`
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            advisorSummary: {
              type: Type.STRING,
              description: "A highly personalized, warm, and professional summary explaining how the properties align with the user's specific request."
            },
            matches: {
              type: Type.ARRAY,
              description: "The list of property evaluations.",
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING, description: "The unique ID of the property evaluated." },
                  score: { type: Type.INTEGER, description: "A score from 0 to 100 indicating match quality." },
                  reason: { type: Type.STRING, description: "Specific 1-2 sentence explanation of how well this property matches the user's criteria." }
                },
                required: ["id", "score", "reason"]
              }
            }
          },
          required: ["advisorSummary", "matches"]
        }
      }
    });

    const outputText = response.text;
    if (!outputText) {
      throw new Error("Empty response returned from Gemini API");
    }

    const parsedResult = JSON.parse(outputText.trim());
    return res.json(parsedResult);
  } catch (error: any) {
    console.error("Error in /api/match-properties:", error);
    return res.status(500).json({
      error: error.message || "An error occurred during AI matchmaking.",
      details: "Ensure your GEMINI_API_KEY is configured in Settings > Secrets."
    });
  }
});

// Endpoint 2: Ask a specific question about a single property
app.post("/api/ask-property-question", async (req, res) => {
  try {
    const { propertyId, question, fallbackProperty } = req.body;
    if (!propertyId || !question) {
      return res.status(400).json({ error: "Property ID and question are required." });
    }

    let property = properties.find(p => p.id === propertyId);
    if (!property && fallbackProperty) {
      property = fallbackProperty;
    }

    if (!property) {
      return res.status(404).json({ error: "Property not found." });
    }

    const ai = getGeminiClient();

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `You are a real estate concierge representing this property in Gumaca, Quezon: "${property.title}".
Analyze the question and the detailed property sheet below, and provide a direct, friendly, and honest answer (max 3-4 sentences). Do not speculate or invent features that are not explicitly stated or logically deduced from the property details.

PROPERTY DETAILS:
- Address: ${property.address}, ${property.city} (${property.neighborhood})
- Price: ₱${property.price.toLocaleString()}
- Type: ${property.type}
- Space: ${property.beds} beds, ${property.baths} baths, ${property.sqft} sqm
- Description: ${property.description}
- Features: ${property.features.join(", ")}
- Tags: ${property.tags.join(", ")}
- Built: ${property.yearBuilt}
- Parking: ${property.parking}
- Cooling: ${property.heating}

USER QUESTION:
"${question}"
`
    });

    return res.json({ answer: response.text });
  } catch (error: any) {
    console.error("Error in /api/ask-property-question:", error);
    return res.status(500).json({
      error: error.message || "An error occurred while answering your question.",
      details: "Ensure your GEMINI_API_KEY is configured in the Secrets panel."
    });
  }
});

// Serve health status
app.get("/api/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// Vite Middleware Integration for Development & Build Setup
async function initializeVite() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in DEVELOPMENT mode with Vite Middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in PRODUCTION mode with Static Assets...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`CasaFinder Express Server running at http://0.0.0.0:${PORT}`);
  });
}

initializeVite().catch(err => {
  console.error("Failed to start server:", err);
});
