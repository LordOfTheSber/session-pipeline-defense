import { useState } from 'react';
import type { FormEvent } from 'react';
import { gameApi } from '@/shared/api/gameApi';
import { clearAuthToken, setAuthToken } from '@/shared/lib/auth';
import { getStoredLanguage } from '@/shared/lib/i18n';
import { getStoredDifficulty, setStoredDifficulty, setStoredNickname } from '@/shared/lib/profilePrefs';
import type { Difficulty } from '@/shared/types/api';

export function AuthPage() {
  const locale = getStoredLanguage();
  const [registerNickname, setRegisterNickname] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>(getStoredDifficulty());
  const [status, setStatus] = useState<string>('');
  const [error, setError] = useState<string>('');

  const onRegister = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setStatus('');

    try {
      const response = await gameApi.register({
        nickname: registerNickname,
        email: registerEmail,
        password: registerPassword,
        preferredDifficulty: difficulty,
      });
      setAuthToken(response.accessToken);
      setStoredNickname(response.profile.nickname);
      setStoredDifficulty(response.profile.preferredDifficulty);
      setStatus(locale === 'ru' ? 'Регистрация успешна. Вы авторизованы.' : 'Registration succeeded. You are now signed in.');
    } catch (err) {
      clearAuthToken();
      setError(err instanceof Error ? err.message : 'Registration failed');
    }
  };

  const onLogin = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setStatus('');

    try {
      const response = await gameApi.login({ email: loginEmail, password: loginPassword });
      setAuthToken(response.accessToken);
      setStoredNickname(response.profile.nickname);
      setStoredDifficulty(response.profile.preferredDifficulty);
      setStatus(locale === 'ru' ? `Вход выполнен: ${response.profile.nickname}` : `Signed in as ${response.profile.nickname}`);
    } catch (err) {
      clearAuthToken();
      setError(err instanceof Error ? err.message : 'Login failed');
    }
  };

  const onLogout = () => {
    clearAuthToken();
    setStatus(locale === 'ru' ? 'Вы вышли из аккаунта.' : 'You have been signed out.');
    setError('');
  };

  const onCheckAuth = async () => {
    try {
      const profile = await gameApi.me();
      setStoredNickname(profile.nickname);
      setStoredDifficulty(profile.preferredDifficulty);
      setStatus(locale === 'ru' ? `Токен валиден. Оператор: ${profile.nickname}` : `Token is valid. Operator: ${profile.nickname}`);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Auth check failed');
    }
  };

  return (
    <section>
      <h2>{locale === 'ru' ? 'АУТЕНТИФИКАЦИЯ ОПЕРАТОРА' : 'OPERATOR AUTHENTICATION'}</h2>
      <p>{locale === 'ru' ? 'Создайте аккаунт или войдите, чтобы использовать защищённый API профиль.' : 'Create an account or sign in to use protected profile API endpoints.'}</p>

      <form className="panel settings-form" onSubmit={onRegister}>
        <h3>{locale === 'ru' ? 'Регистрация' : 'Register'}</h3>
        <label htmlFor="register-nickname">Nickname</label>
        <input id="register-nickname" value={registerNickname} onChange={(event) => setRegisterNickname(event.target.value)} minLength={2} maxLength={50} required />

        <label htmlFor="register-email">Email</label>
        <input id="register-email" type="email" value={registerEmail} onChange={(event) => setRegisterEmail(event.target.value)} maxLength={160} required />

        <label htmlFor="register-password">Password</label>
        <input id="register-password" type="password" value={registerPassword} onChange={(event) => setRegisterPassword(event.target.value)} minLength={8} maxLength={128} required />

        <label htmlFor="difficulty">Preferred Difficulty</label>
        <select id="difficulty" value={difficulty} onChange={(event) => setDifficulty(event.target.value as Difficulty)}>
          <option value="STANDARD">STANDARD</option>
          <option value="HARDENED">HARDENED</option>
          <option value="NIGHTMARE">NIGHTMARE</option>
        </select>

        <button type="submit">{locale === 'ru' ? 'Зарегистрироваться' : 'Register'}</button>
      </form>

      <form className="panel settings-form" onSubmit={onLogin}>
        <h3>{locale === 'ru' ? 'Авторизация' : 'Sign In'}</h3>

        <label htmlFor="login-email">Email</label>
        <input id="login-email" type="email" value={loginEmail} onChange={(event) => setLoginEmail(event.target.value)} maxLength={160} required />

        <label htmlFor="login-password">Password</label>
        <input id="login-password" type="password" value={loginPassword} onChange={(event) => setLoginPassword(event.target.value)} minLength={8} maxLength={128} required />

        <button type="submit">{locale === 'ru' ? 'Войти' : 'Sign In'}</button>
        <button type="button" onClick={onCheckAuth}>{locale === 'ru' ? 'Проверить токен' : 'Check Token'}</button>
        <button type="button" onClick={onLogout}>{locale === 'ru' ? 'Выйти' : 'Sign Out'}</button>
      </form>

      {status && <p>{status}</p>}
      {error && <p>{error}</p>}
    </section>
  );
}
