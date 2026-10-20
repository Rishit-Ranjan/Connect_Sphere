## ConnectSphere

### Backend setup

Configure `backend/.env` from `backend/.env.example` and `frontend/.env` from
`frontend/.env.example`. The backend requires `MONGO_URI`, `JWT_SECRET`, and
`CLIENT_URL`; the frontend API URL can be configured with `VITE_API_URL`.

Student accounts register from the app with a unique registration number. To
create the first administrator, set `ADMIN_NAME`, `ADMIN_HANDLE`, `ADMIN_EMAIL`,
`ADMIN_EMPLOYEE_ID`, and a strong `ADMIN_PASSWORD` in `backend/.env`, then run
`npm run create-admin` from `backend`. No demo accounts are seeded.

Resource uploads accept PDF, ZIP, EPUB, PPTX, and DOCX files up to 25 MB. Files
are stored in `backend/uploads`, so preserve that directory when backing up or
moving the backend.

### Tests

Run the backend API tests with `npm test` from the `backend` directory. They use
the Node.js built-in test runner and mock database calls, so MongoDB is not
required. Notification read and dismissed status is stored per account in
MongoDB and follows that account across browsers and refreshes.

### Production deployment

There are no platform-specific deployment manifests in this repository. Deploy
the frontend and backend as separate services, or configure equivalent build,
start, environment, and storage settings with your hosting provider:

1. Provision a MongoDB database and a Node.js backend service. Install backend
   dependencies with `npm ci` in `backend` and start the service with
   `npm start`. The service listens on `PORT` (default `5000`); use the port
   supplied by your host.
2. Set these backend environment variables in the host's secret/environment
   settings:
   - `MONGO_URI`: production MongoDB connection string.
   - `JWT_SECRET`: a long, randomly generated secret; do not use the example
     value or commit production secrets.
   - `CLIENT_URL`: the deployed frontend's origin, including its scheme, such
     as `https://app.example.com`. CORS allows this configured origin.
   - `PORT`: only set this if your host does not supply it automatically.
3. Set `VITE_API_URL` for the frontend build to the public backend API URL,
   including `/api` (for example, `https://api.example.com/api`). This is a
   build-time setting. Install dependencies and run `npm run build` in
   `frontend`, then publish the generated `frontend/dist` directory using a
   static hosting service.
4. To create an initial administrator, set `ADMIN_NAME`, `ADMIN_HANDLE`,
   `ADMIN_EMAIL`, `ADMIN_EMPLOYEE_ID`, and a strong `ADMIN_PASSWORD` in the
   backend environment, then run `npm run create-admin` in `backend` once.
   `ADMIN_DEPARTMENT` is optional. Do not expose these values in the frontend.

Uploaded resources and user avatar images are written to `backend/uploads`
(avatars are in its `avatars` subdirectory). The application creates these
directories if they do not exist, but it does not use remote object storage.
Attach persistent storage to the backend service at `backend/uploads` and
include it in backups; otherwise uploads can be lost when an instance is
replaced, restarted, or redeployed. If the hosting provider cannot mount
persistent storage, uploads need to be migrated to a persistent object-storage
service before production use.