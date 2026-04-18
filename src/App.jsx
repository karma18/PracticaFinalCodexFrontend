import { useEffect, useState } from 'react';
import './App.css';
import {
  createUser,
  deleteUser,
  fetchBackendInfo,
  fetchHealth,
  fetchUsers,
  login,
  recoverPassword,
  register,
  updateUser
} from './services/api';
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

function App() {
  const [authView, setAuthView] = useState(AUTH_VIEW.LOGIN);
  const [activeSession, setActiveSession] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [authError, setAuthError] = useState('');
  const [isSubmittingAuth, setIsSubmittingAuth] = useState(false);
  const [isSubmittingUser, setIsSubmittingUser] = useState(false);

  const [backendInfo, setBackendInfo] = useState({ app: '', message: '', health: 'Verificando backend...' });
  const [users, setUsers] = useState([]);
  const [usersError, setUsersError] = useState('');
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [userForm, setUserForm] = useState({ fullName: '', email: '', role: '' });
  const [userErrors, setUserErrors] = useState({ fullName: '', email: '', role: '' });

  const [authForm, setAuthForm] = useState({ fullName: '', email: '', password: '' });

  useEffect(() => {
    let isMounted = true;

    async function loadBackendStatus() {
      try {
        const [infoResponse, healthResponse] = await Promise.all([fetchBackendInfo(), fetchHealth()]);

        if (!isMounted) {
          return;
        }

        setBackendInfo({
          app: infoResponse.app,
          message: infoResponse.message,
          health: `Backend disponible (${healthResponse.status})`
        });
      } catch (_error) {
        if (!isMounted) {
          return;
        }

        setBackendInfo({
          app: 'Backend no disponible',
          message: 'Inicia PracticaFinalCodexBackend para habilitar autenticacion y CRUD.',
          health: 'Sin conexion'
        });
      }
    }

    loadBackendStatus();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!activeSession) {
      setUsers([]);
      setUsersError('');
      return;
    }

    let isMounted = true;

    async function loadUsers() {
      setIsLoadingUsers(true);
      setUsersError('');

      try {
        const response = await fetchUsers();

        if (!isMounted) {
          return;
        }

        setUsers(response.items);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setUsersError(error.message);
      } finally {
        if (isMounted) {
          setIsLoadingUsers(false);
        }
      }
    }

    loadUsers();

    return () => {
      isMounted = false;
    };
  }, [activeSession]);

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

    setIsSubmittingAuth(true);

    try {
      if (authView === AUTH_VIEW.LOGIN) {
        const response = await login({
          email: normalizeText(authForm.email),
          password: authForm.password
        });

        setActiveSession(response.user);
        setFeedback(response.message);
        return;
      }

      if (authView === AUTH_VIEW.REGISTER) {
        const response = await register({
          fullName: normalizeText(authForm.fullName),
          email: normalizeText(authForm.email),
          password: authForm.password
        });

        switchAuthView(AUTH_VIEW.LOGIN);
        setFeedback(response.message);
        return;
      }

      const response = await recoverPassword({ email: normalizeText(authForm.email) });
      setFeedback(response.message);
    } catch (error) {
      setAuthError(error.message);
    } finally {
      setIsSubmittingAuth(false);
    }
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

    setIsSubmittingUser(true);
    setUsersError('');

    try {
      if (editingUserId) {
        const response = await updateUser(editingUserId, payload);
        setUsers((prev) => prev.map((user) => (user.id === editingUserId ? response.user : user)));
        setFeedback(response.message);
        clearUserForm();
        return;
      }

      const response = await createUser(payload);
      setUsers((prev) => [...prev, response.user]);
      setFeedback(response.message);
      clearUserForm();
    } catch (error) {
      setUsersError(error.message);
    } finally {
      setIsSubmittingUser(false);
    }
  };

  const handleDelete = async (id) => {
    setUsersError('');

    try {
      const response = await deleteUser(id);
      setUsers((prev) => prev.filter((user) => user.id !== id));
      setFeedback(response.message);

      if (editingUserId === id) {
        clearUserForm();
      }
    } catch (error) {
      setUsersError(error.message);
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
        <p>{backendInfo.message}</p>
        <div className="status-grid" aria-label="Estado de integracion">
          <span className="status-pill">{backendInfo.app || 'Sin backend'}</span>
          <span className="status-pill">{backendInfo.health}</span>
        </div>
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

            <button type="submit" className="primary-btn" disabled={isSubmittingAuth}>
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
              Sesion activa: <strong>{activeSession.email}</strong> ({activeSession.role})
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
                <button type="submit" className="primary-btn" disabled={isSubmittingUser}>
                  {editingUserId ? 'Guardar cambios' : 'Crear usuario'}
                </button>
                <button type="button" className="ghost-btn" onClick={clearUserForm}>
                  Limpiar
                </button>
              </div>
            </form>

            <div className="users-table-wrap">
              <h2>Usuarios registrados</h2>
              {usersError ? <p className="message error">{usersError}</p> : null}
              {isLoadingUsers ? <p className="message info">Cargando usuarios...</p> : null}
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
                  {!isLoadingUsers && users.length === 0 ? (
                    <tr>
                      <td colSpan="5">No hay usuarios registrados.</td>
                    </tr>
                  ) : null}
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
