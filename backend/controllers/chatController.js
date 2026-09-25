import ChatMessage from '../models/ChatMessage.js';
import Contract from '../models/Contract.js';
import Notification from '../models/Notification.js';

// @desc    Send a message
// @route   POST /api/chat
// @access  Private
export const sendMessage = async (req, res) => {
  try {
    const { contractId, receiverId, message } = req.body;
    
    // Validate contract access
    const contract = await Contract.findById(contractId);
    if (!contract) return res.status(404).json({ message: 'Contract not found' });
    
    const isParticipant = contract.logisticManagerId.toString() === req.user._id.toString() || 
                          contract.vesselOwnerId.toString() === req.user._id.toString();
    if (!isParticipant) return res.status(403).json({ message: 'Not authorized for this contract chat' });

    const chatMsg = new ChatMessage({
      contractId,
      senderId: req.user._id,
      receiverId,
      message,
      isRead: false
    });
    
    await chatMsg.save();

    // Notify receiver
    await Notification.create({
      userId: receiverId,
      title: 'New Message',
      message: `${req.user.name || 'User'}: ${message.slice(0, 60)}${message.length > 60 ? '...' : ''}`,
      type: 'CHAT_MESSAGE',
      relatedEntityId: contractId,
      relatedEntityType: 'Contract'
    }).catch(err => console.error('Notification creation error:', err));

    res.status(201).json(chatMsg);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get messages for a specific contract
// @route   GET /api/chat/:contractId
// @access  Private
export const getMessages = async (req, res) => {
  try {
    const { contractId } = req.params;
    
    const contract = await Contract.findById(contractId);
    if (!contract) return res.status(404).json({ message: 'Contract not found' });
    
    const isParticipant = contract.logisticManagerId.toString() === req.user._id.toString() || 
                          contract.vesselOwnerId.toString() === req.user._id.toString();
    if (!isParticipant) return res.status(403).json({ message: 'Not authorized' });

    const messages = await ChatMessage.find({ contractId })
                                      .sort({ createdAt: 1 })
                                      .populate('senderId', 'name company role')
                                      .populate('receiverId', 'name company role');
    
    // Mark messages as read for the current user
    await ChatMessage.updateMany(
      { contractId, receiverId: req.user._id, isRead: false },
      { $set: { isRead: true } }
    );
    
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all chat threads for the user
// @route   GET /api/chat/threads/all
// @access  Private
export const getChatThreads = async (req, res) => {
  try {
    // A thread corresponds to an active or accepted contract for the user
    const contracts = await Contract.find({
      $or: [
        { logisticManagerId: req.user._id },
        { vesselOwnerId: req.user._id }
      ],
      status: { $in: ['ACCEPTED', 'ACTIVE', 'NEGOTIATING'] }
    }).populate('logisticManagerId', 'name company')
      .populate('vesselOwnerId', 'name company');

    const threads = await Promise.all(contracts.map(async (contract) => {
      const lastMessage = await ChatMessage.findOne({ contractId: contract._id })
                                           .sort({ createdAt: -1 });
      const unreadCount = await ChatMessage.countDocuments({
        contractId: contract._id,
        receiverId: req.user._id,
        isRead: false
      });
      
      return {
        contract,
        lastMessage,
        unreadCount
      };
    }));

    // Sort by last message time
    threads.sort((a, b) => {
      const dateA = a.lastMessage ? new Date(a.lastMessage.createdAt) : new Date(a.contract.updatedAt);
      const dateB = b.lastMessage ? new Date(b.lastMessage.createdAt) : new Date(b.contract.updatedAt);
      return dateB - dateA;
    });

    res.json(threads);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
