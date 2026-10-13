const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/requireAuth');
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

router.get('/', getAllEvents);
router.get('/my-events', requireAuth, getMyEvents);
router.get('/:id', getEventById);

router.post('/', requireAuth, createEvent);
router.put('/:id', requireAuth, updateEvent);
router.delete('/:id', requireAuth, deleteEvent);

router.post('/:id/participate', requireAuth, participateInEvent);
router.delete('/:id/leave', requireAuth, leaveEvent);
router.post('/:id/winner', requireAuth, assignWinner);

module.exports = router;
