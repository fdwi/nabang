import type { WarungItem, WarungOrder } from "@/types/database";

/**
 * Menghitung subtotal dari satu baris item pesanan warung.
 */
export function calculateWarungItemSubtotal(qty: number, price: number): number {
  const safeQty = Math.max(0, Number(qty) || 0);
  const safePrice = Math.max(0, Number(price) || 0);
  return safeQty * safePrice;
}

/**
 * Menghitung total belanja satu bon warung dari seluruh itemnya.
 */
export function calculateWarungOrderTotal(
  items: Pick<WarungItem, "qty" | "price">[]
): number {
  if (!Array.isArray(items)) return 0;
  return items.reduce((sum, item) => {
    return sum + calculateWarungItemSubtotal(item.qty, item.price);
  }, 0);
}

export type WarungSummary = {
  totalUnpaid: number;
  totalPaid: number;
  totalOrders: number;
  unpaidCount: number;
  paidCount: number;
};

/**
 * Menghitung ringkasan statistik kasbon vs lunas dari seluruh pesanan warung.
 */
export function calculateWarungSummary(
  orders: Pick<WarungOrder, "is_paid" | "total_amount">[]
): WarungSummary {
  if (!Array.isArray(orders)) {
    return {
      totalUnpaid: 0,
      totalPaid: 0,
      totalOrders: 0,
      unpaidCount: 0,
      paidCount: 0,
    };
  }

  let totalUnpaid = 0;
  let totalPaid = 0;
  let unpaidCount = 0;
  let paidCount = 0;

  for (const order of orders) {
    const amount = Number(order.total_amount) || 0;
    if (order.is_paid) {
      totalPaid += amount;
      paidCount += 1;
    } else {
      totalUnpaid += amount;
      unpaidCount += 1;
    }
  }

  return {
    totalUnpaid,
    totalPaid,
    totalOrders: orders.length,
    unpaidCount,
    paidCount,
  };
}
