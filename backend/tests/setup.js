const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

// variables de entorno oara pruebas
process.env.NODE_ENV = "test";
process.env.DOTENV_CONFIG_QUIET = "true"; // silencia el log de dotenv (de cloudinary)
process.env.JWT_SECRET = "test-secret";
process.env.JWT_REFRESH_SECRET = "test-refresh-secret";
process.env.JWT_EXPIRATION = "1h";
process.env.JWT_REFRESH_EXPIRATION = "7d";
process.env.CLIENT_URL = "http://localhost:5173";

// logger mockeado
// evita escribir archivos de log durante los tests
const mockLogger = {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    add: jest.fn(),
};
jest.mock("../src/config/logger", () => mockLogger);
global.logger = mockLogger;

let mongod;

beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    await mongoose.connect(mongod.getUri());
});

afterEach(async () => {
    const { collections } = mongoose.connection;
    for (const key of Object.keys(collections)) {
        await collections[key].deleteMany({});
    }
});

afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
    if (mongod) await mongod.stop();
});
