let express = require('express')
let router = express.Router()
let auth_api = require('./api/auth')
let friends_api = require('./api/friends')
let rooms_api = require('./api/rooms')
let messages_api = require('./api/messages')
let file_api = require('./api/file')

/**
    login, register
 */
router.post('/auth', auth_api.auth)

/**
 CRUD Friend information
 */
router.post('/friends', friends_api.friends)

/**
 CRUD Room information
 */
router.post('/rooms', rooms_api.rooms)

/**
 CRUD Message information
 */
router.post('/messages', messages_api.messages)

/**
 CRUD file
 */
router.post('/file', file_api.file)


router.get("/logout",(req,res) => {
    req.session.destroy();
    res.redirect(`/#/login`);
})

module.exports = router