import { useState } from "react";

const RED = "#00FF88";
const RED_GLOW = "rgba(0,255,136,0.3)";
const RED_DIM = "rgba(0,255,136,0.08)";

const MOCK_DATA = {
  empresa: { nombre: "Mi Empresa", codigo: "EMPRESA001" },
  conductores: [
    { id: 1, nombre: "Juan Pérez", usuario: "conductor01", activo: true },
    { id: 2, nombre: "María López", usuario: "conductor02", activo: true },
    { id: 3, nombre: "Carlos Mora", usuario: "conductor03", activo: false },
  ],
  vehiculos: [
    { id: 1, codigo: "Unidad-001", descripcion: "Bus rojo", activo: true },
    { id: 2, codigo: "Unidad-002", descripcion: "Bus azul", activo: true },
    { id: 3, codigo: "Unidad-003", descripcion: "Van escolar", activo: false },
  ],
  usuarios: [
    { id: 1, nombre: "Pedro Ramírez", email: "pedro@gmail.com", activo: true },
    { id: 2, nombre: "Ana González", email: "ana@gmail.com", activo: true },
  ],
  invitaciones: [
    { id: 1, codigo: "INV-001", email: "nuevo@gmail.com", usado: false, expira_en: "2026-08-10" },
    { id: 2, codigo: "INV-002", email: "otro@gmail.com", usado: true, expira_en: "2026-07-01" },
  ],
};

const NAV = [
  { id: "dashboard", label: "Dashboard", icon: "▦" },
  { id: "conductores", label: "Conductores", icon: "👤" },
  { id: "vehiculos", label: "Vehículos", icon: "🚗" },
  { id: "usuarios", label: "Usuarios", icon: "👥" },
  { id: "invitaciones", label: "Invitaciones", icon: "✉" },
];

const Badge = ({ activo }) => (
  <span style={{ padding: "2px 8px", borderRadius: 2, fontSize: 9, letterSpacing: 1, fontWeight: 700, background: activo ? "rgba(34,197,94,0.1)" : "rgba(255,255,255,0.05)", color: activo ? "#4ADE80" : "rgba(255,255,255,0.3)", border: `1px solid ${activo ? "rgba(34,197,94,0.3)" : "rgba(255,255,255,0.1)"}` }}>
    {activo ? "ACTIVO" : "INACTIVO"}
  </span>
);

