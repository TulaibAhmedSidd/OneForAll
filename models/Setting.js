import mongoose from 'mongoose';

// Single document (key: 'site') edited from the admin panel.
const settingSchema = new mongoose.Schema(
  {
    key: { type: String, unique: true, default: 'site' },
    depositAccounts: {
      type: [{ method: String, title: String, number: String, _id: false }],
      default: [],
    },
    minDeposit: { type: Number, default: 50 },
    minWithdrawal: { type: Number, default: 200 },
    announcement: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.models.Setting || mongoose.model('Setting', settingSchema);
