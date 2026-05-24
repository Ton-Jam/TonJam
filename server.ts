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
