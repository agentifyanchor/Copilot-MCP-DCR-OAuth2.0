import express from "express";
import jwt from "jsonwebtoken";
import { JwksClient } from "jwks-rsa";
import { config } from "dotenv";

config();

export default async function authorizeRequest(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  const token = req.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({
      jsonrpc: "2.0",
      error: { code: -32001, message: "Authentication token required" },
      id: null,
    });
  }

  const { isValid, payload } = await isValidToken(token);
  if (!isValid) {
    return res.status(401).json({
      jsonrpc: "2.0",
      error: { code: -32003, message: "Invalid authentication token" },
      id: null,
    });
  }

  // attach payload to req if you need it later
  (req as any).user = payload;
  next();
}

async function isValidToken(token: string): Promise<{ isValid: boolean; payload?: jwt.JwtPayload }> {
  try {
    const decoded = jwt.decode(token, { complete: true }) as jwt.Jwt;
    if (!decoded) return { isValid: false };

    const payload = decoded.payload as jwt.JwtPayload;
    const tenantId = payload.tid || process.env.AZURE_TENANT_ID;
    const jwksUri = `https://login.microsoftonline.com/${tenantId}/discovery/v2.0/keys`;

    const client = new JwksClient({ jwksUri });
    const key = await client.getSigningKey(decoded.header.kid!);
    const signingKey = key.getPublicKey();

    const verified = jwt.verify(token, signingKey, {
      algorithms: ["RS256"],
      audience: process.env.AZURE_CLIENT_ID
    }) as jwt.JwtPayload;

    return { isValid: true, payload: verified };
  } catch (err) {
    console.error("Token validation failed:", err);
    return { isValid: false };
  }
}
