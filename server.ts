import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(cookieParser());
app.use(express.json());

// Spotify OAuth Config
const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

// Construct Redirect URI
// Prefer SPOTIFY_REDIRECT_URI if set, otherwise construct from APP_URL or localhost
const getRedirectUri = () => {
  if (process.env.SPOTIFY_REDIRECT_URI) return process.env.SPOTIFY_REDIRECT_URI;
  const baseUrl = process.env.APP_URL || 'http://localhost:3000';
  // Ensure no trailing slash
  const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  return `${cleanBaseUrl}/api/auth/spotify/callback`;
};

// Routes
app.get('/api/auth/spotify/url', (req, res) => {
    if (!SPOTIFY_CLIENT_ID) {
        return res.status(500).json({ error: 'Spotify Client ID not configured' });
    }
    const redirectUri = getRedirectUri();
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

    const redirectUri = getRedirectUri();

    try {
        const tokenResponse = await axios.post('https://accounts.spotify.com/api/token', new URLSearchParams({
            grant_type: 'authorization_code',
            code: code as string,
            redirect_uri: redirectUri,
            client_id: SPOTIFY_CLIENT_ID,
            client_secret: SPOTIFY_CLIENT_SECRET,
        }), {
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

        // Send script to close popup and notify opener
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
        res.status(500).send('Authentication failed: ' + (error.response?.data?.error_description || error.message));
    }
});

// Vite Middleware
async function startServer() {
    const app = express();
    const PORT = 3000;

    // API Routes
    app.use(cookieParser());
    app.use(express.json());

    // Spotify OAuth Config
    const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
    const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

    // Construct Redirect URI
    const getRedirectUri = () => {
        if (process.env.SPOTIFY_REDIRECT_URI) return process.env.SPOTIFY_REDIRECT_URI;
        return 'http://localhost:3000/api/auth/spotify/callback';
    };

    app.get('/api/auth/spotify/url', (req, res) => {
        if (!SPOTIFY_CLIENT_ID) {
            return res.status(500).json({ error: 'Spotify Client ID not configured' });
        }
        const protocol = req.headers['x-forwarded-proto'] || req.protocol;
        const host = req.headers['x-forwarded-host'] || req.headers.host;
        const baseUrl = `${protocol}://${host}`;
        const redirectUri = `${baseUrl}/api/auth/spotify/callback`;
        
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

        const protocol = req.headers['x-forwarded-proto'] || req.protocol;
        const host = req.headers['x-forwarded-host'] || req.headers.host;
        const baseUrl = `${protocol}://${host}`;
        const redirectUri = `${baseUrl}/api/auth/spotify/callback`;

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
    } else {
        // Dynamic import for vite
        const { createServer: createViteServer } = await import('vite');
        const vite = await createViteServer({
            server: { middlewareMode: true },
            appType: 'spa',
        });
        app.use(vite.middlewares);
    }

    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}

startServer();
