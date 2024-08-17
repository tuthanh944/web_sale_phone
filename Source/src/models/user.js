const mongoose = require('mongoose')
const validator = require('validator')
const crypto = require('crypto')

let userSchema = mongoose.Schema({
    fullName: {
        type: String,
        required: [true, 'A user must have fullName'],
    },
    email: {
        type: String,
        validate: [validator.isEmail, 'A user must have email'],
    },
    username: String,
    password: String,
    isConfirmEmail: {
        type: Boolean,
        default: false,
    },
    isFirstTimeLogin: {
        type: Boolean,
        default: true,
    },
    avatar: String,
    status: {
        type: String,
        enums: ['inactive', 'active'],
        default: 'active',
    },
    role: {
        type: String,
        enums: ['salesperson', 'admin'],
        default: 'salesperson',
    },
    confirmEmailToken: String,
    confirmEmailTokenExpires: Date,
})

// Methods of document
userSchema.methods.generateConfirmEmailToken = function () {
    const token = crypto.randomBytes(32).toString('hex')
    this.confirmEmailToken = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex')
    this.confirmEmailTokenExpires = Date.now() + 60 * 1000
    return token
}

userSchema.methods.isConfirmEmailTokenExpires = function () {
    return Date.now() > this.confirmEmailTokenExpires.getTime()
}

userSchema.methods.changeStatus = function() {
    this.status = this.status == "inactive" ? "active" : "inactive"
}

// Document middleware

userSchema.pre('save', function (next) {
    if (this.isFirstTimeLogin) {
        const username = this.email.split('@')[0]
        this.username = username
        this.password = username
    }
    next()
})

const User = mongoose.model('User', userSchema)

module.exports = User
