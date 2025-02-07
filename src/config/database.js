const mongoose = require("mongoose");
require("dotenv").config(); // Cargar variables de entorno

const database = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            //useNewUrlParser: true,
            //useUnifiedTopology: true
        });

        console.log("✅ Conectado correctamente a la base de datos");
        
    } catch (error) {
        console.error("❌ Error al conectar con la base de datos:", error);
        throw new Error("No se pudo conectar a la base de datos");
    }
};

module.exports = {
    database
};
