import mongoose from "mongoose";

const connectDB = async () => {
    const mongoUri = process.env.MONGO_URI || process.env.MONGO_URL;
    const allowStartWithoutDb =
        process.env.ALLOW_START_WITHOUT_DB === "true" || process.env.NODE_ENV !== "production";

    if (!mongoUri || mongoUri.includes("<db_password>")) {
        const message = "MongoDB URI is missing or still using placeholder credentials.";
        if (allowStartWithoutDb) {
            console.warn(`${message} Starting backend without database connection.`);
            return false;
        }
        throw new Error(message);
    }

    try {
        await mongoose.connect(mongoUri, {
            dbName: process.env.MONGO_DB_NAME,
        });
        console.log("MongoDB connected");
        return true;
    } catch (error) {
        if (allowStartWithoutDb) {
            console.warn(`Error connecting to MongoDB: ${error.message}`);
            console.warn("Starting backend without database connection.");
            return false;
        }
        throw new Error(`Error connecting to MongoDB: ${error.message}`);
    }
};

export default connectDB;