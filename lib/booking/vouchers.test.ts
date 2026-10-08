import { describe, it, expect } from "vitest";
import {
  applyVoucher,
  calcVoucherDiscount,
  checkVoucher,
  describeVoucher,
  normalizeVoucherCode,
  MIN_CHARGE_CHF,
  type Voucher,
} from "./vouchers";
import { calcPrice } from "./pricing";

const base: Voucher = {
  id: "v1",
  code: "GIVEAWAY10",
  discount_type: "percent",
  discount_value: 10,
  max_uses: 1,
  used_count: 0,
  expires_at: null,
  active: true,
  note: null,
  created_at: "2026-10-08T00:00:00Z",
};
const now = new Date("2026-10-20T12:00:00Z");

describe("normalizeVoucherCode", () => {
  it("upper-cases and strips whitespace", () => {
    expect(normalizeVoucherCode(" giveaway 10 ")).toBe("GIVEAWAY10");
    expect(normalizeVoucherCode("GiveAway20")).toBe("GIVEAWAY20");
  });
});

describe("calcVoucherDiscount", () => {
  it("takes a percentage off the total", () => {
    expect(calcVoucherDiscount({ discount_type: "percent", discount_value: 10 }, 25000)).toBe(2500);
    expect(calcVoucherDiscount({ discount_type: "percent", discount_value: 20 }, 7000)).toBe(1400);
  });

  it("rounds to whole cents", () => {
    // 10 % of 16550 = 1655; 15 % of 7001 = 1050.15 → 1050
    expect(calcVoucherDiscount({ discount_type: "percent", discount_value: 15 }, 7001)).toBe(1050);
  });

  it("takes a fixed CHF amount off", () => {
    expect(calcVoucherDiscount({ discount_type: "fixed", discount_value: 2000 }, 12000)).toBe(2000);
  });

  it("never takes the charge below Stripe's minimum", () => {
    expect(calcVoucherDiscount({ discount_type: "fixed", discount_value: 99999 }, 7000)).toBe(7000 - MIN_CHARGE_CHF);
    expect(calcVoucherDiscount({ discount_type: "percent", discount_value: 99 }, 7000)).toBe(6930);
    expect(calcVoucherDiscount({ discount_type: "fixed", discount_value: 1000 }, 30)).toBe(0);
  });
});

describe("applyVoucher", () => {
  it("returns a net total and keeps the components untouched", () => {
    const gross = calcPrice({ duration: 2, startHour: 10, addons: [], premium: true, extraPaper: true });
    const net = applyVoucher(gross, base);
    expect(net.totalChf).toBe(gross.totalChf - net.discountChf!);
    expect(net.discountChf).toBe(Math.round(gross.totalChf * 0.1));
    expect(net.baseChf).toBe(gross.baseChf);
    expect(net.premiumChf).toBe(gross.premiumChf);
    expect(net.paperChf).toBe(gross.paperChf);
  });

  it("does not mutate the input breakdown", () => {
    const gross = calcPrice({ duration: 1, startHour: 10, addons: [] });
    applyVoucher(gross, base);
    expect(gross.discountChf).toBeUndefined();
    expect(gross.totalChf).toBe(7000);
  });
});

describe("checkVoucher", () => {
  it("accepts a live, unused code", () => {
    expect(checkVoucher(base, { now, reservedUses: 0 })).toEqual({ ok: true });
  });

  it("treats unknown and switched-off codes the same (can't probe inactive codes)", () => {
    expect(checkVoucher(null, { now, reservedUses: 0 })).toEqual({ ok: false, reason: "invalid" });
    expect(checkVoucher({ ...base, active: false }, { now, reservedUses: 0 })).toEqual({ ok: false, reason: "invalid" });
  });

  it("rejects an expired code", () => {
    const v = { ...base, expires_at: "2026-10-19T21:59:59Z" };
    expect(checkVoucher(v, { now, reservedUses: 0 })).toEqual({ ok: false, reason: "expired" });
  });

  it("rejects a code that has hit max_uses", () => {
    expect(checkVoucher({ ...base, used_count: 1 }, { now, reservedUses: 0 })).toEqual({ ok: false, reason: "used_up" });
  });

  it("counts open checkouts by other people as taken", () => {
    expect(checkVoucher(base, { now, reservedUses: 1 })).toEqual({ ok: false, reason: "used_up" });
  });

  it("never runs out when max_uses is null", () => {
    const v = { ...base, max_uses: null, used_count: 500 };
    expect(checkVoucher(v, { now, reservedUses: 20 })).toEqual({ ok: true });
  });
});

describe("describeVoucher", () => {
  it("formats percent and fixed codes", () => {
    expect(describeVoucher({ discount_type: "percent", discount_value: 10 })).toBe("10 % off");
    expect(describeVoucher({ discount_type: "fixed", discount_value: 2000 })).toBe("CHF 20 off");
    expect(describeVoucher({ discount_type: "fixed", discount_value: 1250 })).toBe("CHF 12.50 off");
  });
});
