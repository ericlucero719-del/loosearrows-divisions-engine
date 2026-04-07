#!/usr/bin/env python3
# LooseArrows Supply & Logistics™
# Multi-Platform Commerce Automation Agent
# Author: Eric Lucero — Chief Architect & Commander
#
# Supports: TikTok, Instagram, YouTube, Amazon — and any future platform.
# All commands call the consolidated REST API at /api/<platform>/*.
#
# Usage:
#   python3 agent/commerce_agent.py --platform instagram capture  '{"order_id":"IG-001","items":[...]}'
#   python3 agent/commerce_agent.py --platform youtube  fulfill   '{"order_id":"YT-001","method":"home"}'
#   python3 agent/commerce_agent.py --platform amazon   invoice   '{"order_id":"AMZ-001"}'
#   python3 agent/commerce_agent.py --platform amazon   payment   '{"order_id":"AMZ-001"}'
#   python3 agent/commerce_agent.py --platform instagram notify   '{"order_id":"IG-001","event":"DELIVERED"}'
#   python3 agent/commerce_agent.py --platform youtube  orders
#   python3 agent/commerce_agent.py --platform amazon   summary
#   python3 agent/commerce_agent.py all-summary          # cross-platform aggregate

import requests
import json
import sys
import argparse
from datetime import datetime

BASE_URL     = "http://localhost:5000"
OPERATOR_KEY = "la-opr-d713a007a3a47494ed56c667313b261aeaf8"

HEADERS = {
    "Content-Type": "application/json",
    "X-API-Key":    OPERATOR_KEY,
}

VALID_PLATFORMS = {"tiktok", "instagram", "youtube", "amazon"}


def _log(msg: str):
    print(f"[{datetime.now().isoformat()}] {msg}")


def _url(platform: str, path: str) -> str:
    return f"{BASE_URL}/api/{platform}{path}"


def _post(platform: str, path: str, payload: dict) -> dict:
    try:
        r = requests.post(_url(platform, path), headers=HEADERS, json=payload, timeout=10)
        data = r.json()
        if not r.ok:
            raise RuntimeError(data.get("error", r.text))
        return data
    except requests.exceptions.ConnectionError:
        raise RuntimeError("Cannot reach API server. Is 'npm run dev' running?")


def _get(platform: str, path: str) -> dict:
    try:
        r = requests.get(_url(platform, path), headers=HEADERS, timeout=10)
        data = r.json()
        if not r.ok:
            raise RuntimeError(data.get("error", r.text))
        return data
    except requests.exceptions.ConnectionError:
        raise RuntimeError("Cannot reach API server. Is 'npm run dev' running?")


# ─── 5-step pipeline (same for every platform) ────────────────────────────────

def capture_order(platform: str, payload: dict) -> dict:
    _log(f"[{platform.upper()}] New order received: {payload['order_id']}")
    result = _post(platform, "/order", payload)
    _log(f"[{platform.upper()}] Captured — profit: {result.get('profitPreview')} | PO: {result.get('po', {}).get('poRef')}")
    return result


def fulfill_order(platform: str, order_id: str, method: str = "supplier",
                  carrier: str = "UPS", tracking_ref: str = None) -> dict:
    payload = {"order_id": order_id, "method": method, "carrier": carrier}
    if tracking_ref:
        payload["trackingRef"] = tracking_ref
    result = _post(platform, "/fulfill", payload)
    _log(f"[{platform.upper()}] Fulfilled {order_id} via {method}")
    return result


def invoice_order(platform: str, order_id: str) -> dict:
    result = _post(platform, "/invoice", {"order_id": order_id})
    _log(f"[{platform.upper()}] Invoice {result.get('invoiceRef')} — ${result.get('totalAmount')}")
    return result


def record_payment(platform: str, order_id: str) -> dict:
    result = _post(platform, "/payment", {"order_id": order_id})
    _log(f"[{platform.upper()}] Payment recorded — {result.get('invoiceRef')} ${result.get('amount')}")
    return result


def notify(platform: str, order_id: str, event: str) -> dict:
    result = _post(platform, "/notify", {"order_id": order_id, "event": event})
    _log(f"[{platform.upper()}] Notified {order_id}: {event}")
    return result


def list_orders(platform: str, status: str = None) -> list:
    path = "/orders"
    if status:
        path += f"?status={status}"
    return _get(platform, path)


def get_order(platform: str, order_id: str) -> dict:
    return _get(platform, f"/orders/{order_id}")


def get_summary(platform: str) -> dict:
    return _get(platform, "/summary")


