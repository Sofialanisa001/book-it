const app = require("./app");
const connectDB = require("./config/db");
const logger = require("./config/logger");

const PORT = process.env.PORT || 5001;

// Conectar la base de datos
connectDB()
    .then(() => {
        // solo si se conectó la base de datos arrancamos el servidor
        app.listen(PORT, () => {
            logger.info(`Servidor corriendo en el puerto ${PORT}`);
        });
    })
    .catch((err) => {
        logger.error("El servidor falló. Checar conexión con la BD:", err);
    });

module.exports = app; // exportar para testing
