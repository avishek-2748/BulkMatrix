import mongoose from 'mongoose';

const scenarioSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  inrChange: { type: Number },
  fuelChange: { type: Number },
  result: { type: mongoose.Schema.Types.Mixed }, // flexible JSON object
  recommendation: { type: String }
}, {
  timestamps: true
});

const Scenario = mongoose.model('Scenario', scenarioSchema);
export default Scenario;
