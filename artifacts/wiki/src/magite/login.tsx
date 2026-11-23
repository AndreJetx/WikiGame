import { useState, type FormEvent } from 'react';
import { Link } from 'wouter';
import { LanguageSwitcher } from './language-switcher';
import { useLocale } from './use-locale';
import { login, register, type AuthUser } from './lib/api';
import { translateApiError } from './lib/i18n';
import { cleanInput } from './lib/sanitize';

export function LoginBackdrop() {
  return (
    <video className="login-video" autoPlay muted loop playsInline poster="/magite/login-bg.png">
      <source src="/magite/login-bg.mp4" type="video/mp4" />
    </video>
  );
}

export function LoginScreen({ onLoggedIn }: { onLoggedIn: (user: AuthUser) => void }) {
  const { t } = useLocale();
  const [creating, setCreating] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      const user = creating ? await register(username, password) : await login(username, password);
      onLoggedIn(user);
    } catch (err) {
      setError(err instanceof Error ? err.message : '__generic__');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="app-frame login-frame">
      <LoginBackdrop />
      <div className="login-stack">
        <div className="login-card card pad">
          <div className="login-lang">
            <LanguageSwitcher />
          </div>
          <div className="brand-lockup">
            <div className="brand-mark">
              <img src="/magite/brand-icon.png" alt="" width={38} height={38} />
            </div>
            <div>
              <div className="brand-name">{t('brand.name')}</div>
              <div className="brand-subtitle">{t('brand.loginSubtitle')}</div>
            </div>
          </div>
          <h1 className="login-title">{creating ? t('login.create') : t('login.enter')}</h1>
          <p className="login-copy">{creating ? t('login.createCopy') : t('login.enterCopy')}</p>
          <form className="source-form" onSubmit={submit}>
            <div>
              <label htmlFor="auth-username">{t('login.username')}</label>
              <input
                id="auth-username"
                type="text"
                autoComplete="username"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                required
                minLength={3}
                maxLength={creating ? 32 : 254}
                value={username}
                onChange={(event) => setUsername(cleanInput(event.target.value, creating ? 32 : 254).toLowerCase())}
                data-testid="input-auth-username"
              />
              {creating ? <p className="field-help">{t('login.usernameHelp')}</p> : null}
            </div>
            <div>
              <label htmlFor="auth-password">{t('login.password')}</label>
              <input
                id="auth-password"
                type="password"
                autoComplete={creating ? 'new-password' : 'current-password'}
                required
                minLength={6}
                maxLength={128}
                value={password}
                onChange={(event) => setPassword(event.target.value.slice(0, 128))}
                data-testid="input-auth-password"
              />
            </div>
            {error && <p className="form-error">{error === '__generic__' ? t('login.generic') : translateApiError(error)}</p>}
            <div className="source-form-actions">
              <button className="button primary" type="submit" disabled={busy} data-testid="button-auth-submit">
                {busy ? t('login.wait') : creating ? t('login.create') : t('login.enter')}
              </button>
              <button
                className="button soft"
                type="button"
                disabled={busy}
                data-testid="button-auth-switch"
                onClick={() => {
                  setCreating((current) => !current);
                  setError('');
                }}
              >
                {creating ? t('login.hasAccount') : t('login.noAccount')}
              </button>
            </div>
          </form>
          <Link href="/ferramentas" className="login-switch">
            Voltar às ferramentas
          </Link>
        </div>
        <p className="gold-disclaimer">{t('disclaimer')}</p>
      </div>
    </div>
  );
}
