import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import { clerkMiddleware } from "@clerk/express";
import connectDB from "./config/mongodb.js";
import connectCloudinary from "./config/cloudinary.js";
import { stripeWebhooks, clerkWebhooks } from "./controllers/webhooks.js";
import userRouter from "./routes/userRouter.js";
import educatorRouter from "./routes/educatorRoutes.js";
import courseRouter from "./routes/courseRoute.js";

dotenv.config();

const app = express();

// ⚠️ STRIPE WEBHOOK: Must use raw body parser for correct signature verification
app.post("/stripe", bodyParser.raw({ type: "application/json" }), stripeWebhooks);

// Middleware (applies globally except for Stripe webhook)
app.use(cors());
app.use(clerkMiddleware());
app.use(express.json());

// Connect to MongoDB & Cloudinary
await connectDB();
await connectCloudinary();

// Routes
app.get("/", (req, res) => res.send("API is running..."));
app.post("/clerk", clerkWebhooks);
app.use("/api/user", userRouter);
app.use("/api/course", courseRouter);
app.use("/api/educator", educatorRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
