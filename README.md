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