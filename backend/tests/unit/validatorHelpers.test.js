const {
    validarFechaNacimiento,
    sanitizarArreglo,
    sanitizarArregloIDs,
    validarEstructuraHorario,
} = require("../../src/helpers/validatorHelpers");

describe("helpers/validatorHelpers", () => {
    describe("validarFechaNacimiento", () => {
        it("acepta una fecha de un mayor de edad", () => {
            expect(validarFechaNacimiento("1990-05-20")).toBe(true);
        });

        it("rechaza fechas en el futuro", () => {
            const futuro = new Date();
            futuro.setFullYear(futuro.getFullYear() + 1);
            expect(() => validarFechaNacimiento(futuro)).toThrow(
                "La fecha de nacimiento debe ser en el pasado.",
            );
        });

        it("rechaza a un menor de edad", () => {
            const hace10 = new Date();
            hace10.setFullYear(hace10.getFullYear() - 10);
            expect(() => validarFechaNacimiento(hace10)).toThrow(
                "Debe ser mayor de edad.",
            );
        });
    });

    describe("sanitizarArreglo", () => {
        it("convierte '[]' y vacíos en un arreglo vacío", () => {
            expect(sanitizarArreglo("[]")).toEqual([]);
            expect(sanitizarArreglo("")).toEqual([]);
            expect(sanitizarArreglo(undefined)).toEqual([]);
        });

        it("parsea un JSON string a arreglo", () => {
            expect(sanitizarArreglo('["a","b"]')).toEqual(["a", "b"]);
        });
    });

    describe("sanitizarArregloIDs", () => {
        it("elimina IDs duplicados", () => {
            expect(sanitizarArregloIDs('["1","1","2"]')).toEqual(["1", "2"]);
        });
    });

    describe("validarEstructuraHorario", () => {
        it("acepta un horario bien formado", () => {
            const horario = [
                { dia: "lunes", horaInicio: "09:00", horaFin: "17:00" },
            ];
            expect(validarEstructuraHorario(horario)).toBe(true);
        });

        it("rechaza días duplicados", () => {
            const horario = [
                { dia: "lunes", horaInicio: "09:00", horaFin: "12:00" },
                { dia: "lunes", horaInicio: "13:00", horaFin: "17:00" },
            ];
            expect(() => validarEstructuraHorario(horario)).toThrow(/duplicado/);
        });

        it("rechaza cuando inicio >= fin", () => {
            const horario = [
                { dia: "martes", horaInicio: "17:00", horaFin: "09:00" },
            ];
            expect(() => validarEstructuraHorario(horario)).toThrow(
                /inicio debe ser menor/,
            );
        });
    });
});
