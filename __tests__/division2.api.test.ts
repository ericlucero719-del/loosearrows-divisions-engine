import request from "supertest";
import { app } from "../src/server";
import { prisma } from "../src/prisma";

describe("Division 2 API", () => {
  let token: string;

  beforeAll(async () => {
    // Ensure database is clean before tests
    await prisma.$executeRawUnsafe(`PRAGMA foreign_keys = OFF;`);
    const tables = [
      "StoreSettings",
      "Store",
      "ProductSupplier",
      "StoreSupplier",
      "PurchaseOrderLog",
      "PurchaseOrder",
      "Tracking",
      "OrderItem",
      "Order",
      "Supplier",
      "Product",
    ];

    for (const table of tables) {
      await prisma.$executeRawUnsafe(`DELETE FROM \"${table}\";`);
    }
    await prisma.$executeRawUnsafe(`PRAGMA foreign_keys = ON;`);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("registers a store and returns an access token", async () => {
    const res = await request(app)
      .post("/division2/store/register")
      .send({ storeId: "test-store", name: "Test Store", url: "https://example.com" });

    expect(res.status).toBe(200);
    expect(res.body.store).toBeDefined();
    expect(res.body.store.accessToken).toBeDefined();
    token = res.body.store.accessToken;
  });

  it("rejects unauthorized requests", async () => {
    const res = await request(app).post("/division2/load-catalog").send({ products: [] });
    expect(res.status).toBe(401);
  });

  it("loads a catalog with valid token", async () => {
    const res = await request(app)
      .post("/division2/load-catalog")
      .set("Authorization", `Bearer ${token}`)
      .send({ products: [{ sku: "SKU-1", title: "Test Product" }] });

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.catalog)).toBe(true);
    expect(res.body.catalog[0].sku).toBe("SKU-1");
  });

  it("creates and lists a supplier", async () => {
    const createRes = await request(app)
      .post("/division2/suppliers")
      .set("Authorization", `Bearer ${token}`)
      .send({ supplier: { name: "Test Supplier", cost: 5, stock: 100, leadTimeDays: 3, reliabilityScore: 0.9, shippingSpeedDays: 2 } });

    expect(createRes.status).toBe(200);
    expect(createRes.body.supplier).toBeDefined();
    expect(createRes.body.supplier.name).toBe("Test Supplier");

    const listRes = await request(app)
      .get("/division2/suppliers")
      .set("Authorization", `Bearer ${token}`);

    expect(listRes.status).toBe(200);
    expect(Array.isArray(listRes.body)).toBe(true);
    expect(listRes.body.length).toBeGreaterThanOrEqual(1);
  });
});
