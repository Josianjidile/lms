import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/mongodb.js";
import {clerkWebhook} from "./controllers/webhooks.js"


dotenv.config(); // Load environment variables

const app = express();
app.use(cors());
app.use(express.json()); // Middleware for JSON parsing

// Connect to MongoDB
connectDB()

//routes
app.get("/", (req, res) => {
  res.send("API is running...");
});
app.post('/clerk', express.json(), clerkWebhook)

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
