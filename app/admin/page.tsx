'use client';
import React, { useState, useEffect, useCallback } from 'react';

const ADMIN_USER = 'admin';
const ADMIN_PASS = 'mayyacine31';
const SESSION_KEY = 'lookagraphy_admin_session';

const gold = '#C9A84C';
const dark = '#1A1209';
const light = '#F5F0E8';

type Tab = 'store' | 'expositions' | 'evenements';

const inputStyle = {
  width: '100%',
  background: 'rgba(245,240,232,0.08)',
  border: '1px solid rgba(201,168,76,0.25)',
  color: light,
  fontFamily: 'Montserrat, sans-serif',
  fontSize: '0.88rem',
  padding: '0.6rem 0.85rem',
  outline: 'none',
  borderRadius: 0,
  boxSizing: 'border-box' as const,
};

const labelStyle = {
  display: 'block' as const,
  fontFamily: 'Montserrat, sans-serif',
  fontSize: '0.68rem',
  letterSpacing: '0.2em',
  textTransform: 'uppercase' as const,
  color: gold,
  marginBottom: '0.35rem',
};

const btnGold = {
  background: gold,
  color: dark,
  border: 'none',
  fontFamily: 'Montserrat, sans-serif',
  fontSize: '0.75rem',
  letterSpacing: '0.15em',
  textTransform: 'uppercase' as const,
  padding: '0.6rem 1.4rem',
  cursor: 'pointer',
  fontWeight: 500,
};

const btnOutline = {
  background: 'transparent',
  color: gold,
  border: `1px solid ${gold}`,
  fontFamily: 'Montserrat, sans-serif',
  fontSize: '0.72rem',
  letterSpacing: '0.12em',
  textTransform: 'uppercase' as const,
  padding: '0.45rem 1rem',
  cursor: 'pointer',
};

const btnDanger = {
  background: 'transparent',
  color: '#e05555',
  border: '1px solid #e05555',
  fontFamily: 'Montserrat, sans-serif',
  fontSize: '0.72rem',
  letterSpacing: '0.12em',
  textTransform: 'uppercase' as const,
  padding: '0.45rem 1rem',
  cursor: 'pointer',
};

function Field({ label, value, onChange, type = 'text', placeholder = '' }: any) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <label style={labelStyle}>{label}</label>
      {type === 'textarea' ? (
        <textarea
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          rows={4}
          style={{ ...inputStyle, resize: 'vertical' }}
        />
      ) : (
        <input
          type={type}
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          style={inputStyle}
        />
      )}
    </div>
  );
}

