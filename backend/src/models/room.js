import { Schema, model } from 'mongoose';

const roomSchema= new Schema(
    {
        name:{
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            default: '',
            trim: true
        },

        visibility: {
            type: String,
            enum: ['public', 'private'],
            default: 'public'
        },

        // User who created the room — allowed to delete it (admins can delete any room).
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            default: null
        },

        // Hashed password — only set for private rooms. Never sent to clients.
        passwordHash: {
            type: String,
            default: '',
            select: false
        }
    },
    {timestamps: true}
);

export default model('Room', roomSchema);