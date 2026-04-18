import { useMemo, useState } from 'react';
import './App.css';
import {
  normalizeText,
  validateEmail,
  validatePassword,
  validateRequired,
  validateUserPayload
} from './utils/validators';

const AUTH_VIEW = {
  LOGIN: 'login',
  REGISTER: 'register',
  RECOVERY: 'recovery'
};

const API_ENDPOINTS = {
  login: '/api/auth/login',
  register: '/api/auth/register',
  recovery: '/api/auth/recover-password',
  users: '/api/users'
};

const seedUsers = [
  { id: 1, fullName: 'Ana Torres', email: 'ana@empresa.com', role: 'Admin' },
  { id: 2, fullName: 'Luis Diaz', email: 'luis@empresa.com', role: 'Editor' }
];

function createApiClient() {
  const buildResponse = (endpoint, payload) =>
    Promise.resolve({ ok: true, endpoint, payload, message: 'Integracion lista para backend real.' });

  return {
    login: (payload) => buildResponse(API_ENDPOINTS.login, payload),
    register: (payload) => buildResponse(API_ENDPOINTS.register, payload),
    recovery: (payload) => buildResponse(API_ENDPOINTS.recovery, payload),
    createUser: (payload) => buildResponse(API_ENDPOINTS.users, payload),
    updateUser: (id, payload) => buildResponse(`${API_ENDPOINTS.users}/${id}`, payload),
    deleteUser: (id) => buildResponse(`${API_ENDPOINTS.users}/${id}`, {})
  };
}

