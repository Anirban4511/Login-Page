import mongoose from "mongoose";

const connectDB = async () => {
  mongoose.connection.on("connected", () => {
    console.log("Database is connected");
  });
  mongoose.connection.on("error", (err) => {
    console.error("Database connection error:", err);
  });
  await mongoose.connect(`${process.env.MONGO_URI}/mern-auth`).catch((err) => {
    console.error("Failed to connect to MongoDB:", err);
    process.exit(1); // Exit process if connection fails
  });
};

export default connectDB;
