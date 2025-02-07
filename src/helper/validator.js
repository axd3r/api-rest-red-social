const validator = require("validator");

const validatorUser = (params) => {
    if (!params || typeof params !== "object") {
        throw new Error("Se requiere un objeto de parámetros válido.");
    }

    let validar_nombre = params.name &&
                         !validator.isEmpty(params.name) &&
                         validator.isLength(params.name, { min: 5, max: 50 });

    let validar_nick = params.nick && !validator.isEmpty(params.nick);

    let validar_email = params.email &&
                        !validator.isEmpty(params.email) &&
                        validator.isEmail(params.email);

    let validar_password = params.password &&
                           !validator.isEmpty(params.password) &&
                           validator.isLength(params.password, { min: 6 });

    if (!validar_nombre || !validar_nick || !validar_email || !validar_password) {
        throw new Error("No se ha validado la información. Verifique los campos obligatorios.");
    }

    return true;
};

module.exports = 
    validatorUser

