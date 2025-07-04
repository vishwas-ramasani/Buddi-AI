const OPENROUTER_API_KEY = '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';
const API_URL = 'https://openrouter.ai/api/v1/chat/completions';

export class OpenRouterService {
  private apiKey: string;

  constructor() {
    this.apiKey = OPENROUTER_API_KEY;
  }

  async generateResponse(question: string, pdfContent: string): Promise<string> {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'X-Title': 'Buddi',
        },
        body: JSON.stringify({
          model: 'mistralai/mistral-7b-instruct:free',
          messages: [
            {
              role: 'system',
              content: `You are Buddi👻, a helpful AI assistant that answers questions based on the provided PDF content. 
                       Use only the information from the PDF to answer questions. If the answer is not in the PDF, 
                       say "I couldn't find that information in the uploaded document."
                       
                       PDF Content:
                       ${pdfContent}`
            },
            {
              role: 'user',
              content: question
            }
          ],
          max_tokens: 500,
          temperature: 0.3,
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
    } catch (error) {
      console.error('OpenRouter API Error:', error);
      throw new Error('Failed to get AI response. Please try again.');
    }
  }
}

export const openRouterService = new OpenRouterService();