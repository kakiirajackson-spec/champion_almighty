import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, User, Lock, Bell, Eye, Moon, HelpCircle,
  Info, Shield, Trash2, LogOut, ChevronRight, Smartphone,
  Heart, BookMarked, Clock, Languages, EyeOff
} from 'lucide-react';
import { API, BACKEND_URL } from '../api';

function authHeaders() {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('token')}`,
  };
}

// ── Toast ────────────────────────────────────────────────────────
function Toast({ message, type }) {
  return (
    <div style={{
      position: 'fixed', bottom: 90, left: '50%', transform: 'translateX(-50%)',
      background: type === 'error' ? '#ef4444' : '#22c55e',
      color: '#fff', padding: '10px 24px', borderRadius: 10,
      fontSize: 14, fontWeight: 600, zIndex: 200, whiteSpace: 'nowrap',
      boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
    }}>
      {message}
    </div>
  );
}

// ── Sub-page header ──────────────────────────────────────────────
function SubHeader({ title, onBack }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: '1px solid #27272a', position: 'sticky', top: 0, background: '#000', zIndex: 10 }}>
      <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fff', padding: 0, display: 'flex' }}>
        <ArrowLeft size={22} />
      </button>
      <h1 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: '#fff' }}>{title}</h1>
    </div>
  );
}

// ── Toggle Switch — defined OUTSIDE to prevent re-render focus loss ──
function Toggle({ label, sublabel, value, onChange }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid #1a1a1a' }}>
      <div>
        <p style={{ fontSize: 14, fontWeight: 500, color: '#fff', margin: 0 }}>{label}</p>
        {sublabel && <p style={{ fontSize: 12, color: '#71717a', margin: '2px 0 0' }}>{sublabel}</p>}
      </div>
      <button
        onClick={() => onChange(!value)}
        style={{ width: 48, height: 28, borderRadius: 14, background: value ? '#2563eb' : '#27272a', border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}
      >
        <div style={{ position: 'absolute', top: 3, left: value ? 23 : 3, width: 22, height: 22, borderRadius: '50%', background: '#fff', transition: 'left 0.2s' }} />
      </button>
    </div>
  );
}

// ── Password Field — defined OUTSIDE to prevent re-render focus loss ──
function PassField({ label, value, onChange, show, onToggle }) {
  return (
    <div>
      <label style={{ fontSize: 11, color: '#71717a', textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 8 }}>{label}</label>
      <div style={{ position: 'relative' }}>
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={e => onChange(e.target.value)}
          style={{ width: '100%', background: '#09090b', border: '1px solid #27272a', borderRadius: 10, padding: '12px 44px 12px 14px', color: '#fff', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
          onFocus={e => e.target.style.borderColor = '#3f3f46'}
          onBlur={e => e.target.style.borderColor = '#27272a'}
        />
        <button onClick={onToggle} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#71717a', padding: 0, display: 'flex' }}>
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  );
}

// ── Personal Information ─────────────────────────────────────────
function PersonalInfo({ onBack }) {
  const stored = JSON.parse(localStorage.getItem('user') || '{}');
  const [username, setUsername] = useState(stored.username || '');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSave = async () => {
    if (!username.trim()) return showToast('Username cannot be empty', 'error');
    setSaving(true);
    try {
      const res = await fetch(`${API}/users/me`, {
        method: 'PUT', headers: authHeaders(),
        body: JSON.stringify({ username }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('user', JSON.stringify({ ...stored, username }));
        showToast('Username updated successfully!');
      } else {
        showToast(data.message || 'Failed to update', 'error');
      }
    } catch { showToast('Server error', 'error'); }
    finally { setSaving(false); }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#fff', paddingBottom: 80 }}>
      <SubHeader title="Personal Information" onBack={onBack} />
      <div style={{ maxWidth: 500, margin: '0 auto', padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Avatar preview */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 16, background: '#09090b', borderRadius: 14, border: '1px solid #27272a' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, background: 'linear-gradient(135deg,#a855f7,#ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 22, color: '#fff' }}>
            {stored.profile_picture
              ? <img src={`${BACKEND_URL}${stored.profile_picture}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : stored.username?.[0]?.toUpperCase()
            }
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>{stored.username}</p>
            <p style={{ margin: '2px 0 0', fontSize: 12, color: '#71717a' }}>To change photo, go to Edit Profile</p>
          </div>
        </div>

        {/* Username */}
        <div>
          <label style={{ fontSize: 11, color: '#71717a', textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 8 }}>Username</label>
          <input
            value={username}
            onChange={e => setUsername(e.target.value)}
            style={{ width: '100%', background: '#09090b', border: '1px solid #27272a', borderRadius: 10, padding: '12px 14px', color: '#fff', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
            onFocus={e => e.target.style.borderColor = '#3f3f46'}
            onBlur={e => e.target.style.borderColor = '#27272a'}
          />
        </div>

        {/* Email (read only) */}
        <div>
          <label style={{ fontSize: 11, color: '#71717a', textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 8 }}>Email</label>
          <input
            value={stored.email || ''}
            readOnly
            style={{ width: '100%', background: '#18181b', border: '1px solid #27272a', borderRadius: 10, padding: '12px 14px', color: '#52525b', fontSize: 14, outline: 'none', boxSizing: 'border-box', cursor: 'not-allowed' }}
          />
          <p style={{ fontSize: 12, color: '#52525b', margin: '6px 0 0' }}>Email address cannot be changed</p>
        </div>

        <button onClick={handleSave} disabled={saving}
          style={{ width: '100%', padding: 14, background: '#2563eb', border: 'none', borderRadius: 10, color: '#fff', fontSize: 15, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
      {toast && <Toast message={toast.msg} type={toast.type} />}
    </div>
  );
}

// ── Password & Security ──────────────────────────────────────────
function PasswordSecurity({ onBack }) {
  const [current, setCurrent] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSave = async () => {
    if (!current || !newPass || !confirm) return showToast('All fields are required', 'error');
    if (newPass !== confirm) return showToast('New passwords do not match', 'error');
    if (newPass.length < 6) return showToast('Password must be at least 6 characters', 'error');
    if (current === newPass) return showToast('New password must be different', 'error');
    setSaving(true);
    try {
      const res = await fetch(`${API}/auth/change-password`, {
        method: 'PUT', headers: authHeaders(),
        body: JSON.stringify({ currentPassword: current, newPassword: newPass }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast('Password changed successfully!');
        setCurrent(''); setNewPass(''); setConfirm('');
      } else {
        showToast(data.message || 'Failed', 'error');
      }
    } catch { showToast('Server error', 'error'); }
    finally { setSaving(false); }
  };

  const strength = newPass.length === 0 ? null : newPass.length < 6 ? 'weak' : newPass.length < 10 ? 'medium' : 'strong';
  const strengthColor = { weak: '#ef4444', medium: '#f59e0b', strong: '#22c55e' };
  const strengthWidth = { weak: '33%', medium: '66%', strong: '100%' };

  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#fff', paddingBottom: 80 }}>
      <SubHeader title="Password & Security" onBack={onBack} />
      <div style={{ maxWidth: 500, margin: '0 auto', padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 20 }}>

        <PassField label="Current Password" value={current} onChange={setCurrent} show={showCurrent} onToggle={() => setShowCurrent(p => !p)} />
        <PassField label="New Password" value={newPass} onChange={setNewPass} show={showNew} onToggle={() => setShowNew(p => !p)} />

        {/* Strength bar */}
        {strength && (
          <div style={{ marginTop: -12 }}>
            <div style={{ height: 4, background: '#27272a', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: strengthWidth[strength], background: strengthColor[strength], borderRadius: 4, transition: 'all 0.3s' }} />
            </div>
            <p style={{ fontSize: 12, color: strengthColor[strength], margin: '4px 0 0', textTransform: 'capitalize' }}>{strength} password</p>
          </div>
        )}

        <PassField label="Confirm New Password" value={confirm} onChange={setConfirm} show={showConfirm} onToggle={() => setShowConfirm(p => !p)} />

        {/* Match indicator */}
        {confirm.length > 0 && (
          <p style={{ fontSize: 12, margin: -12, color: newPass === confirm ? '#22c55e' : '#ef4444' }}>
            {newPass === confirm ? '✓ Passwords match' : '✗ Passwords do not match'}
          </p>
        )}

        <button onClick={handleSave} disabled={saving}
          style={{ width: '100%', padding: 14, background: '#2563eb', border: 'none', borderRadius: 10, color: '#fff', fontSize: 15, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1, marginTop: 8 }}>
          {saving ? 'Changing...' : 'Change Password'}
        </button>

        {/* Security tips */}
        <div style={{ background: '#09090b', border: '1px solid #27272a', borderRadius: 12, padding: 16 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#fff', margin: '0 0 10px' }}>Security tips</p>
          {['Use at least 8 characters', 'Mix letters, numbers and symbols', 'Never share your password with anyone', 'Use a unique password for this account'].map(tip => (
            <div key={tip} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#3b82f6', flexShrink: 0 }} />
              <p style={{ fontSize: 12, color: '#71717a', margin: 0 }}>{tip}</p>
            </div>
          ))}
        </div>
      </div>
      {toast && <Toast message={toast.msg} type={toast.type} />}
    </div>
  );
}

// ── Privacy ──────────────────────────────────────────────────────
function Privacy({ onBack }) {
  const [privateAccount, setPrivateAccount] = useState(false);
  const [showActivity, setShowActivity] = useState(true);
  const [allowMessages, setAllowMessages] = useState(true);
  const [toast, setToast] = useState(null);

  const showToast = (msg) => { setToast({ msg }); setTimeout(() => setToast(null), 2000); };

  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#fff', paddingBottom: 80 }}>
      <SubHeader title="Privacy" onBack={onBack} />
      <div style={{ maxWidth: 500, margin: '0 auto' }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: '#52525b', textTransform: 'uppercase', letterSpacing: 1.2, padding: '16px 16px 8px', margin: 0 }}>Account Privacy</p>
        <div style={{ background: '#09090b', borderTop: '1px solid #27272a', borderBottom: '1px solid #27272a' }}>
          <Toggle label="Private Account" sublabel="Only approved followers can see your posts" value={privateAccount} onChange={(v) => { setPrivateAccount(v); showToast('Setting saved'); }} />
          <Toggle label="Show Activity Status" sublabel="Let others see when you were last active" value={showActivity} onChange={(v) => { setShowActivity(v); showToast('Setting saved'); }} />
          <Toggle label="Allow Direct Messages" sublabel="Anyone who follows you can message you" value={allowMessages} onChange={(v) => { setAllowMessages(v); showToast('Setting saved'); }} />
        </div>
        <p style={{ fontSize: 12, color: '#52525b', padding: '12px 16px', margin: 0 }}>
          Note: These settings are UI only for now. Full privacy controls coming soon.
        </p>
      </div>
      {toast && <Toast message={toast.msg} type="success" />}
    </div>
  );
}

// ── Notifications ────────────────────────────────────────────────
function NotificationsPage({ onBack }) {
  const [likes, setLikes] = useState(true);
  const [comments, setComments] = useState(true);
  const [follows, setFollows] = useState(true);
  const [messages, setMessages] = useState(true);
  const [toast, setToast] = useState(null);

  const showToast = (msg) => { setToast({ msg }); setTimeout(() => setToast(null), 2000); };

  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#fff', paddingBottom: 80 }}>
      <SubHeader title="Notifications" onBack={onBack} />
      <div style={{ maxWidth: 500, margin: '0 auto' }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: '#52525b', textTransform: 'uppercase', letterSpacing: 1.2, padding: '16px 16px 8px', margin: 0 }}>Push Notifications</p>
        <div style={{ background: '#09090b', borderTop: '1px solid #27272a', borderBottom: '1px solid #27272a' }}>
          <Toggle label="Likes" sublabel="When someone likes your post" value={likes} onChange={(v) => { setLikes(v); showToast('Saved'); }} />
          <Toggle label="Comments" sublabel="When someone comments on your post" value={comments} onChange={(v) => { setComments(v); showToast('Saved'); }} />
          <Toggle label="New Followers" sublabel="When someone follows you" value={follows} onChange={(v) => { setFollows(v); showToast('Saved'); }} />
          <Toggle label="Direct Messages" sublabel="When you receive a new message" value={messages} onChange={(v) => { setMessages(v); showToast('Saved'); }} />
        </div>
      </div>
      {toast && <Toast message={toast.msg} type="success" />}
    </div>
  );
}

// ── Active Sessions ──────────────────────────────────────────────
function ActiveSessions({ onBack }) {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const now = new Date();

  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#fff', paddingBottom: 80 }}>
      <SubHeader title="Active Sessions" onBack={onBack} />
      <div style={{ maxWidth: 500, margin: '0 auto', padding: '20px 16px' }}>
        <div style={{ background: '#09090b', border: '1px solid #27272a', borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ padding: 16, borderBottom: '1px solid #27272a' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: '#1d4ed8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Smartphone size={22} color="#fff" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#fff', margin: 0 }}>This device</p>
                  <span style={{ background: '#14532d', color: '#22c55e', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20 }}>ACTIVE NOW</span>
                </div>
                <p style={{ fontSize: 12, color: '#71717a', margin: '2px 0 0' }}>Chrome · Windows · {now.toLocaleDateString()}</p>
                <p style={{ fontSize: 12, color: '#71717a', margin: '2px 0 0' }}>Logged in as {user.username}</p>
              </div>
            </div>
          </div>
          <div style={{ padding: '12px 16px' }}>
            <p style={{ fontSize: 12, color: '#52525b', margin: 0, textAlign: 'center' }}>No other active sessions found</p>
          </div>
        </div>
        <p style={{ fontSize: 12, color: '#52525b', marginTop: 16, lineHeight: 1.6 }}>
          If you see a session you don't recognize, change your password immediately.
        </p>
      </div>
    </div>
  );
}

