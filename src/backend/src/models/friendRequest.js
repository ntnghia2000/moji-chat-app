import mongoose from "mongoose";

const friendRequestSchema = new mongoose.Schema({
    from: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        require: true
    },
    to: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        require: true
    },
    message: {
        type: String,
        maxLength: 300
    }
}, {
    timestamps: true
});

friendRequestSchema.index({ 
    from: 1, 
    to: 1 
}, {
    unique: true // create unique index for friend schema.
});
/*
View all friend request sent.
*/
friendRequestSchema.index({ from: 1 });
/*
View all friend request received.
*/
friendRequestSchema.index({ to: 1 });
const FriendRequest = mongoose.model('FriendRequest', friendRequestSchema);
export default FriendRequest;