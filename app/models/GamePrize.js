import mongoose from 'mongoose';

const gamePrizeSchema = new mongoose.Schema({
  prizeName: {
    type: String,
    required: true,
  },
  prizeImage: {
    type: String, // Cloudinary image URL or any external storage
    required: true,
  },
  prizeWorth: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  quantity: {
    type: Number,
    required: true,
    default: 1,
  },
});

export default mongoose.models.GamePrize || mongoose.model('GamePrize', gamePrizeSchema);
