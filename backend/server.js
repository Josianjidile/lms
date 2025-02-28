import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { clerkMiddleware } from "@clerk/express";
import connectDB from "./config/mongodb.js";
import connectCloudinary from "./config/cloudinary.js";
import educatorRouter from "./routes/educatorRoutes.js";
import courseRouter from "./routes/courseRoute.js";
import { clerkWebhook,stripeWebhooks } from "./controllers/webhooks.js";
import userRouter from "./routes/userRouter.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(clerkMiddleware()); // Use Clerk middleware to authenticate requests
app.use(express.json());

// Connect to MongoDB & Cloudinary
await connectDB();
await connectCloudinary();

// Routes
app.get("/", (req, res) => res.send("API is running..."));
app.post("/clerk", express.json(), clerkWebhook);
app.use("/api/educator", express.json(), educatorRouter);
app.use("/api/course", express.json(), courseRouter);
app.use("/api/user", express.json(), userRouter);
app.use('/stripe', express.raw({type: 'application/json'}),stripeWebhooks)

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
