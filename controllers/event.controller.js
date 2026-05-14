let events = [
  {
    id: "1",
    name: "Counter Strike 2 Tournament",
    description: "Utilizing Anime and Manga as gateways, this event will disseminate the various appeal of Japan (nature, tradition, culture).",
    bannerImage: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=300&fit=crop",
    organizer: "ESL",
    price: 250,
    reward: "1000 SPICA",
    date: "2025-01-05",
    location: "Gaming Platform",
    maxParticipants: 100,
    status: "UPCOMING",
    tags: ["Open", "Upcoming", "E-sports Tournament"],
    participants: [],
    winner: null,
    createdBy: "admin"
  },
  {
    id: "2",
    name: "Tekken 8 Tournament",
    description: "Weekly gaming sessions where community members team up for multiplayer games.",
    bannerImage: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=400&h=300&fit=crop",
    organizer: "5 STAR",
    price: 250,
    reward: "1000 SPICA",
    date: "2025-01-10",
    location: "Gaming Platform",
    maxParticipants: 64,
    status: "UPCOMING",
    tags: ["Open", "Upcoming", "E-sports Tournament"],
    participants: [],
    winner: null,
    createdBy: "admin"
  },
  {
    id: "3",
    name: "International Cosplay Contest",
    description: "Utilizing Anime and Manga as gateways, this event will disseminate the various appeal of Japan (nature, tradition, culture).",
    bannerImage: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&h=300&fit=crop",
    organizer: "COSPLAY",
    price: 0,
    reward: "Weekly SPICA Rewards",
    date: "2025-01-05",
    location: "Discord + Online",
    maxParticipants: 200,
    status: "UPCOMING",
    tags: ["Open", "Upcoming", "Contest"],
    participants: [],
    winner: null,
    createdBy: "admin"
  },
  {
    id: "4",
    name: "HI-TECH 4 - Apex Legends",
    description: "Live ongoing Apex Legends championship.",
    bannerImage: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=250&fit=crop",
    organizer: "HI-TECH",
    price: 0,
    reward: "Trophy + SPICA",
    date: "2025-01-01",
    location: "Online",
    maxParticipants: 50,
    status: "ONGOING",
    tags: ["Live Now", "E-sports Tournament"],
    participants: [],
    winner: null,
    createdBy: "admin"
  },
  {
    id: "5",
    name: "Championship Finals - League of Legends",
    description: "The grand championship finals for League of Legends.",
    bannerImage: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=400&h=250&fit=crop",
    organizer: "RIOT",
    price: 0,
    reward: "Grand Prize",
    date: "2025-01-01",
    location: "Online",
    maxParticipants: 32,
    status: "ONGOING",
    tags: ["Live Now", "E-sports Tournament"],
    participants: [],
    winner: null,
    createdBy: "admin"
  }
];

let nextId = 6;

// ADMIN CONTROLLERS

const createEvent = (req, res) => {
  const { name, description, bannerImage, organizer, price, reward, date, location, maxParticipants, tags } = req.body;

  if (!name || !date || !maxParticipants || maxParticipants <= 0) {
    return res.status(400).json({ success: false, message: "Invalid input: name, date, and maxParticipants are required, maxParticipants must be positive" });
  }

  const newEvent = {
    id: nextId.toString(),
    name,
    description,
    bannerImage,
    organizer,
    price,
    reward,
    date,
    location,
    maxParticipants,
    status: "UPCOMING",
    tags,
    participants: [],
    winner: null,
    createdBy: "admin"
  };

  events.push(newEvent);
  nextId++;

  res.status(201).json({ success: true, message: "Event created successfully", data: newEvent });
};

const updateEvent = (req, res) => {
  const { id } = req.params;
  const event = events.find(e => e.id === id);

  if (!event) {
    return res.status(404).json({ success: false, message: "Event not found" });
  }

  const allowedFields = ['name', 'description', 'bannerImage', 'organizer', 'price', 'reward', 'date', 'location', 'maxParticipants', 'tags', 'status'];
  const updates = {};

  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  });

  // Validate status if provided
  if (updates.status && !['UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED'].includes(updates.status)) {
    return res.status(400).json({ success: false, message: "Invalid status" });
  }

  Object.assign(event, updates);

  res.status(200).json({ success: true, message: "Event updated successfully", data: event });
};

const deleteEvent = (req, res) => {
  const { id } = req.params;
  const index = events.findIndex(e => e.id === id);

  if (index === -1) {
    return res.status(404).json({ success: false, message: "Event not found" });
  }

  events.splice(index, 1);

  res.status(200).json({ success: true, message: "Event deleted successfully" });
};

const getAllEvents = (req, res) => {
  let filteredEvents = events;

  if (req.query.status) {
    filteredEvents = events.filter(e => e.status === req.query.status);
  }

  const eventsWithCount = filteredEvents.map(e => ({
    ...e,
    participantCount: e.participants.length
  }));

  res.status(200).json({ success: true, message: "Events retrieved successfully", data: eventsWithCount });
};

const getEventById = (req, res) => {
  const { id } = req.params;
  const event = events.find(e => e.id === id);

  if (!event) {
    return res.status(404).json({ success: false, message: "Event not found" });
  }

  const eventWithCount = {
    ...event,
    participantCount: event.participants.length
  };

  res.status(200).json({ success: true, message: "Event retrieved successfully", data: eventWithCount });
};

// USER CONTROLLERS

const participateInEvent = (req, res) => {
  const { id } = req.params;
  const { userId, name } = req.body;

  if (!userId || !name) {
    return res.status(400).json({ success: false, message: "userId and name are required" });
  }

  const event = events.find(e => e.id === id);

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

  event.participants.push({ userId, name });

  res.status(200).json({ success: true, message: "Successfully registered", data: { participantCount: event.participants.length } });
};

const leaveEvent = (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ success: false, message: "userId is required" });
  }

  const event = events.find(e => e.id === id);

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

  res.status(200).json({ success: true, message: "Successfully left the event" });
};

const getMyEvents = (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ success: false, message: "userId query parameter is required" });
  }

  const myEvents = events.filter(e => e.participants.some(p => p.userId === userId)).map(e => ({
    ...e,
    participantCount: e.participants.length
  }));

  res.status(200).json({ success: true, message: "My events retrieved successfully", data: myEvents });
};

// ADMIN ONLY: assignWinner

const assignWinner = (req, res) => {
  const { id } = req.params;
  const { userId, name } = req.body;

  if (!userId || !name) {
    return res.status(400).json({ success: false, message: "userId and name are required" });
  }

  const event = events.find(e => e.id === id);

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

  res.status(200).json({ success: true, message: "Winner assigned successfully", data: event });
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