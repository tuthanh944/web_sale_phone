module.exports = {
    objToJsonEncode: (obj) => {
        return encodeURIComponent(JSON.stringify(obj))
    },
    decodeData: (obj) => {
        return decodeURIComponent(obj)
    },
    priceFormat: (price) => {
        // Convert the price string to a number
        const numericPrice = parseInt(price, 10)

        // Use toLocaleString to format the number with a thousands separator
        const formatted = numericPrice.toLocaleString()

        return formatted
    },
    ifeq: function (a, b, options) {
        if (a == b) {
            return options.fn(this)
        }
        return options.inverse(this)
    },
}
