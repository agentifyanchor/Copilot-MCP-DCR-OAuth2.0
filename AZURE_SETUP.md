# Azure App Registration Setup Guide

To use this MCP server with Microsoft Graph and Power Platform, you need to register an application in Microsoft Entra ID (formerly Azure AD).

## 1. Register the Application

1.  Go to the [Azure Portal](https://portal.azure.com/).
2.  Navigate to **Microsoft Entra ID** > **App registrations**.
3.  Click **+ New registration**.
4.  **Name**: Enter a name (e.g., `MCP-Graph-Server`).
5.  **Supported account types**: Select **"Accounts in this organizational directory only (Single tenant)"**.
6.  **Redirect URI**: Leave this blank for now (the MCP server will add it automatically via DCR!).
7.  Click **Register**.

## 2. Configure Authentication (DCR Support)

1.  In your new app, go to **Owners** and ensure your account is listed as an owner.
2.  Go to **Authentication**.
3.  Scroll down to **Implicit grant and hybrid flows**.
4.  We don't need to check anything here for the server itself, but ensuring `Access tokens` and `ID tokens` are **unchecked** is good practice (we use OAuth 2.0 Auth Code flow).

## 3. Add API Permissions

This is critical for the server to work.

1.  Go to **API permissions**.
2.  Click **+ Add a permission** > **Microsoft Graph**.
3.  **Application Permissions** (For DCR):
    *   Find and select: `Application.ReadWrite.All`.
    *   *Why?* This allows the MCP server to update its own Redirect URIs automatically.
4.  **Delegated Permissions** (For Tools):
    *   Find and select:
        *   `User.Read`
        *   `Sites.Read.All`
        *   `Files.Read.All`
        *   (Add any other permissions your tools need, like `Mail.Read`, `Calendars.Read`, etc.)
5.  Click **Add permissions**.
6.  **IMPORTANT**: Click the **"Grant admin consent for [Your Tenant]"** button.

## 4. Create a Client Secret

1.  Go to **Certificates & secrets**.
2.  Click **+ New client secret**.
3.  **Description**: `MCP Server Secret`.
4.  **Expires**: Choose a duration (e.g., 6 months).
5.  Click **Add**.
6.  **COPY THE VALUE IMMEDIATELY**. You will not see it again. This goes into `AZURE_CLIENT_SECRET`.

## 5. Expose an API (Optional but Recommended)

1.  Go to **Expose an API**.
2.  Click **Set** next to **Application ID URI**.
3.  Accept the default (`api://<client-id>`) or set a custom one.
4.  Click **Save**.

## 6. Configure Environment Variables

Create a `.env` file in the `server` directory with the following values:

```env
# Azure AD Configuration
AZURE_TENANT_ID=<Your-Tenant-ID>
AZURE_CLIENT_ID=<Your-Application-Client-ID>
AZURE_CLIENT_SECRET=<Your-Client-Secret-Value>

# MCP Server Configuration
REMOTE_MCP_SERVER_PORT=3000
debug=true

# OAuth Configuration (Used for Discovery)
# Replace <tunnel-url> with your DevTunnel URL (e.g., https://xyz.use.devtunnels.ms)
OAUTH_ISSUER_URL=<tunnel-url> 
OAUTH_AUTHORIZE_URL=https://login.microsoftonline.com/<Your-Tenant-ID>/oauth2/v2.0/authorize
OAUTH_TOKEN_URL=https://login.microsoftonline.com/<Your-Tenant-ID>/oauth2/v2.0/token
OAUTH_SCOPES=openid profile email offline_access User.Read Sites.Read.All Files.Read.All
```

## 7. Run and Connect
1.  Run `npm start`.
2.  In Copilot Studio (or your MCP Client), verify the connection.
3.  The server will automatically register the Redirect URI provided by the client!
