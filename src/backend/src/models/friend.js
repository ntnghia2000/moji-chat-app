import mongoose from "mongoose";

const friendSchema = new mongoose.Schema({
    userA: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        require: true
    },
    userB: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        require: true
    }
}, {
    timestamps: true
});
/*
save: run logical of the function before 
*/
friendSchema.pre("save", function (next) {
    const a = this.userA.toString();
    const b = this.userB.toString();
    if (a > b) {
        this.userA = new mongoose.Types.ObjectId(b);
        this.userB = new mongoose.Types.ObjectId(a);
    }
    next;
});
friendSchema.index({ 
    userA: 1, 
    userB: 1 
}, {
    unique: true // create unique index for friend schema.
});
const Friend = mongoose.model('Friend', friendSchema);
export default Friend;