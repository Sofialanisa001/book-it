const bcrypt = require("bcryptjs");
const request = require("supertest");
const app = require("../../src/app");
const Usuario = require("../../src/models/usuarioModel");

const USUARIO_BASE = {
    nombre: "Test User",
    correo: "test@test.com",
    password: "Password1!",
    sexo: "femenino",
    telefono: "+525512345678",
    fechaNacimiento: new Date("2000-01-01"),
    rol: "CLIENTE",
};

/**
 * inserta un usuario en la BD con password hasheada
 * devuelve el documento y el password
 */
async function crearUsuario(overrides = {}) {
    const { password = USUARIO_BASE.password, ...resto } = {
        ...USUARIO_BASE,
        ...overrides,
    };

    const usuario = await Usuario.create({
        ...resto,
        password: bcrypt.hashSync(password, 10),
    });

    return { usuario, password };
}

/**
 * crea si hace falta un usuario, hace login y devuelve el array de cookies para usar con `.set("Cookie", cookies)`.
 */
async function loginCookies(overrides = {}) {
    const { usuario, password } = await crearUsuario(overrides);

    const res = await request(app)
        .post("/api/auth/login")
        .send({ correo: usuario.correo, password });

    // nombre=valor de cada cookie
    const cookies = (res.headers["set-cookie"] || []).map(
        (c) => c.split(";")[0],
    );

    return { cookies, usuario, res };
}

module.exports = { crearUsuario, loginCookies, USUARIO_BASE };
