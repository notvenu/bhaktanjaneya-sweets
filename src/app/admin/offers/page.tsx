"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, BadgePercent } from "lucide-react";
import { useAdmin } from "@/context/AdminContext";
import {
  AdminButton,
  EmptyState,
  Field,
  Modal,
  Toggle,
  inputClass,
} from "@/components/admin/ui";
import { Badge } from "@/components/ui/Badge";
import { formatINR, uid } from "@/lib/utils";
import type { Offer, OfferType } from "@/lib/types";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { toast } from "@/components/ui/toast";

const TYPE_LABEL: Record<OfferType, string> = {
  percent: "% off",
  flat: "Flat ₹ off",
  free_shipping: "Free shipping",
};

function offerValueLabel(o: Offer): string {
  if (o.type === "percent") return `${o.value}% off`;
  if (o.type === "flat") return `${formatINR(o.value)} off`;
  return "Free shipping";
}

function OfferEditor({
  offer,
  onSave,
  onClose,
}: {
  offer: Offer | null;
  onSave: (o: Offer) => void;
  onClose: () => void;
}) {
  const isNew = !offer;
  const [draft, setDraft] = useState<Offer>(
    offer ?? {
      id: uid("off"),
      code: "",
      title: "",
      description: "",
      type: "percent",
      value: 10,
      minSubtotal: undefined,
      active: true,
    },
  );
  const [error, setError] = useState("");

  function save() {
    const code = draft.code.trim().toUpperCase();
    const title = draft.title.trim();
    if (!code) return setError("A coupon code is required.");
    if (!title) return setError("A title is required.");
    if (draft.type !== "free_shipping" && draft.value <= 0)
      return setError("Enter a discount value greater than zero.");

    onSave({
      ...draft,
      code,
      title,
      description: draft.description?.trim() || undefined,
      value: draft.type === "free_shipping" ? 0 : Number(draft.value),
      minSubtotal: draft.minSubtotal ? Number(draft.minSubtotal) : undefined,
    });
  }

  return (
    <Modal
      title={isNew ? "Add offer" : "Edit offer"}
      onClose={onClose}
      footer={
        <>
          <AdminButton variant="ghost" onClick={onClose}>
            Cancel
          </AdminButton>
          <AdminButton onClick={save}>{isNew ? "Create" : "Save"}</AdminButton>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Coupon code">
            <input
              className={`${inputClass} uppercase`}
              value={draft.code}
              onChange={(e) => setDraft((d) => ({ ...d, code: e.target.value }))}
              placeholder="BAS10"
            />
          </Field>

          <Field label="Type">
            <select
              className={inputClass}
              value={draft.type}
              onChange={(e) =>
                setDraft((d) => ({ ...d, type: e.target.value as OfferType }))
              }
            >
              <option value="percent">Percent off</option>
              <option value="flat">Flat ₹ off</option>
              <option value="free_shipping">Free shipping</option>
            </select>
          </Field>
        </div>

        <Field label="Title">
          <input
            className={inputClass}
            value={draft.title}
            onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
            placeholder="10% off your order"
          />
        </Field>

        <Field label="Description">
          <input
            className={inputClass}
            value={draft.description ?? ""}
            onChange={(e) =>
              setDraft((d) => ({ ...d, description: e.target.value }))
            }
            placeholder="Save 10% on orders above ₹500."
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          {draft.type !== "free_shipping" && (
            <Field
              label={draft.type === "percent" ? "Percent (0–100)" : "Amount (₹)"}
            >
              <input
                className={inputClass}
                type="number"
                min={0}
                value={draft.value || ""}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, value: Number(e.target.value) }))
                }
              />
            </Field>
          )}

          <Field label="Min. subtotal (₹)" hint="Leave blank for none.">
            <input
              className={inputClass}
              type="number"
              min={0}
              value={draft.minSubtotal ?? ""}
              onChange={(e) =>
                setDraft((d) => ({
                  ...d,
                  minSubtotal: e.target.value
                    ? Number(e.target.value)
                    : undefined,
                }))
              }
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Starts (optional)">
            <input
              className={inputClass}
              type="date"
              value={draft.startsAt?.slice(0, 10) ?? ""}
              onChange={(e) =>
                setDraft((d) => ({
                  ...d,
                  startsAt: e.target.value || undefined,
                }))
              }
            />
          </Field>

          <Field label="Ends (optional)">
            <input
              className={inputClass}
              type="date"
              value={draft.endsAt?.slice(0, 10) ?? ""}
              onChange={(e) =>
                setDraft((d) => ({
                  ...d,
                  endsAt: e.target.value || undefined,
                }))
              }
            />
          </Field>
        </div>

        <Toggle
          checked={draft.active}
          onChange={(v) => setDraft((d) => ({ ...d, active: v }))}
          label={draft.active ? "Active" : "Inactive"}
        />

        {error ? <p className="text-sm text-maroon-700">{error}</p> : null}
      </div>
    </Modal>
  );
}