const TableHeader = ({ cols }) => (
  <div style={{ display: "grid", gridTemplateColumns: cols, padding: "8px 16px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
    {["NOMBRE", "DETALLE", "ESTADO", ""].map((h, i) => (
      <div key={i} style={{ color: "rgba(255,255,255,0.2)", fontSize: 9, letterSpacing: 2 }}>{h}</div>
    ))}
  </div>
);

export default function AdminPanel() {
  const [screen, setScreen] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showModal, setShowModal] = useState(null);

  const handleLogin = () => {
    if (!email || !password) { setLoginError("Ingresa tus credenciales."); return; }
    if (email === "admin@miempresa.com" && password === "admin1234") {
      setScreen("panel");
    } else {
      setLoginError("Credenciales incorrectas.");
    }
  };

  const StatCard = ({ label, value, sub }) => (
    <div style={{ padding: "20px", borderRadius: 2, background: "#0A0A0A", border: "1px solid rgba(204,0,0,0.2)" }}>
      <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 9, letterSpacing: 3, marginBottom: 8 }}>{label}</div>
      <div style={{ color: "#fff", fontSize: 28, fontWeight: 700, letterSpacing: 2, marginBottom: 4 }}>{value}</div>
      {sub && <div style={{ color: RED, fontSize: 10, letterSpacing: 1 }}>{sub}</div>}
    </div>
  );

  if (screen === "login") {
    return (
      <div style={{ minHeight: "100vh", background: "#000", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Courier New', monospace", padding: 16 }}>
        <div style={{ width: 380, background: "#0A0A0A", borderRadius: 4, border: "1px solid rgba(255,255,255,0.06)", boxShadow: "0 0 40px rgba(0,255,136,0.05)", padding: "40px 28px 36px" }}>
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <div style={{ width: 52, height: 52, border: `2px solid ${RED}`, transform: "rotate(45deg)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", boxShadow: `0 0 16px ${RED_GLOW}` }}>
              <svg style={{ transform: "rotate(-45deg)" }} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={RED} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
              </svg>
            </div>
            <div style={{ color: "#fff", fontSize: 15, fontWeight: 700, letterSpacing: 5 }}>B&P COMPANY</div>
            <div style={{ color: RED, fontSize: 9, letterSpacing: 4, marginTop: 4 }}>PANEL DE ADMINISTRACIÓN</div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ color: "rgba(255,255,255,0.3)", fontSize: 9, letterSpacing: 3, display: "block", marginBottom: 8 }}>EMAIL</label>
            <input type="email" placeholder="tu@empresa.com" value={email} onChange={e => { setEmail(e.target.value); setLoginError(""); }} style={{ width: "100%", padding: "13px 14px", borderRadius: 2, border: loginError ? `1px solid ${RED}` : "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.03)", color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box", fontFamily: "inherit", letterSpacing: 1 }} />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ color: "rgba(255,255,255,0.3)", fontSize: 9, letterSpacing: 3, display: "block", marginBottom: 8 }}>CONTRASEÑA</label>
            <input type="password" placeholder="••••••••" value={password} onChange={e => { setPassword(e.target.value); setLoginError(""); }} style={{ width: "100%", padding: "13px 14px", borderRadius: 2, border: loginError ? `1px solid ${RED}` : "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.03)", color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box", fontFamily: "inherit", letterSpacing: 1 }} />
          </div>
          {loginError && <div style={{ color: RED, fontSize: 11, marginBottom: 16, textAlign: "center", letterSpacing: 1 }}>{loginError}</div>}
          <button onClick={handleLogin} style={{ width: "100%", padding: "15px", borderRadius: 2, border: `1px solid ${RED}`, background: RED_DIM, color: "#fff", fontSize: 11, fontWeight: 700, letterSpacing: 4, cursor: "pointer", boxShadow: `0 0 20px ${RED_GLOW}` }}>
            ACCEDER
          </button>
          <div style={{ marginTop: 20, padding: "10px", borderRadius: 2, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", textAlign: "center" }}>
            <div style={{ color: "rgba(255,255,255,0.2)", fontSize: 9, letterSpacing: 2, marginBottom: 4 }}>DEMO</div>
            <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 10 }}>admin@miempresa.com / admin1234</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#000", display: "flex", fontFamily: "'Courier New', monospace" }}>

      {/* Sidebar */}
      <div style={{ width: 220, background: "#0A0A0A", borderRight: "1px solid rgba(204,0,0,0.15)", display: "flex", flexDirection: "column", padding: "24px 0" }}>
        <div style={{ padding: "0 20px 24px", borderBottom: "1px solid rgba(204,0,0,0.1)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, border: `1.5px solid ${RED}`, transform: "rotate(45deg)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 8px ${RED_GLOW}`, flexShrink: 0 }}>
              <svg style={{ transform: "rotate(-45deg)" }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={RED} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
              </svg>
            </div>
            <div>
              <div style={{ color: "#fff", fontSize: 11, fontWeight: 700, letterSpacing: 2 }}>B&P COMPANY</div>
              <div style={{ color: RED, fontSize: 8, letterSpacing: 2, marginTop: 2 }}>{MOCK_DATA.empresa.nombre}</div>
            </div>
          </div>
        </div>

        <nav style={{ flex: 1, padding: "16px 0" }}>
          {NAV.map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id)} style={{ width: "100%", padding: "12px 20px", display: "flex", alignItems: "center", gap: 10, background: activeTab === item.id ? RED_DIM : "transparent", border: "none", borderLeft: activeTab === item.id ? `2px solid ${RED}` : "2px solid transparent", color: activeTab === item.id ? "#fff" : "rgba(255,255,255,0.3)", fontSize: 11, letterSpacing: 2, cursor: "pointer", textAlign: "left" }}>
              <span style={{ fontSize: 14 }}>{item.icon}</span>
              {item.label.toUpperCase()}
            </button>
          ))}
        </nav>

        <div style={{ padding: "16px 20px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <button onClick={() => setScreen("login")} style={{ width: "100%", padding: "10px", borderRadius: 2, border: "1px solid rgba(255,255,255,0.08)", background: "transparent", color: "rgba(255,255,255,0.3)", fontSize: 10, letterSpacing: 2, cursor: "pointer" }}>
            CERRAR SESIÓN
          </button>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, padding: 28, overflowY: "auto" }}>

        {/* Dashboard */}
        {activeTab === "dashboard" && (
          <div>
            <div style={{ marginBottom: 28 }}>
              <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 9, letterSpacing: 3, marginBottom: 4 }}>BIENVENIDO</div>
              <div style={{ color: "#fff", fontSize: 20, fontWeight: 700, letterSpacing: 2 }}>DASHBOARD</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 16, marginBottom: 28 }}>
              <StatCard label="CONDUCTORES" value={MOCK_DATA.conductores.filter(c=>c.activo).length} sub="activos" />
              <StatCard label="VEHÍCULOS" value={MOCK_DATA.vehiculos.filter(v=>v.activo).length} sub="en servicio" />
              <StatCard label="USUARIOS" value={MOCK_DATA.usuarios.length} sub="registrados" />
              <StatCard label="INVITACIONES" value={MOCK_DATA.invitaciones.filter(i=>!i.usado).length} sub="pendientes" />
            </div>
            <div style={{ padding: "20px", borderRadius: 2, background: "#0A0A0A", border: "1px solid rgba(204,0,0,0.15)" }}>
              <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 9, letterSpacing: 3, marginBottom: 16 }}>ACCIONES RÁPIDAS</div>
              <div style={{ display: "flex", gap: 12 }}>
                {[
                  { label: "NUEVO CONDUCTOR", action: () => setActiveTab("conductores") },
                  { label: "NUEVO VEHÍCULO", action: () => setActiveTab("vehiculos") },
                  { label: "INVITAR USUARIO", action: () => setActiveTab("invitaciones") },
                ].map(btn => (
                  <button key={btn.label} onClick={btn.action} style={{ padding: "10px 16px", borderRadius: 2, border: `1px solid ${RED}`, background: RED_DIM, color: "#fff", fontSize: 10, letterSpacing: 2, cursor: "pointer", boxShadow: `0 0 10px ${RED_GLOW}` }}>
                    {btn.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Conductores */}
        {activeTab === "conductores" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24 }}>
              <div>
                <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 9, letterSpacing: 3, marginBottom: 4 }}>GESTIÓN</div>
                <div style={{ color: "#fff", fontSize: 20, fontWeight: 700, letterSpacing: 2 }}>CONDUCTORES</div>
              </div>
              <button style={{ padding: "10px 16px", borderRadius: 2, border: `1px solid ${RED}`, background: RED_DIM, color: "#fff", fontSize: 10, letterSpacing: 2, cursor: "pointer" }}>
                + NUEVO
              </button>
            </div>
            <div style={{ background: "#0A0A0A", borderRadius: 2, border: "1px solid rgba(255,255,255,0.06)", overflow: "hidden" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 100px 80px", padding: "10px 16px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                {["NOMBRE", "USUARIO", "ESTADO", ""].map(h => <div key={h} style={{ color: "rgba(255,255,255,0.2)", fontSize: 9, letterSpacing: 2 }}>{h}</div>)}
              </div>
              {MOCK_DATA.conductores.map((c, i) => (
                <div key={c.id} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 100px 80px", padding: "14px 16px", borderBottom: i < MOCK_DATA.conductores.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none", alignItems: "center" }}>
                  <div style={{ color: "#fff", fontSize: 12, letterSpacing: 0.5 }}>{c.nombre}</div>
                  <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 11 }}>{c.usuario}</div>
                  <Badge activo={c.activo} />
                  <button style={{ padding: "4px 10px", borderRadius: 2, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "rgba(255,255,255,0.3)", fontSize: 9, letterSpacing: 1, cursor: "pointer" }}>EDITAR</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Vehículos */}
        {activeTab === "vehiculos" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24 }}>
              <div>
                <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 9, letterSpacing: 3, marginBottom: 4 }}>GESTIÓN</div>
                <div style={{ color: "#fff", fontSize: 20, fontWeight: 700, letterSpacing: 2 }}>VEHÍCULOS</div>
              </div>
              <button style={{ padding: "10px 16px", borderRadius: 2, border: `1px solid ${RED}`, background: RED_DIM, color: "#fff", fontSize: 10, letterSpacing: 2, cursor: "pointer" }}>
                + NUEVO
              </button>
            </div>
            <div style={{ background: "#0A0A0A", borderRadius: 2, border: "1px solid rgba(255,255,255,0.06)", overflow: "hidden" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 100px 80px", padding: "10px 16px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                {["CÓDIGO", "DESCRIPCIÓN", "ESTADO", ""].map(h => <div key={h} style={{ color: "rgba(255,255,255,0.2)", fontSize: 9, letterSpacing: 2 }}>{h}</div>)}
              </div>
              {MOCK_DATA.vehiculos.map((v, i) => (
                <div key={v.id} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 100px 80px", padding: "14px 16px", borderBottom: i < MOCK_DATA.vehiculos.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none", alignItems: "center" }}>
                  <div style={{ color: "#fff", fontSize: 12 }}>{v.codigo}</div>
                  <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 11 }}>{v.descripcion}</div>
                  <Badge activo={v.activo} />
                  <button style={{ padding: "4px 10px", borderRadius: 2, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "rgba(255,255,255,0.3)", fontSize: 9, letterSpacing: 1, cursor: "pointer" }}>EDITAR</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Usuarios */}
        {activeTab === "usuarios" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24 }}>
              <div>
                <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 9, letterSpacing: 3, marginBottom: 4 }}>GESTIÓN</div>
                <div style={{ color: "#fff", fontSize: 20, fontWeight: 700, letterSpacing: 2 }}>USUARIOS</div>
              </div>
            </div>
            <div style={{ background: "#0A0A0A", borderRadius: 2, border: "1px solid rgba(255,255,255,0.06)", overflow: "hidden" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 100px 80px", padding: "10px 16px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                {["NOMBRE", "EMAIL", "ESTADO", ""].map(h => <div key={h} style={{ color: "rgba(255,255,255,0.2)", fontSize: 9, letterSpacing: 2 }}>{h}</div>)}
              </div>
              {MOCK_DATA.usuarios.map((u, i) => (
                <div key={u.id} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 100px 80px", padding: "14px 16px", borderBottom: i < MOCK_DATA.usuarios.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none", alignItems: "center" }}>
                  <div style={{ color: "#fff", fontSize: 12 }}>{u.nombre}</div>
                  <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 11 }}>{u.email}</div>
                  <Badge activo={u.activo} />
                  <button style={{ padding: "4px 10px", borderRadius: 2, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "rgba(255,255,255,0.3)", fontSize: 9, letterSpacing: 1, cursor: "pointer" }}>VER</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Invitaciones */}
        {activeTab === "invitaciones" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24 }}>
              <div>
                <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 9, letterSpacing: 3, marginBottom: 4 }}>GESTIÓN</div>
                <div style={{ color: "#fff", fontSize: 20, fontWeight: 700, letterSpacing: 2 }}>INVITACIONES</div>
              </div>
              <button style={{ padding: "10px 16px", borderRadius: 2, border: `1px solid ${RED}`, background: RED_DIM, color: "#fff", fontSize: 10, letterSpacing: 2, cursor: "pointer" }}>
                + CREAR
              </button>
            </div>
            <div style={{ background: "#0A0A0A", borderRadius: 2, border: "1px solid rgba(255,255,255,0.06)", overflow: "hidden" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 100px", padding: "10px 16px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                {["CÓDIGO", "EMAIL", "EXPIRA", "ESTADO"].map(h => <div key={h} style={{ color: "rgba(255,255,255,0.2)", fontSize: 9, letterSpacing: 2 }}>{h}</div>)}
              </div>
              {MOCK_DATA.invitaciones.map((inv, i) => (
                <div key={inv.id} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 100px", padding: "14px 16px", borderBottom: i < MOCK_DATA.invitaciones.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none", alignItems: "center" }}>
                  <div style={{ color: RED, fontSize: 12, letterSpacing: 1 }}>{inv.codigo}</div>
                  <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 11 }}>{inv.email}</div>
                  <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 11 }}>{inv.expira_en}</div>
                  <Badge activo={!inv.usado} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
