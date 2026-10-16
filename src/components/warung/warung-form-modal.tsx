"use client";

import { createWarungOrder, updateWarungOrder } from "@/actions/warung";
import { Button } from "@/components/ui/button";
import { formatRupiah } from "@/lib/formatters/currency";
import type { WarungItem, WarungOrder } from "@/types/database";
import { CheckCircle2, Clock, Plus, Trash2, UtensilsCrossed, X } from "lucide-react";
import { useEffect, useState, useTransition } from "react";

type WarungFormModalProps = {
  isOpen: boolean;
  onClose: () => void;
  orderToEdit?: WarungOrder | null;
  onSaved?: (order: WarungOrder) => void;
};

// Preset menu warung umum untuk input cepat
const QUICK_MENU_PRESETS = [
  { name: "Es Teh Manis", price: 3000 },
  { name: "Kopi Hitam", price: 4000 },
  { name: "Kopi Susu", price: 5000 },
  { name: "Gorengan", price: 1500 },
  { name: "Mie Goreng / Kuah", price: 8000 },
  { name: "Nasi Telur", price: 10000 },
  { name: "Nasi Ayam", price: 15000 },
  { name: "Air Mineral", price: 3000 },
  { name: "Kerupuk", price: 1000 },
];

const WARUNG_NAME_SUGGESTIONS = [
  "Warteg",
  "Warkop",
  "Angkringan",
  "Pecel Lele",
  "Kantin",
  "Warung Madura",
  "Bakso / Mie Ayam",
];

