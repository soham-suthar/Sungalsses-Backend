import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(`${process.env.MONGO_URL}`);
    mongoose.set("debug", true);
    console.log("Mongoose Connected");
  } catch (error) {
    console.error(error);
    process.exit();
  }
};

export default connectDB;
