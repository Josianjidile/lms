export const clerkWebhook = async (req, res) => {
  try {
    console.log("Received webhook:", req.body);

    const webhook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);
    await webhook.verify(JSON.stringify(req.body), {
      "svix-id": req.headers["svix-id"],
      "svix-timestamp": req.headers["svix-timestamp"],
      "svix-signature": req.headers["svix-signature"],
    });

    const { data, type } = req.body;
    console.log(`Processing event type: ${type}`);

    switch (type) {
      case "user.created": {
        console.log("Creating user:", data);
        const userData = {
          _id: data.id,
          email: data.email_addresses[0].email_address,
          name: `${data.first_name} ${data.last_name}`,
          imageUrl: data.image_url,
        };
        await User.create(userData);
        console.log("User created successfully");
        res.json({});
        break;
      }

      case "user.updated": {
        console.log("Updating user:", data);
        const userData = {
          email: data.email_addresses[0].email_address,
          name: `${data.first_name} ${data.last_name}`,
          imageUrl: data.image_url,
        };
        await User.findByIdAndUpdate(data.id, userData);
        console.log("User updated successfully");
        res.json({});
        break;
      }

      case "user.deleted": {
        console.log("Deleting user:", data.id);
        await User.findByIdAndDelete(data.id);
        console.log("User deleted successfully");
        res.json({});
        break;
      }

      default:
        console.log("Unhandled event type:", type);
        res.status(400).json({ success: false, message: "Unhandled event type" });
        break;
    }
  } catch (error) {
    console.error("Webhook processing error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