function App() {
  const apiClient = useMemo(() => createApiClient(), []);
  const [authView, setAuthView] = useState(AUTH_VIEW.LOGIN);
  const [activeSession, setActiveSession] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [authError, setAuthError] = useState('');

  const [users, setUsers] = useState(seedUsers);
  const [editingUserId, setEditingUserId] = useState(null);
  const [userForm, setUserForm] = useState({ fullName: '', email: '', role: '' });
  const [userErrors, setUserErrors] = useState({ fullName: '', email: '', role: '' });

  const [authForm, setAuthForm] = useState({ fullName: '', email: '', password: '' });

  const clearAuthMessages = () => {
    setAuthError('');
    setFeedback('');
  };

  const switchAuthView = (view) => {
    setAuthView(view);
    setAuthForm({ fullName: '', email: '', password: '' });
    clearAuthMessages();
  };

  const handleAuthField = (field, value) => {
    setAuthForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleAuthSubmit = async (event) => {
    event.preventDefault();
    clearAuthMessages();

    const emailError = validateEmail(authForm.email);
    const passwordError = authView === AUTH_VIEW.RECOVERY ? '' : validatePassword(authForm.password);
    const fullNameError = authView === AUTH_VIEW.REGISTER ? validateRequired(authForm.fullName, 'El nombre completo') : '';

    const currentError = fullNameError || emailError || passwordError;

    if (currentError) {
      setAuthError(currentError);
      return;
    }

    if (authView === AUTH_VIEW.LOGIN) {
      await apiClient.login({ email: normalizeText(authForm.email), password: authForm.password });
      setActiveSession({ email: normalizeText(authForm.email) });
      setFeedback('Sesion iniciada en frontend. Pendiente de validar token con backend.');
      return;
    }

    if (authView === AUTH_VIEW.REGISTER) {
      await apiClient.register({
        fullName: normalizeText(authForm.fullName),
        email: normalizeText(authForm.email),
        password: authForm.password
      });
      setFeedback('Registro exitoso en modo local. Ya puedes iniciar sesion.');
      switchAuthView(AUTH_VIEW.LOGIN);
      return;
    }

    await apiClient.recovery({ email: normalizeText(authForm.email) });
    setFeedback('Solicitud enviada. Conecta este flujo al endpoint de recuperacion real.');
  };

  const clearUserForm = () => {
    setUserForm({ fullName: '', email: '', role: '' });
    setUserErrors({ fullName: '', email: '', role: '' });
    setEditingUserId(null);
  };

  const handleUserField = (field, value) => {
    setUserForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleEdit = (user) => {
    setEditingUserId(user.id);
    setUserForm({ fullName: user.fullName, email: user.email, role: user.role });
    setUserErrors({ fullName: '', email: '', role: '' });
  };

  const handleUserSubmit = async (event) => {
    event.preventDefault();
    const { errors, isValid } = validateUserPayload(userForm);
    setUserErrors(errors);

    if (!isValid) {
      return;
    }

    const payload = {
      fullName: normalizeText(userForm.fullName),
      email: normalizeText(userForm.email).toLowerCase(),
      role: normalizeText(userForm.role)
    };

    if (editingUserId) {
      await apiClient.updateUser(editingUserId, payload);
      setUsers((prev) => prev.map((user) => (user.id === editingUserId ? { ...user, ...payload } : user)));
      setFeedback('Usuario actualizado localmente. Falta conectar PUT /api/users/:id.');
      clearUserForm();
      return;
    }

    await apiClient.createUser(payload);
    const nextId = users.length ? Math.max(...users.map((item) => item.id)) + 1 : 1;
    setUsers((prev) => [...prev, { id: nextId, ...payload }]);
    setFeedback('Usuario creado localmente. Falta conectar POST /api/users.');
    clearUserForm();
  };

  const handleDelete = async (id) => {
    await apiClient.deleteUser(id);
    setUsers((prev) => prev.filter((user) => user.id !== id));
    setFeedback('Usuario eliminado localmente. Falta conectar DELETE /api/users/:id.');

    if (editingUserId === id) {
      clearUserForm();
    }
  };

  const handleLogout = () => {
    setActiveSession(null);
    switchAuthView(AUTH_VIEW.LOGIN);
    clearUserForm();
  };

  return (
    <main className="app-shell">
      <header className="header">
        <h1>Sistema de Autenticacion y CRUD de Usuarios</h1>
        <p>
          Frontend preparado para conectar endpoints reales de autenticacion y gestion de usuarios.
        </p>
      </header>

      {!activeSession ? (
        <section className="panel" aria-label="Panel de autenticacion">
          <nav className="tabs" aria-label="Secciones de autenticacion">
            <button
              type="button"
              className={authView === AUTH_VIEW.LOGIN ? 'tab active' : 'tab'}
              onClick={() => switchAuthView(AUTH_VIEW.LOGIN)}
            >
              Login
            </button>
            <button
              type="button"
              className={authView === AUTH_VIEW.REGISTER ? 'tab active' : 'tab'}
              onClick={() => switchAuthView(AUTH_VIEW.REGISTER)}
            >
              Registro
            </button>
            <button
              type="button"
              className={authView === AUTH_VIEW.RECOVERY ? 'tab active' : 'tab'}
              onClick={() => switchAuthView(AUTH_VIEW.RECOVERY)}
            >
              Recuperar contrasena
            </button>
          </nav>

          <form className="form-grid" onSubmit={handleAuthSubmit}>
            {authView === AUTH_VIEW.REGISTER ? (
              <label>
                Nombre completo
                <input
                  type="text"
                  value={authForm.fullName}
                  onChange={(event) => handleAuthField('fullName', event.target.value)}
                  placeholder="Ej: Maria Perez"
                />
              </label>
            ) : null}

            <label>
              Correo
              <input
                type="email"
                value={authForm.email}
                onChange={(event) => handleAuthField('email', event.target.value)}
                placeholder="correo@dominio.com"
              />
            </label>

            {authView !== AUTH_VIEW.RECOVERY ? (
              <label>
                Contrasena
                <input
                  type="password"
                  value={authForm.password}
                  onChange={(event) => handleAuthField('password', event.target.value)}
                  placeholder="******"
                />
              </label>
            ) : null}

            {authError ? <p className="message error">{authError}</p> : null}

            <button type="submit" className="primary-btn">
              {authView === AUTH_VIEW.LOGIN && 'Iniciar sesion'}
              {authView === AUTH_VIEW.REGISTER && 'Registrarme'}
              {authView === AUTH_VIEW.RECOVERY && 'Enviar recuperacion'}
            </button>
          </form>
        </section>
      ) : (
        <section className="panel" aria-label="Panel de administracion de usuarios">
          <div className="session-bar">
            <p>
              Sesion activa: <strong>{activeSession.email}</strong>
            </p>
            <button type="button" className="ghost-btn" onClick={handleLogout}>
              Cerrar sesion
            </button>
          </div>

          <div className="crud-layout">
            <form className="form-grid" onSubmit={handleUserSubmit}>
              <h2>{editingUserId ? 'Editar usuario' : 'Crear usuario'}</h2>
              <label>
                Nombre completo
                <input
                  type="text"
                  value={userForm.fullName}
                  onChange={(event) => handleUserField('fullName', event.target.value)}
                />
                {userErrors.fullName ? <span className="field-error">{userErrors.fullName}</span> : null}
              </label>

              <label>
                Correo
                <input
                  type="email"
                  value={userForm.email}
                  onChange={(event) => handleUserField('email', event.target.value)}
                />
                {userErrors.email ? <span className="field-error">{userErrors.email}</span> : null}
              </label>

              <label>
                Rol
                <input
                  type="text"
                  value={userForm.role}
                  onChange={(event) => handleUserField('role', event.target.value)}
                  placeholder="Admin / Editor / Viewer"
                />
                {userErrors.role ? <span className="field-error">{userErrors.role}</span> : null}
              </label>

              <div className="actions">
                <button type="submit" className="primary-btn">
                  {editingUserId ? 'Guardar cambios' : 'Crear usuario'}
                </button>
                <button type="button" className="ghost-btn" onClick={clearUserForm}>
                  Limpiar
                </button>
              </div>
            </form>

            <div className="users-table-wrap">
              <h2>Usuarios registrados</h2>
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Correo</th>
                    <th>Rol</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td>{user.id}</td>
                      <td>{user.fullName}</td>
                      <td>{user.email}</td>
                      <td>{user.role}</td>
                      <td>
                        <div className="actions">
                          <button type="button" className="ghost-btn" onClick={() => handleEdit(user)}>
                            Editar
                          </button>
                          <button type="button" className="danger-btn" onClick={() => handleDelete(user.id)}>
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {feedback ? <p className="message info">{feedback}</p> : null}
    </main>
  );
}

export default App;
