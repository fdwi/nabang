import assert from "node:assert/strict";
import test from "node:test";
import {
  calculateWarungItemSubtotal,
  calculateWarungOrderTotal,
  calculateWarungSummary,
} from "../../src/lib/finance/warung.ts";

test("calculateWarungItemSubtotal: menghitung subtotal qty * price dengan benar", () => {
  assert.equal(calculateWarungItemSubtotal(2, 3000), 6000);
  assert.equal(calculateWarungItemSubtotal(5, 1500), 7500);
  assert.equal(calculateWarungItemSubtotal(0, 10000), 0);
  assert.equal(calculateWarungItemSubtotal(-2, 5000), 0);
});

test("calculateWarungOrderTotal: menjumlahkan total pesanan dari daftar item", () => {
  const items = [
    { qty: 2, price: 3000 }, // 6000 (Es Teh)
    { qty: 1, price: 15000 }, // 15000 (Nasi Ayam)
    { qty: 4, price: 1000 }, // 4000 (Gorengan)
  ];
  assert.equal(calculateWarungOrderTotal(items), 25000);
});

test("calculateWarungSummary: memisahkan total belum lunas (kasbon) dan total lunas", () => {
  const orders = [
    { is_paid: false, total_amount: 25000 },
    { is_paid: false, total_amount: 15000 },
    { is_paid: true, total_amount: 40000 },
  ];

  const summary = calculateWarungSummary(orders);
  assert.equal(summary.totalUnpaid, 40000);
  assert.equal(summary.totalPaid, 40000);
  assert.equal(summary.totalOrders, 3);
  assert.equal(summary.unpaidCount, 2);
  assert.equal(summary.paidCount, 1);
});
