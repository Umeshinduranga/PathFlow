import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";
import { GeneratedBy } from "@/types";

// ─── Gemini Direct REST API ───────────────────────────────────────────────────

export async function callGeminiDirectly(prompt: string): Promise<string> {
    const apiKey = process.env.GEMINI_API_KEY;
    const modelName = process.env.GEMINI_MODEL || "gemini-pro";

    const endpoints = [
        `https://generativelanguage.googleapis.com/v1/models/${modelName}:generateContent?key=${apiKey}`,
        `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
    ];

    for (const url of endpoints) {
        try {
            const response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                }),
            });

            if (!response.ok) {
                console.log(`⚠️ API endpoint failed: ${url.includes("/v1/") ? "v1" : "v1beta"}`);
                continue;
            }

            const data = await response.json();

            if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
                return data.candidates[0].content.parts[0].text as string;
            }

            throw new Error("Invalid response format from Gemini API");
        } catch {
            continue;
        }
    }

    throw new Error("All Gemini API endpoints failed");
}

// ─── Gemini SDK ───────────────────────────────────────────────────────────────

export function getGeminiModel() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "YOUR_NEW_API_KEY_HERE") return null;

    const geminiModel = process.env.GEMINI_MODEL || "gemini-pro";
    const genAI = new GoogleGenerativeAI(apiKey);
    return genAI.getGenerativeModel({ model: geminiModel });
}

// ─── OpenAI ───────────────────────────────────────────────────────────────────

export function getOpenAIClient(): OpenAI | null {
    if (!process.env.OPENAI_API_KEY) return null;
    return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

// ─── Utility Helpers ──────────────────────────────────────────────────────────

export function parseStepsFromResponse(text: string): string[] | null {
    const steps = text
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line && /^\d+\./.test(line))
        .map((step) => step.replace(/^\d+\.\s*/, ""))
        .filter((step) => step.length > 0);

    return steps.length > 0 ? steps : null;
}

export function generateFallbackPath(skills: string, goal: string): string[] {
    return [
        `Review and strengthen your current ${skills} skills`,
        `Research the specific requirements and technologies for ${goal}`,
        `Learn the fundamental concepts and tools needed for ${goal}`,
        `Build small practice projects to apply your new knowledge`,
        `Create a comprehensive portfolio showcasing your ${goal} skills`,
        `Network with professionals and apply for ${goal} positions`,
    ];
}

// ─── Main Generator ───────────────────────────────────────────────────────────

export interface GenerationResult {
    steps: string[];
    provider: GeneratedBy | "fallback";
}

export async function generateLearningPath(
    skills: string,
    goal: string
): Promise<GenerationResult> {
    const prompt = `
You are a professional career coach and learning specialist.

Create a clear, actionable, step-by-step learning path for someone who currently knows: "${skills}" and wants to become a "${goal}".

Requirements:
- Provide exactly 6 steps
- Each step should be specific and actionable
- Start each step with an action verb
- Make it beginner-friendly but comprehensive
- Focus on practical skills and real-world application
- Include both learning and doing components

Format: Return only the numbered steps, nothing else.
`;

    // Try Gemini REST API
    if (process.env.GEMINI_API_KEY) {
        try {
            const text = await callGeminiDirectly(prompt);
            const steps = parseStepsFromResponse(text);
            if (steps) {
                return { steps, provider: "gemini-direct" };
            }
        } catch {
            console.log("⚠️ Gemini REST API failed, trying SDK...");
        }

        // Try Gemini SDK
        try {
            const model = getGeminiModel();
            if (model) {
                const result = await model.generateContent(prompt);
                const text = result.response.text();
                const steps = parseStepsFromResponse(text);
                if (steps) {
                    return { steps, provider: "gemini-sdk" };
                }
            }
        } catch {
            console.log("⚠️ Gemini SDK failed, trying OpenAI...");
        }
    }

    // Try OpenAI
    const openai = getOpenAIClient();
    if (openai) {
        try {
            const completion = await openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content:
                            "You are a professional career coach and learning specialist. Provide exactly 6 numbered steps in a clear learning path.",
                    },
                    {
                        role: "user",
                        content: `Create a step-by-step learning path for someone who knows: "${skills}" and wants to become a "${goal}". Format: Return only 6 numbered steps, nothing else.`,
                    },
                ],
                temperature: 0.7,
                max_tokens: 500,
            });

            const text = completion.choices[0].message.content || "";
            const steps = parseStepsFromResponse(text);
            if (steps) {
                return { steps, provider: "openai" };
            }
        } catch {
            console.log("⚠️ OpenAI failed, using fallback...");
        }
    }

    // Fallback
    return {
        steps: generateFallbackPath(skills, goal),
        provider: "fallback",
    };
}
