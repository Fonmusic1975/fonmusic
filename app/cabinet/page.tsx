"use client";
import { useState, useEffect } from "react";

const SUPABASE_URL = "https://ovafknvfckdmatrnlecr.supabase.co";
const SUPABASE_KEY = "sb_publishable_sMrkdTU705Zgw9-Sc12-Ww_XDrl1ASP";

const genres = ["fast", "medium", "slow", "night", "mix"];
const genreNames: Record<string, string> = {
  fast: "🎵 Энергичный",
  medium: "🎶 Средний",
  slow: "🎼 Медленный",
  night: "🌙 Ночной",
  mix: "🎲 Микс",
};

async function supabase(path: string, options?: RequestInit) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...options,
    headers: {
      "apikey": SUPABASE_KEY,
      "Authorization": `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      "Prefer": "return=representation",
      ...(options?.headers || {}),
    },
  });
  if (!res.ok) return null;
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

export default function CabinetPage() {
  const [screen, setScreen] = useState<"login" | "cabinet">("login");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [client, setClient] = useState<any>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [genreLoading, setGenreLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const login = async () => {
    if (!phone || !password) return;
    setLoading(true);
    setError("");
    const data = await supabase(`clients?phone=eq.${encodeURIComponent(phone)}&password=eq.${password}&select=*`);
    setLoading(false);
    if (data && data.length > 0) {
      setClient(data[0]);
      setScreen("cabinet");
    } else {
      setError("Неверный телефон или пароль");
    }
  };

  const changeGenre = async (genre: string) => {
    if (!client) return;
    setGenreLoading(true);
    setSuccess("");

    // Обновляем жанр клиента
    await supabase(`clients?id=eq.${client.id}`, {
      method: "PATCH",
      body: JSON.stringify({ genre }),
    });

    // Отправляем команду на устройство
    await supabase(`commands`, {
      method: "POST",
      body: JSON.stringify({
        device_id: client.device_id,
        command: "change_genre",
        genre,
        executed: false,
      }),
    });

    setClient({ ...client, genre });
    setGenreLoading(false);
    setSuccess(`Жанр изменён на ${genreNames[genre]}!`);
    setTimeout(() => setSuccess(""), 3000);
  };

  if (screen === "login") {
    return (
      <main style={{ minHeight: "100vh", background: "#080C12", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Georgia, serif" }}>
        <div style={{ width: "100%", maxWidth: 420, padding: 48, background: "#0D1B2A", border: "1px solid rgba(201,168,76,0.2)", borderRadius: 24, boxShadow: "0 40px 80px rgba(0,0,0,0.5)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 40 }}>
            <div style={{ width: 6, height: 24, background: "#C9A84C", borderRadius: 2 }} />
            <span style={{ fontSize: 20, fontWeight: 700, color: "#fff" }}>FonMusic</span>
          </div>

          <h1 style={{ fontSize: 26, fontWeight: 700, color: "#fff", marginBottom: 8 }}>Личный кабинет</h1>
          <p style={{ fontSize: 14, color: "#8BA7BE", marginBottom: 32 }}>Войдите чтобы управлять музыкой</p>

          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
            <div>
              <div style={{ fontSize: 12, color: "#8BA7BE", marginBottom: 6 }}>Телефон</div>
              <input
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+998 99 410 09 10"
                style={{ width: "100%", padding: "12px 16px", background: "#162435", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#fff", fontSize: 15, outline: "none", boxSizing: "border-box" }}
              />
            </div>
            <div>
              <div style={{ fontSize: 12, color: "#8BA7BE", marginBottom: 6 }}>Пароль</div>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••"
                onKeyDown={e => e.key === "Enter" && login()}
                style={{ width: "100%", padding: "12px 16px", background: "#162435", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#fff", fontSize: 15, outline: "none", boxSizing: "border-box" }}
              />
            </div>
          </div>

          {error && (
            <div style={{ padding: "10px 16px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, fontSize: 13, color: "#EF4444", marginBottom: 16 }}>
              {error}
            </div>
          )}

          <button onClick={login} disabled={loading} style={{
            width: "100%", padding: "14px", background: "#C9A84C", border: "none",
            borderRadius: 8, color: "#080C12", fontSize: 15, fontWeight: 700, cursor: "pointer",
          }}>
            {loading ? "Входим..." : "Войти"}
          </button>

          <div style={{ marginTop: 24, textAlign: "center" }}>
            <a href="/" style={{ fontSize: 13, color: "#8BA7BE", textDecoration: "none" }}>← На главную</a>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: "100vh", background: "#080C12", fontFamily: "Georgia, serif", color: "#E8EFF5" }}>
      {/* NAV */}
      <nav style={{ padding: "20px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(201,168,76,0.15)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 6, height: 24, background: "#C9A84C", borderRadius: 2 }} />
          <span style={{ fontSize: 18, fontWeight: 700, color: "#fff" }}>FonMusic</span>
        </div>
        <div style={{ fontSize: 14, color: "#8BA7BE" }}>👤 {client?.name}</div>
        <button onClick={() => { setScreen("login"); setClient(null); }} style={{
          padding: "8px 16px", background: "transparent", border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 6, color: "#8BA7BE", fontSize: 13, cursor: "pointer",
        }}>Выйти</button>
      </nav>

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "40px 32px" }}>

        {/* STATUS */}
        <div style={{ background: "#0D1B2A", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: 32, marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: "#fff" }}>Статус</h2>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 14px", background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: 100 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22C55E" }} />
              <span style={{ fontSize: 13, color: "#22C55E" }}>Онлайн</span>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
            {[
              { label: "Заведение", value: client?.name },
              { label: "Тариф", value: client?.tariff },
              { label: "Устройство", value: client?.device_id },
            ].map(item => (
              <div key={item.label} style={{ background: "#162435", borderRadius: 10, padding: 16 }}>
                <div style={{ fontSize: 11, color: "#8BA7BE", marginBottom: 6 }}>{item.label}</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>{item.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* CURRENT GENRE */}
        <div style={{ background: "#0D1B2A", border: "1px solid rgba(201,168,76,0.2)", borderRadius: 16, padding: 32, marginBottom: 24 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "#fff", marginBottom: 8 }}>🎵 Сейчас играет</h2>
          <div style={{ fontSize: 32, fontWeight: 700, color: "#C9A84C", marginBottom: 24 }}>
            {genreNames[client?.genre] || "Микс"}
          </div>

          {success && (
            <div style={{ padding: "10px 16px", background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: 8, fontSize: 13, color: "#22C55E", marginBottom: 16 }}>
              ✓ {success}
            </div>
          )}

          <div style={{ fontSize: 13, color: "#8BA7BE", marginBottom: 16 }}>Выберите жанр:</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            {genres.map(g => (
              <button key={g} onClick={() => changeGenre(g)} disabled={genreLoading} style={{
                padding: "14px", borderRadius: 10, cursor: "pointer", fontSize: 14,
                background: client?.genre === g ? "#C9A84C" : "rgba(255,255,255,0.05)",
                border: client?.genre === g ? "none" : "1px solid rgba(255,255,255,0.1)",
                color: client?.genre === g ? "#080C12" : "#E8EFF5",
                fontWeight: client?.genre === g ? 700 : 400,
                transition: "all 0.2s",
              }}>
                {genreNames[g]}
              </button>
            ))}
          </div>
        </div>

        {/* CERTIFICATE */}
        <div style={{ background: "#0D1B2A", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: 32 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "#fff", marginBottom: 8 }}>📄 Сертификат</h2>
          <p style={{ fontSize: 14, color: "#8BA7BE", marginBottom: 20 }}>Официальный сертификат JAMENDO Licensing для вашего заведения</p>
          <button onClick={() => window.print()} style={{
            padding: "12px 24px", background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.3)",
            borderRadius: 8, color: "#C9A84C", fontSize: 14, fontWeight: 700, cursor: "pointer",
          }}>
            🖨️ Распечатать сертификат
          </button>
        </div>

      </div>
    </main>
  );
}
