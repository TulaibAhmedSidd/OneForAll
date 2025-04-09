import mongoose from 'mongoose';

const gameSchema = new mongoose.Schema({
  adminId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  gameType: { 
    type: String, 
    enum: ['1rupee', '10rupee', '50rupee'], 
    required: true 
  },
  requiredUsers: { 
    type: Number, 
    required: true 
  },
  participants: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }],
  status: { 
    type: String, 
    enum: ['pending', 'active', 'completed', 'cancelled'], 
    default: 'pending' 
  },
  startTime: { 
    type: Date, 
    required: true 
  },
  endTime: { 
    type: Date, 
    required: true 
  },
  prizeAmount: { 
    type: Number, 
    required: true 
  },
  gameResult: { 
    type: String, 
    enum: ['win', 'loss', 'pending'], 
    default: 'pending' 
  },
  winner: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    default: null 
  },
  resultAnnouncedByAdmin: { 
    type: Boolean, 
    default: false 
  }
});

export default mongoose.models.Game || mongoose.model('Game', gameSchema);
