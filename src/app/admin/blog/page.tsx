"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Newspaper } from "lucide-react";
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
import { formatDate, uid, betterSlugify } from "@/lib/utils";
import type { Post } from "@/lib/types";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { toast } from "@/components/ui/toast";

function PostEditor({
  post,
  onSave,
  onClose,
}: {
  post: Post | null;
  onSave: (p: Post) => void;
  onClose: () => void;
}) {
  const isNew = !post;
  const [draft, setDraft] = useState<Post>(
    post ?? {
      id: uid("post"),
      slug: "",
      title: "",
      excerpt: "",
      author: "Bhaktanjaneya Sweets",
      cover: "/images/categories/sweets.svg",
      date: new Date().toISOString().slice(0, 10),
      readMinutes: 3,
      content: [],
      active: true,
    },
  );
  // Paragraphs are edited as plain text, one blank line between paragraphs.
  const [bodyText, setBodyText] = useState(draft.content.join("\n\n"));
  const [error, setError] = useState("");

  function set<K extends keyof Post>(key: K, value: Post[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  function save() {
    const title = draft.title.trim();
    if (!title) return setError("A title is required.");
    const content = bodyText
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(Boolean);
    if (content.length === 0) return setError("Add at least one paragraph of content.");

    onSave({
      ...draft,
      title,
      slug: draft.slug.trim() ? betterSlugify(draft.slug) : betterSlugify(title),
      excerpt: draft.excerpt.trim(),
      author: draft.author.trim() || "Bhaktanjaneya Sweets",
      cover: draft.cover.trim() || "/images/categories/sweets.svg",
      readMinutes: Number(draft.readMinutes) || 3,
      content,
    });
  }

  return (
    <Modal
      wide
      title={isNew ? "Add post" : "Edit post"}
      onClose={onClose}
      footer={
        <>
          <AdminButton variant="ghost" onClick={onClose}>
            Cancel
          </AdminButton>
          <AdminButton onClick={save}>{isNew ? "Create post" : "Save changes"}</AdminButton>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Title">
            <input
              className={inputClass}
              value={draft.title}
              onChange={(e) => {
                const title = e.target.value;
                setDraft((d) => ({
                  ...d,
                  title,
                  slug: isNew && !d.slug ? betterSlugify(title) : d.slug,
                }));
              }}
              placeholder="Why we make everything in pure ghee"
            />
          </Field>
          <Field label="Slug" hint="Used in the post URL.">
            <input
              className={inputClass}
              value={draft.slug}
              onChange={(e) => set("slug", e.target.value)}
              placeholder="why-we-make-everything-in-pure-ghee"
            />
          </Field>
        </div>

        <Field label="Excerpt" hint="Short summary shown on cards and search results.">
          <textarea
            className={`${inputClass} h-auto py-2`}
            rows={2}
            value={draft.excerpt}
            onChange={(e) => set("excerpt", e.target.value)}
            placeholder="Pure ghee is more than tradition — it is the secret to flavour and texture."
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Author">
            <input
              className={inputClass}
              value={draft.author}
              onChange={(e) => set("author", e.target.value)}
            />
          </Field>
          <Field label="Date">
            <input
              className={inputClass}
              type="date"
              value={draft.date?.slice(0, 10) ?? ""}
              onChange={(e) => set("date", e.target.value)}
            />
          </Field>
          <Field label="Read time (min)">
            <input
              className={inputClass}
              type="number"
              min={1}
              value={draft.readMinutes || ""}
              onChange={(e) => set("readMinutes", Number(e.target.value))}
            />
          </Field>
        </div>

        <Field label="Cover image URL">
          <input
            className={inputClass}
            value={draft.cover}
            onChange={(e) => set("cover", e.target.value)}
            placeholder="/images/categories/sweets.svg or https://…"
          />
        </Field>

        <Field label="Content" hint="Separate paragraphs with a blank line.">
          <textarea
            className={`${inputClass} h-auto py-2`}
            rows={8}
            value={bodyText}
            onChange={(e) => setBodyText(e.target.value)}
            placeholder={"First paragraph…\n\nSecond paragraph…"}
          />
        </Field>

        <Toggle
          checked={draft.active}
          onChange={(v) => set("active", v)}
          label={draft.active ? "Published (visible)" : "Draft (hidden)"}
        />

        {error ? <p className="text-sm text-maroon-700">{error}</p> : null}
      </div>
    </Modal>
  );
}

export default function AdminBlogPage() {
  const { posts, savePost, deletePost } = useAdmin();
  const [editing, setEditing] = useState<Post | null>(null);
  const [creating, setCreating] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [confirmTitle, setConfirmTitle] = useState<string | null>(null);

  function requestDelete(p: Post) {
    setConfirmId(p.id);
    setConfirmTitle(p.title);
    setConfirmOpen(true);
  }

  async function confirmDelete() {
    if (!confirmId) return;
    const id = confirmId;
    const title = confirmTitle;
    setConfirmOpen(false);
    try {
      await deletePost(id);
      toast({ tone: "success", title: "Post deleted", message: title ? `“${title}” removed.` : "Post removed." });
    } catch (err) {
      toast({
        tone: "error",
        title: "Delete failed",
        message: err instanceof Error ? err.message : "Please try again.",
      });
    } finally {
      setConfirmId(null);
      setConfirmTitle(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl font-bold text-maroon-900">Blog</h1>
          <p className="text-sm text-ink-500">
            Articles shown on the storefront <span className="text-ink-400">/blog</span> page.
          </p>
        </div>

        <AdminButton onClick={() => setCreating(true)}>
          <Plus size={16} /> Add post
        </AdminButton>
      </div>

      {posts.length === 0 ? (
        <EmptyState
          icon={<Newspaper size={26} />}
          title="No posts yet"
          text="Write your first article, or run migration 009 to enable saving posts to the database."
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-cream-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-cream-200 text-left text-xs uppercase tracking-wide text-ink-400">
                  <th className="px-4 py-3 font-medium">Title</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Read</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-200">
                {posts.map((p) => (
                  <tr key={p.id} className="hover:bg-cream-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-maroon-900">{p.title}</div>
                      <div className="text-xs text-ink-400">/blog/{p.slug}</div>
                    </td>
                    <td className="px-4 py-3 text-ink-500">{p.date ? formatDate(p.date) : "—"}</td>
                    <td className="px-4 py-3 text-ink-500">{p.readMinutes} min</td>
                    <td className="px-4 py-3">
                      <Badge tone={p.active ? "leaf" : "muted"}>
                        {p.active ? "Published" : "Draft"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => setEditing(p)}
                          aria-label={`Edit ${p.title}`}
                          className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-500 hover:bg-cream-100 hover:text-maroon-800"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => requestDelete(p)}
                          aria-label={`Delete ${p.title}`}
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
        <PostEditor
          post={editing}
          onSave={(p) => {
            savePost(p);
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
        title="Delete post?"
        description={confirmTitle ? `Are you sure you want to delete “${confirmTitle}”?` : undefined}
        confirmLabel="Delete"
        tone="danger"
        onCancel={() => {
          setConfirmOpen(false);
          setConfirmId(null);
          setConfirmTitle(null);
        }}
        onConfirm={() => void confirmDelete()}
      />
    </div>
  );
}