// ── About ────────────────────────────────────────────────────────
function About({ onBack }) {
  const items = [
    { label: 'App Name', value: 'ChatApp' },
    { label: 'Version', value: '1.0.0' },
    { label: 'Built with', value: 'React + Node.js + MySQL' },
    { label: 'Developer', value: 'SOD Level 5 Project' },
    { label: 'Backend', value: 'Express.js + Socket.io' },
    { label: 'Database', value: 'MySQL' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#fff', paddingBottom: 80 }}>
      <SubHeader title="About ChatApp" onBack={onBack} />
      <div style={{ maxWidth: 500, margin: '0 auto', padding: '20px 16px' }}>
        <div style={{ textAlign: 'center', padding: '32px 0 24px' }}>
          <div style={{ fontSize: 48, fontWeight: 900, fontStyle: 'italic', background: 'linear-gradient(to right,#ec4899,#ef4444,#eab308)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 8 }}>
            ChatApp
          </div>
          <p style={{ fontSize: 13, color: '#71717a', margin: 0 }}>Connect. Share. Chat.</p>
        </div>
        <div style={{ background: '#09090b', border: '1px solid #27272a', borderRadius: 14, overflow: 'hidden' }}>
          {items.map((item, i) => (
            <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderBottom: i < items.length - 1 ? '1px solid #1a1a1a' : 'none' }}>
              <p style={{ fontSize: 14, color: '#71717a', margin: 0 }}>{item.label}</p>
              <p style={{ fontSize: 14, fontWeight: 600, color: '#fff', margin: 0 }}>{item.value}</p>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 12, color: '#52525b', textAlign: 'center', marginTop: 32 }}>Made with ❤️ in Rwanda</p>
      </div>
    </div>
  );
}

// ── Main Settings Page ───────────────────────────────────────────
export default function Settings({ onBack }) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [page, setPage] = useState('main');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Sub-page routing
  if (page === 'personal') return <PersonalInfo onBack={() => setPage('main')} />;
  if (page === 'password') return <PasswordSecurity onBack={() => setPage('main')} />;
  if (page === 'privacy') return <Privacy onBack={() => setPage('main')} />;
  if (page === 'notifications') return <NotificationsPage onBack={() => setPage('main')} />;
  if (page === 'sessions') return <ActiveSessions onBack={() => setPage('main')} />;
  if (page === 'about') return <About onBack={() => setPage('main')} />;

  const handleLogout = async () => {
    try {
      await fetch(`${API}/auth/logout`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });
    } catch { }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const Row = ({ icon, label, sublabel, onClick, danger }) => (
    <button onClick={onClick}
      style={{ display: 'flex', alignItems: 'center', gap: 16, width: '100%', padding: '14px 16px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
      onMouseEnter={e => e.currentTarget.style.background = '#111111'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      <div style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, background: danger ? 'rgba(239,68,68,0.15)' : '#27272a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: danger ? '#ef4444' : '#fff' }}>{label}</p>
        {sublabel && <p style={{ margin: '2px 0 0', fontSize: 12, color: '#71717a' }}>{sublabel}</p>}
      </div>
      {!danger && <ChevronRight size={16} color="#52525b" />}
    </button>
  );

  const Section = ({ title, children }) => (
    <div style={{ marginBottom: 8 }}>
      {title && <p style={{ fontSize: 11, fontWeight: 700, color: '#52525b', textTransform: 'uppercase', letterSpacing: 1.2, padding: '16px 16px 8px', margin: 0 }}>{title}</p>}
      <div style={{ background: '#09090b', borderTop: '1px solid #27272a', borderBottom: '1px solid #27272a' }}>
        {children}
      </div>
    </div>
  );

  const D = () => <div style={{ height: 1, background: '#1a1a1a', margin: '0 16px' }} />;

  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#fff', paddingBottom: 80 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: '1px solid #27272a', position: 'sticky', top: 0, background: '#000', zIndex: 10 }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fff', padding: 0, display: 'flex' }}>
          <ArrowLeft size={22} />
        </button>
        <h1 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Settings</h1>
      </div>

      {/* Account card */}
      <div style={{ margin: '16px 16px 8px', background: '#09090b', borderRadius: 14, border: '1px solid #27272a', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 48, height: 48, borderRadius: '50%', flexShrink: 0, overflow: 'hidden', background: 'linear-gradient(135deg,#a855f7,#ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 20, color: '#fff' }}>
          {user.profile_picture
            ? <img src={`${BACKEND_URL}${user.profile_picture}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : user.username?.[0]?.toUpperCase()
          }
        </div>
        <div>
          <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#fff' }}>{user.username}</p>
          <p style={{ margin: '2px 0 0', fontSize: 12, color: '#71717a' }}>{user.email}</p>
        </div>
      </div>

      <Section title="Account">
        <Row icon={<User size={18} color="#a78bfa" />} label="Personal information" sublabel="Username, email" onClick={() => setPage('personal')} />
        <D />
        <Row icon={<Lock size={18} color="#60a5fa" />} label="Password & security" sublabel="Change your password" onClick={() => setPage('password')} />
        <D />
        <Row icon={<Eye size={18} color="#34d399" />} label="Privacy" sublabel="Account privacy, activity status" onClick={() => setPage('privacy')} />
        <D />
        <Row icon={<Bell size={18} color="#fbbf24" />} label="Notifications" sublabel="Likes, comments, messages" onClick={() => setPage('notifications')} />
        <D />
        <Row icon={<Smartphone size={18} color="#f472b6" />} label="Active sessions" sublabel="Devices logged in" onClick={() => setPage('sessions')} />
      </Section>

      <Section title="Content & Activity">
        <Row icon={<Heart size={18} color="#f87171" />} label="Liked posts" sublabel="Posts you have liked" onClick={() => {}} />
        <D />
        <Row icon={<BookMarked size={18} color="#818cf8" />} label="Saved" sublabel="Posts you have saved" onClick={() => {}} />
        <D />
        <Row icon={<Clock size={18} color="#94a3b8" />} label="Your activity" sublabel="Time spent, interactions" onClick={() => {}} />
      </Section>

      <Section title="Preferences">
        <Row icon={<Moon size={18} color="#94a3b8" />} label="Appearance" sublabel="Dark mode, theme" onClick={() => {}} />
        <D />
        <Row icon={<Languages size={18} color="#6ee7b7" />} label="Language" sublabel="English" onClick={() => {}} />
      </Section>

      <Section title="Support">
        <Row icon={<HelpCircle size={18} color="#38bdf8" />} label="Help & Support" sublabel="FAQ, report a problem" onClick={() => {}} />
        <D />
        <Row icon={<Shield size={18} color="#a3e635" />} label="Privacy Policy" onClick={() => {}} />
        <D />
        <Row icon={<Info size={18} color="#71717a" />} label="About ChatApp" sublabel="Version 1.0.0" onClick={() => setPage('about')} />
      </Section>

      <Section title="">
        <Row icon={<Trash2 size={18} color="#ef4444" />} label="Delete account" sublabel="Permanently delete your account" onClick={() => setShowDeleteConfirm(true)} danger />
      </Section>

      {/* Logout */}
      <div style={{ padding: '8px 16px 0' }}>
        <button onClick={handleLogout}
          style={{ width: '100%', padding: 14, background: '#09090b', border: '1px solid #27272a', borderRadius: 14, color: '#ef4444', fontSize: 15, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}
          onMouseEnter={e => e.currentTarget.style.background = '#18181b'}
          onMouseLeave={e => e.currentTarget.style.background = '#09090b'}
        >
          <LogOut size={18} /> Log out
        </button>
      </div>

      {/* Delete confirm modal */}
      {showDeleteConfirm && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.8)' }}>
          <div style={{ width: '100%', maxWidth: 320, margin: '0 16px', background: '#18181b', borderRadius: 16, border: '1px solid #27272a', overflow: 'hidden' }}>
            <div style={{ padding: '24px 20px 16px', textAlign: 'center' }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <Trash2 size={24} color="#ef4444" />
              </div>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: '#fff', margin: '0 0 8px' }}>Delete Account?</h2>
              <p style={{ fontSize: 13, color: '#71717a', margin: 0 }}>This will permanently delete your account, posts, and messages. This cannot be undone.</p>
            </div>
            <div style={{ borderTop: '1px solid #27272a' }}>
              <button onClick={handleLogout} style={{ width: '100%', padding: 14, background: 'none', border: 'none', color: '#ef4444', fontSize: 15, fontWeight: 700, cursor: 'pointer', borderBottom: '1px solid #27272a' }}>
                Delete Account
              </button>
              <button onClick={() => setShowDeleteConfirm(false)} style={{ width: '100%', padding: 14, background: 'none', border: 'none', color: '#fff', fontSize: 15, cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}