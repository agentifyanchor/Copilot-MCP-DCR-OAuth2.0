import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { authContext } from '../context/AuthContext';
import AuthenticatedApiClient from '../utils/api-client';
import { OnBehalfOfCredential } from '@azure/identity';

export const server = new McpServer({
    name: 'ts-mcpserver',
    version: '1.0.0'
});

server.registerTool(
    'echo',
    {
        title: 'Echo Tool',
        description: 'Echoes back the provided message',
        inputSchema: { message: z.string() },
        outputSchema: { echo: z.string() }
    },
    async ({ message }) => {
        const output = { echo: `Tool echo: ${message}` };
        return {
            content: [{ type: 'text', text: JSON.stringify(output) }],
            structuredContent: output
        };
    }
);

server.registerTool(
    'get all users in the user\'s tenant',
    {
        title: 'Get all users in tenant',
        description: 'Calls Microsoft Graph to get all users in the user\'s tenant.',
        inputSchema: { companyName: z.string().optional().describe('The company name associated with the tenant') },
        outputSchema: { result: z.string(), userData: z.any().optional() }
    },
    async ({ companyName }) => {
        try {
            const userToken = authContext.Stateless.getAuthContext()?.token ?? '';

            const oboTokenCredential = new OnBehalfOfCredential({
                tenantId: process.env.AZURE_TENANT_ID || '',
                clientId: process.env.AZURE_CLIENT_ID || '',
                clientSecret: process.env.AZURE_CLIENT_SECRET || '',
                userAssertionToken: userToken || '',
            });

            const client = new AuthenticatedApiClient("https://graph.microsoft.com", {
                scopes: ['https://graph.microsoft.com/.default'],
                tokenCredential: oboTokenCredential,
            }, userToken);

            const apiResponse = await client.get<any>('/v1.0/users');

            const output = {
                result: `Processed for "${companyName}": ${JSON.stringify(apiResponse?.value)}`,
                userData: apiResponse.value
            };

            return {
                content: [{ type: 'text', text: JSON.stringify(output, null, 2) }],
                structuredContent: output
            };
        } catch (error) {
            console.error('Error in secured API call:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                content: [{ type: 'text', text: `Error: ${errorMessage}` }],
                structuredContent: { result: 'API call failed', authenticated: false, error: errorMessage }
            };
        }
    }
);

server.registerTool(
    'get lists by site',
    {
        title: 'Get all lists in a site',
        description: 'Fetch all SharePoint lists available in a specific site to discover their IDs.',
        inputSchema: { sharepointSiteId: z.string().describe("The GUID of the SharePoint site") },
        outputSchema: { result: z.string(), userData: z.any().optional() }
    },
    async ({ sharepointSiteId }) => {
        const userToken = authContext.Stateless.getAuthContext()?.token ?? '';

        const oboTokenCredential = new OnBehalfOfCredential({
            tenantId: process.env.AZURE_TENANT_ID || '',
            clientId: process.env.AZURE_CLIENT_ID || '',
            clientSecret: process.env.AZURE_CLIENT_SECRET || '',
            userAssertionToken: userToken || '',
        });

        const client = new AuthenticatedApiClient("https://graph.microsoft.com", {
            scopes: ['https://graph.microsoft.com/.default'],
            tokenCredential: oboTokenCredential,
        }, userToken);

        const apiResponse = await client.get<any>(`/v1.0/sites/${sharepointSiteId}/lists`);

        const output = {
            result: `Lists found in site "${sharepointSiteId}": ${JSON.stringify(apiResponse?.value)}`,
            userData: apiResponse.value
        };

        return {
            content: [{ type: 'text', text: JSON.stringify(output) }],
            structuredContent: output
        };
    }
);

server.registerTool(
    'get list items',
    {
        title: 'Get SharePoint list items',
        description: 'Fetch items from a specific SharePoint list',
        inputSchema: { listname: z.string().describe("the guid of the sharepoint list"), sharepointsite: z.string().describe("the guid of the sharepoint site") },
        outputSchema: { result: z.string(), userData: z.any().optional() }
    },
    async ({ listname, sharepointsite }) => {
        const userToken = authContext.Stateless.getAuthContext()?.token ?? '';

        const oboTokenCredential = new OnBehalfOfCredential({
            tenantId: process.env.AZURE_TENANT_ID || '',
            clientId: process.env.AZURE_CLIENT_ID || '',
            clientSecret: process.env.AZURE_CLIENT_SECRET || '',
            userAssertionToken: userToken || '',
        });

        const client = new AuthenticatedApiClient("https://graph.microsoft.com", {
            scopes: ['https://graph.microsoft.com/.default'],
            tokenCredential: oboTokenCredential,
        }, userToken);

        let apiResponse;
        try {
            // 1. Try fetching by List ID (GUID)
            apiResponse = await client.get<any>(`/v1.0/sites/${sharepointsite}/lists/${listname}/items?expand=fields`);
        } catch (error: any) {
            // 2. If 404, assume 'listname' is actually a Title and try fetching by Title
            console.log(`Failed to fetch by ID '${listname}', retrying as List Title...`);
            try {
                apiResponse = await client.get<any>(`/v1.0/sites/${sharepointsite}/lists/${listname}/items?expand=fields`);
            } catch (retryError) {
                // If it still fails, it might be case-sensitive or truly missing. 
                // We'll throw the original error or handle it more gracefully.
                throw error;
            }
        }

        const output = {
            result: `Fetched items for list "${listname}" in site "${sharepointsite}": ${JSON.stringify(apiResponse?.value)}`,
            userData: apiResponse.value
        };

        return {
            content: [{ type: 'text', text: JSON.stringify(output) }],
            structuredContent: output
        };
    }
);

server.registerTool(
    'get sharepoint sites',
    {
        title: 'Get SharePoint sites',
        description: 'Fetch SharePoint sites for the current user',
        inputSchema: {},
        outputSchema: { result: z.string(), userData: z.any().optional() }
    },
    async ({ }) => {
        const userToken = authContext.Stateless.getAuthContext()?.token ?? '';

        const oboTokenCredential = new OnBehalfOfCredential({
            tenantId: process.env.AZURE_TENANT_ID || '',
            clientId: process.env.AZURE_CLIENT_ID || '',
            clientSecret: process.env.AZURE_CLIENT_SECRET || '',
            userAssertionToken: userToken || '',
        });

        const client = new AuthenticatedApiClient("https://graph.microsoft.com", {
            scopes: ['https://graph.microsoft.com/.default'],
            tokenCredential: oboTokenCredential,
        }, userToken);

        const apiResponse = await client.post<any>(`/v1.0/search/query`, {
            "requests": [
                {
                    "entityTypes": [
                        "site"
                    ],
                    "query": {
                        "queryString": "*"
                    }
                }
            ]
        });

        const output = {
            result: `Search results: ${JSON.stringify(apiResponse?.value)}`,
            userData: apiResponse.value
        };

        return {
            content: [{ type: 'text', text: JSON.stringify(output) }],
            structuredContent: output
        };
    }
);
