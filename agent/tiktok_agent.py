#!/usr/bin/env python3
# LooseArrows Supply & Logistics™
# TikTok Sales Automation Agent
# Author: Eric Lucero — Chief Architect & Commander
#
# This agent calls the consolidated REST API at /api/tiktok/*.
# All data is persisted in PostgreSQL through the Node.js divisions engine.
#
# Usage (CLI):
#   python3 agent/tiktok_agent.py capture  '{"order_id":"TT-9001","items":[{"sku":"SUPSK-001","quantity":2,"unitPrice":45.00,"name":"Supply Kit"}]}'
#   python3 agent/tiktok_agent.py fulfill  '{"order_id":"TT-9001","method":"home","carrier":"UPS"}'
#   python3 agent/tiktok_agent.py invoice  '{"order_id":"TT-9001"}'
#   python3 agent/tiktok_agent.py payment  '{"order_id":"TT-9001"}'
#   python3 agent/tiktok_agent.py notify   '{"order_id":"TT-9001","event":"DELIVERED"}'
#   python3 agent/tiktok_agent.py run      '{"type":"new_order","data":{...}}'
#   python3 agent/tiktok_agent.py orders   [STATUS]
#   python3 agent/tiktok_agent.py order    <order_id>
#   python3 agent/tiktok_agent.py summary

import requests
import json
import sys
from datetime import datetime

# ─── Config ───────────────────────────────────────────────────────────────────

BASE_URL      = "http://localhost:5000"
OPERATOR_KEY  = "la-opr-d713a007a3a47494ed56c667313b261aeaf8"
TIKTOK_BASE   = f"{BASE_URL}/api/tiktok"   # canonical path

HEADERS = {
    "Content-Type": "application/json",
    "X-API-Key":    OPERATOR_KEY,
}


def _log(msg: str):
    print(f"[{datetime.now().isoformat()}] {msg}")


def _post(path: str, payload: dict) -> dict:
    try:
        r = requests.post(f"{TIKTOK_BASE}{path}", headers=HEADERS, json=payload, timeout=10)
        data = r.json()
        if not r.ok:
            raise RuntimeError(data.get("error", r.text))
        return data
    except requests.exceptions.ConnectionError:
        raise RuntimeError("Cannot reach API server. Is 'npm run dev' running?")


def _get(path: str) -> dict:
    try:
        r = requests.get(f"{TIKTOK_BASE}{path}", headers=HEADERS, timeout=10)
        data = r.json()
        if not r.ok:
            raise RuntimeError(data.get("error", r.text))
        return data
    except requests.exceptions.ConnectionError:
        raise RuntimeError("Cannot reach API server. Is 'npm run dev' running?")


# ─── 1. Capture TikTok Order ──────────────────────────────────────────────────
# Runs: SKU match → profit calc → record → vendor select → compliance → PO

def capture_order(order: dict) -> dict:
    _log(f"New TikTok order received: {order['order_id']}")
    result = _post("/order", order)
    _log(f"Order captured — profit preview: {result.get('profitPreview')} | PO: {result.get('po', {}).get('poRef')}")
    return result


# ─── 2. Fulfillment Automation ────────────────────────────────────────────────
# method="home"     → generates label + pushes tracking to Division 5 shipment
# method="supplier" → pushes fulfillment to vendor via Division 5

def fulfill_order(order_id: str, method: str = "supplier", carrier: str = "UPS",
                  tracking_ref: str = None) -> dict:
    payload = {"order_id": order_id, "method": method, "carrier": carrier}
    if tracking_ref:
        payload["trackingRef"] = tracking_ref
    result = _post("/fulfill", payload)
    _log(f"Fulfillment triggered for {order_id} via {method} — trackingRef: {result.get('trackingRef')}")
    return result


# ─── 3. Invoice + Payment Tracking ────────────────────────────────────────────

def invoice_order(order_id: str) -> dict:
    result = _post("/invoice", {"order_id": order_id})
    _log(f"Invoice synced for {order_id} — ref: {result.get('invoiceRef')} total: ${result.get('totalAmount')}")
    return result


def sync_payment(order_id: str) -> dict:
    result = _post("/payment", {"order_id": order_id})
    _log(f"Payment recorded for {order_id} — {result.get('invoiceRef')} ${result.get('amount')}")
    return result


