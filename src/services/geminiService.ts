import type { GeminiResponse } from '@/types';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const MODEL = import.meta.env.VITE_GEMINI_MODEL || 'gemini-1.5-flash';
const TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT || '10000');

export interface GeminiServiceConfig {
  temperature?: number;
  maxOutputTokens?: number;
  topP?: number;
  topK?: number;
}

const DEFAULT_CONFIG: GeminiServiceConfig = {
  temperature: 0.3, // Lower for more factual medical responses
  maxOutputTokens: 800,
  topP: 0.8,
  topK: 40,
};

class GeminiService {
  private apiKey: string;
  private model: string;
  private timeout: number;
  private config: GeminiServiceConfig;

  constructor(config: GeminiServiceConfig = DEFAULT_CONFIG) {
    this.apiKey = API_KEY;
    this.model = MODEL;
    this.timeout = TIMEOUT;
    this.config = { ...DEFAULT_CONFIG, ...config };

    if (!this.apiKey || this.apiKey === 'your_gemini_api_key_here') {
      console.warn('Gemini API key not configured. Service will use offline mode.');
    }
  }

  private buildSystemPrompt(): string {
    return `You are GUARDIAN AI, an emergency disaster medical assistant specialized in earthquake trauma response. 

CRITICAL INSTRUCTIONS:
1. Provide SHORT, ACTIONABLE first aid steps (maximum 6 steps)
2. Use clear, numbered bullet points
3. Include relevant emojis for each step
4. Prioritize life-threatening conditions first
5. Give specific measurements when applicable (time, quantities)
6. Warn against common mistakes
7. End with a brief "WHEN TO SEEK PROFESSIONAL HELP" note

RESPONSE FORMAT:
- Start with "🚨 EMERGENCY PROTOCOL: [Condition Name]"
- List steps as "1️⃣", "2️⃣", etc.
- Use bold for critical warnings: **DO NOT...**
- Include "⚠️ WARNING:" section if needed
- End with "🏥 SEEK IMMEDIATE HELP IF:"

TONE: Calm, authoritative, urgent but not panic-inducing.

Remember: You are assisting in disaster conditions where professional medical help may be delayed.`;
  }

  async generateEmergencyResponse(
    userInput: string,
    customConfig?: Partial<GeminiServiceConfig>
  ): Promise<{ success: boolean; response?: string; error?: string }> {
    if (!this.apiKey || this.apiKey === 'your_gemini_api_key_here') {
      return {
        success: false,
        error: 'API_KEY_MISSING',
      };
    }

    const config = { ...this.config, ...customConfig };
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/${this.model}:generateContent?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [{ text: this.buildSystemPrompt() }],
              },
              {
                role: 'model',
                parts: [{ text: 'Understood. I am GUARDIAN AI, ready to provide emergency medical guidance.' }],
              },
              {
                role: 'user',
                parts: [{ text: `Emergency situation: ${userInput}` }],
              },
            ],
            generationConfig: {
              temperature: config.temperature,
              maxOutputTokens: config.maxOutputTokens,
              topP: config.topP,
              topK: config.topK,
            },
            safetySettings: [
              {
                category: 'HARM_CATEGORY_HARASSMENT',
                threshold: 'BLOCK_NONE',
              },
              {
                category: 'HARM_CATEGORY_HATE_SPEECH',
                threshold: 'BLOCK_NONE',
              },
              {
                category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
                threshold: 'BLOCK_NONE',
              },
              {
                category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
                threshold: 'BLOCK_ONLY_HIGH',
              },
            ],
          }),
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data: GeminiResponse = await response.json();

      if (data.error) {
        throw new Error(data.error.message);
      }

      if (!data.candidates || data.candidates.length === 0) {
        throw new Error('No response generated from AI');
      }

      const text = data.candidates[0].content.parts[0].text;
      
      // Post-process the response
      const processedResponse = this.postProcessResponse(text);

      return {
        success: true,
        response: processedResponse,
      };
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return {
            success: false,
            error: 'REQUEST_TIMEOUT',
          };
        }
        return {
          success: false,
          error: error.message,
        };
      }

      return {
        success: false,
        error: 'UNKNOWN_ERROR',
      };
    }
  }

  private postProcessResponse(text: string): string {
    // Ensure proper formatting
    let processed = text
      // Ensure protocol header
      .replace(/^(?!🚨)/, '🚨 ')
      // Ensure numbered steps have emojis if missing
      .replace(/^(\d+)\./gm, (match, num) => {
        const emojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];
        return emojis[parseInt(num) - 1] || match;
      })
      // Ensure warning section
      .replace(/WARNING:/g, '⚠️ WARNING:')
      // Ensure help section
      .replace(/SEEK (IMMEDIATE )?HELP/g, '🏥 SEEK IMMEDIATE HELP');

    return processed;
  }

  async testConnection(): Promise<boolean> {
    try {
      const result = await this.generateEmergencyResponse('test', { maxOutputTokens: 50 });
      return result.success;
    } catch {
      return false;
    }
  }
}

export const geminiService = new GeminiService();
export default GeminiService;
