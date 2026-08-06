import { useState, useEffect } from "react";

const SUPABASE_URL = "https://ahuraftnoxslotrcfhun.supabase.co";
const SUPABASE_KEY = "sb_publishable_9Up-_iimijqn6NdiOzUrNw_b_RPAQGg";

const GREEN = "#00FF88";
const GREEN_GLOW = "rgba(0,255,136,0.3)";
const GREEN_DIM = "rgba(0,255,136,0.08)";

async function supabaseGet(table, filter = "", select = "*") {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=${select}${filter}`, {
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
  });
  return res.json();
}

async function supabasePost(table, body) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: "POST",
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, "Content-Type": "application/json", Prefer: "return=minimal" },
    body: JSON.stringify(body),
  });
  return res.ok;
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
  const [menuOpen, setMenuOpen] = useState(false);
  const [adminUser, setAdminUser] = useState(null);
  const [empresa, setEmpresa] = useState(null);
  const [conductores, setConductores] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [invitaciones, setInvitaciones] = useState([]);
  const [showForm, setShowForm] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  const stats = {
    conductores: conductores.filter(c => c.activo).length,
    vehiculos: vehiculos.filter(v => v.activo).length,
    usuarios: usuarios.length,
    invitaciones: invitaciones.filter(i => !i.usado).length,
  };

  const loadData = async (empresaId) => {
    const [c, v, u, i] = await Promise.all([
      supabaseGet("conductores", `&empresa_id=eq.${empresaId}`),
      supabaseGet("vehiculos", `&empresa_id=eq.${empresaId}`),
      supabaseGet("usuarios", `&empresa_id=eq.${empresaId}`),
      supabaseGet("invitaciones", `&empresa_id=eq.${empresaId}&order=created_at.desc`),
    ]);
    setConductores(Array.isArray(c) ? c : []);
    setVehiculos(Array.isArray(v) ? v : []);
    setUsuarios(Array.isArray(u) ? u : []);
    setInvitaciones(Array.isArray(i) ? i : []);
  };

  const handleLogin = async () => {
    if (!email || !password) { setLoginError("Ingresa tus credenciales."); return; }
    setLoginError(""); setLoginLoading(true);
    try {
      const data = await supabaseGet("usuarios", `&email=eq.${email}&password_hash=eq.${password}&activo=eq.true`, "id,nombre,email,empresa_id,rol_id,empresas(id,nombre,codigo)");
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

  const crearConductor = async (formData) => {
    if (!formData.nombre || !formData.usuario) return;
    setFormLoading(true);
    await supabasePost("conductores", { empresa_id: empresa.id, nombre: formData.nombre, usuario: formData.usuario, pin: formData.pin || "1234", activo: true });
    await loadData(adminUser.empresa_id);
    setFormLoading(false);
    setShowForm(null);
  };

  const crearVehiculo = async (formData) => {
    if (!formData.codigo) return;
    setFormLoading(true);
    await supabasePost("vehiculos", { empresa_id: empresa.id, codigo: formData.codigo, descripcion: formData.descripcion || "", activo: true });
    await loadData(adminUser.empresa_id);
    setFormLoading(false);
    setShowForm(null);
  };

  const crearInvitacion = async (formData) => {
    setFormLoading(true);
    const codigo = "INV-" + Math.random().toString(36).substring(2, 8).toUpperCase();
    const expira = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const rolData = await supabaseGet("roles", `&nombre=eq.usuario`, "id");
    const rolId = Array.isArray(rolData) && rolData[0]?.id;
    await supabasePost("invitaciones", { empresa_id: empresa.id, rol_id: rolId, codigo, email: formData.email || null, usado: false, expira_en: expira });
    await loadData(adminUser.empresa_id);
    setFormLoading(false);
    setShowForm(null);
  };

  const inputStyle = {
    width: "100%", padding: "13px 14px", borderRadius: 2,
    border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.03)",
    color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box",
    fontFamily: "inherit", letterSpacing: 1, marginBottom: 14, WebkitAppearance: "none",
  };

  // Modal component with local state to avoid re-render keyboard issue
  const FormModal = ({ title, fields, onSave, onClose }) => {
    const [local, setLocal] = useState({});
    return (
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: 20 }}>
        <div style={{ width: "100%", maxWidth: 400, background: "#0A0A0A", borderRadius: 4, border: `1px solid rgba(0,255,136,0.2)`, padding: 24, boxShadow: `0 0 40px rgba(0,255,136,0.1)` }}>
          <div style={{ color: "#fff", fontSize: 12, fontWeight: 700, letterSpacing: 3, marginBottom: 20 }}>{title}</div>
          {fields.map(f => (
            <div key={f.key}>
              <label style={{ color: "rgba(255,255,255,0.3)", fontSize: 9, letterSpacing: 2, display: "block", marginBottom: 6 }}>{f.label}</label>
              <input
                placeholder={f.placeholder}
                defaultValue=""
                onBlur={e => setLocal(p => ({...p, [f.key]: e.target.value}))}
                style={inputStyle}
              />
            </div>
          ))}
          <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
            <button onClick={() => onSave(local)} disabled={formLoading} style={{ flex: 1, padding: "14px", borderRadius: 2, border: `1px solid ${GREEN}`, background: GREEN_DIM, color: "#fff", fontSize: 11, fontWeight: 700, letterSpacing: 2, cursor: "pointer", boxShadow: `0 0 10px ${GREEN_GLOW}` }}>
              {formLoading ? "GUARDANDO..." : "GUARDAR"}
            </button>
            <button onClick={onClose} style={{ padding: "14px 16px", borderRadius: 2, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "rgba(255,255,255,0.4)", fontSize: 11, cursor: "pointer" }}>
              CANCELAR
            </button>
          </div>
        </div>
      </div>
    );
  };

  const Logo = () => (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ width: 32, height: 32, border: `1.5px solid ${GREEN}`, transform: "rotate(45deg)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: `0 0 8px ${GREEN_GLOW}` }}>
        <svg style={{ transform: "rotate(-45deg)" }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
        </svg>
      </div>
      <div>
        <div style={{ color: "#fff", fontSize: 11, fontWeight: 700, letterSpacing: 2 }}>B&P COMPANY</div>
        {empresa && <div style={{ color: GREEN, fontSize: 8, letterSpacing: 2, marginTop: 1 }}>{empresa.nombre}</div>}
      </div>
    </div>
  );

  const TableEmpty = ({ msg }) => (
    <div style={{ padding: "28px", textAlign: "center", color: "rgba(255,255,255,0.2)", fontSize: 11, letterSpacing: 1 }}>{msg}</div>
  );

  if (screen === "login") {
    return (
      <div style={{ minHeight: "100vh", background: "#000", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Courier New', monospace", padding: 20 }}>
        <div style={{ width: "100%", maxWidth: 380, background: "#0A0A0A", borderRadius: 4, border: "1px solid rgba(255,255,255,0.06)", padding: "40px 24px 36px" }}>
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <div style={{ width: 56, height: 56, border: `2px solid ${GREEN}`, transform: "rotate(45deg)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", boxShadow: `0 0 16px ${GREEN_GLOW}` }}>
              <svg style={{ transform: "rotate(-45deg)" }} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
              </svg>
            </div>
            <div style={{ color: "#fff", fontSize: 16, fontWeight: 700, letterSpacing: 5 }}>B&P COMPANY</div>
            <div style={{ color: GREEN, fontSize: 9, letterSpacing: 4, marginTop: 4 }}>PANEL DE ADMINISTRACIÓN</div>
          </div>

          <label style={{ color: "rgba(255,255,255,0.3)", fontSize: 9, letterSpacing: 3, display: "block", marginBottom: 8 }}>EMAIL</label>
          <input type="email" placeholder="tu@empresa.com" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} />
          <label style={{ color: "rgba(255,255,255,0.3)", fontSize: 9, letterSpacing: 3, display: "block", marginBottom: 8 }}>CONTRASEÑA</label>
          <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} style={{ ...inputStyle, marginBottom: 24 }} />

          {loginError && <div style={{ color: "#FF4444", fontSize: 11, marginBottom: 16, textAlign: "center" }}>{loginError}</div>}

          <button onClick={handleLogin} disabled={loginLoading} style={{ width: "100%", padding: "16px", borderRadius: 2, border: `1px solid ${GREEN}`, background: GREEN_DIM, color: "#fff", fontSize: 12, fontWeight: 700, letterSpacing: 4, cursor: "pointer", boxShadow: `0 0 20px ${GREEN_GLOW}` }}>
            {loginLoading ? "VERIFICANDO..." : "ACCEDER"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#000", fontFamily: "'Courier New', monospace" }}>

      {/* Mobile Header */}
      <div style={{ background: "#0A0A0A", borderBottom: "1px solid rgba(0,255,136,0.1)", padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 100 }}>
        <Logo />
        <button onClick={() => setMenuOpen(m => !m)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
          <div style={{ width: 20, height: 2, background: menuOpen ? GREEN : "rgba(255,255,255,0.5)", marginBottom: 4, transition: "all 0.2s" }} />
          <div style={{ width: 20, height: 2, background: menuOpen ? GREEN : "rgba(255,255,255,0.5)", marginBottom: 4 }} />
          <div style={{ width: 20, height: 2, background: menuOpen ? GREEN : "rgba(255,255,255,0.5)" }} />
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div style={{ background: "#0A0A0A", borderBottom: "1px solid rgba(0,255,136,0.1)", padding: "8px 0" }}>
          {NAV.map(item => (
            <button key={item.id} onClick={() => { setActiveTab(item.id); setMenuOpen(false); }} style={{ width: "100%", padding: "14px 20px", display: "flex", alignItems: "center", background: activeTab === item.id ? GREEN_DIM : "transparent", border: "none", borderLeft: activeTab === item.id ? `2px solid ${GREEN}` : "2px solid transparent", color: activeTab === item.id ? "#fff" : "rgba(255,255,255,0.4)", fontSize: 12, letterSpacing: 2, cursor: "pointer", textAlign: "left" }}>
              {item.label.toUpperCase()}
            </button>
          ))}
          <div style={{ padding: "12px 20px", borderTop: "1px solid rgba(255,255,255,0.05)", marginTop: 4 }}>
            <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 10, marginBottom: 8 }}>{adminUser?.nombre}</div>
            <button onClick={() => { setScreen("login"); setMenuOpen(false); }} style={{ padding: "10px 16px", borderRadius: 2, border: "1px solid rgba(255,255,255,0.08)", background: "transparent", color: "rgba(255,255,255,0.3)", fontSize: 10, letterSpacing: 2, cursor: "pointer" }}>
              CERRAR SESIÓN
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      <div style={{ padding: 16, maxWidth: 800, margin: "0 auto" }}>

        {/* Dashboard */}
        {activeTab === "dashboard" && (
          <div>
            <div style={{ marginBottom: 20 }}>
              <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 9, letterSpacing: 3, marginBottom: 4 }}>BIENVENIDO</div>
              <div style={{ color: "#fff", fontSize: 18, fontWeight: 700, letterSpacing: 2 }}>DASHBOARD</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
              {[
                { label: "CONDUCTORES", value: stats.conductores, sub: "activos" },
                { label: "VEHÍCULOS", value: stats.vehiculos, sub: "en servicio" },
                { label: "USUARIOS", value: stats.usuarios, sub: "registrados" },
                { label: "INVITACIONES", value: stats.invitaciones, sub: "pendientes" },
              ].map(s => (
                <div key={s.label} style={{ padding: "16px", borderRadius: 2, background: "#0A0A0A", border: "1px solid rgba(0,255,136,0.15)" }}>
                  <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 8, letterSpacing: 3, marginBottom: 6 }}>{s.label}</div>
                  <div style={{ color: "#fff", fontSize: 24, fontWeight: 700, marginBottom: 2 }}>{s.value}</div>
                  <div style={{ color: GREEN, fontSize: 9, letterSpacing: 1 }}>{s.sub}</div>
                </div>
              ))}
            </div>
            <div style={{ padding: "16px", borderRadius: 2, background: "#0A0A0A", border: "1px solid rgba(0,255,136,0.1)" }}>
              <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 9, letterSpacing: 3, marginBottom: 14 }}>ACCIONES RÁPIDAS</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  { label: "NUEVO CONDUCTOR", action: () => { setActiveTab("conductores"); setShowForm("conductor"); } },
                  { label: "NUEVO VEHÍCULO", action: () => { setActiveTab("vehiculos"); setShowForm("vehiculo"); } },
                  { label: "INVITAR USUARIO", action: () => { setActiveTab("invitaciones"); setShowForm("invitacion"); } },
                ].map(btn => (
                  <button key={btn.label} onClick={btn.action} style={{ padding: "12px 16px", borderRadius: 2, border: `1px solid ${GREEN}`, background: GREEN_DIM, color: "#fff", fontSize: 11, letterSpacing: 2, cursor: "pointer", textAlign: "left" }}>
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
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 20 }}>
              <div>
                <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 9, letterSpacing: 3, marginBottom: 4 }}>GESTIÓN</div>
                <div style={{ color: "#fff", fontSize: 18, fontWeight: 700, letterSpacing: 2 }}>CONDUCTORES</div>
              </div>
              <button onClick={() => setShowForm("conductor")} style={{ padding: "10px 14px", borderRadius: 2, border: `1px solid ${GREEN}`, background: GREEN_DIM, color: "#fff", fontSize: 10, letterSpacing: 2, cursor: "pointer" }}>+ NUEVO</button>
            </div>
            <div style={{ background: "#0A0A0A", borderRadius: 2, border: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 90px", padding: "10px 14px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                {["NOMBRE", "USUARIO", "ESTADO"].map(h => <div key={h} style={{ color: "rgba(255,255,255,0.2)", fontSize: 8, letterSpacing: 2 }}>{h}</div>)}
              </div>
              {conductores.length === 0 ? <TableEmpty msg="No hay conductores registrados" /> :
                conductores.map((c, i) => (
                  <div key={c.id} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 90px", padding: "14px", alignItems: "center", borderBottom: i < conductores.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                    <div style={{ color: "#fff", fontSize: 13 }}>{c.nombre}</div>
                    <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 11 }}>{c.usuario}</div>
                    <Badge activo={c.activo} />
                  </div>
                ))
              }
            </div>
          </div>
        )}

        {/* Vehículos */}
        {activeTab === "vehiculos" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 20 }}>
              <div>
                <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 9, letterSpacing: 3, marginBottom: 4 }}>GESTIÓN</div>
                <div style={{ color: "#fff", fontSize: 18, fontWeight: 700, letterSpacing: 2 }}>VEHÍCULOS</div>
              </div>
              <button onClick={() => setShowForm("vehiculo")} style={{ padding: "10px 14px", borderRadius: 2, border: `1px solid ${GREEN}`, background: GREEN_DIM, color: "#fff", fontSize: 10, letterSpacing: 2, cursor: "pointer" }}>+ NUEVO</button>
            </div>
            <div style={{ background: "#0A0A0A", borderRadius: 2, border: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 90px", padding: "10px 14px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                {["CÓDIGO", "DESCRIPCIÓN", "ESTADO"].map(h => <div key={h} style={{ color: "rgba(255,255,255,0.2)", fontSize: 8, letterSpacing: 2 }}>{h}</div>)}
              </div>
              {vehiculos.length === 0 ? <TableEmpty msg="No hay vehículos registrados" /> :
                vehiculos.map((v, i) => (
                  <div key={v.id} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 90px", padding: "14px", alignItems: "center", borderBottom: i < vehiculos.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                    <div style={{ color: "#fff", fontSize: 13 }}>{v.codigo}</div>
                    <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 11 }}>{v.descripcion}</div>
                    <Badge activo={v.activo} />
                  </div>
                ))
              }
            </div>
          </div>
        )}

        {/* Usuarios */}
        {activeTab === "usuarios" && (
          <div>
            <div style={{ marginBottom: 20 }}>
              <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 9, letterSpacing: 3, marginBottom: 4 }}>GESTIÓN</div>
              <div style={{ color: "#fff", fontSize: 18, fontWeight: 700, letterSpacing: 2 }}>USUARIOS</div>
            </div>
            <div style={{ background: "#0A0A0A", borderRadius: 2, border: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 90px", padding: "10px 14px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                {["NOMBRE", "EMAIL", "ESTADO"].map(h => <div key={h} style={{ color: "rgba(255,255,255,0.2)", fontSize: 8, letterSpacing: 2 }}>{h}</div>)}
              </div>
              {usuarios.length === 0 ? <TableEmpty msg="No hay usuarios registrados" /> :
                usuarios.map((u, i) => (
                  <div key={u.id} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 90px", padding: "14px", alignItems: "center", borderBottom: i < usuarios.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                    <div style={{ color: "#fff", fontSize: 13 }}>{u.nombre}</div>
                    <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 11 }}>{u.email}</div>
                    <Badge activo={u.activo} />
                  </div>
                ))
              }
            </div>
          </div>
        )}

        {/* Invitaciones */}
        {activeTab === "invitaciones" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 20 }}>
              <div>
                <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 9, letterSpacing: 3, marginBottom: 4 }}>GESTIÓN</div>
                <div style={{ color: "#fff", fontSize: 18, fontWeight: 700, letterSpacing: 2 }}>INVITACIONES</div>
              </div>
              <button onClick={() => setShowForm("invitacion")} style={{ padding: "10px 14px", borderRadius: 2, border: `1px solid ${GREEN}`, background: GREEN_DIM, color: "#fff", fontSize: 10, letterSpacing: 2, cursor: "pointer" }}>+ CREAR</button>
            </div>
            <div style={{ background: "#0A0A0A", borderRadius: 2, border: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 80px", padding: "10px 14px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                {["CÓDIGO", "EMAIL", "ESTADO"].map(h => <div key={h} style={{ color: "rgba(255,255,255,0.2)", fontSize: 8, letterSpacing: 2 }}>{h}</div>)}
              </div>
              {invitaciones.length === 0 ? <TableEmpty msg="No hay invitaciones creadas" /> :
                invitaciones.map((inv, i) => (
                  <div key={inv.id} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 80px", padding: "14px", alignItems: "center", borderBottom: i < invitaciones.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                    <div style={{ color: GREEN, fontSize: 12, letterSpacing: 1 }}>{inv.codigo}</div>
                    <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 11 }}>{inv.email || "—"}</div>
                    <Badge activo={!inv.usado} />
                  </div>
                ))
              }
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showForm === "conductor" && (
        <FormModal
          title="NUEVO CONDUCTOR"
          fields={[
            { key: "nombre", label: "NOMBRE COMPLETO", placeholder: "Ej: Juan Pérez" },
            { key: "usuario", label: "USUARIO", placeholder: "Ej: conductor01" },
            { key: "pin", label: "PIN (OPCIONAL, DEFAULT: 1234)", placeholder: "1234" },
          ]}
          onSave={crearConductor}
          onClose={() => setShowForm(null)}
        />
      )}

      {showForm === "vehiculo" && (
        <FormModal
          title="NUEVO VEHÍCULO"
          fields={[
            { key: "codigo", label: "CÓDIGO", placeholder: "Ej: Unidad-006" },
            { key: "descripcion", label: "DESCRIPCIÓN (OPCIONAL)", placeholder: "Ej: Bus azul" },
          ]}
          onSave={crearVehiculo}
          onClose={() => setShowForm(null)}
        />
      )}

      {showForm === "invitacion" && (
        <FormModal
          title="CREAR INVITACIÓN"
          fields={[
            { key: "email", label: "EMAIL DEL USUARIO (OPCIONAL)", placeholder: "usuario@email.com" },
          ]}
          onSave={crearInvitacion}
          onClose={() => setShowForm(null)}
        />
      )}
    </div>
  );
}
