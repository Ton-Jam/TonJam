const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

async function test() {
  try {
    const prompt = `
                Search the web for the latest daily headlines and trends regarding the TON blockchain and the NFT industry, specifically focusing on Web3 Music, digital collectibles, and blockchain platforms.
                Based on the search results, curate a list of 5 up-to-date industry headlines.
                Include realistic timestamps (e.g. from the search results), the reputable source names, and detailed descriptions.
                
                You must return a JSON object with a single key "trends" containing an array of objects matching this schema exactly:
                {
                  "trends": [
                    {
                      "id": "string (sequential unique id)",
                      "title": "string (engaging headline based on real search data)",
                      "source": "string (source of the news)",
                      "timestamp": "string (e.g., '2 hours ago', 'Today')",
                      "summary": "string (1-2 sentences with details about the trend)",
                      "category": "string (e.g. 'NFT', 'TON', 'Platform')",
                      "impact": "string ('High', 'Medium', 'Low')"
                    }
                  ]
                }
            `;
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json",
      }
    });
    console.log("Success:", response.text);
    if (response.candidates && response.candidates[0] && response.candidates[0].groundingMetadata) {
      console.log("Grounding:", JSON.stringify(response.candidates[0].groundingMetadata, null, 2));
    }
  } catch (error) {
    console.error("Error:", error.message || error);
    if (error.status) console.error("Status:", error.status);
    if (error.details) console.error("Details:", error.details);
  }
}

test();
