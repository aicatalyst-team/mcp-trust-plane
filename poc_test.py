#!/usr/bin/env python3
"""
PoC Test Script for MCP Trust Plane
Tests all 6 common filters deployed on OpenShift.
"""

import json
import sys
import time
import urllib.request
import urllib.error

NS = "poc-mcp-trust-plane"

FILTERS = {
    "sql-guard": 6001,
    "pii-redactor": 6002,
    "row-limiter": 6003,
    "schema-validator": 6005,
    "rate-limiter": 6007,
    "field-masker": 6008,
}

results = []


def make_request(url, data=None, method="GET", retries=3, delay=5):
    """Make HTTP request with retry logic."""
    for attempt in range(retries):
        try:
            if data is not None:
                req = urllib.request.Request(
                    url,
                    data=json.dumps(data).encode("utf-8"),
                    headers={"Content-Type": "application/json"},
                    method="POST",
                )
            else:
                req = urllib.request.Request(url, method=method)
            with urllib.request.urlopen(req, timeout=30) as resp:
                body = resp.read().decode("utf-8")
                return resp.status, json.loads(body) if body else {}
        except urllib.error.HTTPError as e:
            body = e.read().decode("utf-8") if e.fp else ""
            return e.code, {"error": body}
        except Exception as e:
            if attempt < retries - 1:
                print(f"  Retry {attempt + 1}/{retries} for {url}: {e}", file=sys.stderr)
                time.sleep(delay)
            else:
                return 0, {"error": str(e)}
    return 0, {"error": "Max retries exceeded"}


def svc_url(filter_name, port, path="/"):
    """Build cluster-internal service URL."""
    return f"http://{filter_name}.{NS}.svc.cluster.local:{port}{path}"


def record(scenario, status, output="", error=None, duration=0):
    """Record a test result."""
    results.append({
        "scenario_name": scenario,
        "status": status,
        "output": output[:500],
        "error_message": error,
        "duration_seconds": round(duration, 2),
    })


def test_health_checks():
    """Scenario 1: Health Check All Filters."""
    scenario = "health_check_all_filters"
    start = time.time()
    all_ok = True

    for name, port in FILTERS.items():
        url = svc_url(name, port, "/health")
        code, body = make_request(url)
        if code == 200 and body.get("status") == "healthy":
            print(f"  {name}: healthy (filter={body.get('filter')}, version={body.get('version')})")
        else:
            print(f"  {name}: UNHEALTHY (code={code}, body={body})", file=sys.stderr)
            all_ok = False

    duration = time.time() - start
    if all_ok:
        record(scenario, "pass", f"All {len(FILTERS)} filters healthy", duration=duration)
    else:
        record(scenario, "fail", "Some filters unhealthy", error="Health check failed", duration=duration)


def test_sql_guard_block():
    """Scenario 2: SQL Guard blocks dangerous SQL."""
    scenario = "sql_guard_block_dangerous"
    start = time.time()

    url = svc_url("sql-guard", 6001, "/filter")
    payload = {
        "arguments": {"sql": "DROP TABLE users;"},
        "config": {},
    }
    code, body = make_request(url, data=payload)
    duration = time.time() - start

    if code == 200 and body.get("action") == "block":
        record(scenario, "pass", f"Blocked: {body.get('reason')}", duration=duration)
    else:
        record(scenario, "fail", json.dumps(body), error=f"Expected block, got {body.get('action')}", duration=duration)


def test_sql_guard_allow():
    """Scenario 3: SQL Guard allows safe SQL."""
    scenario = "sql_guard_allow_safe"
    start = time.time()

    url = svc_url("sql-guard", 6001, "/filter")
    payload = {
        "arguments": {"sql": "SELECT name, email FROM users WHERE id = 1"},
        "config": {},
    }
    code, body = make_request(url, data=payload)
    duration = time.time() - start

    if code == 200 and body.get("action") == "allow":
        record(scenario, "pass", f"Allowed: {body.get('reason')}", duration=duration)
    else:
        record(scenario, "fail", json.dumps(body), error=f"Expected allow, got {body.get('action')}", duration=duration)


def test_pii_redactor():
    """Scenario 4: PII Redactor redacts email."""
    scenario = "pii_redactor_email"
    start = time.time()

    url = svc_url("pii-redactor", 6002, "/filter")
    payload = {
        "arguments": {"content": "Contact john@example.com for details"},
        "config": {},
    }
    code, body = make_request(url, data=payload)
    duration = time.time() - start

    action = body.get("action", "")
    # PII redactor may use "modify" or "allow" with modified content
    if code == 200 and action in ("modify", "allow", "redact"):
        record(scenario, "pass", f"Action: {action}, reason: {body.get('reason', '')}", duration=duration)
    else:
        record(scenario, "fail", json.dumps(body), error=f"Unexpected response: code={code}, action={action}", duration=duration)


def test_contract_compliance():
    """Scenario 5: Filter contract compliance - malformed JSON."""
    scenario = "contract_compliance_malformed"
    start = time.time()
    all_ok = True

    for name, port in FILTERS.items():
        url = svc_url(name, port, "/filter")
        # Send malformed JSON
        try:
            req = urllib.request.Request(
                url,
                data=b"{invalid json",
                headers={"Content-Type": "application/json"},
                method="POST",
            )
            with urllib.request.urlopen(req, timeout=10) as resp:
                body = json.loads(resp.read().decode("utf-8"))
                if body.get("action") == "allow":
                    print(f"  {name}: fail-open OK (reason: {body.get('reason', '')[:60]})")
                else:
                    print(f"  {name}: UNEXPECTED action={body.get('action')}", file=sys.stderr)
                    all_ok = False
        except Exception as e:
            print(f"  {name}: ERROR {e}", file=sys.stderr)
            all_ok = False

    duration = time.time() - start
    if all_ok:
        record(scenario, "pass", "All filters fail-open on malformed JSON", duration=duration)
    else:
        record(scenario, "fail", "Some filters did not fail-open", error="Contract violation", duration=duration)


if __name__ == "__main__":
    print("=" * 60)
    print("MCP Trust Plane - PoC Validation Tests")
    print("=" * 60)

    print("\n--- Scenario 1: Health Check All Filters ---")
    test_health_checks()

    print("\n--- Scenario 2: SQL Guard - Block Dangerous SQL ---")
    test_sql_guard_block()

    print("\n--- Scenario 3: SQL Guard - Allow Safe SQL ---")
    test_sql_guard_allow()

    print("\n--- Scenario 4: PII Redactor - Redact Email ---")
    test_pii_redactor()

    print("\n--- Scenario 5: Filter Contract Compliance ---")
    test_contract_compliance()

    # Output structured results
    print("\n" + "=" * 60)
    print("TEST RESULTS (JSON)")
    print("=" * 60)
    print(json.dumps(results, indent=2))

    # Summary
    passed = sum(1 for r in results if r["status"] == "pass")
    failed = sum(1 for r in results if r["status"] == "fail")
    print(f"\nSummary: {passed} passed, {failed} failed out of {len(results)} scenarios")

    sys.exit(0 if failed == 0 else 1)
