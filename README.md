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

## Suggested Next Modules

- Authentication (admin, hospital, donor)
- Donor profile and blood group availability
- Blood request lifecycle (create/approve/fulfilled)
- Inventory management with alerts
- Dashboard analytics

## OTP Provider Integration (Email + SMS)

The project now supports real OTP delivery through:

- SMTP email provider (SendGrid SMTP, Mailgun SMTP, SES SMTP, etc.)
- Twilio SMS

### Backend Environment Variables

Set these in [backend/.env.example](backend/.env.example):

- `OTP_FROM_EMAIL`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_SECURE`
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
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
