const mongoose = require("mongoose");

const pageSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        blocks: [
            {
                order: { type: Number },
                id: { type: String },
                type: { type: String, enum: ['text', 'image'], required: true },
                content: { type: String }, // For text content

            },
        ],
        isDeleted: { type: Boolean, default: false }, // Soft delete
    },
    { timestamps: true }
);

const Page = mongoose.model("Page", pageSchema);

module.exports = Page;
