const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeText(value) {
  return String(value ?? '').trim();
}

export function validateEmail(email) {
  const normalizedEmail = normalizeText(email).toLowerCase();

  if (!normalizedEmail) {
    return 'El correo es obligatorio.';
  }

  if (!EMAIL_REGEX.test(normalizedEmail)) {
    return 'Ingresa un correo valido.';
  }

  return '';
}

export function validatePassword(password) {
  const normalizedPassword = normalizeText(password);

  if (!normalizedPassword) {
    return 'La contrasena es obligatoria.';
  }

  if (normalizedPassword.length < 6) {
    return 'La contrasena debe tener al menos 6 caracteres.';
  }

  return '';
}

export function validateRequired(value, label) {
  if (!normalizeText(value)) {
    return `${label} es obligatorio.`;
  }

  return '';
}

export function validateUserPayload(payload) {
  const errors = {
    fullName: validateRequired(payload.fullName, 'El nombre completo'),
    email: validateEmail(payload.email),
    role: validateRequired(payload.role, 'El rol')
  };

  return {
    errors,
    isValid: !Object.values(errors).some(Boolean)
  };
}
