import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { clerkMiddleware } from "@clerk/express";
import connectDB from "./config/mongodb.js";
import connectCloudinary from "./config/cloudinary.js";
import userRouter from "./routes/userRouter.js";
import { stripeWebhooks, clerkWebhooks } from "./controllers/webhooks.js";
import bodyParser from 'body-parser';

dotenv.config();

const app = express();

app.use(cors());
app.use(clerkMiddleware());
app.use(express.json()); // Correct placement of express.json()

// Connect to MongoDB & Cloudinary
await connectDB();
await connectCloudinary();

// Routes
app.get("/", (req, res) => res.send("API is running..."));
app.post("/clerk", express.json(), clerkWebhooks);
app.use("/api/user", userRouter);
app.post('/stripe', bodyParser.raw({ type: 'application/json' }), stripeWebhooks);

// Test route to verify express.json()
app.post('/test', (req, res) => {
    console.log("Test Request Body:", req.body);
    res.json(req.body);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});