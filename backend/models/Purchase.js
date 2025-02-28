import mongoose from "mongoose";

const purchaseSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    userId: { type: String, ref: "User", required: true }, // Reference to the user who made the purchase
    // Reference to the purchased course
    amount: { type: Number, required: true }, // Amount paid for the course
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    }, // Status of payment
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt fields
);

const Purchase =
  mongoose.models.Purchase || mongoose.model("Purchase", purchaseSchema);

export default Purchase;
