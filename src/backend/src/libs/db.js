import mongoose from 'mongoose';

export const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_CONNECTIONSTRING);
        console.log("Data connected!");
    } catch(err) {
        console.log("Fail to connect to database:", err);
        process.exit(1);
    }
}