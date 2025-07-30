"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mysql2_1 = __importDefault(require("mysql2"));
const db = mysql2_1.default.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "pal_db",
    port: 3308,
});
db.connect((err) => {
    if (err) {
        console.error("Database connection failed:", err);
        return;
    }
    console.log("Connected to the database.");
});
exports.default = db;
