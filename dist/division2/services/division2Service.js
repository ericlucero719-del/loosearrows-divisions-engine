"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logs = exports.poEngine = exports.trackingListener = exports.storeManager = void 0;
exports.addLog = addLog;
exports.getStoreByToken = getStoreByToken;
exports.createStore = createStore;
exports.updateStoreSettings = updateStoreSettings;
exports.loadCatalog = loadCatalog;
exports.listSuppliers = listSuppliers;
exports.createSupplier = createSupplier;
exports.createOrder = createOrder;
exports.createPurchaseOrderRecord = createPurchaseOrderRecord;
exports.updateTracking = updateTracking;
exports.matchAndSelectSupplier = matchAndSelectSupplier;
const crypto_1 = require("crypto");
const multiStoreManager_1 = require("../stores/multiStoreManager");
const trackingListener_1 = require("../tracking/trackingListener");
const poEngine_1 = require("../po/poEngine");
const supplierMatching_1 = require("../matching/supplierMatching");
const prisma_1 = require("../../prisma");
exports.storeManager = new multiStoreManager_1.MultiStoreManager();
exports.trackingListener = new trackingListener_1.TrackingListener();
exports.poEngine = new poEngine_1.PurchaseOrderEngine({ logger: (message, meta) => addLog(message, meta) });
// In-memory logs for quick access
exports.logs = [];
function addLog(message, meta) {
    exports.logs.push({ timestamp: new Date().toISOString(), message, meta });
}
async function getStoreByToken(token) {
    if (!token)
        return null;
    return prisma_1.prisma.store.findFirst({ where: { accessToken: token } });
}
async function createStore(entry) {
    const accessToken = entry.accessToken ?? (0, crypto_1.randomUUID)();
    const store = await prisma_1.prisma.store.upsert({
        where: { id: entry.storeId },
        update: {
            name: entry.name,
            url: entry.url,
            accessToken,
            updatedAt: new Date(),
        },
        create: {
            id: entry.storeId,
            name: entry.name,
            url: entry.url,
            accessToken,
        },
    });
    addLog("Store registered", { storeId: store.id });
    return store;
}
async function updateStoreSettings(storeId, settings) {
    const store = await prisma_1.prisma.store.findUnique({ where: { id: storeId } });
    if (!store)
        return null;
    const existingSettings = await prisma_1.prisma.storeSettings.findUnique({ where: { storeId } });
    const newSettings = {
        pricingRulesJson: JSON.stringify(settings.pricingRules ?? existingSettings?.pricingRulesJson ?? null),
        supplierPriorityJson: JSON.stringify(settings.supplierPriority ?? existingSettings?.supplierPriorityJson ?? null),
        shippingRulesJson: JSON.stringify(settings.shippingRules ?? existingSettings?.shippingRulesJson ?? null),
        automationRulesJson: JSON.stringify(settings.automationRules ?? existingSettings?.automationRulesJson ?? null),
        themePresetsJson: JSON.stringify(settings.themePresets ?? existingSettings?.themePresetsJson ?? null),
    };
    const updated = await prisma_1.prisma.storeSettings.upsert({
        where: { storeId },
        update: {
            ...newSettings,
            updatedAt: new Date(),
        },
        create: {
            storeId,
            ...newSettings,
        },
    });
    addLog("Store settings updated", { storeId });
    return updated;
}
async function loadCatalog(storeId, products) {
    const store = await prisma_1.prisma.store.findUnique({ where: { id: storeId } });
    if (!store)
        return null;
    const created = [];
    for (const product of products) {
        const sku = product.sku ?? product.id;
        if (!sku)
            continue;
        const upserted = await prisma_1.prisma.product.upsert({
            where: { sku },
            update: {
                title: product.title ?? "",
                description: product.description ?? null,
                imagesJson: product.images ? JSON.stringify(product.images) : null,
                cost: Number(product.cost ?? 0),
                price: Number(product.price ?? 0),
                updatedAt: new Date(),
                storeId,
            },
            create: {
                sku,
                title: product.title ?? "",
                description: product.description ?? null,
                imagesJson: product.images ? JSON.stringify(product.images) : null,
                cost: Number(product.cost ?? 0),
                price: Number(product.price ?? 0),
                storeId,
            },
        });
        created.push(upserted);
    }
    addLog("Catalog loaded", { storeId, count: created.length });
    return created;
}
async function listSuppliers(storeId) {
    if (storeId) {
        const rels = await prisma_1.prisma.storeSupplier.findMany({
            where: { storeId },
            include: { supplier: true },
        });
        return rels.map((r) => r.supplier);
    }
    return prisma_1.prisma.supplier.findMany();
}
async function createSupplier(storeId, supplier) {
    const createdSupplier = await prisma_1.prisma.supplier.create({
        data: {
            name: supplier.name ?? "",
            contactEmail: supplier.contactEmail,
            apiEndpoint: supplier.apiEndpoint,
            portalUrl: supplier.portalUrl,
            cost: supplier.cost ?? 0,
            stock: supplier.stock ?? 0,
            leadTimeDays: supplier.leadTimeDays ?? 0,
            reliabilityScore: supplier.reliabilityScore ?? 0,
            shippingSpeedDays: supplier.shippingSpeedDays ?? 0,
            location: supplier.location,
        },
    });
    await prisma_1.prisma.storeSupplier.create({
        data: {
            storeId,
            supplierId: createdSupplier.id,
        },
    });
    addLog("Supplier created", { storeId, supplierId: createdSupplier.id });
    return createdSupplier;
}
async function createOrder(order) {
    const created = await prisma_1.prisma.order.create({
        data: {
            id: order.orderId,
            storeId: order.storeId,
            customerJson: JSON.stringify(order.customer ?? {}),
            status: order.status ?? "created",
            items: {
                create: order.lineItems.map((item) => ({
                    product: {
                        connect: { sku: item.sku },
                    },
                    quantity: item.quantity,
                    unitCost: item.unitCost,
                })),
            },
        },
        include: { items: true },
    });
    addLog("Order created", { orderId: created.id, storeId: created.storeId });
    return created;
}
async function createPurchaseOrderRecord(poData) {
    const created = await prisma_1.prisma.purchaseOrder.create({
        data: {
            poNumber: poData.poNumber,
            orderId: poData.orderId,
            supplierId: poData.supplierId,
            status: poData.status ?? "pending",
            shippingMethod: poData.shippingMethod,
            notes: poData.notes,
        },
    });
    await prisma_1.prisma.purchaseOrderLog.create({
        data: {
            purchaseOrderId: created.id,
            status: created.status,
            message: "Created",
        },
    });
    addLog("Purchase order recorded", { poNumber: created.poNumber });
    return created;
}
async function updateTracking(orderId, update) {
    const existing = await prisma_1.prisma.tracking.findUnique({ where: { orderId } });
    const data = {
        carrier: update.carrier,
        trackingNumber: update.trackingNumber,
        status: update.status,
        eta: update.eta ? new Date(update.eta) : null,
        lastScan: update.lastScan ? new Date(update.lastScan) : null,
        location: update.location,
        updatedAt: new Date(),
    };
    const normalized = existing
        ? await prisma_1.prisma.tracking.update({ where: { orderId }, data })
        : await prisma_1.prisma.tracking.create({
            data: {
                orderId,
                ...data,
            },
        });
    addLog("Tracking updated", { orderId });
    return normalized;
}
async function matchAndSelectSupplier(input) {
    const attemptFn = async (supplier) => {
        // Simulate an API call to supplier. In a real system this would integrate with supplier's API.
        return { supplierId: supplier.id, acknowledgedAt: new Date().toISOString() };
    };
    const { result, failure } = await (0, supplierMatching_1.matchSupplier)(input, attemptFn, { maxRetries: 3 });
    if (result) {
        addLog("Supplier matched", { supplierId: result.supplierId, score: result.score });
    }
    else if (failure) {
        addLog("Supplier match failed", failure);
    }
    return { match: result, failure };
}
//# sourceMappingURL=division2Service.js.map