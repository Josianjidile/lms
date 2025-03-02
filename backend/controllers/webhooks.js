import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import { Webhook } from "svix";
import User from "../models/User.js";
import Purchase from "../models/Purchase.js";
import Course from "../models/course.js";
import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set in the environment variables");
}

const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

// Clerk Webhook Handler
export const clerkWebhook = async (req, res) => {
  try {
    console.log("Received webhook:", JSON.stringify(req.body, null, 2));

    // Verify the webhook signature
    const webhook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);
    await webhook.verify(JSON.stringify(req.body), {
      "svix-id": req.headers["svix-id"],
      "svix-timestamp": req.headers["svix-timestamp"],
      "svix-signature": req.headers["svix-signature"],
    });
    console.log("Webhook verified successfully");

    const { data, type } = req.body;
    console.log(`Processing event type: ${type}`);

    switch (type) {
      case "user.created": {
        console.log("Creating user with data:", data);
        const userData = {
          _id: data.id,
          email: data.email_addresses[0].email_address,
          name: `${data.first_name} ${data.last_name}`,
          imageUrl: data.image_url,
        };
        const newUser = await User.create(userData);
        console.log("User created successfully:", newUser);
        return res.status(200).json({ success: true });
      }

      case "user.updated": {
        console.log("Updating user with data:", data);
        const userData = {
          email: data.email_addresses[0].email_address,
          name: `${data.first_name} ${data.last_name}`,
          imageUrl: data.image_url,
        };
        const updatedUser = await User.findByIdAndUpdate(data.id, userData, {
          new: true,
        });
        console.log("User updated successfully:", updatedUser);
        return res.status(200).json({ success: true });
      }

      case "user.deleted": {
        console.log("Deleting user with ID:", data.id);
        const deletedUser = await User.findByIdAndDelete(data.id);
        console.log("User deleted successfully:", deletedUser);
        return res.status(200).json({ success: true });
      }

      default:
        console.log("Unhandled event type:", type);
        return res.status(400).json({ success: false, message: "Unhandled event type" });
    }
  } catch (error) {
    console.error("Webhook processing error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const stripeWebhooks = async (req, res) => {
  const sig = req.headers["stripe-signature"]; // Get signature from headers
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!endpointSecret) {
    console.error("STRIPE_WEBHOOK_SECRET is not set in environment variables");
    return res.status(500).json({ error: "Webhook secret is not configured" });
  }

  let event;

  try {
    // Construct the event using Stripe's SDK
    event = stripeInstance.webhooks.constructEvent(req.body, sig, endpointSecret);
    console.log("Event data received:", JSON.stringify(event, null, 2));
  } catch (err) {
    console.error("Error verifying webhook signature:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const payment_intent = event.data.object;
        const paymentIntentId = payment_intent.id;

        const session = await stripeInstance.checkout.sessions.list({
          payment_intent: paymentIntentId,
        });

        const { purchaseId } = session.data[0].metadata;

        // Find the purchase record
        const purchaseData = await Purchase.findById(purchaseId);
        const userData = await User.findById(purchaseData.userId);
        const courseData = await Course.findById(purchaseData.courseId.toString());

        courseData.enrolledStudents.push(userData);
        await courseData.save();
        userData.enrolledCourses.push(courseData._id);
        await userData.save();

        purchaseData.status = "completed";
        await purchaseData.save();

        console.log("Purchase completed and user enrolled successfully");
        break;
      }

      case "payment_intent.payment_failed": {
        const payment_intent = event.data.object;
        const paymentIntentId = payment_intent.id;

        const session = await stripeInstance.checkout.sessions.list({
          payment_intent: paymentIntentId, 
        });

        const { purchaseId } = session.data[0].metadata;

        const purchaseData = await Purchase.findById(purchaseId);
        purchaseData.status = "failed";
        await purchaseData.save();
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};