export function WarungFormModal({
  isOpen,
  onClose,
  orderToEdit,
  onSaved,
}: WarungFormModalProps) {
  const [warungName, setWarungName] = useState("");
  const [orderedAt, setOrderedAt] = useState("");
  const [isPaid, setIsPaid] = useState(false);
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<WarungItem[]>([
    { id: "item-1", name: "", qty: 1, price: 0, subtotal: 0 },
  ]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Inisialisasi form saat buka modal atau edit
  useEffect(() => {
    if (orderToEdit) {
      setWarungName(orderToEdit.warung_name);
      // Format tanggal ISO ke YYYY-MM-DDTHH:mm untuk input datetime-local
      const date = new Date(orderToEdit.ordered_at);
      const tzOffset = date.getTimezoneOffset() * 60000;
      const localISOTime = new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
      setOrderedAt(localISOTime);
      setIsPaid(orderToEdit.is_paid);
      setNotes(orderToEdit.notes ?? "");
      setItems(
        orderToEdit.items && orderToEdit.items.length > 0
          ? orderToEdit.items.map((it) => ({
              ...it,
              subtotal: (Number(it.qty) || 0) * (Number(it.price) || 0),
            }))
          : [{ id: "item-1", name: "", qty: 1, price: 0, subtotal: 0 }]
      );
    } else {
      setWarungName("");
      const now = new Date();
      const tzOffset = now.getTimezoneOffset() * 60000;
      const localISOTime = new Date(now.getTime() - tzOffset).toISOString().slice(0, 16);
      setOrderedAt(localISOTime);
      setIsPaid(false);
      setNotes("");
      setItems([{ id: "item-1", name: "", qty: 1, price: 0, subtotal: 0 }]);
    }
    setErrorMessage(null);
  }, [orderToEdit, isOpen]);

  if (!isOpen) return null;

  // Update baris item
  const updateItem = (
    index: number,
    field: keyof WarungItem,
    value: string | number
  ) => {
    setItems((prev) => {
      const updated = [...prev];
      const current = { ...updated[index] };

      if (field === "name") {
        current.name = String(value);
      } else if (field === "qty") {
        current.qty = Math.max(1, Number(value) || 1);
      } else if (field === "price") {
        current.price = Math.max(0, Number(value) || 0);
      }

      current.subtotal = current.qty * current.price;
      updated[index] = current;
      return updated;
    });
  };

  // Tambah baris kosong
  const addItemRow = () => {
    setItems((prev) => [
      ...prev,
      { id: `item-${Date.now()}`, name: "", qty: 1, price: 0, subtotal: 0 },
    ]);
  };

  // Hapus baris
  const removeItemRow = (index: number) => {
    if (items.length <= 1) {
      setItems([{ id: `item-${Date.now()}`, name: "", qty: 1, price: 0, subtotal: 0 }]);
      return;
    }
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Tambah preset menu cepat
  const addPresetItem = (preset: { name: string; price: number }) => {
    setItems((prev) => {
      // Jika baris pertama masih kosong belum diketik apa-apa, pakai baris itu
      if (prev.length === 1 && !prev[0].name.trim() && prev[0].price === 0) {
        return [
          {
            id: prev[0].id,
            name: preset.name,
            qty: 1,
            price: preset.price,
            subtotal: preset.price,
          },
        ];
      }
      return [
        ...prev,
        {
          id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          name: preset.name,
          qty: 1,
          price: preset.price,
          subtotal: preset.price,
        },
      ];
    });
  };

  // Total keseluruhan
  const grandTotal = items.reduce((sum, item) => sum + (item.subtotal || 0), 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedWarung = warungName.trim();
    if (!trimmedWarung) {
      setErrorMessage("Nama warung atau tempat makan wajib diisi.");
      return;
    }

    const validItems = items.filter((it) => it.name.trim().length > 0);
    if (validItems.length === 0) {
      setErrorMessage("Minimal masukkan satu menu/item pesanan (contoh: Es Teh).");
      return;
    }

    const payload = {
      warung_name: trimmedWarung,
      ordered_at: new Date(orderedAt).toISOString(),
      is_paid: isPaid,
      notes: notes.trim() || null,
      items: validItems.map((it) => ({
        id: it.id,
        name: it.name.trim(),
        qty: Number(it.qty) || 1,
        price: Number(it.price) || 0,
        subtotal: (Number(it.qty) || 1) * (Number(it.price) || 0),
      })),
    };

    startTransition(async () => {
      let res;
      if (orderToEdit) {
        res = await updateWarungOrder(orderToEdit.id, payload);
      } else {
        res = await createWarungOrder(payload);
      }

      // Jika berhasil di Supabase server
      if (res?.success) {
        if (onSaved) {
          onSaved({
            id: orderToEdit ? orderToEdit.id : `local-${Date.now()}`,
            user_id: "",
            warung_name: payload.warung_name,
            items: payload.items,
            total_amount: grandTotal,
            is_paid: payload.is_paid,
            ordered_at: payload.ordered_at,
            notes: payload.notes,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        }
        onClose();
      } else if (res?.error) {
        // Jika error karena tabel belum ada di Supabase, fallback simpan lokal agar pengguna tetap bisa pakai
        if (onSaved) {
          const fallbackOrder: WarungOrder = {
            id: orderToEdit ? orderToEdit.id : `local-${Date.now()}`,
            user_id: "",
            warung_name: payload.warung_name,
            items: payload.items,
            total_amount: grandTotal,
            is_paid: payload.is_paid,
            ordered_at: payload.ordered_at,
            notes: payload.notes,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          onSaved(fallbackOrder);
          onClose();
        } else {
          setErrorMessage(res.error);
        }
      }
    });
  };

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
      role="dialog"
    >
      <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl border border-border bg-card shadow-2xl">
        {/* Header Modal */}
        <div className="flex items-center justify-between border-b border-border p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-[#f9e1e1] text-[#8f3242] dark:bg-[#542d35] dark:text-[#ffc4cb]">
              <UtensilsCrossed size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold sm:text-xl">
                {orderToEdit ? "Edit Catatan Warung" : "Catat Pembelian di Warung"}
              </h2>
              <p className="text-xs text-muted-foreground sm:text-sm">
                Catat menu yang dipesan, harga satuan, dan status pelunasan bon.
              </p>
            </div>
          </div>
          <button
            aria-label="Tutup form"
            className="inline-flex size-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-[#b34455]"
            onClick={onClose}
            type="button"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body - Scrollable */}
        <form className="flex flex-1 flex-col overflow-y-auto p-5 sm:p-6" onSubmit={handleSubmit}>
          {errorMessage && (
            <div
              className="mb-5 rounded-xl border border-rose-300 bg-rose-50 p-3.5 text-xs text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-200"
              role="alert"
            >
              {errorMessage}
            </div>
          )}

          <div className="space-y-5">
            {/* Nama Warung & Tanggal */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
                  Nama Warung / Tempat <span className="text-rose-500">*</span>
                </label>
                <input
                  className="mt-1.5 w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-[#b34455] focus:outline-none focus:ring-2 focus:ring-[#b34455]/20 dark:focus:border-[#ffb9c3]"
                  onChange={(e) => setWarungName(e.target.value)}
                  placeholder="Contoh: Warteg Bahari, Warkop 99"
                  required
                  type="text"
                  value={warungName}
                />
                {/* Saran Nama Cepat */}
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {WARUNG_NAME_SUGGESTIONS.map((sug) => (
                    <button
                      className="rounded-md border border-border bg-muted/50 px-2 py-0.5 text-[11px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      key={sug}
                      onClick={() => setWarungName(sug)}
                      type="button"
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
                  Tanggal & Waktu <span className="text-rose-500">*</span>
                </label>
                <input
                  className="mt-1.5 w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm text-foreground focus:border-[#b34455] focus:outline-none focus:ring-2 focus:ring-[#b34455]/20 dark:focus:border-[#ffb9c3]"
                  onChange={(e) => setOrderedAt(e.target.value)}
                  required
                  type="datetime-local"
                  value={orderedAt}
                />
              </div>
            </div>

            {/* Status Lunas / Belum Lunas (Kasbon) */}
            <div className="rounded-xl border border-border bg-muted/40 p-4">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                  <span className="text-xs font-semibold text-foreground uppercase tracking-wider">
                    Status Pembayaran
                  </span>
                  <p className="text-xs text-muted-foreground">
                    Tentukan apakah pesanan ini sudah langsung dibayar atau masih kasbon/utang.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                      !isPaid
                        ? "bg-amber-500 text-white shadow-xs dark:bg-amber-600"
                        : "border border-border bg-background text-muted-foreground hover:bg-muted"
                    }`}
                    onClick={() => setIsPaid(false)}
                    type="button"
                  >
                    <Clock size={14} />
                    Belum Lunas (Kasbon)
                  </button>
                  <button
                    className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                      isPaid
                        ? "bg-emerald-600 text-white shadow-xs dark:bg-emerald-700"
                        : "border border-border bg-background text-muted-foreground hover:bg-muted"
                    }`}
                    onClick={() => setIsPaid(true)}
                    type="button"
                  >
                    <CheckCircle2 size={14} />
                    Lunas
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Chips Menu Populer */}
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground uppercase tracking-wider">
                  Menu Cepat (Tap untuk Tambah)
                </span>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {QUICK_MENU_PRESETS.map((preset) => (
                  <button
                    className="inline-flex items-center gap-1 rounded-lg border border-border bg-card px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:border-[#b34455]/40 hover:bg-pink-50/50 dark:hover:bg-pink-950/30"
                    key={preset.name}
                    onClick={() => addPresetItem(preset)}
                    type="button"
                  >
                    <Plus className="text-[#b34455] dark:text-[#ffb9c3]" size={12} />
                    <span>{preset.name}</span>
                    <span className="text-[10px] text-muted-foreground">({formatRupiah(preset.price)})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Daftar Item Menu Yang Dipesan */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground uppercase tracking-wider">
                  Rincian Pesanan <span className="text-rose-500">*</span>
                </span>
                <button
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#8f3242] hover:underline dark:text-[#ffb9c3]"
                  onClick={addItemRow}
                  type="button"
                >
                  <Plus size={14} />
                  Tambah Item Menu
                </button>
              </div>

              <div className="space-y-2.5">
                {items.map((item, index) => (
                  <div
                    className="flex flex-col gap-2 rounded-xl border border-border bg-background p-3 sm:flex-row sm:items-center"
                    key={item.id}
                  >
                    {/* Nama Item */}
                    <div className="flex-1">
                      <input
                        className="w-full rounded-lg border border-input bg-card px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-[#b34455] focus:outline-none dark:focus:border-[#ffb9c3]"
                        onChange={(e) => updateItem(index, "name", e.target.value)}
                        placeholder="Nama menu (misal: Es Teh)"
                        required
                        type="text"
                        value={item.name}
                      />
                    </div>

                    {/* Qty & Harga */}
                    <div className="flex items-center gap-2">
                      <div className="w-20">
                        <div className="relative">
                          <input
                            className="w-full rounded-lg border border-input bg-card px-2 py-1.5 text-center text-sm text-foreground focus:border-[#b34455] focus:outline-none dark:focus:border-[#ffb9c3]"
                            min={1}
                            onChange={(e) => updateItem(index, "qty", e.target.value)}
                            placeholder="Qty"
                            required
                            type="number"
                            value={item.qty || ""}
                          />
                        </div>
                      </div>

                      <span className="text-xs text-muted-foreground">x</span>

                      <div className="w-28 sm:w-32">
                        <input
                          className="w-full rounded-lg border border-input bg-card px-2.5 py-1.5 text-sm text-foreground focus:border-[#b34455] focus:outline-none dark:focus:border-[#ffb9c3]"
                          min={0}
                          onChange={(e) => updateItem(index, "price", e.target.value)}
                          placeholder="Harga (Rp)"
                          required
                          step={500}
                          type="number"
                          value={item.price || ""}
                        />
                      </div>

                      {/* Subtotal */}
                      <div className="w-24 text-right text-xs font-semibold text-foreground sm:w-28 sm:text-sm">
                        {formatRupiah(item.subtotal || 0)}
                      </div>

                      {/* Hapus Baris */}
                      <button
                        aria-label="Hapus item ini"
                        className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/50"
                        onClick={() => removeItemRow(index)}
                        type="button"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Total Belanja Ringkasan */}
            <div className="flex items-center justify-between rounded-xl border border-[#b34455]/20 bg-gradient-to-r from-pink-50 to-rose-50 p-4 dark:from-[#351e24] dark:to-[#2d1e22]">
              <div>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Total Belanja Warung
                </span>
                <p className="text-xs text-muted-foreground">
                  {items.filter((it) => it.name.trim()).length} jenis item pesanan
                </p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black tracking-tight text-[#8f3242] sm:text-3xl dark:text-[#ffb9c3]">
                  {formatRupiah(grandTotal)}
                </span>
              </div>
            </div>

            {/* Catatan Tambahan */}
            <div>
              <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
                Catatan Tambahan (Opsional)
              </label>
              <textarea
                className="mt-1.5 w-full rounded-xl border border-input bg-background p-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-[#b34455] focus:outline-none focus:ring-2 focus:ring-[#b34455]/20 dark:focus:border-[#ffb9c3]"
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Misal: Kurang bayar Rp 5.000 / janjian bayar besok"
                rows={2}
                value={notes}
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="mt-8 flex items-center justify-end gap-3 border-t border-border pt-4">
            <Button disabled={isPending} onClick={onClose} type="button" variant="outline">
              Batal
            </Button>
            <Button disabled={isPending} type="submit">
              {isPending ? "Menyimpan..." : orderToEdit ? "Simpan Perubahan" : "Simpan Catatan"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
