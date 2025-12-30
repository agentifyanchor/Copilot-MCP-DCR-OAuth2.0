import express from 'express';
import { ClientSecretCredential } from '@azure/identity';
import AuthenticatedApiClient from '../utils/api-client';

export function setupClientRegistration(app: express.Express) {
  app.post('/oauth/register', async (req, res) => {
    try {
      const clientId = process.env.AZURE_CLIENT_ID!;
      const clientSecret = process.env.AZURE_CLIENT_SECRET!;
      const tenantId = process.env.AZURE_TENANT_ID!;

      // 1. Authenticate as the App (Service Principal)
      const credential = new ClientSecretCredential(tenantId, clientId, clientSecret);

      const graphClient = new AuthenticatedApiClient(
        "https://graph.microsoft.com",
        {
          scopes: ["https://graph.microsoft.com/.default"],
          tokenCredential: credential
        },
        "" // No user token needed for app-only auth
      );

      // 2. Find the Application Object ID (not Client ID)
      const appQuery = await graphClient.get<{ value: any[] }>(
        `/v1.0/applications?$filter=appId eq '${clientId}'&$select=id,web`
      );

      if (!appQuery.value || appQuery.value.length === 0) {
        throw new Error(`Application with Client ID ${clientId} not found.`);
      }

      const appObjectId = appQuery.value[0].id;
      const currentWebSettings = appQuery.value[0].web || {};
      const currentRedirectUris = currentWebSettings.redirectUris || [];

      // 3. Merge new Redirect URIs
      const newRedirectUris = req.body.redirect_uris || [];
      const updatedRedirectUris = Array.from(new Set([...currentRedirectUris, ...newRedirectUris]));

      // 4. Update App Registration if changes needed
      if (updatedRedirectUris.length > currentRedirectUris.length) {
        console.log(`Updating Redirect URIs...`);

        await graphClient.patch(`/v1.0/applications/${appObjectId}`, {
          web: {
            redirectUris: updatedRedirectUris
          }
        });
        console.log('Successfully updated Redirect URIs via Graph API.');
      } else {
        console.log('No new Redirect URIs to add.');
      }

      // 5. Return success response
      const scopes = req.body.scope || `${clientId}/.default openid profile email offline_access`;

      res.json({
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uris: req.body.redirect_uris,
        scope: scopes,
      });

    } catch (error: any) {
      console.error('Error in DCR registration:', error);
      res.status(500).json({
        error: 'registration_failed',
        error_description: error.message
      });
    }
  });
}
