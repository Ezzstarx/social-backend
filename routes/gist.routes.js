const express = require('express');
const { 
  getAllGists,
  toggleJoinGist,
  starGist,
  getCreators,
  subscribeCreator
} = require('../controllers/gist.controller');

const router = express.Router();

router.get('/', getAllGists);
router.post('/:id/join', toggleJoinGist);
router.post('/:id/star', starGist);

router.get('/creators', getCreators);
router.post('/creators/:id/subscribe', subscribeCreator);

module.exports = router;
