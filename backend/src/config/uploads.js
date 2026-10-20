import { mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
export const UPLOADS_DIR = join(__dirname, '..', '..', 'uploads');
export const AVATARS_DIR = join(UPLOADS_DIR, 'avatars');
export const POST_IMAGES_DIR = join(UPLOADS_DIR, 'posts');

mkdirSync(UPLOADS_DIR, { recursive: true });
mkdirSync(AVATARS_DIR, { recursive: true });
mkdirSync(POST_IMAGES_DIR, { recursive: true });