# ─── 4. Notifications + Inventory Update ─────────────────────────────────────

def notify_and_update(order_id: str, event: str) -> dict:
    result = _post("/notify", {"order_id": order_id, "event": event})
    _log(f"Notification sent for {order_id}: {event}")
    return result


# ─── 5. Query Helpers ─────────────────────────────────────────────────────────

def list_orders(status: str = None) -> list:
    path = "/orders"
    if status:
        path += f"?status={status}"
    return _get(path)


def get_order(order_id: str) -> dict:
    return _get(f"/orders/{order_id}")


def get_summary() -> dict:
    return _get("/summary")


# ─── Main Dispatcher (mirrors original Python spec exactly) ───────────────────

def run_tiktok_automation(event: dict) -> dict:
    """Main entry for Replit Agent task execution."""
    event_type = event.get("type")
    data       = event.get("data", {})

    if event_type == "new_order":
        return capture_order(data)

    elif event_type == "fulfill":
        return fulfill_order(
            data["order_id"],
            data.get("method", "supplier"),
            data.get("carrier", "UPS"),
            data.get("tracking_ref"),
        )

    elif event_type == "invoice":
        result = invoice_order(data["order_id"])
        if data.get("auto_pay"):
            result["payment"] = sync_payment(data["order_id"])
        return result

    elif event_type == "notify":
        return notify_and_update(data["order_id"], data["event"])

    elif event_type == "full_pipeline":
        # Run complete order lifecycle end-to-end
        order_id = data["order_id"]
        results  = {}
        results["capture"]  = capture_order(data)
        results["fulfill"]  = fulfill_order(order_id, data.get("method", "supplier"))
        results["invoice"]  = invoice_order(order_id)
        results["payment"]  = sync_payment(order_id)
        results["notify"]   = notify_and_update(order_id, "FULL_PIPELINE_COMPLETE")
        _log(f"Full pipeline complete for {order_id}")
        return results

    else:
        return {"error": f"Unknown event type: '{event_type}'. Valid: new_order | fulfill | invoice | notify | full_pipeline"}


# ─── CLI Entry ────────────────────────────────────────────────────────────────

def _print(data):
    print(json.dumps(data, indent=2, default=str))


if __name__ == "__main__":
    args = sys.argv[1:]

    if not args:
        print("""
LooseArrows Supply & Logistics™ — TikTok Automation Agent
All commands call the consolidated API at /api/tiktok/*

Commands:
  capture  <json>    Capture new TikTok order (SKU match + PO auto-fired)
  fulfill  <json>    Trigger fulfillment   {"order_id","method","carrier"}
  invoice  <json>    Generate invoice      {"order_id"}
  payment  <json>    Record payment        {"order_id"}
  notify   <json>    Log event + sync inv  {"order_id","event"}
  run      <json>    Event dispatcher      {"type","data":{...}}
  orders   [status]  List all orders       optional: RECEIVED|PO_SENT|FULFILLED|INVOICED|PAID
  order    <id>      Get single order detail
  summary            Aggregate stats
""")
        sys.exit(0)

    cmd = args[0].lower()

    try:
        if cmd == "capture":
            _print(capture_order(json.loads(args[1])))

        elif cmd == "fulfill":
            payload = json.loads(args[1])
            _print(fulfill_order(
                payload["order_id"],
                payload.get("method", "supplier"),
                payload.get("carrier", "UPS"),
                payload.get("tracking_ref"),
            ))

        elif cmd == "invoice":
            _print(invoice_order(json.loads(args[1])["order_id"]))

        elif cmd == "payment":
            _print(sync_payment(json.loads(args[1])["order_id"]))

        elif cmd == "notify":
            p = json.loads(args[1])
            _print(notify_and_update(p["order_id"], p["event"]))

        elif cmd == "run":
            _print(run_tiktok_automation(json.loads(args[1])))

        elif cmd == "orders":
            status = args[1] if len(args) > 1 else None
            rows   = list_orders(status)
            _log(f"{len(rows)} order(s) returned")
            _print(rows)

        elif cmd == "order":
            _print(get_order(args[1]))

        elif cmd == "summary":
            _print(get_summary())

        else:
            print(f"Unknown command: {cmd}")
            sys.exit(1)

    except (RuntimeError, KeyError, json.JSONDecodeError) as e:
        print(f"[ERROR] {e}")
        sys.exit(1)
