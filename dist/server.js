"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const division1_1 = require("./divisions/division1");
const division3_dispatch_1 = require("./divisions/division3-dispatch");
const express_1 = __importDefault(require("express"));
const division2_1 = __importDefault(require("./routes/division2"));
const dashboard_1 = __importDefault(require("./routes/dashboard"));
exports.app = (0, express_1.default)();
const port = process.env.PORT || 3000;
exports.app.use('/division1', division1_1.division1Routes);
exports.app.use(express_1.default.json());
exports.app.use("/division2", division2_1.default);
exports.app.use("/dashboard", dashboard_1.default);
exports.app.use("/dispatch", division3_dispatch_1.dispatchRoutes);
exports.app.get("/", (_req, res) => {
    res.json({ message: "Welcome to Loose Arrows Divisions Engine" });
});
if (require.main === module) {
    exports.app.listen(Number(port), '0.0.0.0', () => {
        console.log(`Server running on port ${port}`);
    });
}
//# sourceMappingURL=server.js.map