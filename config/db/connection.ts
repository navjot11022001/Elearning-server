require("dotenv").config();
import mongoose from "mongoose";
const DB_URL: string = process.env.MONGODB_URL || "";
const connectToDb = async () => {
  try {
    mongoose.connect(DB_URL).then(() => {
      console.log("Connection to b succssfull");
    });
  } catch (err) {
    console.log("Erro while cnnecting to db ");
    setTimeout(connectToDb, 5000);
  }
};

export default connectToDb;
