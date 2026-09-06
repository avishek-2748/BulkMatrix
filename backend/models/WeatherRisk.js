import mongoose from 'mongoose';

const weatherRiskSchema = new mongoose.Schema({
  region: { type: String },
  port: { type: String },
  month: { type: String },
  year: { type: Number },
  riskType: { 
    type: String,
    enum: ['monsoon', 'cyclone', 'storm']
  },
  riskLevel: {
    type: String,
    enum: ['low', 'medium', 'high']
  },
  description: { type: String }
}, {
  timestamps: true
});

const WeatherRisk = mongoose.model('WeatherRisk', weatherRiskSchema);
export default WeatherRisk;
