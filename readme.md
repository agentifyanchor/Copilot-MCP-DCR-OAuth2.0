# MCP Server for Copilot with Dynamic Client Registration

This is a production-ready Model Context Protocol (MCP) server built with TypeScript, designed specifically for **Microsoft Copilot Studio**.

It solves the "Dynamic Redirect URI" problem in Power Platform by automatically updating its own Azure App Registration using the Microsoft Graph API.

## 🎥 Demo
![Demo](MCP-DCR.gif)



## 🚀 Quick Start

### 1. Installation
```bash
npm install
```

### 2. Configuration
Create a `.env` file in the root directory (see [AZURE_SETUP.md](./AZURE_SETUP.md) for full setup details):

```env
# Azure AD Configuration
AZURE_TENANT_ID=your_tenant_id
AZURE_CLIENT_ID=your_client_id
AZURE_CLIENT_SECRET=your_client_secret

# Server Configuration
REMOTE_MCP_SERVER_PORT=3000

# OAuth Discovery (For Copilot)
OAUTH_ISSUER_URL=https://your-tunnel-url.devtunnels.ms
OAUTH_AUTHORIZE_URL=https://login.microsoftonline.com/your_tenant_id/oauth2/v2.0/authorize
OAUTH_TOKEN_URL=https://login.microsoftonline.com/your_tenant_id/oauth2/v2.0/token
```

### 3. Build & Run
```bash
# Build the project
npm run build

# Start the server
npm start
```

## 📖 The "Magic" Behind It
Want to know how we accomplished automated Dynamic Client Registration (DCR) and granular SharePoint discovery? 

Check out our detailed blog post: 
👉 **[Building a Production-Ready MCP Server for Copilot](https://agentifyanchor.github.io/blog/posts/2025-12-30-building-a-production-ready-mcp-server-for-copilot-with-dynamic-client-registration/)**

## 🛠 Features
*   **Automated DCR**: Automatically adds Power Platform Redirect URIs to Azure AD.
*   **SharePoint Discovery**:
    *   `get sharepoint sites`: List available sites.
    *   `get lists by site`: List contents of a site.
    *   `get list items`: Intelligent item fetching (supports both GUID and List Names).
*   **Secure**: Uses On-Behalf-Of (OBO) flow and strict Audience validation.

## 📄 License
MIT
