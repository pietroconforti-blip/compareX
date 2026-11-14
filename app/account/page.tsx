"use client";

import { FormEvent, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";

type Profile = { full_name: string; phone: string; street_address: string; postal_code: string; city: string; country_code: string; student_status: string };
const emptyProfile: Profile = { full_name: "", phone: "", street_address: "", postal_code: "", city: "Vienna", country_code: "AT", student_status: "prospective_student" };
const configured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);

export default function AccountPage() {
  const [supabase] = useState(() => configured ? createClient() : null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile>(emptyProfile);
  const [mode, setMode] = useState<"signup" | "login">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [profileReady, setProfileReady] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    let active = true;
    async function loadProfile(userId: string) {
      const { data, error } = await supabase!.from("comparex_customer_profiles")
        .select("full_name, phone, street_address, postal_code, city, country_code, student_status")
        .eq("id", userId).maybeSingle();
      if (!active) return;
      if (error) {
        setMessage("Your account is active, but the CompareX database migration still needs to be applied before profile sync is available.");
        return;
      }
      if (data) setProfile({ ...emptyProfile, ...data });
      setProfileReady(true);
    }
    supabase.auth.getUser().then(({ data }) => {
      if (active && data.user) {
        setUserEmail(data.user.email ?? null);
        void loadProfile(data.user.id);
      }
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      setUserEmail(session?.user?.email ?? null);
      if (session?.user) void loadProfile(session.user.id);
      else { setProfile(emptyProfile); setProfileReady(false); }
    });
    return () => { active = false; listener.subscription.unsubscribe(); };
  }, [supabase]);

  async function handleAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase) return;
    setBusy(true); setMessage("");
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({ email: email.trim(), password, options: { emailRedirectTo: window.location.origin + "/account" } });
        if (error) throw error;
        if (data.session && data.user) {
          setUserEmail(data.user.email ?? email);
          setMessage("Account created. You can now complete your CompareX profile.");
        } else setMessage("Check your email to confirm your account, then return here to sign in.");
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
        setUserEmail(data.user.email ?? email);
        setMessage("You are signed in. Complete your CompareX profile below.");
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "We could not complete the account request.");
    } finally { setBusy(false); }
  }

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase) return;
    setBusy(true); setMessage("");
    try {
      const { data, error: authError } = await supabase.auth.getUser();
      if (authError || !data.user) throw new Error("Please sign in again before saving your profile.");
      const { error } = await supabase.from("comparex_customer_profiles").upsert({ id: data.user.id, ...profile, updated_at: new Date().toISOString() }, { onConflict: "id" });
      if (error) throw error;
      setProfileReady(true);
      setMessage("Your profile has been saved securely to your CompareX account.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Profile could not be saved. Check that the database migration is applied.");
    } finally { setBusy(false); }
  }

  async function signOut() {
    if (!supabase) return;
    await supabase.auth.signOut();
    setUserEmail(null); setProfile(emptyProfile); setProfileReady(false); setMessage("You have signed out.");
  }

  function update<K extends keyof Profile>(key: K, value: Profile[K]) {
    setProfile(current => ({ ...current, [key]: value }));
  }

  return (
    <main className="min-h-screen bg-[#f7f9fd] px-5 py-10 text-[#0c1222]">
      <div className="mx-auto max-w-5xl">
        <header className="flex items-center justify-between gap-4">
          <a href="/" className="text-xl font-bold text-[#1a3470]">CompareX</a>
          <nav className="flex flex-wrap gap-2 text-sm font-semibold">
            <a href="/mobile" className="rounded-xl border border-[#d5dceb] bg-white px-4 py-2">Mobile plans</a>
            <a href="/dashboard" className="rounded-xl border border-[#d5dceb] bg-white px-4 py-2">Dashboard</a>
          </nav>
        </header>
        <section className="mt-10 grid gap-8 lg:grid-cols-[.9fr_1.1fr]">
          <div className="rounded-3xl bg-[#142b59] p-7 text-white md:p-9">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-200">Your CompareX account</p>
            <h1 className="mt-4 text-4xl font-bold tracking-tight">Your services.<br />All in one place.</h1>
            <p className="mt-4 leading-7 text-blue-100">Create one account to save your favourite offers, build your student package and keep your service applications together.</p>
            <div className="mt-8 space-y-4 text-sm text-blue-50">
              <p>✓ One reusable customer profile</p><p>✓ Your selected offers saved to your account</p><p>✓ Your saved services in one dashboard</p><p>✓ You remain in control of what is shared</p>
            </div>
            <p className="mt-8 text-xs leading-5 text-blue-200">CompareX does not currently activate mobile contracts or collect provider payments. Those functions require a live, authorised provider integration.</p>
          </div>
          <div className="rounded-3xl border border-[#d5dceb] bg-white p-6 shadow-sm md:p-8">
            {!configured ? (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-900">Supabase is not configured for this deployment. Add the public Supabase URL and publishable key to the Vercel preview environment to enable accounts.</div>
            ) : !userEmail ? (
              <>
                <p className="text-xs font-bold uppercase tracking-wider text-blue-700">Customer account</p>
                <h2 className="mt-2 text-2xl font-bold">{mode === "signup" ? "Create your account" : "Welcome back"}</h2>
                <div className="mt-5 inline-flex rounded-xl bg-slate-100 p-1">
                  <button type="button" onClick={() => setMode("signup")} className={"rounded-lg px-4 py-2 text-sm font-semibold " + (mode === "signup" ? "bg-white text-[#1a3470] shadow-sm" : "text-slate-500")}>Create account</button>
                  <button type="button" onClick={() => setMode("login")} className={"rounded-lg px-4 py-2 text-sm font-semibold " + (mode === "login" ? "bg-white text-[#1a3470] shadow-sm" : "text-slate-500")}>Sign in</button>
                </div>
                <form onSubmit={handleAuth} className="mt-6 space-y-4">
                  <label className="block text-sm font-semibold">Email address<input type="email" required autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} className="mt-2 w-full rounded-xl border border-[#d5dceb] px-4 py-3 font-normal outline-none focus:border-[#1a3470]" /></label>
                  <label className="block text-sm font-semibold">Password<input type="password" required minLength={8} autoComplete={mode === "signup" ? "new-password" : "current-password"} value={password} onChange={event => setPassword(event.target.value)} className="mt-2 w-full rounded-xl border border-[#d5dceb] px-4 py-3 font-normal outline-none focus:border-[#1a3470]" /></label>
                  <button disabled={busy} className="w-full rounded-xl bg-[#1a3470] px-5 py-3 font-bold text-white disabled:opacity-60">{busy ? "Please wait…" : mode === "signup" ? "Create my CompareX account" : "Sign in"}</button>
                </form>
              </>
            ) : (
              <>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div><p className="text-xs font-bold uppercase tracking-wider text-blue-700">Your account</p><h2 className="mt-2 text-2xl font-bold">Your student profile</h2><p className="mt-1 text-sm text-slate-500">{userEmail}</p></div>
                  <button type="button" onClick={signOut} className="rounded-lg border border-[#d5dceb] px-3 py-2 text-sm font-semibold text-slate-600">Sign out</button>
                </div>
                <form onSubmit={saveProfile} className="mt-6 grid gap-4 sm:grid-cols-2">
                  <label className="text-sm font-semibold sm:col-span-2">Full name<input required value={profile.full_name} onChange={event => update("full_name", event.target.value)} autoComplete="name" className="mt-2 w-full rounded-xl border border-[#d5dceb] px-4 py-3 font-normal" placeholder="Your full name" /></label>
                  <label className="text-sm font-semibold">Phone number<input value={profile.phone} onChange={event => update("phone", event.target.value)} autoComplete="tel" className="mt-2 w-full rounded-xl border border-[#d5dceb] px-4 py-3 font-normal" placeholder="+43…" /></label>
                  <label className="text-sm font-semibold">Country<select value={profile.country_code} onChange={event => update("country_code", event.target.value)} className="mt-2 w-full rounded-xl border border-[#d5dceb] bg-white px-4 py-3 font-normal"><option value="AT">Austria</option><option value="IT">Italy</option><option value="DE">Germany</option><option value="CH">Switzerland</option><option value="OTHER">Other</option></select></label>
                  <label className="text-sm font-semibold sm:col-span-2">Street address (optional)<input value={profile.street_address} onChange={event => update("street_address", event.target.value)} autoComplete="street-address" className="mt-2 w-full rounded-xl border border-[#d5dceb] px-4 py-3 font-normal" /></label>
                  <label className="text-sm font-semibold">Postal code<input value={profile.postal_code} onChange={event => update("postal_code", event.target.value)} autoComplete="postal-code" className="mt-2 w-full rounded-xl border border-[#d5dceb] px-4 py-3 font-normal" /></label>
                  <label className="text-sm font-semibold">City<input value={profile.city} onChange={event => update("city", event.target.value)} autoComplete="address-level2" className="mt-2 w-full rounded-xl border border-[#d5dceb] px-4 py-3 font-normal" /></label>
                  <label className="text-sm font-semibold sm:col-span-2">Student status<select value={profile.student_status} onChange={event => update("student_status", event.target.value)} className="mt-2 w-full rounded-xl border border-[#d5dceb] bg-white px-4 py-3 font-normal"><option value="prospective_student">Prospective student</option><option value="student">Current student</option><option value="other">Other</option></select></label>
                  <button disabled={busy} className="rounded-xl bg-[#1a3470] px-5 py-3 font-bold text-white disabled:opacity-60 sm:col-span-2">{busy ? "Saving…" : "Save my profile"}</button>
                </form>
                <p className="mt-4 text-xs text-slate-500">{profileReady ? "Your profile is connected to your account." : "Complete the database setup to sync your profile."}</p>
              </>
            )}
            {message && <p role="status" className="mt-5 rounded-xl bg-blue-50 p-3 text-sm leading-6 text-[#1a3470]">{message}</p>}
            <p className="mt-6 border-t border-slate-100 pt-4 text-xs leading-5 text-slate-500">Only enter details needed for your CompareX profile. Do not enter card numbers, security codes, passport numbers or identity documents here. Provider-specific identity checks will be handled through approved provider integrations.</p>
          </div>
        </section>
      </div>
    </main>
  );
}
