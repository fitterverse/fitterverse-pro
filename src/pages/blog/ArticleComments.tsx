// src/pages/blog/ArticleComments.tsx
import React from "react";
import {
  addDoc,
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

type Props = { hubId: string; slug: string };
type Comment = { id: string; name?: string; message: string; createdAt?: any };

export default function ArticleComments({ hubId, slug }: Props) {
  const colPath = `posts/${hubId}__${slug}/comments`;

  const [items, setItems] = React.useState<Comment[]>([]);
  const [name, setName] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const hpRef = React.useRef<HTMLInputElement>(null); // honeypot

  React.useEffect(() => {
    const qy = query(collection(db, colPath), orderBy("createdAt", "desc"), limit(25));
    const unsub = onSnapshot(qy, (snap) => {
      const rows: Comment[] = [];
      snap.forEach((d) => rows.push({ id: d.id, ...(d.data() as any) }));
      setItems(rows);
    });
    return () => unsub();
  }, [colPath]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (hpRef.current?.value) return; // bot

    const msg = message.trim();
    if (!msg) return setError("Please write a short comment.");
    if (msg.length > 1000) return setError("Comment is too long (max 1000 chars).");

    setSubmitting(true);
    try {
      await addDoc(collection(db, colPath), {
        hub: hubId,
        slug,
        name: name.trim().slice(0, 60) || null,
        message: msg,
        createdAt: serverTimestamp(),
      });
      setName("");
      setMessage("");
    } catch (err: any) {
      setError(err?.message || "Could not submit comment.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="article-cta" style={{ marginTop: 28 }}>
      <h3 className="font-semibold">Tell us how it went</h3>
      <p className="text-slate-600 text-sm" style={{ marginTop: 6 }}>
        Tried this plan? Which move challenged you most this week?
      </p>

      <form onSubmit={submit} className="mt-3 space-y-2">
        {/* Honeypot to reduce spam */}
        <input
          ref={hpRef}
          type="text"
          name="website"
          autoComplete="off"
          tabIndex={-1}
          aria-hidden="true"
          style={{ position: "absolute", left: "-10000px", width: 1, height: 1 }}
        />
        <div>
          <label className="block text-sm text-slate-600">Name (optional)</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-sky-500"
            placeholder="Your name"
          />
        </div>
        <div>
          <label className="block text-sm text-slate-600">Comment</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-sky-500"
            rows={4}
            maxLength={1000}
            placeholder="Share what worked, what didn’t, or your tweak…"
            required
          />
          <div className="mt-1 text-xs text-slate-500">{message.length}/1000</div>
        </div>
        {error && (
          <div className="rounded-md border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </div>
        )}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-xl bg-teal-500 px-4 py-2 font-medium text-black hover:bg-teal-400 disabled:opacity-60"
          >
            {submitting ? "Posting…" : "Post comment"}
          </button>
        </div>
      </form>

      {items.length > 0 && (
        <div className="mt-5">
          <h4 className="font-semibold">Recent comments</h4>
          <ul className="mt-2 space-y-3">
            {items.map((c) => (
              <li key={c.id} className="rounded-lg border border-slate-200 p-3 bg-white">
                <div className="text-sm">
                  <span className="font-medium">{c.name || "Anonymous"}</span>
                  <span className="text-slate-500">
                    {" "}
                    • {c.createdAt?.toDate?.().toLocaleString?.() || "just now"}
                  </span>
                </div>
                <p className="mt-1 text-slate-800">{c.message}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
