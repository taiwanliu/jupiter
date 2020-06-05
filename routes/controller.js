const express = require('express');
const router = express.Router();

router.get('/view', require('./jupiter').view);
router.get('/edit', require('./jupiter').edit);
router.post('/insert', require('./jupiter').insert);
router.post('/save', require('./jupiter').save);
router.get('/setLock', require('./jupiter').setLock);

module.exports = router;