import mongoose from 'mongoose';

// Prize catalogue. Games copy the prize details when created, so editing or deleting
// a catalogue prize never changes a game people already paid into.
const gamePrizeSchema = new mongoose.Schema(
  {
    prizeName: { type: String, required: true, trim: true },
    prizeImage: { type: String, required: true },
    prizeWorth: { type: Number, required: true, min: 0 },
    // 'cash' prizes are credited to the winner's wallet automatically; 'item' prizes are delivered by hand.
    type: { type: String, enum: ['item', 'cash'], default: 'item' },
  },
  { timestamps: true }
);

export default mongoose.models.GamePrize || mongoose.model('GamePrize', gamePrizeSchema);
