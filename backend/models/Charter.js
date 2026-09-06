import mongoose from 'mongoose';

const charterSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  cargoVolume: {
    type: Number,
    required: true
  },
  commodity: {
    type: String,
    enum: ['coal', 'iron_ore'],
    required: true
  },
  originPort: {
    type: String,
    required: true
  },
  destinationPorts: [{
    type: String
  }],
  contractType: {
    type: String,
    enum: ['spot', 'short_term', 'medium_term'],
    required: true
  },
  arrivalWindowStart: {
    type: Date,
    required: true
  },
  arrivalWindowEnd: {
    type: Date,
    required: true
  },
  recommendedVessel: {
    type: String
  },
  marketSignal: {
    type: String
  },
  status: {
    type: String,
    enum: ['planning', 'recommended', 'active', 'completed', 'cancelled'],
    default: 'planning'
  }
}, {
  timestamps: true
});

const Charter = mongoose.model('Charter', charterSchema);
export default Charter;
