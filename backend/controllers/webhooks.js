import { Webhook } from "svix";
import User from "../models/User.js";

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
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: "Duplicate email or ID" });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};
