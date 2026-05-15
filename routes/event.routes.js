const express = require('express');
const router = express.Router();
const {
  createEvent,
  updateEvent,
  deleteEvent,
  getAllEvents,
  getEventById,
  participateInEvent,
  leaveEvent,
  getMyEvents,
  assignWinner
} = require('../controllers/event.controller');

// IMPORTANT: Register the /my-events route BEFORE /:id to avoid Express treating "my-events" as an id param.

router.get('/my-events', getMyEvents);

router.get('/', getAllEvents);
router.get('/:id', getEventById);
router.post('/', createEvent);
router.put('/:id', updateEvent);
router.delete('/:id', deleteEvent);

router.post('/:id/participate', participateInEvent);
router.delete('/:id/leave', leaveEvent);
router.post('/:id/winner', assignWinner);

module.exports = router;