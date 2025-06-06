import Message from '../models/Message.js';

export const sendMessage = async (req, res) => {
  const { senderId, receiverId, text } = req.body;
  try {
    const message = await Message.create({ senderId, receiverId, text });
    res.status(200).json(message);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getMessages = async (req, res) => {
  const { senderId, receiverId } = req.query;
  try {
    const messages = await Message.find({
      $or: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId }
      ]
    }).sort({ timestamp: 1 });
    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
