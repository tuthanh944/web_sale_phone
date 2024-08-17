const express = require('express')

const {
    confirmEmail,
    getChangePasswordForm,
    changePassword,
    getCreateAccountForm,
    createAccount,
    getChangePasswordNotFirstTimeForm,
    changePasswordNotFirstTime,
} = require('./../controllers/account')

const router = express.Router()

router.route('/change-password').get(getChangePasswordForm).post(changePassword)
router.route('/change-password-not-first-time').get(getChangePasswordNotFirstTimeForm).post(changePasswordNotFirstTime)
router.route('/create').get(getCreateAccountForm).post(createAccount)
router.route('/:token').get(confirmEmail)

module.exports = router
