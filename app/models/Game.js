import mongoose from 'mongoose';

const gameSchema = new mongoose.Schema({
  adminId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  gameName: { 
    type: String, 
    required: true 
  },
  gameAmount: { 
    type: Number, 
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
    default: 'active' 
  },
  startTime: { 
    type: Date, 
    required: true 
  },
  endTime: { 
    type: Date, 
    required: true 
  },
  gameResult: { 
    type: String, 
    enum: ['win', 'loss', 'pending'], 
    default: 'pending' 
  },
  gamePrize: [
    {
      prize: { type: mongoose.Schema.Types.ObjectId, ref: 'GamePrize' },
      quantity: { type: Number, required: true },
      winners: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    },
  ],
  // gamePrize: { 
  //   type: mongoose.Schema.Types.ObjectId, 
  //   ref: 'GamePrize', 
  //   required: true 
  // },
  winner: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    default: null 
  },
  resultAnnouncedByAdmin: { 
    type: Boolean, 
    default: false 
  },
  paused: { type: Boolean, default: false }
});

export default mongoose.models.Game || mongoose.model('Game', gameSchema);
