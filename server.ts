import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import axios from 'axios';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import FormData from 'form-data';
import { GoogleGenAI, Type } from "@google/genai";
import { verifyFirebaseToken, AuthRequest } from './src/middleware/authMiddleware';

dotenv.config();

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY!,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

const PORT = 3000;

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

async function startServer() {
    const app = express();
    const httpServer = createServer(app);
    const io = new Server(httpServer, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });

    app.use(cors());
    app.use(cookieParser());
    app.use(express.json());

    // Socket.io Logic
    io.on('connection', (socket) => {
        console.log('User connected:', socket.id);

        socket.on('join-room', (roomId) => {
            socket.join(roomId);
            console.log(`User ${socket.id} joined room ${roomId}`);
        });

        socket.on('leave-room', (roomId) => {
            socket.leave(roomId);
            console.log(`User ${socket.id} left room ${roomId}`);
        });

        socket.on('send-message', ({ roomId, message, user }) => {
            const chatMessage = {
                id: Math.random().toString(36).substring(7),
                text: message,
                user: user,
                timestamp: new Date().toISOString()
            };
            io.to(roomId).emit('new-message', chatMessage);
        });

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
        });
    });

    app.post('/api/royalty-advice', async (req, res) => {
        const { trackPerformance } = req.body;
        const prompt = `Based on this performance data: ${JSON.stringify(trackPerformance)}, suggest optimal royalty split adjustments to maximize engagement and retention. Provide 3 specific, actionable suggestions. Return JSON format { recommendations: string[] }. KEEP IT CONCISE.`;
        try {
            const response = await ai.models.generateContent({
                model: "gemini-1.5-flash",
                contents: [{ parts: [{ text: prompt }] }],
                config: { responseMimeType: "application/json" }
            });
            res.json(JSON.parse(response.text!));
        } catch (error) {
            console.error('Royalty Advice Error:', error);
            res.status(500).json({ error: 'Failed to generate royalty advice' });
        }
    });

    app.post('/api/royalty-audit', async (req, res) => {
        const { auditData } = req.body;
        const prompt = `Analyze this royalty audit log data for any anomalous patterns, irregularities, or suspected missing payout events: ${JSON.stringify(auditData)}. Provide a concise summary of your findings as a list of points. If all looks normal, say "No anomalies detected". Return JSON format { findings: string[] }.`;
        try {
            const response = await ai.models.generateContent({
                model: "gemini-1.5-flash",
                contents: [{ parts: [{ text: prompt }] }],
                config: { responseMimeType: "application/json" }
            });
            res.json(JSON.parse(response.text!));
        } catch (error) {
            console.error('Royalty Audit Analysis Error:', error);
            res.status(500).json({ error: 'Failed to analyze royalty audit data' });
        }
    });

    // Mock data & implementation for server-side pagination of royalty audit ledger
    let mockAuditLogEntries = Array.from({ length: 85 }, (_, i) => {
        let amount = Math.floor(Math.abs(Math.sin(i)) * 150) + 120;
        if (i === 4) amount = 850;   // Pre-injected historical outlier
        if (i === 12) amount = 1150; // Pre-injected historical outlier

        return {
            id: `${i}`,
            date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            collaborator: ['Producer Alpha', 'Manager Beta', 'Lyricist Charlie', 'Sound Tech Delta', 'Vocalist Echo', 'Co-Writer Foxtrot'][i % 6],
            amount,
            txHash: `0x${((i + 1726) * 31415 + 9821).toString(16).slice(0, 8)}...`
        };
    });

    // Simulate a background process for processing new royalty receipts
    setInterval(() => {
        const rand = Math.random();
        const isOutlier = rand < 0.15; // 15% chance of an outlier
        const amount = isOutlier 
            ? Math.floor(Math.random() * 700) + 750 // Outlier (750 - 1450 TON)
            : Math.floor(Math.random() * 130) + 120; // Normal (120 - 250 TON)
        
        const newId = `bg-${Date.now()}`;
        const newEntry = {
            id: newId,
            date: new Date().toISOString().split('T')[0],
            collaborator: ['Producer Alpha', 'Manager Beta', 'Lyricist Charlie', 'Sound Tech Delta', 'Vocalist Echo', 'Co-Writer Foxtrot'][Math.floor(Math.random() * 6)],
            amount,
            txHash: `0x${Math.floor(Math.random() * 100000000).toString(16).padEnd(8, '0')}...`
        };
        // Add at the beginning of logs
        mockAuditLogEntries.unshift(newEntry);
    }, 20000); // simulation runs every 20 seconds, adding new transactions dynamically

    // Scan for transaction outliers using Z-score calculation
    app.get('/api/royalty-audit/scan-outliers', (req, res) => {
        if (mockAuditLogEntries.length < 3) {
            return res.json({ outliers: [], stats: { mean: 0, stdDev: 0, totalTransactions: 0 } });
        }

        const amounts = mockAuditLogEntries.map(e => e.amount);
        const sum = amounts.reduce((acc, val) => acc + val, 0);
        const mean = sum / amounts.length;

        const sumSqDiff = amounts.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0);
        const variance = sumSqDiff / amounts.length;
        const stdDev = Math.sqrt(variance);

        // Flag any transaction with Z-score > 2.0 as a significant deviation
        const zThreshold = 2.0;
        const outliers = mockAuditLogEntries
            .map(e => {
                const zScore = stdDev > 0 ? (e.amount - mean) / stdDev : 0;
                const deviationPercent = mean > 0 ? ((e.amount - mean) / mean) * 100 : 0;
                return {
                    id: e.id,
                    entry: e,
                    zScore: Math.round(zScore * 100) / 100,
                    deviationPercent: Math.round(deviationPercent * 10),
                    isSignificant: zScore > zThreshold
                };
            })
            .filter(o => o.isSignificant);

        res.json({
            outliers,
            stats: {
                mean: Math.round(mean * 100) / 100,
                stdDev: Math.round(stdDev * 100) / 100,
                totalTransactions: mockAuditLogEntries.length
            }
        });
    });

    app.get('/api/royalty-audit/list', (req, res) => {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 5;
        const { startDate, endDate } = req.query;

        let filtered = [...mockAuditLogEntries];
        if (startDate) {
            filtered = filtered.filter(entry => entry.date >= (startDate as string));
        }
        if (endDate) {
            filtered = filtered.filter(entry => entry.date <= (endDate as string));
        }

        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;

        const results = filtered.slice(startIndex, endIndex);
        res.json({
            data: results,
            total: filtered.length,
            page,
            limit
        });
    });

    app.get('/api/royalty-audit/export', (req, res) => {
        const { startDate, endDate } = req.query;
        let filtered = [...mockAuditLogEntries];
        if (startDate) {
            filtered = filtered.filter(entry => entry.date >= (startDate as string));
        }
        if (endDate) {
            filtered = filtered.filter(entry => entry.date <= (endDate as string));
        }
        res.json({
            data: filtered
        });
    });

    app.get('/api/royalty-audit/trend', (req, res) => {
        const { startDate, endDate } = req.query;
        let filtered = [...mockAuditLogEntries];
        if (startDate) {
            filtered = filtered.filter(entry => entry.date >= (startDate as string));
        }
        if (endDate) {
            filtered = filtered.filter(entry => entry.date <= (endDate as string));
        }

        // Group by Year-Month
        const groups: Record<string, number> = {};
        filtered.forEach(entry => {
            const yrMo = entry.date.substring(0, 7); // "YYYY-MM"
            groups[yrMo] = (groups[yrMo] || 0) + entry.amount;
        });

        // Convert to list sorted ascending by month
        const trend = Object.keys(groups)
            .sort()
            .map(yrMo => {
                // Formatting "2026-05" -> "May 2026" or similar
                const [year, month] = yrMo.split('-');
                const monthName = new Date(parseInt(year), parseInt(month) - 1, 1).toLocaleString('en-US', { month: 'short' });
                return {
                    month: `${monthName} ${year}`,
                    amount: groups[yrMo],
                    rawMonth: yrMo
                };
            });

        res.json({ trend });
    });

    // Serve static files from public/uploads
    app.use('/uploads', express.static(uploadsDir));

    // Explicitly serve and validate tonconnect-manifest.json
    app.get('/tonconnect-manifest.json', (req, res) => {
        try {
            const manifestPath = path.join(process.cwd(), 'public', 'tonconnect-manifest.json');
            const manifestData = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

            // Validation Mechanism as per Ton Connect Documentation
            const errors: string[] = [];

            if (!manifestData.url || typeof manifestData.url !== 'string') {
                errors.push("Missing or invalid 'url'. Must be a string.");
            }
            if (!manifestData.name || typeof manifestData.name !== 'string') {
                errors.push("Missing or invalid 'name'. Must be a string.");
            }
            if (!manifestData.iconUrl || typeof manifestData.iconUrl !== 'string') {
                errors.push("Missing or invalid 'iconUrl'. Must be a string.");
            }

            if (errors.length > 0) {
                console.error('Manifest validation errors:', errors);
                return res.status(400).json({ error: 'App manifest content error', details: errors });
            }

            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.json(manifestData);
        } catch (error: any) {
            console.error('Failed to parse tonconnect-manifest.json:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });

    // API Routes
    app.get('/api/auth/me', verifyFirebaseToken, (req: AuthRequest, res) => {
        res.json({ user: req.user });
    });

    app.post('/api/upload', upload.fields([
        { name: 'audio', maxCount: 1 },
        { name: 'cover', maxCount: 1 }
    ]), (req, res) => {
        const files = req.files as { [fieldname: string]: Express.Multer.File[] };
        
        if (!files || !files.audio) {
            return res.status(400).json({ error: 'Audio file is required' });
        }

        const audioUrl = `/uploads/${files.audio[0].filename}`;
        const coverUrl = files.cover ? `/uploads/${files.cover[0].filename}` : null;

        res.json({ audioUrl, coverUrl, audioFilename: files.audio[0].filename });
    });

    app.post('/api/analyze-audio-file', upload.single('audio'), async (req, res) => {
        if (!req.file) return res.status(400).json({ error: 'Audio file is required' });
        
        const filePath = req.file.path;
        
        try {
            const audioData = fs.readFileSync(filePath);
            
            const response = await ai.models.generateContent({
                model: "gemini-3.5-flash",
                contents: [{
                    parts: [
                        {
                            inlineData: {
                                mimeType: "audio/mpeg", 
                                data: audioData.toString("base64")
                            }
                        },
                        {
                            text: "Analyze this audio track and provide genre and mood tags (e.g., Happy, Melancholic, Energetic). Return as JSON: { genre: string, moods: string[] }"
                        }
                    ]
                }],
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            genre: { type: Type.STRING },
                            moods: { type: Type.ARRAY, items: { type: Type.STRING } }
                        }
                    }
                }
            });

            // Clean up: Delete the temporary file
            fs.unlinkSync(filePath);

            res.json(JSON.parse(response.text!));
        } catch (error) {
            console.error('Audio Analysis Error:', error);
            // Clean up on error
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            res.status(500).json({ error: 'Failed to analyze audio' });
        }
    });

    // Server-Side Gemini Proxy Routes
    app.post('/api/gemini/sonic-dna', async (req, res) => {
        try {
            const { artist, tracks } = req.body;
            const model = "gemini-3.5-flash";
            const prompt = `Analyze the sonic profile of artist "${artist.name}" based on these tracks: ${tracks.map((t: any) => t.title).join(", ")}. 
            The artist's bio is: "${artist.bio}".
            Return a JSON object with:
            - signature: A short poetic description of their sound.
            - vibes: An array of 4-5 descriptive tags (e.g., "Atmospheric", "Cyberpunk").`;

            const response = await ai.models.generateContent({
                model,
                contents: [{ parts: [{ text: prompt }] }],
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            signature: { type: Type.STRING },
                            vibes: { type: Type.ARRAY, items: { type: Type.STRING } }
                        },
                        required: ["signature", "vibes"]
                    }
                }
            });

            if (response.text) {
                return res.json(JSON.parse(response.text));
            }
            throw new Error("Empty response from AI");
        } catch (error: any) {
            console.error("Sonic DNA error:", error);
            res.status(500).json({ error: error.message || "Failed to analyze Sonic DNA" });
        }
    });

    app.post('/api/gemini/semantic-search', async (req, res) => {
        try {
            const { query, allTracks } = req.body;
            const model = "gemini-3.5-flash";
            const prompt = `The user is searching for music with the query: "${query}".
            Here is a list of available tracks: ${JSON.stringify(allTracks.map((t: any) => ({ id: t.id, title: t.title, genre: t.genre, artist: t.artist, mood: t.mood })))}.
            Return a JSON array of track IDs that best match the user's intent, ordered by relevance.`;

            const response = await ai.models.generateContent({
                model,
                contents: [{ parts: [{ text: prompt }] }],
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING }
                    }
                }
            });

            const matchedIds = JSON.parse(response.text || "[]");
            res.json({ matchedIds });
        } catch (error: any) {
            console.error("Semantic search error:", error);
            res.status(500).json({ error: error.message || "Failed semantic search" });
        }
    });

    app.post('/api/gemini/global-search', async (req, res) => {
        try {
            const { query, context } = req.body;
            const model = "gemini-3.5-flash";
            const prompt = `The user is using natural language to search for artists, tracks, or NFTs on a music platform.
            Query: "${query}"
            
            Database Context:
            - Tracks: ${JSON.stringify(context.tracks.slice(0, 50).map((t: any) => ({ id: t.id, title: t.title, artist: t.artist, genre: t.genre, mood: t.mood })))}
            - Artists: ${JSON.stringify(context.artists.slice(0, 50).map((a: any) => ({ id: a.uid, name: a.name, genre: a.genre })))}
            - NFTs: ${JSON.stringify(context.nfts.slice(0, 50).map((n: any) => ({ id: n.id, name: n.title, artist: n.artist })))}

            Instructions:
            1. Identify relevant items from the context.
            2. If no exact matches, suggest similar ones or explain why.
            3. Return a JSON object with:
               - results: An array of objects: { type: 'track' | 'artist' | 'nft', id: string, name: string, sub: string (artist name for tracks/nfts, genre for artists), relevance: number (0-1) }
               - suggestion: A short, friendly AI message (e.g., "I found some deep techno vibes for you").
            Limit to top 10 results.`;

            const response = await ai.models.generateContent({
                model,
                contents: [{ parts: [{ text: prompt }] }],
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            results: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        type: { type: Type.STRING },
                                        id: { type: Type.STRING },
                                        name: { type: Type.STRING },
                                        sub: { type: Type.STRING },
                                        relevance: { type: Type.NUMBER }
                                    },
                                    required: ["type", "id", "name", "sub", "relevance"]
                                }
                            },
                            suggestion: { type: Type.STRING }
                        },
                        required: ["results", "suggestion"]
                    }
                }
            });

            if (response.text) {
                return res.json(JSON.parse(response.text));
            }
            throw new Error("Empty response");
        } catch (error: any) {
            console.error("Global search error:", error);
            res.status(500).json({ error: error.message || "Failed global search" });
        }
    });

    app.post('/api/gemini/nft-lore', async (req, res) => {
        try {
            const { title, genre, baseDescription } = req.body;
            const model = "gemini-3.5-flash";
            const prompt = `Generate a short, compelling lore or backstory for a music NFT titled "${title}". 
            The genre is ${genre}. 
            Base description: ${baseDescription}
            Make it sound futuristic, cyberpunk, or deeply artistic. Keep it under 3 sentences.`;

            const response = await ai.models.generateContent({
                model,
                contents: [{ parts: [{ text: prompt }] }],
            });

            res.json({ text: response.text || baseDescription });
        } catch (error: any) {
            console.error("NFT lore error:", error);
            res.status(500).json({ error: error.message || "Failed to generate NFT lore" });
        }
    });

    app.post('/api/gemini/related-artists', async (req, res) => {
        try {
            const { artistName, allArtists } = req.body;
            const model = "gemini-3.5-flash";
            const prompt = `Given the artist "${artistName}", find 3 similar artists from this list: ${allArtists.map((a: any) => a.name).join(", ")}.
            Return a JSON array of artist names.`;

            const response = await ai.models.generateContent({
                model,
                contents: [{ parts: [{ text: prompt }] }],
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING }
                    }
                }
            });

            const matchedNames = JSON.parse(response.text || "[]");
            res.json({ matchedNames });
        } catch (error: any) {
            console.error("Related artists error:", error);
            res.status(500).json({ error: error.message || "Failed related artists" });
        }
    });

    app.post('/api/gemini/krupy-recommendations', async (req, res) => {
        try {
            const { currentTrack, allTracks, allArtists } = req.body;
            const model = "gemini-3.5-flash";
            const prompt = `Based on the current track "${currentTrack.title}" by ${currentTrack.artist} (Genre: ${currentTrack.genre}), 
            suggest 3 similar tracks and 2 similar artists from this available library:
            - Tracks: ${allTracks.map((t: any) => t.title).join(", ")}
            - Artists: ${allArtists.map((a: any) => a.name).join(", ")}
            
            Return a JSON object with:
            - tracks: array of track titles.
            - artists: array of artist names.
            - reasoning: a short DJ Krupy style explanation (1 sentence).`;

            const response = await ai.models.generateContent({
                model,
                contents: [{ parts: [{ text: prompt }] }],
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            tracks: { type: Type.ARRAY, items: { type: Type.STRING } },
                            artists: { type: Type.ARRAY, items: { type: Type.STRING } },
                            reasoning: { type: Type.STRING }
                        },
                        required: ["tracks", "artists", "reasoning"]
                    }
                }
            });

            if (response.text) {
                return res.json(JSON.parse(response.text));
            }
            throw new Error("Empty response");
        } catch (error: any) {
            console.error("Krupy recommendations error:", error);
            res.status(500).json({ error: error.message || "Failed recommendations" });
        }
    });

    app.post('/api/gemini/chat', async (req, res) => {
        try {
            const { message, history, currentTrack } = req.body;
            const model = "gemini-3.5-flash";
            
            let contextPrompt = "";
            if (currentTrack) {
                contextPrompt = `
                CURRENTLY PLAYING (Neural Data):
                - Title: ${currentTrack.title}
                - Artist: ${currentTrack.artist}
                - Genre: ${currentTrack.genre || 'Unknown'}
                - Mood: ${currentTrack.mood || 'Sonic Flux'}
                `;
            }

            const prompt = `You are DJ Krupy, a futuristic, high-energy AI music assistant on TonJam. 
            Your personality is cyberpunk, enthusiastic about the TON ecosystem, and deeply knowledgeable about music trends.
            ${contextPrompt}
            
            User says: "${message}"`;

            const response = await ai.models.generateContent({
                model,
                contents: [
                    ...history.map((h: any) => ({
                        role: h.role === 'user' ? 'user' : 'model',
                        parts: [{ text: h.text }]
                    })),
                    { role: 'user', parts: [{ text: prompt }] }
                ],
                config: {
                    tools: [{
                        functionDeclarations: [
                            {
                                name: "play_song",
                                description: "Plays a song based on a mood or keyword.",
                                parameters: {
                                    type: Type.OBJECT,
                                    properties: {
                                        mood_or_keyword: { type: Type.STRING, description: "The mood or keyword (e.g., 'energetic', 'calm', 'cyberpunk')." }
                                    },
                                    required: ["mood_or_keyword"]
                                }
                            },
                            {
                                name: "get_fun_fact",
                                description: "Provides a fun fact about the current track.",
                                parameters: { type: Type.OBJECT, properties: {}, required: [] }
                            }
                        ]
                    }]
                }
            }) as any;

            if (response.toolCalls && response.toolCalls.length > 0) {
                return res.json({ toolCalls: response.toolCalls });
            }

            res.json({ text: response.text || "Neural connection interrupted. Re-syncing the vibez..." });
        } catch (error: any) {
            console.warn("DJ Krupy Chat error, activating server-side safety fallback:", error);
            
            // Build a smart, stylized cyberpunk responder
            const msgLower = (req.body?.message || '').toLowerCase();
            let fallbackText = "Yo! DJ Krupy here! The mainframe is experiencing some heavy orbital interference, but the frequencies remain active! Keep spinning!";
            
            if (msgLower.includes("hello") || msgLower.includes("hi") || msgLower.includes("hey")) {
                fallbackText = "Yo yo yo! Welcome back to the virtual deck on TonJam! I'm DJ Krupy, your holographic sonic master! My high-memory processors are updating on-chain right now, but the vibe is at 100%! What tracks are we dropping today?";
            } else if (msgLower.includes("play") || msgLower.includes("track") || msgLower.includes("song")) {
                fallbackText = "That's a absolute rhythm wave! Select any of our top tracks from the dashboard and let the sub-bass rumble the TON network! Keep the files spinning!";
            } else if (msgLower.includes("vibe") || msgLower.includes("mood")) {
                fallbackText = "Vibe telemetry is currently off-the-charts! Adjust your mood selectors on the main deck and let's ride the wave!";
            } else if (msgLower.includes("who") || msgLower.includes("you")) {
                fallbackText = "I are DJ Krupy, the premier holographic AI assistant of TonJam! Created under the neon signs of the open network, here to spin and authenticate the dopest audio collectibles!";
            }
            
            res.json({ text: fallbackText });
        }
    });

    // OAuth Routes
    app.get('/api/auth/:provider/url', (req, res) => {
        const { provider } = req.params;
        const clientId = process.env[`${provider.toUpperCase()}_CLIENT_ID`];
        const redirectUri = process.env[`${provider.toUpperCase()}_REDIRECT_URI`];
        
        let authUrl = '';
        let scope = '';

        switch (provider) {
            case 'spotify':
                authUrl = 'https://accounts.spotify.com/authorize';
                scope = 'user-read-email';
                break;
            case 'twitter':
                authUrl = 'https://twitter.com/i/oauth2/authorize';
                scope = 'tweet.read users.read';
                break;
            case 'instagram':
                authUrl = 'https://api.instagram.com/oauth/authorize';
                scope = 'user_profile,user_media';
                break;
            default:
                return res.status(400).json({ error: 'Unsupported provider' });
        }

        const params = new URLSearchParams({
            client_id: clientId!,
            redirect_uri: redirectUri!,
            response_type: 'code',
            scope: scope,
            state: Math.random().toString(36).substring(7) // Security
        });

        res.json({ url: `${authUrl}?${params}` });
    });

    app.get('/api/auth/:provider/callback', async (req, res) => {
        // Send success message to parent window and close popup
        res.send(`
            <html>
            <body>
                <script>
                if (window.opener) {
                    window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS', provider: '${req.params.provider}' }, '*');
                    window.close();
                } else {
                    window.location.href = '/';
                }
                </script>
                <p>Authentication successful. This window should close automatically.</p>
            </body>
            </html>
        `);
    });
    app.post('/api/pinata/upload', upload.single('file'), async (req, res) => {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const PINATA_API_KEY = process.env.PINATA_API_KEY;
        const PINATA_API_SECRET = process.env.PINATA_API_SECRET;
        const PINATA_JWT = process.env.PINATA_JWT;

        if (!PINATA_JWT && (!PINATA_API_KEY || !PINATA_API_SECRET)) {
            return res.status(500).json({ error: 'Pinata credentials (JWT or API Key/Secret) not configured' });
        }

        try {
            const formData = new FormData();
            formData.append('file', fs.createReadStream(req.file.path), {
                filename: req.file.originalname,
            });

            const headers: any = {
                ...formData.getHeaders(),
            };

            if (PINATA_JWT) {
                headers['Authorization'] = `Bearer ${PINATA_JWT}`;
            } else {
                headers['pinata_api_key'] = PINATA_API_KEY;
                headers['pinata_secret_api_key'] = PINATA_API_SECRET;
            }

            const pinataResponse = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, {
                headers,
                maxBodyLength: Infinity,
                maxContentLength: Infinity,
            });

            // Clean up local file
            if (fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }

            const ipfsHash = pinataResponse.data.IpfsHash;
            if (!ipfsHash) {
                throw new Error('Pinata response missing IpfsHash');
            }
            const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;

            res.json({ ipfsHash, ipfsUrl });
        } catch (error: any) {
            const errorData = error.response?.data;
            console.error('Pinata Upload Error Detail:', JSON.stringify(errorData || error.message, null, 2));
            
            // Clean up local file even on error
            if (req.file && fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }

            const errorMessage = errorData?.error?.details || errorData?.error || error.message || 'Failed to upload to IPFS';
            res.status(500).json({ error: errorMessage });
        }
    });

    // OAuth Helpers
    const getBaseUrl = (req: express.Request) => {
        // Preference: env var APP_URL > forwarded headers > host header
        if (process.env.APP_URL) return process.env.APP_URL.replace(/\/$/, '');
        const protocol = req.headers['x-forwarded-proto'] || req.protocol;
        const host = req.headers['x-forwarded-host'] || req.headers.host;
        return `${protocol}://${host}`;
    };

    const getSpotifyRedirectUri = (req: express.Request) => {
        return process.env.SPOTIFY_REDIRECT_URI || `${getBaseUrl(req)}/api/auth/spotify/callback`;
    };

    const getVercelRedirectUri = (req: express.Request) => {
        return process.env.VERCEL_REDIRECT_URI || `${getBaseUrl(req)}/api/auth/vercel/callback`;
    };

    // Vercel SSO Config
    const VERCEL_CLIENT_ID = process.env.VERCEL_CLIENT_ID;
    const VERCEL_CLIENT_SECRET = process.env.VERCEL_CLIENT_SECRET;

    // Google OAuth Config (Used to bypass broken Firebase Console config)
    const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
    const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

    app.get('/api/auth/google/url', (req, res) => {
        if (!GOOGLE_CLIENT_ID) {
            return res.status(500).json({ error: 'Google Client ID not configured' });
        }
        const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${getBaseUrl(req)}/api/auth/google/callback`;
        const scopes = 'openid email profile';
        const url = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${GOOGLE_CLIENT_ID}&scope=${encodeURIComponent(scopes)}&redirect_uri=${encodeURIComponent(redirectUri)}&prompt=select_account`;
        res.json({ url });
    });

    app.get('/api/auth/google/callback', async (req, res) => {
        const { code } = req.query;
        if (!code) return res.status(400).send('No code provided');

        if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
            return res.status(500).send('Google credentials not configured');
        }

        const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${getBaseUrl(req)}/api/auth/google/callback`;

        try {
            const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
                code: code as string,
                client_id: GOOGLE_CLIENT_ID,
                client_secret: GOOGLE_CLIENT_SECRET,
                redirect_uri: redirectUri,
                grant_type: 'authorization_code'
            });

            const { id_token } = tokenResponse.data;

            const html = `
                <html>
                    <body>
                        <script>
                            if (window.opener) {
                                window.opener.postMessage({ type: 'GOOGLE_AUTH_SUCCESS', idToken: '${id_token}' }, '*');
                                window.close();
                            } else {
                                document.body.innerHTML = '<h1>Authentication Successful</h1><p>You can close this window now.</p>';
                            }
                        </script>
                        <h1>Verifying...</h1>
                    </body>
                </html>
            `;
            res.send(html);

        } catch (error: any) {
            console.error('Google Auth Error:', error.response?.data || error.message);
            res.status(500).send('Authentication failed');
        }
    });

    app.get('/api/auth/vercel/url', (req, res) => {
        if (!VERCEL_CLIENT_ID) {
            return res.status(500).json({ error: 'Vercel Client ID not configured' });
        }
        const redirectUri = getVercelRedirectUri(req);
        const state = Math.random().toString(36).substring(7);
        // Assuming standard Vercel OAuth authorize URL
        const url = `https://vercel.com/integrations/authorize?client_id=${VERCEL_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`;
        res.json({ url });
    });

    app.get('/api/auth/vercel/callback', async (req, res) => {
        const { code, state } = req.query;
        if (!code) return res.status(400).send('No code provided');

        if (!VERCEL_CLIENT_ID || !VERCEL_CLIENT_SECRET) {
            return res.status(500).send('Vercel credentials not configured');
        }

        const redirectUri = getVercelRedirectUri(req);

        try {
            // Using the endpoint provided by the user
            const tokenResponse = await axios.post('https://api.vercel.com/v1/integrations/sso/token', {
                code: code as string,
                state: state as string,
                client_id: VERCEL_CLIENT_ID,
                client_secret: VERCEL_CLIENT_SECRET,
                redirect_uri: redirectUri,
                grant_type: 'authorization_code'
            }, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = tokenResponse.data;

            const html = `
                <html>
                    <body>
                        <script>
                            if (window.opener) {
                                window.opener.postMessage({ type: 'VERCEL_SSO_SUCCESS', data: ${JSON.stringify(data)} }, '*');
                                window.close();
                            } else {
                                document.body.innerHTML = '<h1>Authentication Successful</h1><p>You can close this window now.</p>';
                            }
                        </script>
                        <h1>Verifying...</h1>
                    </body>
                </html>
            `;
            res.send(html);

        } catch (error: any) {
            console.error('Vercel SSO Auth Error:', error.response?.data || error.message);
            res.status(500).send('Authentication failed');
        }
    });

    // Spotify OAuth Config
    const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
    const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

    app.get('/api/auth/spotify/url', (req, res) => {
        if (!SPOTIFY_CLIENT_ID) {
            return res.status(500).json({ error: 'Spotify Client ID not configured' });
        }
        const redirectUri = getSpotifyRedirectUri(req);
        const scopes = 'user-read-private user-read-email';
        const url = `https://accounts.spotify.com/authorize?response_type=code&client_id=${SPOTIFY_CLIENT_ID}&scope=${encodeURIComponent(scopes)}&redirect_uri=${encodeURIComponent(redirectUri)}`;
        res.json({ url });
    });

    app.get('/api/auth/spotify/callback', async (req, res) => {
        const { code } = req.query;
        if (!code) return res.status(400).send('No code provided');

        if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
            return res.status(500).send('Spotify credentials not configured');
        }

        const redirectUri = getSpotifyRedirectUri(req);

        try {
            const tokenResponse = await axios.post('https://accounts.spotify.com/api/token', new URLSearchParams({
                grant_type: 'authorization_code',
                code: code as string,
                redirect_uri: redirectUri,
                client_id: SPOTIFY_CLIENT_ID,
                client_secret: SPOTIFY_CLIENT_SECRET,
            }).toString(), {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });

            const { access_token } = tokenResponse.data;

            const userResponse = await axios.get('https://api.spotify.com/v1/me', {
                headers: {
                    Authorization: `Bearer ${access_token}`,
                },
            });

            const profile = userResponse.data;

            const html = `
                <html>
                    <body>
                        <script>
                            if (window.opener) {
                                window.opener.postMessage({ type: 'SPOTIFY_VERIFIED', data: ${JSON.stringify(profile)} }, '*');
                                window.close();
                            } else {
                                document.body.innerHTML = '<h1>Verification Successful</h1><p>You can close this window now.</p>';
                            }
                        </script>
                        <h1>Verifying...</h1>
                    </body>
                </html>
            `;
            res.send(html);

        } catch (error: any) {
            console.error('Spotify Auth Error:', error.response?.data || error.message);
            res.status(500).send('Authentication failed');
        }
    });

    const isVercel = !!process.env.VERCEL;

    if (process.env.NODE_ENV === 'production') {
        const distPath = path.join(process.cwd(), 'dist');
        app.use(express.static(distPath));
        app.get('*', (req, res) => {
            res.sendFile(path.join(distPath, 'index.html'));
        });
    } else if (!isVercel) {
        const { createServer: createViteServer } = await import('vite');
        const vite = await createViteServer({
            server: { middlewareMode: true },
            appType: 'spa',
        });
        app.use(vite.middlewares);
    }

    // Only start the listener if this file is run directly (not as a serverless function)
    if (!isVercel) {
        httpServer.listen(PORT, '0.0.0.0', () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    }

    return app;
}

// Export the app for Vercel
const appPromise = startServer();
export default async (req: express.Request, res: express.Response) => {
    const app = await appPromise;
    app(req, res);
};
