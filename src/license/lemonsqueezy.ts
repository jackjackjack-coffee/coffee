/**
 * Lemon Squeezy License API (public endpoints — no secret key needed).
 * Docs: https://docs.lemonsqueezy.com/help/licensing/license-api
 *
 * Fill the constants below after creating the two products in your store
 * (see README → "Lemon Squeezy setup").
 */

import type { LicenseTier } from '../data/types';
import type { LicenseStatus } from '../store/useAppStore';

// ── Configure these ────────────────────────────────────────────────────────
export const LS_STORE_ID = ''; // e.g. '12345'
export const LS_PRODUCT_ID_PERSONAL = ''; // product id for "Personal Pro"
export const LS_PRODUCT_ID_CAFE = ''; // product id for "Café Pro"

/** Hosted checkout links shown on the paywall (placeholders). */
export const LS_CHECKOUT_PERSONAL = 'https://YOUR_STORE.lemonsqueezy.com/buy/PERSONAL';
export const LS_CHECKOUT_CAFE = 'https://YOUR_STORE.lemonsqueezy.com/buy/CAFE';

/**
 * Dev/offline shortcut so the app is testable before the store is wired up.
 * Keys "DEMO-PERSONAL" / "DEMO-CAFE" unlock locally. Set to false for production.
 */
export const ALLOW_DEMO_KEYS = true;
// ───────────────────────────────────────────────────────────────────────────

const API_BASE = 'https://api.lemonsqueezy.com/v1/licenses';
const REQUEST_TIMEOUT_MS = 12000;

export interface LicenseResult {
  ok: boolean;
  tier: LicenseTier;
  status: LicenseStatus;
  productName?: string;
  instanceId?: string;
  message?: string;
  /** True when the network was unreachable and the caller should keep cached state. */
  offline?: boolean;
}

interface LsMeta {
  store_id?: number | string;
  product_id?: number | string;
  product_name?: string;
  variant_name?: string;
}

interface LsResponse {
  activated?: boolean;
  valid?: boolean;
  error?: string | null;
  license_key?: { status?: string; key?: string } | null;
  instance?: { id?: string; name?: string } | null;
  meta?: LsMeta | null;
}

const STORE_CONFIGURED = LS_STORE_ID !== '';

function tierFromProduct(productId: LsMeta['product_id']): LicenseTier | null {
  const pid = productId === undefined || productId === null ? '' : String(productId);
  if (LS_PRODUCT_ID_PERSONAL && pid === LS_PRODUCT_ID_PERSONAL) return 'personal';
  if (LS_PRODUCT_ID_CAFE && pid === LS_PRODUCT_ID_CAFE) return 'cafe';
  // When product ids are not configured we cannot tell the tiers apart.
  return null;
}

function normalizeStatus(raw?: string): LicenseStatus {
  switch (raw) {
    case 'active':
      return 'active';
    case 'expired':
      return 'expired';
    case 'disabled':
    case 'inactive':
      return 'inactive';
    default:
      return 'inactive';
  }
}

function demoResult(key: string, instanceId: string): LicenseResult | null {
  if (!ALLOW_DEMO_KEYS) return null;
  const k = key.trim().toUpperCase();
  if (k === 'DEMO-PERSONAL') {
    return { ok: true, tier: 'personal', status: 'active', productName: 'Personal Pro (demo)', instanceId };
  }
  if (k === 'DEMO-CAFE') {
    return { ok: true, tier: 'cafe', status: 'active', productName: 'Café Pro (demo)', instanceId };
  }
  return null;
}

async function postForm(path: string, body: Record<string, string>): Promise<LsResponse> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(`${API_BASE}/${path}`, {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(body).toString(),
      signal: controller.signal,
    });
    return (await res.json()) as LsResponse;
  } finally {
    clearTimeout(timer);
  }
}

function evaluate(json: LsResponse, instanceId: string): LicenseResult {
  if (json.error || (json.activated === false && json.valid === undefined) || json.valid === false) {
    return { ok: false, tier: 'free', status: 'invalid', message: json.error ?? 'Invalid license' };
  }
  const meta = json.meta ?? {};
  if (STORE_CONFIGURED && String(meta.store_id ?? '') !== LS_STORE_ID) {
    return { ok: false, tier: 'free', status: 'mismatch', message: 'Store mismatch' };
  }
  const tier = tierFromProduct(meta.product_id);
  if (!tier) {
    return { ok: false, tier: 'free', status: 'mismatch', message: 'Product mismatch' };
  }
  const status = normalizeStatus(json.license_key?.status);
  if (status !== 'active') {
    return { ok: false, tier: 'free', status, message: `License ${status}` };
  }
  return {
    ok: true,
    tier,
    status: 'active',
    productName: meta.product_name ?? meta.variant_name,
    instanceId: json.instance?.id ?? instanceId,
  };
}

/** Activate a key, binding it to this device. Call once when the user enters a key. */
export async function activateLicense(key: string, instanceName: string): Promise<LicenseResult> {
  const trimmed = key.trim();
  if (!trimmed) return { ok: false, tier: 'free', status: 'invalid', message: 'Empty key' };

  const demo = demoResult(trimmed, instanceName);
  if (demo) return demo;

  if (!STORE_CONFIGURED) {
    return { ok: false, tier: 'free', status: 'invalid', message: 'License store not configured' };
  }

  try {
    const json = await postForm('activate', { license_key: trimmed, instance_name: instanceName });
    return evaluate(json, instanceName);
  } catch {
    return { ok: false, tier: 'free', status: 'inactive', message: 'Network error', offline: true };
  }
}

/** Re-validate a previously activated key (run ~daily). */
export async function validateLicense(key: string, instanceId: string): Promise<LicenseResult> {
  const trimmed = key.trim();
  if (!trimmed) return { ok: false, tier: 'free', status: 'invalid' };

  const demo = demoResult(trimmed, instanceId);
  if (demo) return demo;

  if (!STORE_CONFIGURED) {
    return { ok: false, tier: 'free', status: 'invalid', offline: true };
  }

  try {
    const json = await postForm('validate', { license_key: trimmed, instance_id: instanceId });
    return evaluate(json, instanceId);
  } catch {
    return { ok: false, tier: 'free', status: 'inactive', message: 'Network error', offline: true };
  }
}
