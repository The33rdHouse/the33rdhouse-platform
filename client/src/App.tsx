import { useEffect, useState, type FormEvent } from "react";
import {
  Shield,
  Activity,
  Database,
  FileSearch,
  Users,
  Lock,
  LogOut,
  Download,
  ArrowUpRight,
} from "lucide-react";
import { api } from "./lib/trpc";
import { readPreferences, type Tab } from "../../shared/preferences";

type Account = Awaited<ReturnType<typeof api.console.me.query>>;
type Application = Awaited<
  ReturnType<typeof api.console.applications.query>
>[number];
type Exhibit = Awaited<ReturnType<typeof api.console.registry.query>>[number];
const navigation = [
  { id: "overview", label: "Overview", icon: Activity },
  { id: "audit-lab", label: "Audit Lab", icon: FileSearch },
  { id: "registry", label: "Registry", icon: Database },
  { id: "ledger", label: "Ledger", icon: Users },
] as const;
function initialTab(): Tab {
  try {
    return readPreferences(localStorage.getItem("harmga_ui_v1")).tab;
  } catch {
    return "overview";
  }
}

export default function App() {
  const [tab, setTab] = useState<Tab>(initialTab);
  const [account, setAccount] = useState<Account | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [exhibits, setExhibits] = useState<Exhibit[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [token, setToken] = useState("");
  const [revision, setRevision] = useState(0);
  const [search, setSearch] = useState("");
  const [showIntake, setShowIntake] = useState(false);
  useEffect(() => {
    try {
      localStorage.setItem("harmga_ui_v1", JSON.stringify({ tab }));
    } catch {
      /* Optional preference storage. */
    }
  }, [tab]);
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([
      api.console.me.query(),
      api.console.applications.query(),
      api.console.registry.query(),
    ])
      .then(([me, rows, files]) => {
        if (cancelled) return;
        setAccount(me);
        setApplications(rows);
        setExhibits(files);
        setError("");
      })
      .catch((cause: unknown) => {
        if (cancelled) return;
        setAccount(null);
        setApplications([]);
        setExhibits([]);
        const code = (cause as { data?: { code?: string } })?.data?.code;
        if (code !== "UNAUTHORIZED")
          setError(
            "The console service is unavailable. Retry when your connection is restored.",
          );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [revision]);
  async function signIn(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
        credentials: "same-origin",
      });
      if (!response.ok)
        throw new Error(
          "Sign-in failed. Check your session credential and its expiry.",
        );
      setToken("");
      setRevision((x) => x + 1);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Sign-in failed.");
    } finally {
      setBusy(false);
    }
  }
  async function logout() {
    setBusy(true);
    try {
      const response = await fetch("/auth/logout", {
        method: "POST",
        credentials: "same-origin",
      });
      if (!response.ok) throw new Error();
      setAccount(null);
      setApplications([]);
      setExhibits([]);
      setShowIntake(false);
      setNotice("Signed out.");
    } catch {
      setError("Sign-out could not be confirmed. Retry.");
    } finally {
      setBusy(false);
    }
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!account) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    if (data.get("accepted") !== "on") return;
    setBusy(true);
    setError("");
    try {
      await api.console.submitApplication.mutate({
        name: String(data.get("name")),
        email: String(data.get("email")),
        requestedRole: String(data.get("role")) as
          "Keeper" | "Advisory Witness" | "Associate",
        accepted: true,
        termsVersion: "harmga-intake-2026-09-17",
      });
      form.reset();
      setShowIntake(false);
      setTab("ledger");
      setNotice(
        "Application recorded. Pending review; no roles or voting rights have been granted.",
      );
      setRevision((x) => x + 1);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Application could not be saved.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function download(file: Exhibit) {
    setError("");
    setBusy(true);
    try {
      const response = await fetch(
        "/api/exhibits/" + encodeURIComponent(file.id),
        { credentials: "same-origin", redirect: "error" },
      );
      if (!response.ok)
        throw new Error(
          "Download unavailable. Your access or the file could not be verified.",
        );
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = file.id + ".bin";
      document.body.append(anchor);
      anchor.click();
      anchor.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Download failed.");
    } finally {
      setBusy(false);
    }
  }
  const filtered = exhibits.filter((file) =>
    (file.id + " " + file.title).toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <div className="shell">
      <aside className="sidebar">
        <a className="brand" href="#main">
          <span className="brand-icon">
            <Shield />
          </span>
          <span>
            HARMGA<small>COMMAND CONSOLE · v2.5.0</small>
          </span>
        </a>
        <nav aria-label="Console sections">
          {navigation.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              aria-current={tab === id ? "page" : undefined}
              onClick={() => setTab(id)}
            >
              <Icon size={19} />
              {label}
            </button>
          ))}
        </nav>
        <div className="custody">
          <Lock size={19} />
          <strong>Authority stays on the server</strong>
          <p>
            {loading
              ? "Checking session."
              : account
                ? "Session verified. Roles loaded from persisted records."
                : "No verified session. Sign in to access records."}
            {" "}Signing requires external verification.
          </p>
        </div>
      </aside>
      <main id="main">
        <header>
          <div>
            <p className="eyebrow">WESTERN AUSTRALIA / THE 33RD HOUSE</p>
            <h1>{navigation.find((item) => item.id === tab)?.label}</h1>
            <p className="subtitle">
              Governance, evidence and operational records.
            </p>
          </div>
          {account && (
            <div className="actions">
              <button
                className="primary"
                onClick={() => {
                  setShowIntake(true);
                  setTab("overview");
                }}
                disabled={busy || applications.length > 0}
              >
                Stakeholder intake <ArrowUpRight size={16} />
              </button>
              <button aria-label="Sign out" onClick={logout} disabled={busy}>
                <LogOut size={18} />
              </button>
            </div>
          )}
        </header>
        {error && (
          <div className="message error" role="alert">
            {error}{" "}
            <button onClick={() => setRevision((x) => x + 1)}>
              Retry connection
            </button>
          </div>
        )}
        {notice && (
          <div className="message" role="status">
            {notice}
          </div>
        )}
        {loading ? (
          <section className="card" aria-live="polite">
            Checking your session…
          </section>
        ) : !account ? (
          <section className="card signin">
            <p className="eyebrow">PRIVATE WORKSPACE</p>
            <h2>Sign in to your console</h2>
            <p>
              Use a current session credential issued by your platform operator.
            </p>
            <form onSubmit={signIn}>
              <label>
                Session credential
                <input
                  type="password"
                  autoComplete="off"
                  value={token}
                  onChange={(event) => setToken(event.target.value)}
                  required
                  minLength={64}
                  maxLength={64}
                />
              </label>
              <button className="primary" disabled={busy}>
                {busy ? "Signing in…" : "Sign in"} <ArrowUpRight size={17} />
              </button>
            </form>
          </section>
        ) : (
          <>
            {tab === "overview" && (
              <>
                <div className="stats">
                  <section className="card">
                    <p className="eyebrow">ACCESS</p>
                    <h2>Authenticated</h2>
                    <p>{account.user?.name ?? account.user?.id}</p>
                  </section>
                  <section className="card">
                    <p className="eyebrow">YOUR APPLICATION</p>
                    <h2>
                      {applications.length ? "Pending review" : "Not submitted"}
                    </h2>
                    <p>Server-owned record</p>
                  </section>
                  <section className="card">
                    <p className="eyebrow">VERIFIED EXHIBITS</p>
                    <h2>{exhibits.length}</h2>
                    <p>Available to signed-in members</p>
                  </section>
                </div>
                <div className="columns">
                  <section className="card">
                    <p className="eyebrow">PRINCIPAL'S MANDATE</p>
                    <h2>Evidence before assurance.</h2>
                    <p>
                      Every published status should be supported by a record.
                      This console does not create authority, certify an audit
                      or sign a document by displaying a badge.
                    </p>
                    <div className="badge">
                      Roles: {account.roles.join(", ") || "No assigned roles"}
                    </div>
                  </section>
                  <section className="card dark">
                    <Shield size={32} />
                    <h2>
                      Clear boundaries.
                      <br />
                      Persistent records.
                    </h2>
                    <p>
                      Your application and acceptance record are stored by the
                      platform. Browser preferences only remember the section
                      you last viewed.
                    </p>
                  </section>
                </div>
              </>
            )}
            {showIntake && tab === "overview" && (
              <section className="card">
                <h2>Stakeholder application</h2>
                <p>
                  Submit your details for review. A requested role does not
                  grant permissions.
                </p>
                <form onSubmit={submit}>
                  <div className="columns">
                    <label>
                      Full name
                      <input name="name" required maxLength={120} />
                    </label>
                    <label>
                      Email
                      <input
                        name="email"
                        type="email"
                        required
                        maxLength={254}
                      />
                    </label>
                  </div>
                  <label>
                    Requested role
                    <select name="role">
                      <option>Keeper</option>
                      <option>Advisory Witness</option>
                      <option>Associate</option>
                    </select>
                  </label>
                  <div className="terms">
                    <strong>Application acknowledgement</strong>
                    <p>
                      I request review of these details and understand that
                      submission grants no membership, permissions, voting
                      weight or verified signature. The platform records these
                      details and this acknowledgement for review.
                    </p>
                    <small>Version: {account.termsVersion}</small>
                  </div>
                  <label className="checkbox">
                    <input name="accepted" type="checkbox" required />I accept
                    the application acknowledgement above.
                  </label>
                  <div className="actions">
                    <button className="primary" disabled={busy}>
                      {busy ? "Saving…" : "Submit for review"}
                    </button>
                    <button type="button" onClick={() => setShowIntake(false)}>
                      Cancel
                    </button>
                  </div>
                </form>
              </section>
            )}
            {tab === "audit-lab" && (
              <section className="card">
                <p className="eyebrow">ASSURANCE WORKFLOW</p>
                <h2>Audit service unavailable</h2>
                <p>
                  No analysis has been run. Stability scores, hallucination
                  checks and provenance certificates will appear only when
                  supported by a connected analysis service and verified
                  evidence.
                </p>
                <div className="badge">
                  Signing: external verification required
                </div>
              </section>
            )}
            {tab === "registry" && (
              <section className="card">
                <div className="section-heading">
                  <h2>Exhibit register</h2>
                  <span>{exhibits.length} verified artifacts</span>
                </div>
                <label>
                  Search exhibits
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Title or exhibit ID"
                  />
                </label>
                {filtered.length ? (
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>Exhibit</th>
                          <th>Tier</th>
                          <th>Download</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filtered.map((file) => (
                          <tr key={file.id}>
                            <td>
                              {file.title}
                              <small>{file.id}</small>
                            </td>
                            <td>{file.tier}</td>
                            <td>
                              <button
                                disabled={busy}
                                aria-label={"Download " + file.title}
                                onClick={() => download(file)}
                              >
                                <Download size={18} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="empty">
                    {exhibits.length
                      ? "No matching exhibits."
                      : "No reviewed files have been enabled for download."}
                  </p>
                )}
              </section>
            )}
            {tab === "ledger" && (
              <section className="card">
                <h2>Your application ledger</h2>
                <p>
                  These are recorded applications, not an equity or voting
                  register.
                </p>
                {applications.length ? (
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>Applicant</th>
                          <th>Requested role</th>
                          <th>Status</th>
                          <th>Recorded</th>
                        </tr>
                      </thead>
                      <tbody>
                        {applications.map((row) => (
                          <tr key={row.id}>
                            <td>
                              {row.name}
                              <small>{row.id}</small>
                            </td>
                            <td>{row.requestedRole}</td>
                            <td>{row.status.replaceAll("_", " ")}</td>
                            <td>
                              {new Date(row.acceptedAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="empty">You have no recorded application.</p>
                )}
              </section>
            )}
          </>
        )}
        <footer>
          HARMGA / v2.5.0 integration · Deployment and provenance signatures
          unverified
        </footer>
      </main>
    </div>
  );
}
