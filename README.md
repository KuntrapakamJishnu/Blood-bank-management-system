# Blood Bank Management System (Starter)

This workspace now contains a full-stack starter setup:

- `backend`: Node.js + Express API
- `frontend`: React + Vite client

## 1) Install Dependencies

```bash
cd backend && npm install
cd ../frontend && npm install
```

## 2) Configure Environment

Backend:

```bash
cd backend
cp .env.example .env
```

Windows CMD alternative:

```cmd
copy .env.example .env
```

Frontend:

```bash
cd ../frontend
cp .env.example .env
```

Windows CMD alternative:

```cmd
copy .env.example .env
```

## 3) Run Backend

```bash
cd backend
npm run dev
```

Backend starts on `http://localhost:5000`.

## 4) Run Frontend

Open a second terminal:

```bash
cd frontend
npm run dev
```

Frontend starts on `http://localhost:5173`.

The frontend calls `/api/v1/health` and Vite proxies it to the backend.

## Deploy Backend on Render

This backend is ready for a Render Web Service using Docker.

Recommended Render settings:

- `Name`: `blood-bank-backend` (any unique name is fine)
- `Environment`: `Docker`
- `Branch`: `main`
- `Region`: `Oregon (US West)`
- `Root Directory`: `backend`
- `Dockerfile Path`: `backend/Dockerfile`
- `Instance Type`: `Free` or higher as needed

Required environment variables on Render:

- `NODE_ENV=production`
- `MONGO_URI=<your MongoDB Atlas connection string>`
- `MONGO_DB_NAME=blood_donation`
- `JWT_SECRET=<strong-random-secret>`
- `CLIENT_URL=<your deployed frontend URL>`
- `ALLOW_START_WITHOUT_DB=false`
- `SEED_ADMIN_NAME=System Admin`
- `SEED_ADMIN_EMAIL=<admin email>`
- `SEED_ADMIN_PASSWORD=<admin password>`
- `OTP_FROM_EMAIL=<verified sender email>`
- `SMTP_HOST=<smtp host>`
- `SMTP_PORT=587`
- `SMTP_USER=<smtp user>`
- `SMTP_PASS=<smtp app password>`
- `SMTP_SECURE=false`
- `TWILIO_ACCOUNT_SID=<twilio sid>`
- `TWILIO_AUTH_TOKEN=<twilio token>`
- `TWILIO_FROM_NUMBER=<verified twilio number>`
- `TWILIO_VERIFY_SERVICE_SID=<twilio verify service sid>`

Notes:

- Render injects `PORT` automatically, and the backend already reads it from `process.env.PORT`.
- For production, use MongoDB Atlas or another hosted MongoDB instance. A local MongoDB container will not work on Render.
- After deploy, run the admin seed script once against the Render database if you want a default admin account:

```bash
node src/seedAdmin.js
```

- If you deploy the frontend separately, update `CLIENT_URL` to the final frontend URL so CORS matches.

## Suggested Next Modules

- Authentication (admin, hospital, donor)
- Donor profile and blood group availability
- Blood request lifecycle (create/approve/fulfilled)
- Inventory management with alerts
- Dashboard analytics

## OTP Provider Integration (Email + SMS)

The project now supports real OTP delivery through:

- Resend email API (preferred)
- SMTP email provider (optional fallback)
- Twilio SMS

### Backend Environment Variables

Set these in [backend/.env.example](backend/.env.example):

- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL` (preferred sender)
- `OTP_FROM_EMAIL` (fallback sender)
- `SMTP_HOST` (optional fallback)
- `SMTP_PORT` (optional fallback)
- `SMTP_USER` (optional fallback)
- `SMTP_PASS` (optional fallback)
- `SMTP_SECURE` (optional fallback)
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_VERIFY_SERVICE_SID` (recommended for production SMS verification)
- `TWILIO_FROM_NUMBER`

### OTP API Usage

- `POST /api/auth/request-otp`
	- Body:
		- `email` (required)
		- `phone` (required for `sms` or `both`)
		- `channel`: `email | sms | both`
		- `purpose`: `register`
- `POST /api/auth/verify-otp`
	- Body:
		- `email`
		- `code` (6 digits)
		- `purpose`: `register`

In `development`, the response may include `devOtp` for local testing.
In `production`, OTP delivery must succeed through configured providers.

Delivery response now includes `providerStatus` so you can quickly verify whether email/SMS providers are configured correctly.

### Docker Compose

Use [docker-compose.yml](docker-compose.yml) to run frontend, backend, and MongoDB together.

## Secret Guard (Pre-commit)

This repository includes a pre-commit hook to reduce accidental secret leaks.

What it blocks:

- Any `.env` file commit (except `.env.example`)
- Common high-risk secrets in staged changes (Mongo URI creds, JWT secret assignments, Twilio token assignments, SMTP password assignments, private keys, API token patterns)

Install once per clone:

```bash
./scripts/install-git-hooks.sh
```

Windows CMD:

```cmd
scripts\install-git-hooks.cmd
```
