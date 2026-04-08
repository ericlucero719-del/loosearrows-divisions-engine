"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.shopifyController = void 0;
const shopify_service_1 = require("./shopify.service");
const crypto = __importStar(require("crypto"));
const SHARED_SECRET = process.env.SHOPIFY_APP_SHARED_SECRET ?? "";
function verifyWebhook(rawBody, hmacHeader) {
    if (!SHARED_SECRET)
        return false;
    const digest = crypto.createHmac("sha256", SHARED_SECRET).update(rawBody).digest("base64");
    return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(hmacHeader));
}
exports.shopifyController = {
    async storeInfo(_req, res) {
        try {
            return res.json(await shopify_service_1.shopifyService.storeInfo());
        }
        catch (e) {
            return res.status(400).json({ error: e.message });
        }
    },
    async syncOrders(req, res) {
        try {
            const limit = parseInt(req.query.limit) || 50;
            return res.json(await shopify_service_1.shopifyService.syncOrders(limit));
        }
        catch (e) {
            return res.status(400).json({ error: e.message });
        }
    },
    async syncOne(req, res) {
        try {
            return res.json(await shopify_service_1.shopifyService.syncOne(req.params.shopify_id));
        }
        catch (e) {
            return res.status(400).json({ error: e.message });
        }
    },
    // Public webhook — verified via HMAC, no API key
    async webhook(req, res) {
        try {
            const hmac = req.headers["x-shopify-hmac-sha256"] ?? "";
            const topic = req.headers["x-shopify-topic"] ?? "";
            const raw = req.rawBody;
            if (raw && hmac && !verifyWebhook(raw, hmac)) {
                return res.status(401).json({ error: "Invalid webhook signature" });
            }
            const result = await shopify_service_1.shopifyService.processWebhook(topic, req.body);
            return res.status(200).json(result);
        }
        catch (e) {
            return res.status(400).json({ error: e.message });
        }
    },
    async listOrders(req, res) {
        try {
            return res.json(await shopify_service_1.shopifyService.listOrders(req.query.status));
        }
        catch (e) {
            return res.status(500).json({ error: e.message });
        }
    },
    async getOrder(req, res) {
        try {
            return res.json(await shopify_service_1.shopifyService.getOrder(req.params.order_id));
        }
        catch (e) {
            return res.status(404).json({ error: e.message });
        }
    },
    async summary(_req, res) {
        try {
            return res.json(await shopify_service_1.shopifyService.summary());
        }
        catch (e) {
            return res.status(500).json({ error: e.message });
        }
    },
};
//# sourceMappingURL=shopify.controller.js.map