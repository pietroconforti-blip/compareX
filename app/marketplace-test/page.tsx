"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { createClient } from "@/lib/supabase";

type Listing = {
  id: string;
  category: string;
  listing_type: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  price_period: string;
  country: string | null;
  city: string | null;
  condition: string | null;
  created_at: string;
};

const categories = [
  { value: "housing", label: "Case e stanze" },
  { value: "cars", label: "Auto e veicoli" },
  { value: "clothing", label: "Vestiti e accessori" },
  { value: "electronics", label: "Elettronica" },
  { value: "other", label: "Altro" },
];

const emptyForm = {
  category: "electronics",
  listing_type: "sale",
  title: "",
  description: "",
  price: "",
  price_period: "once",
  country: "Austria",
  city: "",
  condition: "good",
};

export default function MarketplaceTestPage() {
  const supabase = useMemo(() => createClient(), []);

  const [session, setSession] = useState<any>(null);
  const [authReady, setAuthReady] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadListings = useCallback(async () => {
    setLoading(true);
    const { data, error: queryError } = await supabase
      .from("listings")
      .select(
        "id,category,listing_type,title,description,price,currency,price_period,country,city,condition,created_at"
      )
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(30);

    if (queryError) {
      setError("Non riesco a caricare gli annunci: " + queryError.message);
    } else {
      setListings((data ?? []) as Listing[]);
    }

    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (mounted) {
        setSession(data.session);
        setAuthReady(true);
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
        setAuthReady(true);
      }
    );

    loadListings();

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [supabase, loadListings]);

  async function handleAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (isSignup) {
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) {
        setError(authError.message);
      } else if (!data.session) {
        setMessage(
          "Registrazione avviata! Controlla la tua email per confermare l'account, poi accedi."
        );
      } else {
        setMessage("Account creato con successo!");
      }
    } else {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) setError(authError.message);
      else setMessage("Accesso effettuato!");
    }
  }

  async function handleLogout() {
    const { error: logoutError } = await supabase.auth.signOut();
    if (logoutError) setError(logoutError.message);
    else setMessage("Hai effettuato la disconnessione.");
  }

  async function handlePublish(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!session?.user?.id) {
      setError("Devi prima accedere al tuo account.");
      return;
    }

    if (Number(form.price) < 0 || form.price.trim() === "") {
      setError("Inserisci un prezzo valido.");
      return;
    }

    setSaving(true);

    const { error: insertError } = await supabase.from("listings").insert({
      user_id: session.user.id,
      category: form.category,
      listing_type: form.listing_type,
      title: form.title.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      currency: "EUR",
      price_period:
        form.listing_type === "sale" ? "once" : form.price_period,
      country: form.country.trim() || null,
      city: form.city.trim() || null,
      condition: form.category === "housing" ? null : form.condition || null,
      status: "active",
    });

    setSaving(false);

    if (insertError) {
      setError("Annuncio non pubblicato: " + insertError.message);
      return;
    }

    setMessage("Annuncio pubblicato con successo!");
    setForm(emptyForm);
    await loadListings();
  }

  function updateForm(field: string, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  const categoryLabel = (value: string) =>
    categories.find((category) => category.value === value)?.label ?? value;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-blue-700">
              CompareX Marketplace
            </p>
            <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
              Compra, vendi, affitta.
            </h1>
            <p className="mt-2 text-slate-600">
              Trova offerte o pubblica il tuo annuncio.
            </p>
          </div>
          {session && (
            <button
              onClick={handleLogout}
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-white"
            >
              Esci
            </button>
          )}
        </header>

        {message && (
          <div className="mb-5 rounded-xl border border-green-200 bg-green-50 p-4 text-green-800">
            {message}
          </div>
        )}
        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        {!authReady ? (
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            Controllo dell'accesso...
          </div>
        ) : (
          <>
            {!session ? (
              <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-bold">
                  {isSignup ? "Crea il tuo account" : "Accedi a CompareX"}
                </h2>
                <p className="mb-5 mt-1 text-sm text-slate-600">
                  Per pubblicare un annuncio devi essere registrato.
                </p>

                <form onSubmit={handleAuth} className="grid gap-4 sm:max-w-lg">
                  <label className="grid gap-1 text-sm font-medium">
                    Email
                    <input
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      className="rounded-xl border border-slate-300 px-3 py-3"
                      placeholder="tu@email.com"
                    />
                  </label>

                  <label className="grid gap-1 text-sm font-medium">
                    Password (almeno 6 caratteri)
                    <input
                      type="password"
                      required
                      minLength={6}
                      autoComplete={isSignup ? "new-password" : "current-password"}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      className="rounded-xl border border-slate-300 px-3 py-3"
                      placeholder="La tua password"
                    />
                  </label>

                  <button
                    type="submit"
                    className="rounded-xl bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800"
                  >
                    {isSignup ? "Registrati" : "Accedi"}
                  </button>
                </form>

                <button
                  type="button"
                  onClick={() => {
                    setIsSignup(!isSignup);
                    setError("");
                    setMessage("");
                  }}
                  className="mt-4 text-sm font-medium text-blue-700 underline"
                >
                  {isSignup
                    ? "Hai già un account? Accedi"
                    : "Non hai un account? Registrati"}
                </button>
              </section>
            ) : (
              <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="mb-1 text-xl font-bold">Pubblica un annuncio</h2>
                <p className="mb-5 text-sm text-slate-600">
                  Connesso come {session.user.email}
                </p>

                <form onSubmit={handlePublish} className="grid gap-4 sm:grid-cols-2">
                  <label className="grid gap-1 text-sm font-medium">
                    Categoria
                    <select
                      value={form.category}
                      onChange={(event) => updateForm("category", event.target.value)}
                      className="rounded-xl border border-slate-300 bg-white px-3 py-3"
                    >
                      {categories.map((category) => (
                        <option key={category.value} value={category.value}>
                          {category.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="grid gap-1 text-sm font-medium">
                    Tipo di annuncio
                    <select
                      value={form.listing_type}
                      onChange={(event) => {
                        const value = event.target.value;
                        setForm((current) => ({
                          ...current,
                          listing_type: value,
                          price_period: value === "sale" ? "once" : "month",
                        }));
                      }}
                      className="rounded-xl border border-slate-300 bg-white px-3 py-3"
                    >
                      <option value="sale">In vendita</option>
                      <option value="rent">In affitto</option>
                    </select>
                  </label>

                  <label className="grid gap-1 text-sm font-medium sm:col-span-2">
                    Titolo
                    <input
                      required
                      minLength={3}
                      maxLength={120}
                      value={form.title}
                      onChange={(event) => updateForm("title", event.target.value)}
                      className="rounded-xl border border-slate-300 px-3 py-3"
                      placeholder="Es. Stanza singola vicino all'università"
                    />
                  </label>

                  <label className="grid gap-1 text-sm font-medium sm:col-span-2">
                    Descrizione
                    <textarea
                      required
                      minLength={10}
                      maxLength={5000}
                      rows={5}
                      value={form.description}
                      onChange={(event) => updateForm("description", event.target.value)}
                      className="rounded-xl border border-slate-300 px-3 py-3"
                      placeholder="Descrivi le caratteristiche e le condizioni..."
                    />
                  </label>

                  <label className="grid gap-1 text-sm font-medium">
                    Prezzo (€)
                    <input
                      required
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.price}
                      onChange={(event) => updateForm("price", event.target.value)}
                      className="rounded-xl border border-slate-300 px-3 py-3"
                      placeholder="Es. 450"
                    />
                  </label>

                  {form.listing_type === "rent" && (
                    <label className="grid gap-1 text-sm font-medium">
                      Prezzo per
                      <select
                        value={form.price_period}
                        onChange={(event) => updateForm("price_period", event.target.value)}
                        className="rounded-xl border border-slate-300 bg-white px-3 py-3"
                      >
                        <option value="day">Giorno</option>
                        <option value="week">Settimana</option>
                        <option value="month">Mese</option>
                        <option value="year">Anno</option>
                      </select>
                    </label>
                  )}

                  <label className="grid gap-1 text-sm font-medium">
                    Paese
                    <select
                      value={form.country}
                      onChange={(event) => updateForm("country", event.target.value)}
                      className="rounded-xl border border-slate-300 bg-white px-3 py-3"
                    >
                      <option value="Austria">Austria</option>
                      <option value="Italy">Italia</option>
                      <option value="Germany">Germania</option>
                      <option value="Other">Altro</option>
                    </select>
                  </label>

                  <label className="grid gap-1 text-sm font-medium">
                    Città
                    <input
                      value={form.city}
                      onChange={(event) => updateForm("city", event.target.value)}
                      className="rounded-xl border border-slate-300 px-3 py-3"
                      placeholder="Es. Vienna"
                    />
                  </label>

                  {form.category !== "housing" && (
                    <label className="grid gap-1 text-sm font-medium">
                      Condizione
                      <select
                        value={form.condition}
                        onChange={(event) => updateForm("condition", event.target.value)}
                        className="rounded-xl border border-slate-300 bg-white px-3 py-3"
                      >
                        <option value="new">Nuovo</option>
                        <option value="like_new">Come nuovo</option>
                        <option value="good">Buone condizioni</option>
                        <option value="fair">Condizioni discrete</option>
                        <option value="used">Usato</option>
                      </select>
                    </label>
                  )}

                  <div className="sm:col-span-2">
                    <button
                      type="submit"
                      disabled={saving}
                      className="w-full rounded-xl bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800 disabled:opacity-50 sm:w-auto"
                    >
                      {saving ? "Pubblicazione..." : "Pubblica annuncio"}
                    </button>
                  </div>
                </form>
              </section>
            )}
          </>
        )}

        <section>
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold">Ultimi annunci</h2>
              <p className="text-sm text-slate-600">
                Gli annunci attivi salvati su CompareX.
              </p>
            </div>
            <button
              onClick={loadListings}
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm hover:bg-slate-100"
            >
              Aggiorna
            </button>
          </div>

          {loading ? (
            <p className="rounded-xl bg-white p-5">Caricamento annunci...</p>
          ) : listings.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
              <p className="font-semibold">Ancora nessun annuncio</p>
              <p className="mt-1 text-sm text-slate-600">
                Registrati e pubblica il primo annuncio!
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {listings.map((listing) => (
                <article
                  key={listing.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="mb-3 flex flex-wrap gap-2">
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-800">
                      {categoryLabel(listing.category)}
                    </span>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs">
                      {listing.listing_type === "rent" ? "Affitto" : "Vendita"}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold">{listing.title}</h3>
                  <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">
                    {listing.description}
                  </p>
                  <p className="mt-4 text-2xl font-bold">
                    {Number(listing.price).toLocaleString("it-IT", {
                      style: "currency",
                      currency: listing.currency || "EUR",
                    })}
                    {listing.listing_type === "rent" &&
                      ` / ${listing.price_period === "once" ? "una volta" : listing.price_period}`}
                  </p>
                  {(listing.city || listing.country) && (
                    <p className="mt-2 text-sm text-slate-500">
                      {[listing.city, listing.country].filter(Boolean).join(", ")}
                    </p>
                  )}
                  {listing.condition && (
                    <p className="mt-1 text-xs text-slate-500">
                      Condizione: {listing.condition.replace("_", " ")}
                    </p>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
