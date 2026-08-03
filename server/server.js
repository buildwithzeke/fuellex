import dotenv from "dotenv";
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";

//configuring environment variables
dotenv.config();

//setting up the port
const Port = process.env.PORT || 7000;

//initializing express server`
const server = express();

//middlewares
server.use(bodyParser.json());
server.use(cors());

//routes
server.get("/", (req, res) => {
  res.send("Hello World");
});

//starting the server
server.listen(Port, () => {
  console.log(`Server is running on port ${Port}`);
});