def all_platforms_summary() -> dict:
    r = requests.get(f"{BASE_URL}/api/commerce/summary", headers=HEADERS, timeout=10)
    data = r.json()
    if not r.ok:
        raise RuntimeError(data.get("error", r.text))
    return data


def run_full_pipeline(platform: str, payload: dict) -> dict:
    order_id = payload["order_id"]
    results  = {}
    results["capture"] = capture_order(platform, payload)
    results["fulfill"] = fulfill_order(platform, order_id, payload.get("method", "supplier"))
    results["invoice"] = invoice_order(platform, order_id)
    results["payment"] = record_payment(platform, order_id)
    results["notify"]  = notify(platform, order_id, "FULL_PIPELINE_COMPLETE")
    _log(f"[{platform.upper()}] Full pipeline complete for {order_id}")
    return results


# ─── Main dispatcher (mirrors TikTok agent pattern) ───────────────────────────

def run_commerce_automation(platform: str, event: dict) -> dict:
    event_type = event.get("type")
    data       = event.get("data", {})

    if event_type == "new_order":
        return capture_order(platform, data)
    elif event_type == "fulfill":
        return fulfill_order(platform, data["order_id"], data.get("method", "supplier"),
                             data.get("carrier", "UPS"), data.get("tracking_ref"))
    elif event_type == "invoice":
        result = invoice_order(platform, data["order_id"])
        if data.get("auto_pay"):
            result["payment"] = record_payment(platform, data["order_id"])
        return result
    elif event_type == "notify":
        return notify(platform, data["order_id"], data["event"])
    elif event_type == "full_pipeline":
        return run_full_pipeline(platform, data)
    else:
        return {"error": f"Unknown event type: '{event_type}'"}


# ─── CLI ──────────────────────────────────────────────────────────────────────

def _print(data):
    print(json.dumps(data, indent=2, default=str))


def main():
    parser = argparse.ArgumentParser(
        description="LooseArrows Commerce Automation Agent",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  commerce_agent.py --platform instagram capture '{"order_id":"IG-001","items":[{"sku":"SUPSK-001","quantity":1,"unitPrice":45.00}]}'
  commerce_agent.py --platform youtube   fulfill '{"order_id":"YT-001","method":"home","carrier":"FEDEX"}'
  commerce_agent.py --platform amazon    invoice '{"order_id":"AMZ-001"}'
  commerce_agent.py --platform amazon    payment '{"order_id":"AMZ-001"}'
  commerce_agent.py --platform instagram notify  '{"order_id":"IG-001","event":"DELIVERED"}'
  commerce_agent.py --platform tiktok    orders  PAID
  commerce_agent.py --platform youtube   summary
  commerce_agent.py all-summary
  commerce_agent.py --platform amazon    run '{"type":"full_pipeline","data":{"order_id":"AMZ-002","items":[...]}}'
        """
    )
    parser.add_argument("--platform", "-p", choices=sorted(VALID_PLATFORMS),
                        help="Target platform (required for all commands except all-summary)")
    parser.add_argument("command", help="Command to run")
    parser.add_argument("args", nargs="*", help="Command arguments")
    parsed = parser.parse_args()

    cmd  = parsed.command.lower()
    args = parsed.args
    plat = parsed.platform

    try:
        # Cross-platform command — no --platform needed
        if cmd == "all-summary":
            _print(all_platforms_summary())
            return

        if not plat:
            print(f"Error: --platform is required for command '{cmd}'")
            parser.print_help()
            sys.exit(1)

        if cmd == "capture":
            _print(capture_order(plat, json.loads(args[0])))

        elif cmd == "fulfill":
            p = json.loads(args[0])
            _print(fulfill_order(plat, p["order_id"], p.get("method", "supplier"),
                                 p.get("carrier", "UPS"), p.get("tracking_ref")))

        elif cmd == "invoice":
            _print(invoice_order(plat, json.loads(args[0])["order_id"]))

        elif cmd == "payment":
            _print(record_payment(plat, json.loads(args[0])["order_id"]))

        elif cmd == "notify":
            p = json.loads(args[0])
            _print(notify(plat, p["order_id"], p["event"]))

        elif cmd == "run":
            _print(run_commerce_automation(plat, json.loads(args[0])))

        elif cmd == "orders":
            status = args[0] if args else None
            rows   = list_orders(plat, status)
            _log(f"[{plat.upper()}] {len(rows)} order(s) returned")
            _print(rows)

        elif cmd == "order":
            _print(get_order(plat, args[0]))

        elif cmd == "summary":
            _print(get_summary(plat))

        else:
            print(f"Unknown command: '{cmd}'")
            sys.exit(1)

    except (RuntimeError, KeyError, IndexError, json.JSONDecodeError) as e:
        print(f"[ERROR] {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
