"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const zod_1 = __importDefault(require("zod"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const app = (0, express_1.default)();
const JWT_SECRET = process.env.JWT_SECRET;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const signupBody = zod_1.default.object({
    email: zod_1.default.string().email(),
    name: zod_1.default.string(),
    password: zod_1.default.string()
});
const signinBody = zod_1.default.object({
    email: zod_1.default.string().email(),
    password: zod_1.default.string()
});
app.post("/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const body = req.body;
    const { success } = signupBody.safeParse(body);
    if (!success) {
        return res.status(401).json({ message: "invalid creadentials" });
    }
    const userAlready = yield prisma.user.findMany({
        where: {
            email: body.email
        }
    });
    if (userAlready[0]) {
        return res.status(401).json({ message: "email already in use" });
    }
    try {
        yield prisma.user.create({
            data: {
                email: body.email,
                name: body.name,
                password: body.password
            }
        });
        return res.status(200).json({ message: "user created" });
    }
    catch (error) {
        console.log(error);
        return res.status(400).json({ message: "error while creating user", error: error });
    }
}));
app.get("/signin", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const body = req.body;
    const { success } = signinBody.safeParse(body);
    if (!success) {
        return res.status(401).json({ message: "invalid creadentials" });
    }
    try {
        const user = yield prisma.user.findUnique({
            where: {
                email: body.email,
                password: body.password
            }
        });
        if (!user) {
            return res.status(411).json({ message: "user does not exists" });
        }
        if (!JWT_SECRET)
            return;
        const token = jsonwebtoken_1.default.sign({ userId: user.id }, JWT_SECRET);
        return res.status(200).json({ message: "signedin", token: token });
    }
    catch (error) {
        return res.status(411).json({ message: "error while signing in", error: error });
    }
}));
app.listen(3000, () => {
    console.log("listning on http://localhost:3000");
});
