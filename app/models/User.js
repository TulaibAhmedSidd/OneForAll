import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  walletBalance: { type: Number, default: 0 },  // Wallet balance field
  referralCode: { type: String, unique: true },  // Unique referral code
  referredBy: { type: String, default: null },  // Track who referred the user
  isAdmin: { type: Boolean, default: false },  // Optional, for admin roles
});

userSchema.methods.generateReferralCode = function () {
  return `${this._id.toString().slice(0, 5)}-${Math.random().toString(36).slice(2, 10)}`;
};

export default mongoose.models.User || mongoose.model('User', userSchema);
