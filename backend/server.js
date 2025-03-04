import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { clerkMiddleware } from "@clerk/express";
import connectDB from "./config/mongodb.js";
import connectCloudinary from "./config/cloudinary.js";
import educatorRouter from "./routes/educatorRoutes.js";
import courseRouter from "./routes/courseRoute.js";
import { stripeWebhooks, clerkWebhooks } from "./controllers/webhooks.js";
import userRouter from "./routes/userRouter.js";
import bodyParser from 'body-parser'; // Import body-parser

dotenv.config();

const app = express();
app.use(cors());
app.use(clerkMiddleware()); // Use Clerk middleware to authenticate requests

// Connect to MongoDB & Cloudinary
await connectDB();
await connectCloudinary();

// Routes
app.get("/", (req, res) => res.send("API is running..."));
app.post("/clerk", express.json(), clerkWebhooks); // Keep express.json() for Clerk
app.use("/api/educator", educatorRouter); // Remove express.json()
app.use("/api/course", courseRouter); // Remove express.json()
app.use("/api/user", userRouter); // Remove express.json()
app.post('/stripe', bodyParser.raw({ type: 'application/json' }), stripeWebhooks); // Use body-parser.raw()

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));