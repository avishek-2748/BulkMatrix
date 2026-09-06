import mongoose from 'mongoose';

const disruptionEventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  eventType: { 
    type: String,
    enum: ['cyclone', 'strike', 'port_closure', 'weather', 'operational']
  },
  port: { type: String },
  region: { type: String },
  startDate: { type: Date },
  endDate: { type: Date },
  impactDays: { type: Number },
  severity: { type: String },
  description: { type: String },
  status: { 
    type: String,
    enum: ['active', 'resolved'],
    default: 'active'
  }
}, {
  timestamps: true
});

const DisruptionEvent = mongoose.model('DisruptionEvent', disruptionEventSchema);
export default DisruptionEvent;
