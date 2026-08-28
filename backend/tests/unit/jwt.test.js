const jwt = require("jsonwebtoken");
const { generarJWT, generarRefreshToken } = require("../../src/helpers/jwt");

describe("helpers/jwt", () => {
    describe("generarJWT", () => {
        it("genera un token verificable con el payload correcto", async () => {
            const token = await generarJWT("uid-123", "Ana", "ADMIN");

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            expect(decoded).toMatchObject({
                uid: "uid-123",
                nombre: "Ana",
                rol: "ADMIN",
            });
            expect(decoded.exp).toBeGreaterThan(decoded.iat);
        });

        it("rechaza si no hay JWT_SECRET", async () => {
            const original = process.env.JWT_SECRET;
            delete process.env.JWT_SECRET;

            await expect(generarJWT("uid", "x", "CLIENTE")).rejects.toBeDefined();

            process.env.JWT_SECRET = original;
        });
    });

    describe("generarRefreshToken", () => {
        it("firma solo el uid con el secreto de refresco", async () => {
            const token = await generarRefreshToken("uid-999");

            const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
            expect(decoded.uid).toBe("uid-999");
            expect(decoded.nombre).toBeUndefined();
        });

        it("el token de refresco NO es válido con el secreto de acceso", async () => {
            const token = await generarRefreshToken("uid-999");
            expect(() => jwt.verify(token, process.env.JWT_SECRET)).toThrow();
        });
    });
});
