require("dotenv").config();
import { app } from "./app";
import { v2 as cloudinary } from "cloudinary";
import connectToDb from "./config/db/connection";
const port = process.env.PORT;
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_SECRET_KEY,
});
//create server

app.listen(port, () => {
  console.log("server connected with port", port, process.pid);
  connectToDb();
});
