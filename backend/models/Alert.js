import mongoose from 'mongoose';

const alertSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  charter: { type: mongoose.Schema.Types.ObjectId, ref: 'Charter' },
  vessel: { type: mongoose.Schema.Types.ObjectId, ref: 'Vessel' },
  port: { type: mongoose.Schema.Types.ObjectId, ref: 'Port' },
  type: {
    type: String,
    enum: ['weather', 'congestion', 'disruption', 'vessel', 'market'],
    required: true
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high'],
    required: true
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false }
}, {
  timestamps: true
});

const Alert = mongoose.model('Alert', alertSchema);
export default Alert;
