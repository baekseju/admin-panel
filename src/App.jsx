import { useState, useEffect } from "react";

const SUPABASE_URL = "https://ahuraftnoxslotrcfhun.supabase.co";
const SUPABASE_KEY = "sb_publishable_9Up-_iimijqn6NdiOzUrNw_b_RPAQGg";

const GREEN = "#00FF88";
const GREEN_GLOW = "rgba(0,255,136,0.3)";
const GREEN_DIM = "rgba(0,255,136,0.08)";

async function supabase(table, options = {}) {
  const { method = "GET", filter = "", body = null, select = "*" } = options;
  const url = `${SUPABASE_URL}/rest/v1/${table}?select=${select}${filter}`;
  const res = await fetch(url, {
    method,
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      Prefer: method === "POST" ? "return=representation" : undefined,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return res.json();
}

const Badge = ({ activo }) => (
  <span style={{ padding: "2px 8px", borderRadius: 2, fontSize: 9, letterSpacing: 1, fontWeight: 700, background: activo ? "rgba(0,255,136,0.1)" : "rgba(255,255,255,0.05)", color: activo ? GREEN : "rgba(255,255,255,0.3)", border: `1px solid ${activo ? "rgba(0,255,136,0.3)" : "rgba(255,255,255,0.1)"}` }}>
    {activo ? "ACTIVO" : "INACTIVO"}
  </span>
);

const NAV = [
  { id: "dashboard", label: "Dashboard" },
  { id: "conductores", label: "Conductores" },
  { id: "vehiculos", label: "Vehículos" },
  { id: "usuarios", label: "Usuarios" },
  { id: "invitaciones", label: "Invitaciones" },
];

export default function AdminPanel() {
  const [screen, setScreen] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [adminUser, setAdminUser] = useState(null);
  const [empresa, setEmpresa] = useState(null);

  // Data
  const [conductores, setConductores] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [invitaciones, setInvitaciones] = useState([]);
  const [stats, setStats] = useState({ conductores: 0, vehiculos: 0, usuarios: 0, invitaciones: 0 });

  // Forms
  const [showForm, setShowForm] = useState(null);
  const [formData, setFormData] = useState({});
  const [formLoading, setFormLoading] = useState(false);

  const loadData = async (empresaId) => {
    const [c, v, u, i] = await Promise.all([
      supabase("conductores", { filter: `&empresa_id=eq.${empresaId}` }),
      supabase("vehiculos", { filter: `&empresa_id=eq.${empresaId}` }),
      supabase("usuarios", { filter: `&empresa_id=eq.${empresaId}` }),
      supabase("invitaciones", { filter: `&empresa_id=eq.${empresaId}&order=created_at.desc` }),
    ]);
    setConductores(Array.isArray(c) ? c : []);
    setVehiculos(Array.isArray(v) ? v : []);
    setUsuarios(Array.isArray(u) ? u : []);
    setInvitaciones(Array.isArray(i) ? i : []);
    setStats({
      conductores: Array.isArray(c) ? c.filter(x => x.activo).length : 0,
      vehiculos: Array.isArray(v) ? v.filter(x => x.activo).length : 0,
      usuarios: Array.isArray(u) ? u.length : 0,
      invitaciones: Array.isArray(i) ? i.filter(x => !x.usado).length : 0,
    });
  };

  const handleLogin = async () => {
    if (!email || !password) { setLoginError("Ingresa tus credenciales."); return; }
    setLoginError(""); setLoginLoading(true);
    try {
      const data = await supabase("usuarios", {
        filter: `&email=eq.${email}&password_hash=eq.${password}&activo=eq.true`,
        select: "id,nombre,email,empresa_id,rol_id,empresas(id,nombre,codigo)",
      });
      if (Array.isArray(data) && data.length > 0) {
        const user = data[0];
        setAdminUser(user);
        setEmpresa(user.empresas);
        await loadData(user.empresa_id);
        setLoginLoading(false);
        setScreen("panel");
      } else {
        setLoginLoading(false);
        setLoginError("Credenciales incorrectas.");
      }
    } catch {
      setLoginLoading(false);
      setLoginError("Error de conexión.");
    }
  };

  const crearInvitacion = async () => {
    setFormLoading(true);
    const codigo = "INV-" + Math.random().toString(36).substring(2, 8).toUpperCase();
    const expira = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const rolData = await supabase("roles", { filter: `&nombre=eq.usuario`, select: "id" });
    const rolId = rolData[0]?.id;
    await fetch(`${SUPABASE_URL}/rest/v1/invitaciones`, {
      method: "POST",
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify({ empresa_id: empresa.id, rol_id: rolId, codigo, email: formData.email || null, usado: false, expira_en: expira }),
    });
    await loadData(adminUser.empresa_id);
    setFormLoading(false);
    setShowForm(null);
    setFormData({});
  };

  const crearConductor = async () => {
    setFormLoading(true);
    await fetch(`${SUPABASE_URL}/rest/v1/conductores`, {
      method: "POST",
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify({ empresa_id: empresa.id, nombre: formData.nombre, usuario: formData.usuario, pin: formData.pin || "1234", activo: true }),
    });
    await loadData(adminUser.empresa_id);
    setFormLoading(false);
    setShowForm(null);
    setFormData({});
  };

  const crearVehiculo = async () => {
    setFormLoading(true);
    await fetch(`${SUPABASE_URL}/rest/v1/vehiculos`, {
      method: "POST",
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify({ empresa_id: empresa.id, codigo: formData.codigo, descripcion: formData.descripcion || "", activo: true }),
    });
    await loadData(adminUser.empresa_id);
    setFormLoading(false);
    setShowForm(null);
    setFormData({});
  };

  const inputStyle = {
    width: "100%", padding: "11px 14px", borderRadius: 2,
    border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.03)",
    color: "#fff", fontSize: 12, outline: "none", boxSizing: "border-box",
    fontFamily: "inherit", letterSpacing: 1, marginBottom: 12,
  };

  const StatCard = ({ label, value, sub }) => (
    <div style={{ padding: "20px", borderRadius: 2, background: "#0A0A0A", border: "1px solid rgba(0,255,136,0.15)" }}>
      <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 9, letterSpacing: 3, marginBottom: 8 }}>{label}</div>
      <div style={{ color: "#fff", fontSize: 28, fontWeight: 700, letterSpacing: 2, marginBottom: 4 }}>{value}</div>
      {sub && <div style={{ color: GREEN, fontSize: 10, letterSpacing: 1 }}>{sub}</div>}
    </div>
  );

  const Modal = ({ title, children, onSave, onClose }) => (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}>
      <div style={{ width: 380, background: "#0A0A0A", borderRadius: 4, border: `1px solid rgba(0,255,136,0.2)`, padding: 28, boxShadow: `0 0 40px rgba(0,255,136,0.1)` }}>
        <div style={{ color: "#fff", fontSize: 13, fontWeight: 700, letterSpacing: 3, marginBottom: 20 }}>{title}</div>
        {children}
        <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
          <button onClick={onSave} disabled={formLoading} style={{ flex: 1, padding: "12px", borderRadius: 2, border: `1px solid ${GREEN}`, background: GREEN_DIM, color: "#fff", fontSize: 11, fontWeight: 700, letterSpacing: 2, cursor: "pointer", boxShadow: `0 0 10px ${GREEN_GLOW}` }}>
            {formLoading ? "GUARDANDO..." : "GUARDAR"}
          </button>
          <button onClick={onClose} style={{ padding: "12px 16px", borderRadius: 2, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "rgba(255,255,255,0.4)", fontSize: 11, cursor: "pointer" }}>
            CANCELAR
          </button>
        </div>
      </div>
    </div>
  );

  if (screen === "login") {
    return (
      <div style={{ minHeight: "100vh", background: "#000", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Courier New', monospace", padding: 16 }}>
        <div style={{ width: 380, background: "#0A0A0A", borderRadius: 4, border: "1px solid rgba(255,255,255,0.06)", padding: "40px 28px 36px" }}>
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <div style={{ width: 52, height: 52, border: `2px solid ${GREEN}`, transform: "rotate(45deg)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", boxShadow: `0 0 16px ${GREEN_GLOW}` }}>
              <svg style={{ transform: "rotate(-45deg)" }} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
              </svg>
            </div>
            <div style={{ color: "#fff", fontSize: 15, fontWeight: 700, letterSpacing: 5 }}>B&P COMPANY</div>
            <div style={{ color: GREEN, fontSize: 9, letterSpacing: 4, marginTop: 4 }}>PANEL DE ADMINISTRACIÓN</div>
          </div>

          <label style={{ color: "rgba(255,255,255,0.3)", fontSize: 9, letterSpacing: 3, display: "block", marginBottom: 8 }}>EMAIL</label>
          <input type="email" placeholder="tu@empresa.com" value={email} onChange={e => { setEmail(e.target.value); setLoginError(""); }} style={inputStyle} />
          <label style={{ color: "rgba(255,255,255,0.3)", fontSize: 9, letterSpacing: 3, display: "block", marginBottom: 8 }}>CONTRASEÑA</label>
          <input type="password" placeholder="••••••••" value={password} onChange={e => { setPassword(e.target.value); setLoginError(""); }} style={{ ...inputStyle, marginBottom: 24 }} />

          {loginError && <div style={{ color: "#FF4444", fontSize: 11, marginBottom: 16, textAlign: "center" }}>{loginError}</div>}

          <button onClick={handleLogin} disabled={loginLoading} style={{ width: "100%", padding: "15px", borderRadius: 2, border: `1px solid ${GREEN}`, background: GREEN_DIM, color: "#fff", fontSize: 11, fontWeight: 700, letterSpacing: 4, cursor: "pointer", boxShadow: `0 0 20px ${GREEN_GLOW}` }}>
            {loginLoading ? "VERIFICANDO..." : "ACCEDER"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#000", display: "flex", fontFamily: "'Courier New', monospace" }}>

      {/* Sidebar */}
      <div style={{ width: 220, background: "#0A0A0A", borderRight: "1px solid rgba(0,255,136,0.1)", display: "flex", flexDirection: "column", padding: "24px 0" }}>
        <div style={{ padding: "0 20px 24px", borderBottom: "1px solid rgba(0,255,136,0.08)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, border: `1.5px solid ${GREEN}`, transform: "rotate(45deg)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: `0 0 8px ${GREEN_GLOW}` }}>
              <svg style={{ transform: "rotate(-45deg)" }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
              </svg>
            </div>
            <div>
              <div style={{ color: "#fff", fontSize: 11, fontWeight: 700, letterSpacing: 2 }}>B&P COMPANY</div>
              <div style={{ color: GREEN, fontSize: 8, letterSpacing: 2, marginTop: 2 }}>{empresa?.nombre}</div>
            </div>
          </div>
        </div>

        <nav style={{ flex: 1, padding: "16px 0" }}>
          {NAV.map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id)} style={{ width: "100%", padding: "12px 20px", display: "flex", alignItems: "center", gap: 10, background: activeTab === item.id ? GREEN_DIM : "transparent", border: "none", borderLeft: activeTab === item.id ? `2px solid ${GREEN}` : "2px solid transparent", color: activeTab === item.id ? "#fff" : "rgba(255,255,255,0.3)", fontSize: 11, letterSpacing: 2, cursor: "pointer", textAlign: "left" }}>
              {item.label.toUpperCase()}
            </button>
          ))}
        </nav>

        <div style={{ padding: "16px 20px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 10, marginBottom: 4 }}>{adminUser?.nombre}</div>
          <button onClick={() => { setScreen("login"); setEmail(""); setPassword(""); }} style={{ width: "100%", padding: "10px", borderRadius: 2, border: "1px solid rgba(255,255,255,0.08)", background: "transparent", color: "rgba(255,255,255,0.3)", fontSize: 10, letterSpacing: 2, cursor: "pointer" }}>
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
              <StatCard label="CONDUCTORES" value={stats.conductores} sub="activos" />
              <StatCard label="VEHÍCULOS" value={stats.vehiculos} sub="en servicio" />
              <StatCard label="USUARIOS" value={stats.usuarios} sub="registrados" />
              <StatCard label="INVITACIONES" value={stats.invitaciones} sub="pendientes" />
            </div>
            <div style={{ padding: "20px", borderRadius: 2, background: "#0A0A0A", border: "1px solid rgba(0,255,136,0.1)" }}>
              <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 9, letterSpacing: 3, marginBottom: 16 }}>ACCIONES RÁPIDAS</div>
              <div style={{ display: "flex", gap: 12 }}>
                {[
                  { label: "NUEVO CONDUCTOR", action: () => { setActiveTab("conductores"); setShowForm("conductor"); } },
                  { label: "NUEVO VEHÍCULO", action: () => { setActiveTab("vehiculos"); setShowForm("vehiculo"); } },
                  { label: "INVITAR USUARIO", action: () => { setActiveTab("invitaciones"); setShowForm("invitacion"); } },
                ].map(btn => (
                  <button key={btn.label} onClick={btn.action} style={{ padding: "10px 16px", borderRadius: 2, border: `1px solid ${GREEN}`, background: GREEN_DIM, color: "#fff", fontSize: 10, letterSpacing: 2, cursor: "pointer" }}>
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
              <button onClick={() => setShowForm("conductor")} style={{ padding: "10px 16px", borderRadius: 2, border: `1px solid ${GREEN}`, background: GREEN_DIM, color: "#fff", fontSize: 10, letterSpacing: 2, cursor: "pointer" }}>+ NUEVO</button>
            </div>
            <div style={{ background: "#0A0A0A", borderRadius: 2, border: "1px solid rgba(255,255,255,0.06)", overflow: "hidden" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 100px", padding: "10px 16px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                {["NOMBRE", "USUARIO", "ESTADO"].map(h => <div key={h} style={{ color: "rgba(255,255,255,0.2)", fontSize: 9, letterSpacing: 2 }}>{h}</div>)}
              </div>
              {conductores.length === 0 ? (
                <div style={{ padding: "24px", textAlign: "center", color: "rgba(255,255,255,0.2)", fontSize: 11 }}>No hay conductores registrados</div>
              ) : conductores.map((c, i) => (
                <div key={c.id} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 100px", padding: "14px 16px", borderBottom: i < conductores.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none", alignItems: "center" }}>
                  <div style={{ color: "#fff", fontSize: 12 }}>{c.nombre}</div>
                  <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 11 }}>{c.usuario}</div>
                  <Badge activo={c.activo} />
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
              <button onClick={() => setShowForm("vehiculo")} style={{ padding: "10px 16px", borderRadius: 2, border: `1px solid ${GREEN}`, background: GREEN_DIM, color: "#fff", fontSize: 10, letterSpacing: 2, cursor: "pointer" }}>+ NUEVO</button>
            </div>
            <div style={{ background: "#0A0A0A", borderRadius: 2, border: "1px solid rgba(255,255,255,0.06)", overflow: "hidden" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 100px", padding: "10px 16px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                {["CÓDIGO", "DESCRIPCIÓN", "ESTADO"].map(h => <div key={h} style={{ color: "rgba(255,255,255,0.2)", fontSize: 9, letterSpacing: 2 }}>{h}</div>)}
              </div>
              {vehiculos.length === 0 ? (
                <div style={{ padding: "24px", textAlign: "center", color: "rgba(255,255,255,0.2)", fontSize: 11 }}>No hay vehículos registrados</div>
              ) : vehiculos.map((v, i) => (
                <div key={v.id} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 100px", padding: "14px 16px", borderBottom: i < vehiculos.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none", alignItems: "center" }}>
                  <div style={{ color: "#fff", fontSize: 12 }}>{v.codigo}</div>
                  <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 11 }}>{v.descripcion}</div>
                  <Badge activo={v.activo} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Usuarios */}
        {activeTab === "usuarios" && (
          <div>
            <div style={{ marginBottom: 24 }}>
              <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 9, letterSpacing: 3, marginBottom: 4 }}>GESTIÓN</div>
              <div style={{ color: "#fff", fontSize: 20, fontWeight: 700, letterSpacing: 2 }}>USUARIOS</div>
            </div>
            <div style={{ background: "#0A0A0A", borderRadius: 2, border: "1px solid rgba(255,255,255,0.06)", overflow: "hidden" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 100px", padding: "10px 16px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                {["NOMBRE", "EMAIL", "ESTADO"].map(h => <div key={h} style={{ color: "rgba(255,255,255,0.2)", fontSize: 9, letterSpacing: 2 }}>{h}</div>)}
              </div>
              {usuarios.length === 0 ? (
                <div style={{ padding: "24px", textAlign: "center", color: "rgba(255,255,255,0.2)", fontSize: 11 }}>No hay usuarios registrados</div>
              ) : usuarios.map((u, i) => (
                <div key={u.id} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 100px", padding: "14px 16px", borderBottom: i < usuarios.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none", alignItems: "center" }}>
                  <div style={{ color: "#fff", fontSize: 12 }}>{u.nombre}</div>
                  <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 11 }}>{u.email}</div>
                  <Badge activo={u.activo} />
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
              <button onClick={() => setShowForm("invitacion")} style={{ padding: "10px 16px", borderRadius: 2, border: `1px solid ${GREEN}`, background: GREEN_DIM, color: "#fff", fontSize: 10, letterSpacing: 2, cursor: "pointer" }}>+ CREAR</button>
            </div>
            <div style={{ background: "#0A0A0A", borderRadius: 2, border: "1px solid rgba(255,255,255,0.06)", overflow: "hidden" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 100px", padding: "10px 16px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                {["CÓDIGO", "EMAIL", "EXPIRA", "ESTADO"].map(h => <div key={h} style={{ color: "rgba(255,255,255,0.2)", fontSize: 9, letterSpacing: 2 }}>{h}</div>)}
              </div>
              {invitaciones.length === 0 ? (
                <div style={{ padding: "24px", textAlign: "center", color: "rgba(255,255,255,0.2)", fontSize: 11 }}>No hay invitaciones</div>
              ) : invitaciones.map((inv, i) => (
                <div key={inv.id} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 100px", padding: "14px 16px", borderBottom: i < invitaciones.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none", alignItems: "center" }}>
                  <div style={{ color: GREEN, fontSize: 12, letterSpacing: 1, fontFamily: "monospace" }}>{inv.codigo}</div>
                  <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 11 }}>{inv.email || "—"}</div>
                  <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 11 }}>{new Date(inv.expira_en).toLocaleDateString()}</div>
                  <Badge activo={!inv.usado} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showForm === "conductor" && (
        <Modal title="NUEVO CONDUCTOR" onSave={crearConductor} onClose={() => { setShowForm(null); setFormData({}); }}>
          <input placeholder="Nombre completo" value={formData.nombre || ""} onChange={e => setFormData({...formData, nombre: e.target.value})} style={inputStyle} />
          <input placeholder="Usuario (ej: conductor01)" value={formData.usuario || ""} onChange={e => setFormData({...formData, usuario: e.target.value})} style={inputStyle} />
          <input placeholder="PIN (default: 1234)" value={formData.pin || ""} onChange={e => setFormData({...formData, pin: e.target.value})} style={inputStyle} />
        </Modal>
      )}

      {showForm === "vehiculo" && (
        <Modal title="NUEVO VEHÍCULO" onSave={crearVehiculo} onClose={() => { setShowForm(null); setFormData({}); }}>
          <input placeholder="Código (ej: Unidad-006)" value={formData.codigo || ""} onChange={e => setFormData({...formData, codigo: e.target.value})} style={inputStyle} />
          <input placeholder="Descripción (opcional)" value={formData.descripcion || ""} onChange={e => setFormData({...formData, descripcion: e.target.value})} style={inputStyle} />
        </Modal>
      )}

      {showForm === "invitacion" && (
        <Modal title="CREAR INVITACIÓN" onSave={crearInvitacion} onClose={() => { setShowForm(null); setFormData({}); }}>
          <input placeholder="Email del usuario (opcional)" value={formData.email || ""} onChange={e => setFormData({...formData, email: e.target.value})} style={inputStyle} />
          <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 10, letterSpacing: 1 }}>Se generará un código único válido por 7 días.</div>
        </Modal>
      )}
    </div>
  );
}
