import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { clerkMiddleware } from "@clerk/express";
import connectDB from "./config/mongodb.js";
import educatorRouter from "./routes/educatorRoutes.js";
import { clerkWebhook } from "./controllers/webhooks.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(clerkMiddleware()); // Use Clerk middleware to authenticate requests
app.use(express.json());

// Connect to MongoDB
connectDB();

// Routes
app.get("/", (req, res) => {
  res.send("API is running...");
});
app.post("/clerk", express.json(), clerkWebhook);
app.use('/api/educator', educatorRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
