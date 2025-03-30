const validator = require("validator");

const validatorPublication = (params) => {
    if (!params || typeof params !== 'object') {
        throw new Error("Se requirer un objeto de parametros validos.");
    }

    let validar_text = params.text &&
                        !validator.isEmpty(params.text) &&
                        validator.isLength(params.text, { min: 1, max:100});

    if ( !validar_text ) {
        throw new Error("Texto invalido para su publicacion.");
    }

    return true;
};

module.exports = 
    validatorPublication