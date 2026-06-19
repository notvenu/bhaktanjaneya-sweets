function readAdminToken(): string | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const raw = window.localStorage.getItem("bas_admin_session");
    if (!raw) return undefined;
    return (JSON.parse(raw) as { token?: string }).token;
  } catch {
    return undefined;
  }
}

export async function uploadCategoryImage(file: File): Promise<string> {
  const token = readAdminToken();
  if (!token) throw new Error("Please log in to the admin panel first.");

  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("/api/admin/upload/category-image", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  let data: { url?: string; error?: string; message?: string } = {};
  try {
    data = (await res.json()) as typeof data;
  } catch {
    // Ignore JSON parse errors; we'll fall back to status text.
  }

  if (!res.ok) {
    throw new Error(
      data.error ?? data.message ?? `Upload failed (HTTP ${res.status})`,
    );
  }
  if (!data.url) throw new Error("Upload failed: missing url");
  return data.url;
}

export async function uploadProductImage(file: File): Promise<string> {
  const token = readAdminToken();
  if (!token) throw new Error("Please log in to the admin panel first.");

  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("/api/admin/upload/product-image", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  let data: { url?: string; error?: string; message?: string } = {};
  try {
    data = (await res.json()) as typeof data;
  } catch {
    // Ignore JSON parse errors; we'll fall back to status text.
  }

  if (!res.ok) {
    throw new Error(
      data.error ?? data.message ?? `Upload failed (HTTP ${res.status})`,
    );
  }
  if (!data.url) throw new Error("Upload failed: missing url");
  return data.url;
}

