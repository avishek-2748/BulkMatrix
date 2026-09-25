import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['CONTRACT_REQUEST', 'CONTRACT_UPDATE', 'CHAT_MESSAGE', 'SYSTEM_ALERT'] },
  isRead: { type: Boolean, default: false },
  relatedEntityId: { type: mongoose.Schema.Types.ObjectId }, // e.g., contractId, chatId
  relatedEntityType: { type: String }
}, { timestamps: true });

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
