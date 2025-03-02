import { clerkClient } from "@clerk/express";

export const protectEducator = async (req, res, next) => {
  try {
    const userId = req.auth?.userId;
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized: No user ID found" });

    const user = await clerkClient.users.getUser(userId);
    if (user.publicMetadata.role !== "educator") {
      return res.status(403).json({ success: false, message: "Unauthorized user" });
    }

    next();
  } catch (error) {
    console.error("Error in protectEducator middleware:", error);
    return res.status(500).json({ success: false, message: "Authentication error" });
  }
};
