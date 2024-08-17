const crypto = require('crypto')

const User = require('../models/user')
const sendEmail = require('../utils/sendEmail')

exports.getLoginForm = (req, res) => {
    res.render('account/login', {
        layout: 'noneLayout',
    })
}

exports.getCreateAccountForm = (req, res) => {
    res.render('account/create', {
        layout: 'dashboard',
    })
}

exports.getChangePasswordForm = (req, res) => {
    res.render('account/changePassword')
}

exports.createAccount = async (req, res) => {
    const { fullName, email } = req.body
    const newUser = await User.create({
        fullName,
        email,
    })
    const token = newUser.generateConfirmEmailToken()
    newUser.save()
    sendEmail(
        email,
        'Your account has just been created',
        `Click this link to confirm ${req.protocol}://localhost:${process.env.PORT}/accounts/${token}`
    )
    res.redirect('/dashboard/users')
}

exports.checkIsPasswordChangedAfterAccountCreated = async (req, res, next) => {
    // just check when user has already login
    if (req.session.userId) {
        const userId = req.session.userId
        try {
            const userFound = await User.findOne({ _id: userId })
            if (userFound.isFirstTimeLogin) {
                return res.redirect('/accounts/change-password')
            }
        } catch (err) {
            console.log(err)
        }
    }
    next()
}

// need to hash password for security but do that later
exports.login = async (req, res, next) => {
    const { username, password } = req.body

    if (!username || !password) {
        req.session.flash = {
            type: 'danger',
            message: `Please enter username & password`,
        }
        return res.redirect('/login')
    }

    const userFound = await User.findOne({ username, password })
    if (!userFound) {
        req.session.flash = {
            type: 'danger',
            message: `Invalid username or password`,
        }
        return res.redirect('/login')
    }

    if (!userFound.isConfirmEmail) {
        req.session.flash = {
            type: 'danger',
            message: `Please login by clicking on the link in your email`,
        }
        return res.redirect('/login')
    }

    if (userFound.status == 'inactive') {
        req.session.flash = {
            type: 'danger',
            message: `Your account is inactive. Please contact admin for support`,
        }
        return res.redirect('/login')
    }

    req.session.userId = userFound._id

    res.redirect('/')
}

exports.confirmEmail = async (req, res, next) => {
    const { token } = req.params
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex')

    const userFound = await User.findOne({ confirmEmailToken: tokenHash })
    if (!userFound || userFound.isConfirmEmailTokenExpires()) {
        const expireError = new Error(
            'Token invalid or Token expires. Please contact admin for support'
        )
        return next(expireError)
    }

    userFound.confirmEmailToken = undefined
    userFound.confirmEmailTokenExpires = undefined
    userFound.isConfirmEmail = true
    userFound.save()

    // Login first time
    req.session.userId = userFound._id

    res.redirect('/accounts/change-password')
}

exports.changePassword = async (req, res) => {
    const userId = req.session.userId
    const { newPassword } = req.body
    const userFound = await User.findOne({ _id: userId })

    userFound.password = newPassword
    userFound.isFirstTimeLogin = false
    userFound.save()

    res.redirect('/')
}

exports.checkAuthorization = (...roles) => {
    return async (req, res, next) => {
        const userId = req.session.userId
        const userFound = await User.findOne({ _id: userId })
        if (roles.includes(userFound.role)) {
            next()
        } else {
            return next(
                new Error(
                    'You do not have any privilege to access this resource'
                )
            )
        }
    }
}

exports.logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.redirect('/')
        }
        res.redirect('/login')
    })
}

exports.getChangePasswordNotFirstTimeForm = (req, res) => {
    res.render('account/changePasswordNotFirstTime')
}

exports.changePasswordNotFirstTime = async (req, res) => {
    console.log(req.body)
    const userId = req.session.userId
    const { oldPassword, newPassword, confirmPassword } = req.body
    const userFound = await User.findOne({ _id: userId })
    if (newPassword !== confirmPassword) {
        return res.status(400).json({
            message: 'New password and confirm password do not match',
        })
    } else if (oldPassword !== userFound.password) {
        return res.status(400).json({
            message: 'Old password is incorrect',
        })
    } else {
        userFound.password = newPassword
        // userFound.isFirstTimeLogin = false
        userFound.save()
        res.redirect('/')
    }
}