export default function AdminOffersPage() {
  const { offers, saveOffer, deleteOffer } = useAdmin();
  const [editing, setEditing] = useState<Offer | null>(null);
  const [creating, setCreating] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [confirmCode, setConfirmCode] = useState<string | null>(null);

  function requestDelete(o: Offer) {
    setConfirmId(o.id);
    setConfirmCode(o.code);
    setConfirmOpen(true);
  }

  async function confirmDelete() {
    if (!confirmId) return;
    const id = confirmId;
    const code = confirmCode;
    setConfirmOpen(false);

    try {
      await deleteOffer(id);
      toast({
        tone: "success",
        title: "Offer deleted",
        message: code ? `Offer ${code} removed.` : "Offer removed.",
      });
    } catch (err) {
      toast({
        tone: "error",
        title: "Delete failed",
        message: err instanceof Error ? err.message : "Please try again.",
      });
    } finally {
      setConfirmId(null);
      setConfirmCode(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl font-bold text-maroon-900">Offers</h1>
          <p className="text-sm text-ink-500">
            Coupon codes customers can apply at checkout.
          </p>
        </div>

        <AdminButton onClick={() => setCreating(true)}>
          <Plus size={16} /> Add offer
        </AdminButton>
      </div>

      {offers.length === 0 ? (
        <EmptyState
          icon={<BadgePercent size={26} />}
          title="No offers yet"
          text="Create a coupon code to run a promotion."
        />
      ) : (
        <div className="md:overflow-hidden md:rounded-2xl md:border md:border-cream-200 md:bg-white">
          <div className="md:overflow-x-auto">
            <table className="admin-table w-full text-sm">
              <thead>
                <tr className="border-b border-cream-200 text-left text-xs uppercase tracking-wide text-ink-400">
                  <th className="px-4 py-3 font-medium">Code</th>
                  <th className="px-4 py-3 font-medium">Title</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Discount</th>
                  <th className="px-4 py-3 font-medium">Min.</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-cream-200">
                {offers.map((o) => (
                  <tr key={o.id} className="hover:bg-cream-50">
                    <td className="px-4 py-3">
                      <span className="rounded-md bg-cream-100 px-2 py-1 font-mono text-xs font-bold text-maroon-800">
                        {o.code}
                      </span>
                    </td>
                    <td data-label="Title" className="px-4 py-3 text-ink-700">{o.title}</td>
                    <td data-label="Type" className="px-4 py-3 text-ink-500">{TYPE_LABEL[o.type]}</td>
                    <td data-label="Discount" className="px-4 py-3 font-medium text-maroon-900">
                      {offerValueLabel(o)}
                    </td>
                    <td data-label="Min." className="px-4 py-3 text-ink-500">
                      {o.minSubtotal ? formatINR(o.minSubtotal) : "—"}
                    </td>
                    <td data-label="Status" className="px-4 py-3">
                      <Badge tone={o.active ? "leaf" : "muted"}>
                        {o.active ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td data-label="Actions" className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => setEditing(o)}
                          aria-label={`Edit ${o.code}`}
                          className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-500 hover:bg-cream-100 hover:text-maroon-800"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => requestDelete(o)}
                          aria-label={`Delete ${o.code}`}
                          className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-500 hover:bg-maroon-700/5 hover:text-maroon-700"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {(editing || creating) && (
        <OfferEditor
          offer={editing}
          onSave={(o) => {
            saveOffer(o);
            setEditing(null);
            setCreating(false);
          }}
          onClose={() => {
            setEditing(null);
            setCreating(false);
          }}
        />
      )}

      <ConfirmDialog
        open={confirmOpen}
        title="Delete offer?"
        description={confirmCode ? `Are you sure you want to delete ${confirmCode}?` : undefined}
        confirmLabel="Delete"
        tone="danger"
        onCancel={() => {
          setConfirmOpen(false);
          setConfirmId(null);
          setConfirmCode(null);
        }}
        onConfirm={() => void confirmDelete()}
      />
    </div>
  );
}

