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
        }
    },
    {timestamps: true}
);

export default model('Room', roomSchema);