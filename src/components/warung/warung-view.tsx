"use client";

import { deleteWarungOrder, toggleWarungPaymentStatus } from "@/actions/warung";
import { WarungFormModal } from "@/components/warung/warung-form-modal";
import { Button } from "@/components/ui/button";
import { formatRupiah } from "@/lib/formatters/currency";
import { calculateWarungSummary } from "@/lib/finance/warung";
import type { WarungAccountOption } from "@/app/warung/page";
import type { WarungOrder } from "@/types/database";
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  Edit2,
  Plus,
  Receipt,
  Search,
  Store,
  Trash2,
  Wallet,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const LOCAL_STORAGE_KEY = "nabang_warung_orders";

type WarungViewProps = {
  initialOrders: WarungOrder[];
  accounts?: WarungAccountOption[];
  isConfigured?: boolean;
};

export function WarungView({
  initialOrders,
  accounts = [],
  isConfigured = true,
}: WarungViewProps) {
  const [orders, setOrders] = useState<WarungOrder[]>(initialOrders);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [orderToEdit, setOrderToEdit] = useState<WarungOrder | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "unpaid" | "paid">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);

  // Dialog konfirmasi pelunasan dengan pilihan akun potong saldo
  const [orderToPay, setOrderToPay] = useState<WarungOrder | null>(null);
  const [payAccountId, setPayAccountId] = useState<string>("");
  const [autoDeductOnPay, setAutoDeductOnPay] = useState<boolean>(true);

  // Sinkronisasi dengan localStorage jika server data kosong atau offline
  useEffect(() => {
    if (initialOrders.length > 0) {
      setOrders(initialOrders);
    } else {
      try {
        const localData = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (localData) {
          const parsed = JSON.parse(localData);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setOrders(parsed);
          }
        }
      } catch {
        /* noop */
      }
    }
  }, [initialOrders]);

  // Simpan ke localStorage untuk backup cepat
  const saveToLocalStorage = (updatedOrders: WarungOrder[]) => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedOrders));
    } catch {
      /* noop */
    }
  };

  // Hitung metrik ringkasan
  const summary = useMemo(() => calculateWarungSummary(orders), [orders]);

  // Filter daftar pesanan
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      if (activeTab === "unpaid" && order.is_paid) return false;
      if (activeTab === "paid" && !order.is_paid) return false;

      if (!searchQuery.trim()) return true;
      const query = searchQuery.toLowerCase();
      const matchWarung = order.warung_name.toLowerCase().includes(query);
      const matchItem = order.items?.some((it) =>
        it.name.toLowerCase().includes(query)
      );
      const matchNotes = order.notes?.toLowerCase().includes(query);

      return matchWarung || matchItem || matchNotes;
    });
  }, [orders, activeTab, searchQuery]);

  // Handle buat / update pesanan
  const handleOrderSaved = (savedOrder: WarungOrder) => {
    setOrders((prev) => {
      const existsIndex = prev.findIndex((o) => o.id === savedOrder.id);
      let next: WarungOrder[];
      if (existsIndex >= 0) {
        next = [...prev];
        next[existsIndex] = savedOrder;
      } else {
        next = [savedOrder, ...prev];
      }
      saveToLocalStorage(next);
      return next;
    });
  };

  // Mulai alur pelunasan bon
  const handleInitiatePaymentToggle = (order: WarungOrder) => {
    if (!order.is_paid) {
      // Jika saat ini kasbon dan mau ditandai lunas, tanyakan akun untuk potong saldo
      if (accounts.length > 0) {
        setPayAccountId(order.account_id || accounts[0]?.id || "");
        setAutoDeductOnPay(true);
        setOrderToPay(order);
        return;
      }
    }
    // Jika tidak ada akun atau mengubah dari lunas kembali ke kasbon
    executeTogglePayment(order, null);
  };

  const executeTogglePayment = async (order: WarungOrder, accountId: string | null) => {
    setActionError(null);
    const newStatus = !order.is_paid;

    // Optimistic UI update
    setOrders((prev) => {
      const next = prev.map((o) =>
        o.id === order.id
          ? {
              ...o,
              is_paid: newStatus,
              account_id: newStatus ? (accountId || o.account_id) : o.account_id,
            }
          : o
      );
      saveToLocalStorage(next);
      return next;
    });

    const res = await toggleWarungPaymentStatus(order.id, order.is_paid, accountId);
    if (res?.error) {
      console.warn("Server sync error (saved locally):", res.error);
    }
    setOrderToPay(null);
  };

  // Hapus pesanan
  const handleDelete = async (order: WarungOrder) => {
    if (!confirm(`Hapus catatan pesanan di "${order.warung_name}"?`)) return;

    setActionError(null);
    setOrders((prev) => {
      const next = prev.filter((o) => o.id !== order.id);
      saveToLocalStorage(next);
      return next;
    });

    const res = await deleteWarungOrder(order.id);
    if (res?.error) {
      console.warn("Server delete sync error:", res.error);
    }
  };

  const openCreateModal = () => {
    setOrderToEdit(null);
    setIsModalOpen(true);
  };

  const openEditModal = (order: WarungOrder) => {
    setOrderToEdit(order);
    setIsModalOpen(true);
  };

  // Format tanggal ramah pengguna
  const formatDateTime = (dateString: string) => {
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString("id-ID", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  const getAccountName = (accId: string | null | undefined) => {
    if (!accId) return null;
    const found = accounts.find((a) => a.id === accId);
    return found ? found.name : null;
  };

  return (
    <div className="space-y-8">
      {!isConfigured && (
        <div className="flex items-center gap-2.5 rounded-xl border border-amber-300 bg-amber-50/70 p-3.5 text-xs text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200">
          <AlertCircle className="size-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <span>Mode penyimpanan lokal aktif. Data tersimpan di browser Anda dan tetap aman digunakan.</span>
        </div>
      )}

      {actionError && (
        <div
          className="rounded-xl border border-rose-300 bg-rose-50 p-4 text-sm text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-200"
          role="alert"
        >
          {actionError}
        </div>
      )}

      {/* 1. Stat Cards Ringkasan */}
      <div className="grid gap-4 sm:grid-cols-3">
        {/* Total Kasbon Belum Lunas */}
        <div className="rounded-2xl border border-amber-300/80 bg-gradient-to-br from-amber-50/90 to-orange-50/50 p-5 shadow-xs dark:border-amber-900/50 dark:from-amber-950/30 dark:to-orange-950/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wider dark:text-amber-300">
              Belum Lunas (Kasbon)
            </span>
            <div className="flex size-8 items-center justify-center rounded-lg bg-amber-200/80 text-amber-900 dark:bg-amber-900/60 dark:text-amber-200">
              <Clock size={16} />
            </div>
          </div>
          <p className="mt-3 text-2xl font-black tracking-tight text-amber-900 sm:text-3xl dark:text-amber-100">
            {formatRupiah(summary.totalUnpaid)}
          </p>
          <p className="mt-1 text-xs text-amber-700/90 dark:text-amber-400">
            {summary.unpaidCount} bon warung belum dibayar
          </p>
        </div>

        {/* Total Sudah Lunas */}
        <div className="rounded-2xl border border-emerald-300/80 bg-gradient-to-br from-emerald-50/90 to-teal-50/50 p-5 shadow-xs dark:border-emerald-900/50 dark:from-emerald-950/30 dark:to-teal-950/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider dark:text-emerald-300">
              Sudah Lunas
            </span>
            <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-200/80 text-emerald-900 dark:bg-emerald-900/60 dark:text-emerald-200">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <p className="mt-3 text-2xl font-black tracking-tight text-emerald-900 sm:text-3xl dark:text-emerald-100">
            {formatRupiah(summary.totalPaid)}
          </p>
          <p className="mt-1 text-xs text-emerald-700/90 dark:text-emerald-400">
            {summary.paidCount} bon sudah selesai dibayar
          </p>
        </div>

        {/* Total Kunjungan Warung */}
        <div className="rounded-2xl border border-pink-200/80 bg-gradient-to-br from-pink-50/70 to-rose-50/40 p-5 shadow-xs dark:border-pink-900/50 dark:from-[#2e1d22] dark:to-[#221518]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#8f3242] uppercase tracking-wider dark:text-[#ffc4cb]">
              Total Kunjungan Warung
            </span>
            <div className="flex size-8 items-center justify-center rounded-lg bg-[#f9e1e1] text-[#8f3242] dark:bg-[#542d35] dark:text-[#ffc4cb]">
              <Store size={16} />
            </div>
          </div>
          <p className="mt-3 text-2xl font-black tracking-tight text-foreground sm:text-3xl">
            {summary.totalOrders} <span className="text-sm font-medium text-muted-foreground">Catatan</span>
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Warteg, warkop, angkringan & kantin
          </p>
        </div>
      </div>

      {/* 2. Toolbar: Search, Filter Tabs, & Tombol Tambah */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Filter Tabs */}
        <div className="flex items-center gap-1 rounded-xl border border-border bg-muted/50 p-1">
          <button
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              activeTab === "all"
                ? "bg-card text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setActiveTab("all")}
            type="button"
          >
            Semua ({summary.totalOrders})
          </button>
          <button
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
              activeTab === "unpaid"
                ? "bg-amber-400 text-amber-950 shadow-xs dark:bg-amber-500 dark:text-black"
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setActiveTab("unpaid")}
            type="button"
          >
            <Clock size={13} />
            Kasbon ({summary.unpaidCount})
          </button>
          <button
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
              activeTab === "paid"
                ? "bg-emerald-600 text-white shadow-xs dark:bg-emerald-700"
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setActiveTab("paid")}
            type="button"
          >
            <CheckCircle2 size={13} />
            Lunas ({summary.paidCount})
          </button>
        </div>

        {/* Search & Tombol Tambah */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-64">
            <Search
              className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <input
              className="w-full rounded-xl border border-input bg-card pr-3 pl-9 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-[#b34455] focus:outline-none dark:focus:border-[#ffb9c3]"
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari warung / es teh / nasi..."
              type="text"
              value={searchQuery}
            />
          </div>

          <Button onClick={openCreateModal} type="button">
            <Plus size={16} />
            <span>Catat Pembelian</span>
          </Button>
        </div>
      </div>

      {/* 3. Daftar Kartu Bon Warung */}
      {filteredOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/60 p-12 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
            <Receipt size={28} />
          </div>
          <h3 className="mt-4 text-base font-bold text-foreground">
            {searchQuery
              ? "Tidak ada pesanan yang sesuai pencarian"
              : activeTab === "unpaid"
              ? "Hore! Tidak ada kasbon atau utang warung"
              : "Belum ada catatan pembelian di warung"}
          </h3>
          <p className="mt-1.5 max-w-sm text-xs text-muted-foreground sm:text-sm">
            {searchQuery
              ? "Coba kata kunci lain atau bersihkan kotak pencarian."
              : "Catat setiap kali makan di warteg, warkop, atau jajan agar tidak lupa apa saja menu yang dipesan, total harganya, dan potong saldo akun otomatis."}
          </p>
          {!searchQuery && (
            <Button className="mt-5" onClick={openCreateModal} type="button">
              <Plus size={16} />
              Catat Pembelian Sekarang
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filteredOrders.map((order) => {
            const linkedAccountName = getAccountName(order.account_id);

            return (
              <div
                className={`flex flex-col justify-between overflow-hidden rounded-2xl border bg-card shadow-xs transition-all hover:shadow-md ${
                  order.is_paid
                    ? "border-border/90"
                    : "border-amber-400/80 ring-1 ring-amber-400/20 dark:border-amber-700/60"
                }`}
                key={order.id}
              >
                {/* Header Nota Warung */}
                <div className="border-b border-border bg-muted/30 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-base font-bold text-foreground">
                        {order.warung_name}
                      </h3>
                      <div className="mt-1 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                        <Calendar size={12} />
                        <span>{formatDateTime(order.ordered_at)}</span>
                      </div>
                    </div>

                    {/* Badge Status Lunas / Belum Lunas */}
                    <span
                      className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                        order.is_paid
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300"
                          : "bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-300"
                      }`}
                    >
                      {order.is_paid ? (
                        <>
                          <CheckCircle2 size={12} />
                          Lunas
                        </>
                      ) : (
                        <>
                          <Clock size={12} />
                          Kasbon
                        </>
                      )}
                    </span>
                  </div>

                  {/* Keterangan Akun Pemotong Saldo */}
                  {order.is_paid && linkedAccountName && (
                    <div className="mt-2 flex items-center gap-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
                      <Wallet size={12} />
                      <span>Saldo dipotong dari: {linkedAccountName}</span>
                    </div>
                  )}
                </div>

                {/* Rincian Menu Yang Dipesan (Gaya Struk Kasir) */}
                <div className="flex-1 p-4">
                  <div className="space-y-2 text-xs">
                    {order.items && order.items.length > 0 ? (
                      order.items.map((it, idx) => (
                        <div
                          className="flex items-center justify-between border-b border-border/40 pb-1.5 last:border-0 last:pb-0"
                          key={it.id || idx}
                        >
                          <div className="flex items-baseline gap-2">
                            <span className="font-mono font-bold text-[#b34455] dark:text-[#ffb9c3]">
                              {it.qty}x
                            </span>
                            <span className="font-medium text-foreground">{it.name}</span>
                            <span className="text-[10px] text-muted-foreground">
                              @{formatRupiah(it.price)}
                            </span>
                          </div>
                          <span className="font-semibold text-foreground">
                            {formatRupiah(it.subtotal || it.qty * it.price)}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-muted-foreground italic">
                        Tidak ada detail item.
                      </p>
                    )}
                  </div>

                  {/* Catatan jika ada */}
                  {order.notes && (
                    <div className="mt-3 rounded-lg bg-muted/50 p-2 text-[11px] text-muted-foreground italic">
                      &ldquo;{order.notes}&rdquo;
                    </div>
                  )}
                </div>

                {/* Total Tagihan & Aksi Bawah */}
                <div className="border-t border-border bg-muted/20 p-4">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs font-medium text-muted-foreground">
                      Total Tagihan:
                    </span>
                    <span className="text-lg font-black tracking-tight text-[#8f3242] sm:text-xl dark:text-[#ffb9c3]">
                      {formatRupiah(order.total_amount)}
                    </span>
                  </div>

                  {/* Tombol Aksi */}
                  <div className="mt-3 flex items-center justify-between gap-2 pt-2 border-t border-border/60">
                    <button
                      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                        order.is_paid
                          ? "border border-border bg-card text-muted-foreground hover:bg-muted"
                          : "bg-emerald-600 text-white shadow-xs hover:bg-emerald-700"
                      }`}
                      onClick={() => handleInitiatePaymentToggle(order)}
                      type="button"
                    >
                      {order.is_paid ? (
                        <>
                          <Clock size={13} />
                          Ubah ke Kasbon
                        </>
                      ) : (
                        <>
                          <CheckCircle2 size={13} />
                          Tandai Lunas
                        </>
                      )}
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        aria-label="Edit catatan ini"
                        className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        onClick={() => openEditModal(order)}
                        type="button"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        aria-label="Hapus catatan ini"
                        className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/50"
                        onClick={() => handleDelete(order)}
                        type="button"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Dialog Pelunasan dengan Pilihan Akun Potong Saldo */}
      {orderToPay && (
        <div
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
          role="dialog"
        >
          <div className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2.5">
                <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  <CheckCircle2 size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">Tandai Lunas Pesanan</h3>
                  <p className="text-xs text-muted-foreground">{orderToPay.warung_name}</p>
                </div>
              </div>
              <button
                aria-label="Tutup"
                className="size-8 inline-flex items-center justify-center rounded-lg text-muted-foreground hover:bg-muted"
                onClick={() => setOrderToPay(null)}
                type="button"
              >
                <X size={16} />
              </button>
            </div>

            <div className="py-4 space-y-4">
              <div className="rounded-xl bg-muted/40 p-3.5 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Total Tagihan:</span>
                <span className="text-lg font-black text-[#8f3242] dark:text-[#ffb9c3]">
                  {formatRupiah(orderToPay.total_amount)}
                </span>
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    checked={autoDeductOnPay}
                    className="size-4 rounded border-input text-[#b34455] focus:ring-[#b34455]"
                    onChange={(e) => setAutoDeductOnPay(e.target.checked)}
                    type="checkbox"
                  />
                  <span className="text-xs font-semibold text-foreground">
                    Auto potong saldo dari akun keuangan
                  </span>
                </label>

                {autoDeductOnPay && accounts.length > 0 && (
                  <div className="space-y-1.5 pl-6">
                    <label className="text-[11px] font-medium text-muted-foreground">
                      Pilih Akun Sumber:
                    </label>
                    <select
                      className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs font-medium text-foreground focus:border-[#b34455] focus:outline-none dark:focus:border-[#ffb9c3]"
                      onChange={(e) => setPayAccountId(e.target.value)}
                      value={payAccountId}
                    >
                      {accounts.map((acc) => (
                        <option key={acc.id} value={acc.id}>
                          {acc.name} ({acc.account_type.toUpperCase()})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
              <Button onClick={() => setOrderToPay(null)} type="button" variant="outline">
                Batal
              </Button>
              <Button
                onClick={() =>
                  executeTogglePayment(
                    orderToPay,
                    autoDeductOnPay && payAccountId ? payAccountId : null
                  )
                }
                type="button"
              >
                Konfirmasi Lunas
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Form Tambah/Edit */}
      <WarungFormModal
        accounts={accounts}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaved={handleOrderSaved}
        orderToEdit={orderToEdit}
      />
    </div>
  );
}
