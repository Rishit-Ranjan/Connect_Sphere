import { listen } from './src/app.js';
import connectDB from './src/config/db.js';

const PORT= process.env.PORT|| 5000;

connectDB().then(()=> {
    listen(PORT, ()=> {
        console.log(`Server running on port ${PORT}`);
    });
});