const express = require('express');
const { 
  getAllGists,
  toggleJoinGist,
  starGist,
  getCreators,
  subscribeCreator
} = require('../controllers/gist.controller');
const {
  getFourChanBoards,
  getFourChanCatalog,
  getFourChanThread,
} = require("../controllers/externalDiscovery.controller");
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();

router.get('/', getAllGists);
router.get('/threads/4chan/boards', getFourChanBoards);
router.get('/threads/4chan/:board/catalog', getFourChanCatalog);
router.get('/threads/4chan/:board/:threadNo', getFourChanThread);
router.post('/:id/join', requireAuth, toggleJoinGist);
router.post('/:id/star', requireAuth, starGist);

router.get('/creators', getCreators);
router.post('/creators/:id/subscribe', requireAuth, subscribeCreator);

module.exports = router;
