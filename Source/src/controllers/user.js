const path = require('path');

const User = require('../models/user')
const sendEmail = require('../utils/sendEmail')

exports.getAllUserExceptAdmin = async (req, res) => {
    const users = await User.find({ role: { $ne: 'admin' } }).lean()
    res.render('user/index', { users, layout: 'dashboard' })
}

exports.getUserById = async (req, res) => {
    const id = req.params.id
    const user = await User.findOne({ _id: id }).lean()
    res.render('user/detail', { user, layout: 'dashboard' })
}

// lock or unlock account
exports.changeUserStatus = async (req, res) => {
    const id = req.body.id
    const userFound = await User.findOne({ _id: id })

    userFound.changeStatus()
    userFound.save()

    res.status(200).json({
        status: 'success',
    })
}

exports.resendLoginMail = async (req, res) => {
    const id = req.body.id
    const userFound = await User.findOne({ _id: id })
    if (userFound.isConfirmEmail) {
        res.status(201).json({
            status: 'fail',
            message: 'User had login through email before',
        })
    } else {
        const newToken = userFound.generateConfirmEmailToken()
        userFound.save()
        sendEmail(
            userFound.email,
            'Your account has just been created',
            `Click this link to confirm ${req.protocol}://localhost:${process.env.PORT}/accounts/${newToken}`
        )
        res.status(201).json({
            status: 'success',
        })
    }
}

// need to combine with edit user information
exports.uploadAvatar = async (req, res, next) => {
    const avatar = req.file

    let imgPath = path.posix.join('/', path.relative("src\\public", avatar.path));
    imgPath = imgPath.replace(/\\/g, "/")

    const { userId } = req.session

    const userFound = await User.findOne({ _id: userId })
    userFound.avatar = imgPath
    userFound.save()

    res.json({
        status: 'success',
        message: 'Upload avatar successfully',
        img: imgPath,
    })
}
