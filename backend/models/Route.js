import mongoose from 'mongoose';

const routeSchema = new mongoose.Schema({
  originPort: { type: mongoose.Schema.Types.ObjectId, ref: 'Port', required: true },
  destinationPort: { type: mongoose.Schema.Types.ObjectId, ref: 'Port', required: true },
  distanceNM: { type: Number },
  estimatedDays: { type: Number },
  routeName: { type: String }
}, {
  timestamps: true
});

const Route = mongoose.model('Route', routeSchema);
export default Route;
