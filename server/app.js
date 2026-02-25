import "dotenv/config";
import express from "express";
import cors from "cors";
import todoRouter from "./routes/todoRouter.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/", todoRouter);

export default app;