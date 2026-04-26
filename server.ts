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

dotenv.config();

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

    // Serve static files from public/uploads
    app.use('/uploads', express.static(uploadsDir));

    // API Routes
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

        res.json({ audioUrl, coverUrl });
    });

    // Pinata IPFS Upload
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

    if (process.env.NODE_ENV === 'production') {
        app.use(express.static('dist'));
        app.get('*', (req, res) => {
            res.sendFile(path.join(process.cwd(), 'dist', 'index.html'));
        });
    } else {
        const { createServer: createViteServer } = await import('vite');
        const vite = await createViteServer({
            server: { middlewareMode: true },
            appType: 'spa',
        });
        app.use(vite.middlewares);
    }

    httpServer.listen(PORT, '0.0.0.0', () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}

startServer();
