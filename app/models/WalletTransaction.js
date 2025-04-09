import mongoose from 'mongoose';

const walletTransactionSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  transactionType: { 
    type: String, 
    enum: ['top-up', 'game-win', 'game-participation'], 
    required: true 
  },
  amount: { 
    type: Number, 
    required: true 
  },
  balanceAfterTransaction: { 
    type: Number, 
    required: true 
  },
  transactionDate: { 
    type: Date, 
    default: Date.now 
  },
  gameId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Game', 
    default: null 
  },
});

export default mongoose.models.WalletTransaction || mongoose.model('WalletTransaction', walletTransactionSchema);
