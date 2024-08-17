const mongoose = require('mongoose')

async function connect() {
    try {
        await mongoose.connect(
            'mongodb+srv://iFoneX:H1NDFoMr5H4JTJIl@cluster0.qctvr61.mongodb.net/iFoneX?retryWrites=true&w=majority',
            {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            }
        )
        console.log('Connect DB successfully.')
    } catch (error) {
        console.log('Connect fail.')
    }
}

module.exports = { connect }
