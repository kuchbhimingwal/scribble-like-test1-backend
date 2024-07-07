"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET;
function authMiddelware(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(403).json({});
    }
    const token = authHeader.split(' ')[1];
    try {
        if (!JWT_SECRET)
            return;
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        // @ts-ignore
        req.userId = decoded.userId;
        next();
    }
    catch (err) {
        return res.status(403).json({});
    }
}
exports.default = authMiddelware;
