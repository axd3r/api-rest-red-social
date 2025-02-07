const {Schema, model} = require("mongoose");

const userSchema = Schema({
    name: {
        type: String,
        required: true
    },
    surname: String,
    nick:{
        type: String,
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        default: "role_user"
    },
    image: {
        type: String,
        default: "default.png"
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

module.exports = model("User", userSchema, "users" )