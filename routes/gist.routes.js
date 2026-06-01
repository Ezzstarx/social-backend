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

const router = express.Router();

router.get('/', getAllGists);
router.get('/threads/4chan/boards', getFourChanBoards);
router.get('/threads/4chan/:board/catalog', getFourChanCatalog);
router.get('/threads/4chan/:board/:threadNo', getFourChanThread);
router.post('/:id/join', toggleJoinGist);
router.post('/:id/star', starGist);

router.get('/creators', getCreators);
router.post('/creators/:id/subscribe', subscribeCreator);

module.exports = router;
