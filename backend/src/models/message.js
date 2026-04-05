import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    conversationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Conversation',
        require: true,
        index: true
    },
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        require: true
    },
    content: {
        type: String,
        trim: true // auto delete usual spaces of the beginning and the and of the message.
    },
    imgUrl: {
        type: String,
    }
}, {
    timestamps: true
});

/*
schema index is a fast researching calculation.
Compound index (ex: index({ a, b }));
1: sort in ascending order 1 -> 10....
-1: sort in descending order (newest to older)
*/
messageSchema.index({ 
    conversationId: 1, 
    createdAt: -1 
});
const Message = mongoose.model('Message', messageSchema);
export default Message;