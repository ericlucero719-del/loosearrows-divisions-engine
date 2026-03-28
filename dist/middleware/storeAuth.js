"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.storeAuth = storeAuth;
const division2Service_1 = require("../division2/services/division2Service");
async function storeAuth(req, res, next) {
    const authHeader = String(req.headers.authorization ?? '');
    const token = authHeader.startsWith('Bearer ')
        ? authHeader.slice(7).trim()
        : req.headers['x-store-token'];
    if (!token) {
        return res.status(401).json({ error: 'Missing authorization token' });
    }
    const store = await (0, division2Service_1.getStoreByToken)(token);
    if (!store) {
        return res.status(401).json({ error: 'Invalid store token' });
    }
    req.store = store;
    next();
}
//# sourceMappingURL=storeAuth.js.map