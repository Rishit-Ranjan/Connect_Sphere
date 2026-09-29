import 'dotenv/config';
import { connect } from 'mongoose';
import Room from './src/models/Room.js';
import RoomMessage from './src/models/RoomMessage.js';
import User from './src/models/User.js';

await connect(process.env.MONGO_URI);

const rooms = await Room.find().sort({ createdAt: 1 }).lean();
console.log('ROOMS:', rooms.length);
for (const r of rooms) {
  const msgs = await RoomMessage.countDocuments({ roomId: r._id });
  console.log(
    `  - ${r.name} | visibility=${r.visibility || 'public'} | createdBy=${r.createdBy ? r.createdBy.toString() : 'NULL'} | messages=${msgs}`
  );
}

const users = await User.find().lean();
console.log('USERS:', users.length);
for (const u of users) {
  console.log(`  - ${u.name} (@${u.handle}) | ${u.email} | role=${u.role} | id=${u._id.toString()}`);
}

process.exit(0);
