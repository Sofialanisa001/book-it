const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const logTransacciones = require("./middleware/logMiddleware");

// Logger global (varios módulos lo usan sin require).
// Si ya se definió (p. ej. en los tests con un mock) se respeta.
global.logger = global.logger || require("./config/logger");

const app = express();

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middlewares globales
app.use(cookieParser());
app.use(
    cors({
        origin: process.env.CLIENT_URL || "http://localhost:5173", // debe de ser el puerto de React
        credentials: true, // Permite que las cookies pasen
    }),
);

// middleware de logs
app.use(logTransacciones);

// Rutas
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/usuarios", require("./routes/usuarioRoutes"));
app.use("/api/servicios", require("./routes/servicioRoutes"));
app.use("/api/empresa", require("./routes/empresaRoutes"));
app.use("/api/empleados", require("./routes/empleadoRoutes"));
app.use("/api/suspensiones", require("./routes/suspensionRoutes"));
app.use("/api/citas", require("./routes/citaRoutes"));
app.use("/api/reportes", require("./routes/reporteRoutes"));

module.exports = app;
