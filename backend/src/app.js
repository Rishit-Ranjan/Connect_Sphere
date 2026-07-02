import express, { json } from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import postRoutes from './routes/postRoutes.js';
import noticeRoutes from './routes/noticeRoutes.js';
import resourceRoutes from './routes/resourceRoutes.js';
import roomRoutes from './routes/roomRoutes.js';
import errorMiddleware from './middlewares/errorMiddleware.js';
import directMessageRoutes from './routes/directMessageRoutes.js';

config();

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));
app.use(json());
app.use(cookieParser());
app.use(morgan('dev'));

app.get('/', (req, res) => {
  res.json({ message: 'ConnectSphere API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/direct-messages', directMessageRoutes);

app.use(errorMiddleware);

export const listen = (port, callback) => {
  return app.listen(port, callback);
};

export default app;