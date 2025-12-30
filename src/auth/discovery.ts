import express from 'express';

export function setupDiscovery(app: express.Express) {

    const issuer = process.env.OAUTH_ISSUER_URL; // MUST equal your public domain
    const registrationEndpoint = `${issuer}/oauth/register`;
    const tokenEndpoint = process.env.OAUTH_TOKEN_URL;
    const authorizationEndpoint = process.env.OAUTH_AUTHORIZE_URL;

    app.get('/.well-known/oauth-authorization-server', (_req, res) => {
        res.json({
            issuer,
            authorization_endpoint: authorizationEndpoint,
            token_endpoint: tokenEndpoint,
            registration_endpoint: registrationEndpoint,
            response_types_supported: ["code"],
            grant_types_supported: ["authorization_code", "refresh_token", "client_credentials"],
            token_endpoint_auth_methods_supported: ["client_secret_basic"],
            scopes_supported: ["openid", "profile", "email", "User.Read", "offline_access", `api://${process.env.AZURE_CLIENT_ID}/mcp`]
        });
    });
}
