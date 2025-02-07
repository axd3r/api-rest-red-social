const pruebaPublication = (req, res) => {
    return res.status(200).send({
        "message": "Mensaje desde controlles/publication.js"
    })
}

module.exports = {
    pruebaPublication
}