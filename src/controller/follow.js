const pruebaFollow = (req, res) => {
    return res.status(200).send({
        "message": "Mensaje desde controlles/follow.js"
    })
}

module.exports = {
    pruebaFollow
}