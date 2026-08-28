const request = require("supertest");
const app = require("../../src/app");
const Usuario = require("../../src/models/usuarioModel");
const { crearUsuario, loginCookies } = require("../helpers/auth");

const usuarioValido = {
    nombre: "Sofia Test",
    correo: "sofia@test.com",
    password: "Password1!",
    passwordConfirmacion: "Password1!",
    sexo: "femenino",
    telefono: "+525512345678",
    fechaNacimiento: "1998-03-15",
};

describe("POST /api/auth/registro", () => {
    it("registra un usuario nuevo y lo guarda hasheado (201)", async () => {
        const res = await request(app)
            .post("/api/auth/registro")
            .send(usuarioValido);

        expect(res.status).toBe(201);
        expect(res.body.ok).toBe(true);
        expect(res.body).toHaveProperty("uid");

        const enBD = await Usuario.findById(res.body.uid);
        expect(enBD).not.toBeNull();
        expect(enBD.password).not.toBe(usuarioValido.password);
    });

    it("rechaza contraseñas que no coinciden (400)", async () => {
        const res = await request(app)
            .post("/api/auth/registro")
            .send({ ...usuarioValido, passwordConfirmacion: "Otra1!xx" });

        expect(res.status).toBe(400);
        expect(res.body.ok).toBe(false);
    });

    it("rechaza correo duplicado (400)", async () => {
        await crearUsuario({ correo: "sofia@test.com" });

        const res = await request(app)
            .post("/api/auth/registro")
            .send(usuarioValido);

        expect(res.status).toBe(400);
    });

    it("rechaza correo con formato inválido (400)", async () => {
        const res = await request(app)
            .post("/api/auth/registro")
            .send({ ...usuarioValido, correo: "no-es-correo" });

        expect(res.status).toBe(400);
    });
});

describe("POST /api/auth/login", () => {
    it("devuelve 200 y setea las cookies accessToken y refreshToken", async () => {
        const { usuario, password } = await crearUsuario();

        const res = await request(app)
            .post("/api/auth/login")
            .send({ correo: usuario.correo, password });

        expect(res.status).toBe(200);
        expect(res.body.usuario).toMatchObject({ nombre: usuario.nombre });

        const cookies = res.headers["set-cookie"].join(";");
        expect(cookies).toMatch(/accessToken=/);
        expect(cookies).toMatch(/refreshToken=/);
        expect(cookies).toMatch(/HttpOnly/i);
    });

    it("devuelve 400 con contraseña incorrecta", async () => {
        const { usuario } = await crearUsuario();

        const res = await request(app)
            .post("/api/auth/login")
            .send({ correo: usuario.correo, password: "incorrecta9!" });

        expect(res.status).toBe(400);
        expect(res.body.msg).toBe("Credenciales Inválidas");
    });

    it("devuelve 400 si el usuario no existe", async () => {
        const res = await request(app)
            .post("/api/auth/login")
            .send({ correo: "fantasma@test.com", password: "Password1!" });

        expect(res.status).toBe(400);
    });
});

describe("Ruta protegida con validarJWT", () => {
    it("rechaza sin cookie (401)", async () => {
        const res = await request(app).get("/api/auth/rutaProtegidaTest");
        expect(res.status).toBe(401);
        expect(res.body.msg).toBe("No hay token en la petición");
    });

    it("rechaza con token basura (401)", async () => {
        const res = await request(app)
            .get("/api/auth/rutaProtegidaTest")
            .set("Cookie", ["accessToken=abc.def.ghi"]);
        expect(res.status).toBe(401);
        expect(res.body.msg).toBe("Token no válido");
    });

    it("permite el acceso con una cookie válida", async () => {
        const { cookies, usuario } = await loginCookies();

        const res = await request(app)
            .get("/api/auth/rutaProtegidaTest")
            .set("Cookie", cookies);

        expect(res.status).toBe(200);
        expect(res.body.ok).toBe(true);
        expect(res.body.uid).toBe(usuario.id);
    });
});

describe("POST /api/auth/refresh", () => {
    it("devuelve 401 si no hay refreshToken", async () => {
        const res = await request(app).post("/api/auth/refresh");
        expect(res.status).toBe(401);
    });

    it("renueva el accessToken con un refreshToken válido", async () => {
        const { cookies } = await loginCookies();
        const refresh = cookies.find((c) => c.startsWith("refreshToken="));

        const res = await request(app)
            .post("/api/auth/refresh")
            .set("Cookie", [refresh]);

        expect(res.status).toBe(200);
        expect(res.headers["set-cookie"].join(";")).toMatch(/accessToken=/);
    });
});

describe("POST /api/auth/logout", () => {
    it("limpia las cookies de sesión", async () => {
        const { cookies } = await loginCookies();

        const res = await request(app)
            .post("/api/auth/logout")
            .set("Cookie", cookies);

        expect(res.status).toBe(200);
        const set = res.headers["set-cookie"].join(";");
        expect(set).toMatch(/accessToken=;/);
        expect(set).toMatch(/refreshToken=;/);
    });
});
