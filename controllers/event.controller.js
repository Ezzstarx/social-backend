const Event = require("../models/Event");
const Notification = require("../models/Notification");
const xpEngine = require("../services/xpEngine");
const rewardEngine = require("../services/rewardEngine");
const { notifyUser } = require("../services/socket");

const createEvent = async (req, res) => {
  try {
    const { name, description, bannerImage, organizer, price, reward, date, location, maxParticipants, tags } = req.body;

    if (!name || !date || !maxParticipants || maxParticipants <= 0) {
      return res.status(400).json({ success: false, message: "Invalid input: name, date, and maxParticipants are required" });
    }

    const newEvent = await Event.create({
      name,
      description,
      bannerImage,
      organizer,
      price,
      reward,
      date,
      location,
      maxParticipants,
      tags,
      createdBy: req.user._id.toString(),
    });

    res.status(201).json({ success: true, message: "Event created successfully", data: newEvent });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    if (event.createdBy !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    const allowedFields = ['name', 'description', 'bannerImage', 'organizer', 'price', 'reward', 'date', 'location', 'maxParticipants', 'tags', 'status'];
    const updates = {};

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    if (updates.status && !['UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED'].includes(updates.status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    Object.assign(event, updates);
    await event.save();

    res.status(200).json({ success: true, message: "Event updated successfully", data: event });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    if (event.createdBy !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    await Event.findByIdAndDelete(id);

    res.status(200).json({ success: true, message: "Event deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAllEvents = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) {
      filter.status = req.query.status;
    }

    const events = await Event.find(filter).sort({ createdAt: -1 });
    const eventsWithCount = events.map(e => ({
      ...e.toObject(),
      participantCount: e.participants.length,
    }));

    res.status(200).json({ success: true, message: "Events retrieved successfully", data: eventsWithCount });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getEventById = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    const eventWithCount = {
      ...event.toObject(),
      participantCount: event.participants.length,
    };

    res.status(200).json({ success: true, message: "Event retrieved successfully", data: eventWithCount });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const participateInEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id.toString();
    const name = req.user.displayName || req.user.username;

    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    if (event.status !== "UPCOMING") {
      return res.status(400).json({ success: false, message: "Event is not open for participation" });
    }

    if (event.participants.length >= event.maxParticipants) {
      return res.status(400).json({ success: false, message: "Event is full" });
    }

    const alreadyParticipating = event.participants.some(p => p.userId === userId);

    if (alreadyParticipating) {
      return res.status(400).json({ success: false, message: "Already registered for this event" });
    }

    // Handle entry fee split (blueprint §21: 80% prize pool, 15% host, 5% platform)
    let feeSplitResult = null;
    if (event.price && event.price > 0) {
      feeSplitResult = await rewardEngine.processEventEntryFee(userId, event._id, event.price);
      // Award REGISTER_EVENT XP (25 XP) for paid events
      await xpEngine.awardXP(userId, "REGISTER_EVENT", event._id.toString());
    } else {
      // Award JOIN_EVENT XP (10 XP) for free events
      await xpEngine.awardXP(userId, "JOIN_EVENT", event._id.toString());
    }

    event.participants.push({ userId, name });
    await event.save();

    // Send join notification (blueprint §26: "Tournament joined")
    const notif = await Notification.create({
      userId,
      type: "EVENT_JOINED",
      title: "Event Joined!",
      body: `You successfully registered for "${event.name}". Good luck!`,
      referenceId: event._id.toString(),
      referenceType: "Event",
    });
    notifyUser(userId, notif);

    res.status(200).json({
      success: true,
      message: "Successfully registered",
      data: {
        participantCount: event.participants.length,
        feeSplit: feeSplitResult,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const leaveEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id.toString();

    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    if (event.status !== "UPCOMING") {
      return res.status(400).json({ success: false, message: "Cannot leave an event that has already started" });
    }

    const participantIndex = event.participants.findIndex(p => p.userId === userId);

    if (participantIndex === -1) {
      return res.status(400).json({ success: false, message: "You are not registered for this event" });
    }

    event.participants.splice(participantIndex, 1);
    await event.save();

    res.status(200).json({ success: true, message: "Successfully left the event" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getMyEvents = async (req, res) => {
  try {
    const userId = req.user._id.toString();

    const events = await Event.find({ "participants.userId": userId }).sort({ createdAt: -1 });
    const myEvents = events.map(e => ({
      ...e.toObject(),
      participantCount: e.participants.length,
    }));

    res.status(200).json({ success: true, message: "My events retrieved successfully", data: myEvents });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const assignWinner = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, name } = req.body;

    if (!userId || !name) {
      return res.status(400).json({ success: false, message: "userId and name are required" });
    }

    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    if (event.status !== "COMPLETED") {
      return res.status(400).json({ success: false, message: "Winner can only be assigned to a completed event" });
    }

    const isParticipant = event.participants.some(p => p.userId === userId);

    if (!isParticipant) {
      return res.status(400).json({ success: false, message: "Winner must be a participant of the event" });
    }

    event.winner = { userId, name };
    await event.save();

    res.status(200).json({ success: true, message: "Winner assigned successfully", data: event });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createEvent,
  updateEvent,
  deleteEvent,
  getAllEvents,
  getEventById,
  participateInEvent,
  leaveEvent,
  getMyEvents,
  assignWinner
};
