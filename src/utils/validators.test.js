import {
  normalizeText,
  validateEmail,
  validatePassword,
  validateRequired,
  validateUserPayload
} from './validators';

describe('validators', () => {
  it('normaliza texto en caso exitoso', () => {
    expect(normalizeText('  Ana  ')).toBe('Ana');
  });

  it('retorna error de correo para caso invalido', () => {
    expect(validateEmail('correo_invalido')).toMatch(/correo valido/i);
  });

  it('retorna error de contrasena para edge case de longitud', () => {
    expect(validatePassword('123')).toMatch(/al menos 6 caracteres/i);
  });

  it('valida payload de usuario exitoso', () => {
    const result = validateUserPayload({
      fullName: 'Ana Torres',
      email: 'ana@empresa.com',
      role: 'Admin'
    });

    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual({ fullName: '', email: '', role: '' });
  });

  it('valida error cuando faltan campos requeridos', () => {
    const result = validateUserPayload({
      fullName: '',
      email: 'ana@empresa.com',
      role: ''
    });

    expect(result.isValid).toBe(false);
    expect(result.errors.fullName).toBe(validateRequired('', 'El nombre completo'));
    expect(result.errors.role).toBe(validateRequired('', 'El rol'));
  });
});
