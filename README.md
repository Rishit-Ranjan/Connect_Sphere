# ConnectSphere

ConnectSphere is a web-based social network for a campus, school, college, or
other community. Participants can share updates and learning resources, build
their network, follow announcements, and message one another. Administrators
have additional tools to manage users and posts.

## Features

- **Participant and administrator accounts:** Students can register with a
  registration number or email address. Each account has a unique email
  address, and new student accounts must verify that email before signing in.
  Administrators are provisioned separately.
- **Social feed:** Create text and image posts, like posts, and comment. Authors
  can edit or delete their own comments; administrators can remove posts.
- **Network:** Follow participants or add them as connections. Relationship
  changes are saved to the database.
- **Messaging:** Send and view direct messages, and participate in rooms.
  Messaging currently uses HTTP requests rather than WebSockets, so it does
  not provide live push updates.
- **Campus information:** Publish notices and share downloadable resources,
  such as course materials.
- **Notifications:** Read and dismissed notification status is saved per
  account.
- **Profiles:** Update profile details and avatar, review recent posts and
  comments, and permanently delete your own account.
- **Administrator tools:** Manage users and remove posts.

## Tech stack

- **Frontend:** React, Vite, Tailwind CSS
- **Backend:** Node.js, Express
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT-based authentication

## Requirements

- Node.js and npm (use a Node.js release supported by Vite 8)
- MongoDB. A replica-set deployment, such as MongoDB Atlas, is required for
  operations that use database transactions, including relationship updates
  and account deletion.
- SMTP credentials to send student email-verification links

## Local development

### 1. Install dependencies

Run these commands from the repository root:

```sh
npm ci
npm ci --prefix backend
npm ci --prefix frontend
```

### 2. Configure environment files

Create local environment files from the examples:

```sh
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

In PowerShell, use `Copy-Item backend/.env.example backend/.env` and
`Copy-Item frontend/.env.example frontend/.env` instead.

Set the following values in `backend/.env`:

| Variable | Purpose |
| --- | --- |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret used to sign authentication tokens |
| `CLIENT_URL` | Frontend origin allowed by the backend CORS policy; locally, `http://localhost:5173` |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE` | SMTP server connection settings |
| `SMTP_USER`, `SMTP_PASSWORD` | SMTP credentials |
| `MAIL_FROM` | Sender address used for verification email |
| `PORT` | Backend port; defaults to `5000` |

The `ADMIN_*` variables are only needed when creating an initial
administrator; see [Create an administrator](#create-an-administrator).

In `frontend/.env`, set `VITE_API_URL` to the backend API URL. The example
defaults to `http://localhost:5000/api`.

Do not commit `.env` files or put backend secrets in frontend environment
variables. Vite variables prefixed with `VITE_` are included in the client
build and are public.

### 3. Start the app

From the repository root, start both the backend and frontend:

```sh
npm run dev
```

By default, the frontend is available at `http://localhost:5173` and the API
at `http://localhost:5000`. The API root (`http://localhost:5000/`) returns a
basic status response.

You can also start either service independently:

```sh
npm run dev --prefix backend
npm run dev --prefix frontend
```

### Create an administrator

Public registration creates student accounts only. To provision an
administrator, set these variables in `backend/.env`:

```dotenv
ADMIN_NAME=
ADMIN_HANDLE=
ADMIN_EMAIL=
ADMIN_EMPLOYEE_ID=
ADMIN_PASSWORD=
ADMIN_DEPARTMENT=
```

`ADMIN_NAME`, `ADMIN_HANDLE`, `ADMIN_EMAIL`, `ADMIN_EMPLOYEE_ID`, and
`ADMIN_PASSWORD` are required. Use a password with at least 12 characters.
Then run this command once from the repository root:

```sh
npm --prefix backend run create-admin
```

The script exits with an error if the required settings are missing or the
email, handle, or employee ID is already in use. Keep administrator
credentials in the backend environment only.

## Uploads and persistent storage

Uploaded files are stored on the backend filesystem under `backend/uploads`:

- Post images: `backend/uploads/posts`
- Profile avatars: `backend/uploads/avatars`
- Shared resources: `backend/uploads`

Post images and avatars accept JPG, PNG, and WebP files up to 5 MB. Resources
accept PDF, ZIP, EPUB, PPTX, and DOCX files up to 25 MB. The backend creates
the upload directories if they do not exist.

The app does not currently copy uploads to cloud object storage. For
production, mount persistent storage at the backend's uploads directory and
include it in backups. Without persistent storage, uploads may be lost when a
server instance is replaced or redeployed.

## Tests and checks

Backend tests use Node.js's built-in test runner and mock database calls, so
they do not require a running MongoDB instance:

```sh
npm test --prefix backend
```

Run the frontend lint and production build with:

```sh
npm run lint --prefix frontend
npm run build --prefix frontend
```

The production frontend files are generated in `frontend/dist`.

## Production deployment

This repository does not include provider-specific deployment manifests.
Deploy the frontend and backend as separate services, or configure equivalent
build, runtime, environment, and storage settings with your provider.

1. **Provision MongoDB.** Use a production database that supports transactions
   and configure its network access and credentials appropriately.
2. **Deploy the backend.** Install dependencies in `backend` with `npm ci` and
   start it with `npm start`. The server listens on the host-provided `PORT`,
   or port `5000` by default.
3. **Configure backend environment variables.** Set `MONGO_URI`, a strong
   unique `JWT_SECRET`, the frontend `CLIENT_URL` origin, and SMTP settings
   (`SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASSWORD`, and
   `MAIL_FROM`). Configure secrets in the hosting provider, not in source
   control.
4. **Build and deploy the frontend.** Set `VITE_API_URL` to the public backend
   API URL, including `/api` (for example, `https://api.example.com/api`),
   before building. Install frontend dependencies and run
   `npm run build` in `frontend`, then publish `frontend/dist` using a static
   hosting service. `VITE_API_URL` is a build-time setting.
5. **Create an administrator.** Configure the `ADMIN_*` values securely in
   the backend environment and run `npm run create-admin` from `backend` once.
6. **Persist uploads.** Mount durable storage at the backend's `uploads`
   directory and back it up. If the hosting service cannot provide persistent
   disk storage, migrate uploads to an object-storage service before relying
   on them in production.

The backend CORS policy allows the configured `CLIENT_URL`. Set it to the
deployed frontend's origin (scheme and host, without an API path).

## Email verification behavior

New student registrations require a verification link delivered through the
configured SMTP server. Verification links expire after 24 hours, and a
verification email can be resent at most once per minute per account.
Registration accepts email or a registration number; it does not enforce a
campus-specific email domain. Existing accounts created before email
verification was introduced are not blocked from signing in.

## Project structure

```text
.
├── backend/
│   ├── src/
│   │   ├── config/       # Database and upload configuration
│   │   ├── controllers/  # API request handlers
│   │   ├── middlewares/  # Authentication and error handling
│   │   ├── models/       # Mongoose models
│   │   ├── routes/       # Express API routes
│   │   └── services/     # Email delivery
│   ├── test/             # Backend tests
│   └── uploads/          # Runtime file storage (not committed)
└── frontend/
    ├── public/
    └── src/
        ├── components/   # App views and UI components
        ├── context/      # Shared React context
        └── config/       # Frontend API configuration
```

## Current scope notes

Notices and shared resources can be used to distribute placement details,
course information, and schedules, but the app does not currently have a
dedicated placement-management workflow or lecture calendar. Direct messages
are stored and retrieved through HTTP endpoints; real-time messaging is not
implemented.
