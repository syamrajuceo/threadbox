# Email Ingestion Setup Guide

This guide explains how to set up and use email ingestion in Threadbox.

## Overview

Threadbox supports three email providers:
1. **Gmail** - Using Gmail API with OAuth2
2. **Outlook** - Using Microsoft Graph API with OAuth2
3. **IMAP** - Generic IMAP/SMTP support

## Prerequisites

1. **Grok API Key** (for AI features) - Optional but recommended
2. **Email Provider Credentials** - Depending on which provider you use

## Setup Instructions

### Option 1: Gmail API Setup

1. **Create Google Cloud Project:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Enable Gmail API

2. **Create OAuth 2.0 Credentials:**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Choose "Web application"
   - **IMPORTANT:** Add authorized redirect URI(s):
     - If using OAuth Playground: `https://developers.google.com/oauthplayground`
     - If using custom callback: `http://localhost:3001/auth/gmail/callback` (or your domain)
     - **The redirect URI must match EXACTLY** (including http vs https, trailing slashes, etc.)
   - Save Client ID and Client Secret

3. **Get Refresh Token (Using OAuth 2.0 Playground - Recommended):**
   - Go to [OAuth 2.0 Playground](https://developers.google.com/oauthplayground)
   - Click the gear icon (⚙️) in top right
   - Check "Use your own OAuth credentials"
   - Enter your Client ID and Client Secret
   - **CRITICAL:** In the OAuth Playground settings, make sure the redirect URI is set to: `https://developers.google.com/oauthplayground`
   - In "Step 1", select scope: `https://www.googleapis.com/auth/gmail.readonly`
   - Click "Authorize APIs"
   - Sign in and grant permissions
   - In "Step 2", click "Exchange authorization code for tokens"
   - Copy the "Refresh token" value
   - **IMPORTANT:** When entering credentials in Threadbox, you MUST use the EXACT same redirect URI: `https://developers.google.com/oauthplayground`

4. **Get Refresh Token (Using Custom OAuth Flow):**
   - Implement OAuth flow with your redirect URI
   - Authorize with Gmail scopes: `https://www.googleapis.com/auth/gmail.readonly`
   - Exchange authorization code for refresh token
   - Use the same redirect URI in the email ingestion form

5. **Configure in `.env`:**
   ```env
   GMAIL_CLIENT_ID=your-client-id
   GMAIL_CLIENT_SECRET=your-client-secret
   GMAIL_REDIRECT_URI=http://localhost:3001/auth/gmail/callback
   ```

### Option 2: Outlook/Microsoft 365 Setup

1. **Register Application in Azure:**
   - Go to [Azure Portal](https://portal.azure.com/)
   - Navigate to "Azure Active Directory" > "App registrations"
   - Click "New registration"
   - Set redirect URI: `http://localhost:3001/auth/outlook/callback`
   - Note the Application (client) ID

2. **Create Client Secret:**
   - Go to "Certificates & secrets"
   - Create new client secret
   - Save the secret value

3. **Set API Permissions:**
   - Add permission: `Mail.Read` (Microsoft Graph)
   - Grant admin consent

4. **Get Access Token:**
   - Implement OAuth flow or use Microsoft Graph Explorer
   - Get access token with `Mail.Read` scope

5. **Configure in `.env`:**
   ```env
   OUTLOOK_CLIENT_ID=your-client-id
   OUTLOOK_CLIENT_SECRET=your-client-secret
   OUTLOOK_REDIRECT_URI=http://localhost:3001/auth/outlook/callback
   ```

### Option 3: IMAP/SMTP Setup

1. **Get IMAP Credentials:**
   - IMAP server address (e.g., `imap.gmail.com`, `imap-mail.outlook.com`)
   - Port (usually 993 for SSL/TLS)
   - Username and password (or app-specific password)

2. **Configure in `.env`:**
   ```env
   IMAP_HOST=imap.example.com
   IMAP_PORT=993
   IMAP_USERNAME=your-email@example.com
   IMAP_PASSWORD=your-password
   IMAP_TLS=true
   ```

## Usage Methods

### Method 1: Manual API Call (Recommended for Testing)

Use the REST API endpoint to trigger ingestion:

```bash
curl -X POST http://localhost:3001/email-ingestion/ingest \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "provider": "gmail",
    "account": "user@example.com",
    "credentials": {
      "clientId": "your-client-id",
      "clientSecret": "your-client-secret",
      "redirectUri": "http://localhost:3001/auth/gmail/callback",
      "refreshToken": "your-refresh-token"
    },
    "since": "2024-01-01T00:00:00Z"
  }'
```

**For IMAP:**
```bash
curl -X POST http://localhost:3001/email-ingestion/ingest \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "provider": "imap",
    "account": "user@example.com",
    "credentials": {
      "username": "user@example.com",
      "password": "your-password",
      "host": "imap.example.com",
      "port": "993",
      "tls": true
    }
  }'
```

### Method 2: Scheduled Automatic Ingestion

The system includes a scheduler that runs every 15 minutes. To enable it:

1. **Configure email accounts in `.env`:**
   ```env
   # Store accounts as JSON (one account per line or as JSON array)
   GMAIL_ACCOUNTS=[{"provider":"gmail","account":"user@example.com","credentials":{"clientId":"...","clientSecret":"...","redirectUri":"...","refreshToken":"..."}}]
   ```

2. **The scheduler will automatically:**
   - Run every 15 minutes
   - Fetch emails from all configured accounts
   - Process and classify emails
   - Assign to projects based on AI classification

### Method 3: Create Admin UI (Future Enhancement)

You can create an admin page to:
- Configure email accounts
- Test connections
- Trigger manual ingestion
- View ingestion logs

## Email Processing Flow

When emails are ingested, they go through:

1. **Fetching** - Retrieve emails from provider
2. **Storage** - Save to database with metadata
3. **Attachment Handling** - Save attachments to `storage/attachments/`
4. **Spam Classification** - AI determines if email is spam
5. **Project Routing** - AI suggests which project the email belongs to
6. **Status Assignment** - Mark as assigned or unassigned

## Configuration Examples

### Gmail Example
```json
{
  "provider": "gmail",
  "account": "support@company.com",
  "credentials": {
    "clientId": "123456789-abc.apps.googleusercontent.com",
    "clientSecret": "GOCSPX-xxxxxxxxxxxx",
    "redirectUri": "http://localhost:3001/auth/gmail/callback",
    "refreshToken": "1//0xxxxxxxxxxxx"
  }
}
```

### Outlook Example
```json
{
  "provider": "outlook",
  "account": "support@company.com",
  "credentials": {
    "clientId": "12345678-1234-1234-1234-123456789abc",
    "clientSecret": "abc~xxxxxxxxxxxx",
    "redirectUri": "http://localhost:3001/auth/outlook/callback",
    "accessToken": "eyJ0eXAiOiJKV1QiLCJub..."
  }
}
```

### IMAP Example
```json
{
  "provider": "imap",
  "account": "support@company.com",
  "credentials": {
    "username": "support@company.com",
    "password": "your-password",
    "host": "imap.gmail.com",
    "port": "993",
    "tls": true
  }
}
```

## Troubleshooting

### Gmail API Issues

1. **"Invalid credentials" error:**
   - Verify client ID and secret are correct
   - Check refresh token is valid
   - Ensure Gmail API is enabled in Google Cloud Console

2. **"Insufficient permissions" error:**
   - Check OAuth scopes include `gmail.readonly`
   - Re-authorize to get new refresh token

### Outlook API Issues

1. **"Invalid token" error:**
   - Access tokens expire - you need to refresh them
   - Implement token refresh logic or use refresh tokens

2. **"Insufficient privileges" error:**
   - Ensure `Mail.Read` permission is granted
   - Check admin consent is given

### IMAP Issues

1. **Connection timeout:**
   - Verify host and port are correct
   - Check firewall settings
   - Try different port (143 for non-SSL, 993 for SSL)

2. **Authentication failed:**
   - Use app-specific password if 2FA is enabled
   - Verify username format (sometimes needs full email)

## Security Best Practices

1. **Never commit credentials to git**
2. **Use environment variables** for all sensitive data
3. **Rotate credentials regularly**
4. **Use app-specific passwords** when possible
5. **Store credentials in secure vault** (e.g., AWS Secrets Manager, HashiCorp Vault)

## Next Steps

After setting up email ingestion:

1. Test with a manual API call
2. Verify emails appear in the database
3. Check spam classification is working
4. Review project routing suggestions
5. Use "Incoming Mail Review" page to manually assign emails
6. Set up scheduled ingestion for production