function Select({ label, value, onChange, options }: any) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <label style={labelStyle}>{label}</label>
      <select
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        style={{ ...inputStyle, cursor: 'pointer' }}
      >
        {options.map((o: string) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

function Toggle({ label, value, onChange }: any) {
  return (
    <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
      <label style={{ ...labelStyle, marginBottom: 0 }}>{label}</label>
      <button
        onClick={() => onChange(!value)}
        style={{
          width: 44, height: 24, borderRadius: 12,
          background: value ? gold : 'rgba(245,240,232,0.15)',
          border: 'none', cursor: 'pointer', position: 'relative', transition: 'all 0.2s',
        }}
      >
        <span style={{
          position: 'absolute', top: 3, left: value ? 22 : 3, width: 18, height: 18,
          borderRadius: '50%', background: value ? dark : light, transition: 'all 0.2s',
        }} />
      </button>
      <span style={{ color: value ? gold : 'rgba(245,240,232,0.5)', fontSize: '0.75rem', fontFamily: 'Montserrat, sans-serif' }}>
        {value ? 'Disponible' : 'Indisponible'}
      </span>
    </div>
  );
}

function ImagesField({ label, value, onChange }: any) {
  const [newUrl, setNewUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileRef = React.useRef<HTMLInputElement>(null);
  const imgs: string[] = Array.isArray(value) ? value : [];

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (data.path) {
        onChange([...imgs, data.path]);
      } else {
        alert('Erreur upload: ' + (data.error || 'inconnu'));
      }
    } catch {
      alert('Erreur lors de l\'upload');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div style={{ marginBottom: '1rem' }}>
      <label style={labelStyle}>{label}</label>
      {imgs.map((url, i) => (
        <div key={i} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.4rem', alignItems: 'center' }}>
          {url && <img src={url} alt="" style={{ width: 44, height: 44, objectFit: 'cover', flexShrink: 0, border: '1px solid rgba(201,168,76,0.3)' }} onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />}
          <input value={url} onChange={e => { const a = [...imgs]; a[i] = e.target.value; onChange(a); }} style={{ ...inputStyle, flex: 1 }} />
          <button onClick={() => onChange(imgs.filter((_, j) => j !== i))} style={{ ...btnDanger, padding: '0.3rem 0.6rem', fontSize: '0.7rem' }}>✕</button>
        </div>
      ))}
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.4rem', flexWrap: 'wrap' }}>
        <input value={newUrl} onChange={e => setNewUrl(e.target.value)} placeholder="/images/..." style={{ ...inputStyle, flex: 1, minWidth: 120 }} />
        <button onClick={() => { if (newUrl.trim()) { onChange([...imgs, newUrl.trim()]); setNewUrl(''); } }} style={{ ...btnOutline, whiteSpace: 'nowrap' }}>+ URL</button>
        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleUpload} />
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          style={{ ...btnGold, whiteSpace: 'nowrap', opacity: uploading ? 0.6 : 1 }}
        >
          {uploading ? 'Upload…' : '📤 Uploader'}
        </button>
      </div>
    </div>
  );
}

const emptyStore = { titre: '', sous_titre: '', categorie: 'Tableau', description: '', citation: '', technique: '', dimensions: '', annee: '', prix: '', images: [], disponible: true, paypal_link: '', ordre: 0 };
const emptyExpo = { titre: '', lieu: '', dates: '', statut: 'passé', description: '', image: '', images: [] };
const emptyEvt = { titre: '', date: '', heure: '', lieu: '', type: 'Vernissage', statut: 'à venir', description: '', images: [] };

export default function AdminPage() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState('');
  const [tab, setTab] = useState<Tab>('store');
  const [initDone, setInitDone] = useState(false);
  const [initMsg, setInitMsg] = useState('');

  const [storeItems, setStoreItems] = useState<any[]>([]);
  const [expositions, setExpositions] = useState<any[]>([]);
  const [evenements, setEvenements] = useState<any[]>([]);

  const [editStore, setEditStore] = useState<any>(null);
  const [editExpo, setEditExpo] = useState<any>(null);
  const [editEvt, setEditEvt] = useState<any>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const s = localStorage.getItem(SESSION_KEY);
        if (s === 'true') setLoggedIn(true);
      }
    } catch (_) {}
  }, []);

  const login = () => {
    if (loginUser === ADMIN_USER && loginPass === ADMIN_PASS) {
      try { localStorage.setItem(SESSION_KEY, 'true'); } catch (_) {}
      setLoggedIn(true);
      setLoginError('');
    } else {
      setLoginError('Identifiants incorrects');
    }
  };

  const logout = () => {
    try { localStorage.removeItem(SESSION_KEY); } catch (_) {}
    setLoggedIn(false);
  };

  const initDb = async () => {
    setInitMsg('Initialisation...');
    const r = await fetch('/api/admin/init', { method: 'POST' });
    const data = await r.json();
    setInitMsg(data.ok ? '✅ ' + data.message : '❌ ' + data.error);
    setInitDone(data.ok);
    if (data.ok) { fetchAll(); }
  };

  const fetchAll = useCallback(async () => {
    const [s, e, ev] = await Promise.all([
      fetch('/api/store').then(r => r.json()),
      fetch('/api/expositions').then(r => r.json()),
      fetch('/api/evenements').then(r => r.json()),
    ]);
    if (Array.isArray(s)) setStoreItems(s);
    if (Array.isArray(e)) setExpositions(e);
    if (Array.isArray(ev)) setEvenements(ev);
  }, []);

  useEffect(() => { if (loggedIn) fetchAll(); }, [loggedIn, fetchAll]);

  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(''), 3000); };

  const saveStore = async () => {
    setSaving(true);
    const body = { ...editStore, prix: parseFloat(editStore.prix) || 0, ordre: parseInt(editStore.ordre) || 0 };
    const url = isNew ? '/api/store' : `/api/store/${editStore.id}`;
    const method = isNew ? 'POST' : 'PUT';
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    await fetchAll(); setEditStore(null); setSaving(false); flash('✅ Article sauvegardé');
  };

  const deleteStore = async (id: number) => {
    if (!confirm('Supprimer cet article ?')) return;
    await fetch(`/api/store/${id}`, { method: 'DELETE' });
    await fetchAll(); flash('Article supprimé');
  };

  const saveExpo = async () => {
    setSaving(true);
    const url = isNew ? '/api/expositions' : `/api/expositions/${editExpo.id}`;
    const method = isNew ? 'POST' : 'PUT';
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editExpo) });
    await fetchAll(); setEditExpo(null); setSaving(false); flash('✅ Exposition sauvegardée');
  };

  const deleteExpo = async (id: number) => {
    if (!confirm('Supprimer cette exposition ?')) return;
    await fetch(`/api/expositions/${id}`, { method: 'DELETE' });
    await fetchAll(); flash('Exposition supprimée');
  };

  const saveEvt = async () => {
    setSaving(true);
    const url = isNew ? '/api/evenements' : `/api/evenements/${editEvt.id}`;
    const method = isNew ? 'POST' : 'PUT';
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editEvt) });
    await fetchAll(); setEditEvt(null); setSaving(false); flash('✅ Événement sauvegardé');
  };

  const deleteEvt = async (id: number) => {
    if (!confirm('Supprimer cet événement ?')) return;
    await fetch(`/api/evenements/${id}`, { method: 'DELETE' });
    await fetchAll(); flash('Événement supprimé');
  };

  if (!loggedIn) {
    return (
      <div style={{ minHeight: '100vh', background: dark, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ width: '100%', maxWidth: 360, border: `1px solid rgba(201,168,76,0.2)`, padding: '2.5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', color: light, fontWeight: 300, letterSpacing: '0.05em' }}>LookaGraphy</div>
            <div style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.68rem', letterSpacing: '0.3em', color: gold, textTransform: 'uppercase', marginTop: '0.3rem' }}>Backoffice</div>
          </div>
          <form onSubmit={e => { e.preventDefault(); login(); }}>
            <Field label="Identifiant" value={loginUser} onChange={setLoginUser} placeholder="admin" />
            <Field label="Mot de passe" value={loginPass} onChange={setLoginPass} type="password" placeholder="••••••••" />
            {loginError && <p style={{ color: '#e05555', fontFamily: 'Montserrat, sans-serif', fontSize: '0.8rem', marginBottom: '1rem' }}>{loginError}</p>}
            <button
              type="submit"
              style={{ ...btnGold, width: '100%', padding: '0.8rem' }}
            >
              Connexion
            </button>
          </form>
        </div>
      </div>
    );
  }

  const sectionTitle = (t: string) => (
    <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 300, fontSize: 'clamp(1.4rem, 2.5vw, 2rem)', color: light, letterSpacing: '0.04em', marginBottom: '0.25rem' }}>{t}</h2>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#2A2520', color: light }}>
      {/* Header */}
      <div style={{ background: dark, padding: '1rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid rgba(201,168,76,0.15)` }}>
        <div>
          <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.3rem', color: light, letterSpacing: '0.05em' }}>LookaGraphy</span>
          <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.65rem', letterSpacing: '0.25em', color: gold, textTransform: 'uppercase', marginLeft: '1rem' }}>Backoffice</span>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {!initDone && storeItems.length === 0 && (
            <button onClick={initDb} style={btnGold}>⚙ Init DB</button>
          )}
          <button onClick={logout} style={btnOutline}>Déconnexion</button>
        </div>
      </div>

      {initMsg && (
        <div style={{ background: 'rgba(201,168,76,0.1)', borderBottom: '1px solid rgba(201,168,76,0.2)', padding: '0.75rem 2rem', fontFamily: 'Montserrat, sans-serif', fontSize: '0.82rem', color: gold }}>{initMsg}</div>
      )}

      {msg && (
        <div style={{ background: 'rgba(201,168,76,0.12)', padding: '0.75rem 2rem', fontFamily: 'Montserrat, sans-serif', fontSize: '0.82rem', color: gold, textAlign: 'center' }}>{msg}</div>
      )}

      {/* Tabs */}
      <div style={{ background: dark, display: 'flex', gap: 0, borderBottom: `1px solid rgba(201,168,76,0.15)` }}>
        {([['store', 'Store'], ['expositions', 'Expositions'], ['evenements', 'Événements']] as [Tab, string][]).map(([k, label]) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontFamily: 'Montserrat, sans-serif', fontSize: '0.75rem', letterSpacing: '0.2em', textTransform: 'uppercase',
              color: tab === k ? gold : 'rgba(245,240,232,0.55)',
              padding: '1rem 1.75rem',
              borderBottom: tab === k ? `2px solid ${gold}` : '2px solid transparent',
              transition: 'all 0.2s',
            }}
          >{label}</button>
        ))}
      </div>

      <div style={{ padding: '2rem', maxWidth: 1100, margin: '0 auto' }}>

        {/* ── STORE ── */}
        {tab === 'store' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              {sectionTitle('Articles du Store')}
              <button onClick={() => { setEditStore({ ...emptyStore }); setIsNew(true); }} style={btnGold}>+ Nouvel article</button>
            </div>

            {editStore && (
              <div style={{ background: dark, border: `1px solid rgba(201,168,76,0.2)`, padding: '2rem', marginBottom: '2rem' }}>
                <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.3rem', color: light, marginBottom: '1.5rem' }}>{isNew ? 'Nouvel article' : 'Modifier l\'article'}</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1.5rem' }}>
                  <Field label="Titre" value={editStore.titre} onChange={(v: string) => setEditStore({ ...editStore, titre: v })} />
                  <Field label="Sous-titre" value={editStore.sous_titre} onChange={(v: string) => setEditStore({ ...editStore, sous_titre: v })} />
                  <Select label="Catégorie" value={editStore.categorie} onChange={(v: string) => setEditStore({ ...editStore, categorie: v })} options={['Tableau', 'Bague', "Boucles d'oreilles", 'Pendentif']} />
                  <Field label="Année" value={editStore.annee} onChange={(v: string) => setEditStore({ ...editStore, annee: v })} />
                  <Field label="Technique" value={editStore.technique} onChange={(v: string) => setEditStore({ ...editStore, technique: v })} />
                  <Field label="Dimensions" value={editStore.dimensions} onChange={(v: string) => setEditStore({ ...editStore, dimensions: v })} />
                  <Field label="Prix (€)" value={editStore.prix} onChange={(v: string) => setEditStore({ ...editStore, prix: v })} type="number" />
                  <Field label="Lien PayPal" value={editStore.paypal_link} onChange={(v: string) => setEditStore({ ...editStore, paypal_link: v })} />
                  <Field label="Ordre d'affichage" value={editStore.ordre} onChange={(v: string) => setEditStore({ ...editStore, ordre: v })} type="number" />
                </div>
                <Field label="Citation" value={editStore.citation} onChange={(v: string) => setEditStore({ ...editStore, citation: v })} type="textarea" />
                <Field label="Description" value={editStore.description} onChange={(v: string) => setEditStore({ ...editStore, description: v })} type="textarea" />
                <ImagesField label="Images (chemins /images/...)" value={editStore.images} onChange={(v: string[]) => setEditStore({ ...editStore, images: v })} />
                <Toggle label="Disponibilité" value={editStore.disponible} onChange={(v: boolean) => setEditStore({ ...editStore, disponible: v })} />
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                  <button onClick={saveStore} disabled={saving} style={btnGold}>{saving ? 'Sauvegarde...' : 'Sauvegarder'}</button>
                  <button onClick={() => setEditStore(null)} style={btnOutline}>Annuler</button>
                </div>
              </div>
            )}

            <div style={{ display: 'grid', gap: '1px', background: 'rgba(201,168,76,0.1)' }}>
              {storeItems.map(item => (
                <div key={item.id} style={{ background: '#2A2520', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  {item.images?.[0] && (
                    <img src={item.images[0]} alt="" style={{ width: 56, height: 56, objectFit: 'cover', flexShrink: 0 }} />
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1rem', color: light }}>{item.titre}</div>
                    <div style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.72rem', color: gold }}>{item.categorie} · {item.prix}€ · {item.disponible ? 'DISPO' : 'Indisponible'}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                    <button onClick={() => { setEditStore({ ...item }); setIsNew(false); }} style={btnOutline}>Modifier</button>
                    <button onClick={() => deleteStore(item.id)} style={btnDanger}>Supprimer</button>
                  </div>
                </div>
              ))}
              {storeItems.length === 0 && (
                <div style={{ background: '#2A2520', padding: '2rem', textAlign: 'center', fontFamily: 'Montserrat, sans-serif', fontSize: '0.82rem', color: 'rgba(245,240,232,0.4)' }}>
                  Aucun article. Cliquez sur «&nbsp;Init DB&nbsp;» pour migrer les données, ou créez un article.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── EXPOSITIONS ── */}
        {tab === 'expositions' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              {sectionTitle('Expositions')}
              <button onClick={() => { setEditExpo({ ...emptyExpo }); setIsNew(true); }} style={btnGold}>+ Nouvelle exposition</button>
            </div>

            {editExpo && (
              <div style={{ background: dark, border: `1px solid rgba(201,168,76,0.2)`, padding: '2rem', marginBottom: '2rem' }}>
                <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.3rem', color: light, marginBottom: '1.5rem' }}>{isNew ? 'Nouvelle exposition' : 'Modifier l\'exposition'}</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1.5rem' }}>
                  <Field label="Titre" value={editExpo.titre} onChange={(v: string) => setEditExpo({ ...editExpo, titre: v })} />
                  <Field label="Lieu" value={editExpo.lieu} onChange={(v: string) => setEditExpo({ ...editExpo, lieu: v })} />
                  <Field label="Dates" value={editExpo.dates} onChange={(v: string) => setEditExpo({ ...editExpo, dates: v })} />
                  <Select label="Statut" value={editExpo.statut} onChange={(v: string) => setEditExpo({ ...editExpo, statut: v })} options={['passé', 'à venir']} />
                  <Field label="Image principale (/images/...)" value={editExpo.image} onChange={(v: string) => setEditExpo({ ...editExpo, image: v })} />
                </div>
                <Field label="Description" value={editExpo.description} onChange={(v: string) => setEditExpo({ ...editExpo, description: v })} type="textarea" />
                <ImagesField label="Images supplémentaires" value={editExpo.images} onChange={(v: string[]) => setEditExpo({ ...editExpo, images: v })} />
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                  <button onClick={saveExpo} disabled={saving} style={btnGold}>{saving ? 'Sauvegarde...' : 'Sauvegarder'}</button>
                  <button onClick={() => setEditExpo(null)} style={btnOutline}>Annuler</button>
                </div>
              </div>
            )}

            <div style={{ display: 'grid', gap: '1px', background: 'rgba(201,168,76,0.1)' }}>
              {expositions.map(expo => (
                <div key={expo.id} style={{ background: '#2A2520', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  {expo.image && (
                    <img src={expo.image} alt="" style={{ width: 56, height: 56, objectFit: 'cover', flexShrink: 0 }} />
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1rem', color: light }}>{expo.titre}</div>
                    <div style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.72rem', color: gold }}>{expo.lieu} · {expo.statut}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                    <button onClick={() => { setEditExpo({ ...expo, images: expo.images || [] }); setIsNew(false); }} style={btnOutline}>Modifier</button>
                    <button onClick={() => deleteExpo(expo.id)} style={btnDanger}>Supprimer</button>
                  </div>
                </div>
              ))}
              {expositions.length === 0 && (
                <div style={{ background: '#2A2520', padding: '2rem', textAlign: 'center', fontFamily: 'Montserrat, sans-serif', fontSize: '0.82rem', color: 'rgba(245,240,232,0.4)' }}>
                  Aucune exposition. Cliquez sur «&nbsp;Init DB&nbsp;» pour migrer les données.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── ÉVÉNEMENTS ── */}
        {tab === 'evenements' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              {sectionTitle('Événements')}
              <button onClick={() => { setEditEvt({ ...emptyEvt }); setIsNew(true); }} style={btnGold}>+ Nouvel événement</button>
            </div>

            {editEvt && (
              <div style={{ background: dark, border: `1px solid rgba(201,168,76,0.2)`, padding: '2rem', marginBottom: '2rem' }}>
                <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.3rem', color: light, marginBottom: '1.5rem' }}>{isNew ? 'Nouvel événement' : 'Modifier l\'événement'}</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1.5rem' }}>
                  <Field label="Titre" value={editEvt.titre} onChange={(v: string) => setEditEvt({ ...editEvt, titre: v })} />
                  <Select label="Type" value={editEvt.type} onChange={(v: string) => setEditEvt({ ...editEvt, type: v })} options={['Vernissage', 'Performance', 'Portes ouvertes', 'Conférence', 'Atelier', 'Autre']} />
                  <Field label="Date" value={editEvt.date} onChange={(v: string) => setEditEvt({ ...editEvt, date: v })} placeholder="12 avril 2026" />
                  <Field label="Heure" value={editEvt.heure} onChange={(v: string) => setEditEvt({ ...editEvt, heure: v })} placeholder="18h30 — 21h00" />
                  <Field label="Lieu" value={editEvt.lieu} onChange={(v: string) => setEditEvt({ ...editEvt, lieu: v })} />
                  <Select label="Statut" value={editEvt.statut} onChange={(v: string) => setEditEvt({ ...editEvt, statut: v })} options={['à venir', 'passé']} />
                </div>
                <Field label="Description" value={editEvt.description} onChange={(v: string) => setEditEvt({ ...editEvt, description: v })} type="textarea" />
                <ImagesField label="Images (optionnel)" value={editEvt.images} onChange={(v: string[]) => setEditEvt({ ...editEvt, images: v })} />
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                  <button onClick={saveEvt} disabled={saving} style={btnGold}>{saving ? 'Sauvegarde...' : 'Sauvegarder'}</button>
                  <button onClick={() => setEditEvt(null)} style={btnOutline}>Annuler</button>
                </div>
              </div>
            )}

            <div style={{ display: 'grid', gap: '1px', background: 'rgba(201,168,76,0.1)' }}>
              {evenements.map(evt => (
                <div key={evt.id} style={{ background: '#2A2520', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1rem', color: light }}>{evt.titre}</div>
                    <div style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.72rem', color: gold }}>{evt.type} · {evt.date} · {evt.statut}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                    <button onClick={() => { setEditEvt({ ...evt, images: evt.images || [] }); setIsNew(false); }} style={btnOutline}>Modifier</button>
                    <button onClick={() => deleteEvt(evt.id)} style={btnDanger}>Supprimer</button>
                  </div>
                </div>
              ))}
              {evenements.length === 0 && (
                <div style={{ background: '#2A2520', padding: '2rem', textAlign: 'center', fontFamily: 'Montserrat, sans-serif', fontSize: '0.82rem', color: 'rgba(245,240,232,0.4)' }}>
                  Aucun événement. Cliquez sur «&nbsp;Init DB&nbsp;» pour migrer les données.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
