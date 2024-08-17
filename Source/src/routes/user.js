const express = require('express')
const router = express.Router()

const {
    getUserById,
    changeUserStatus,
    resendLoginMail,
    uploadAvatar,
} = require('../controllers/user')
const User = require('../models/user')

module.exports = (upload) => {
    router.get('/view-profile', async (req, res) => {
        const { userId } = req.session
        const userFound = await User.findOne({ _id: userId }).lean()
        res.render('user/profile', { user: userFound, layout: 'main' })
    })
    router.post('/update-avatar', upload.single('imgItem'), uploadAvatar)
    router.route('/:id').get(getUserById)
    router.route('/change-status').put(changeUserStatus)
    router.route('/resend-login-mail').put(resendLoginMail)
    return router
}
