'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { CARRIER_SUGGESTIONS } from '@/lib/carriers';
import { adminFetchInit, adminJsonInit } from '@/lib/admin-fetch';

const gold = '#C9A84C';
const dark = '#1A1209';
const light = '#F5F0E8';

type Tab = 'store' | 'expositions' | 'evenements' | 'commandes';

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
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd, credentials: 'include' });
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

const emptyStore = { titre: '', sous_titre: '', categorie: 'Tableau', description: '', citation: '', technique: '', dimensions: '', annee: '', prix: '', images: [], disponible: true, paypal_link: '', ordre: 0, style: 'Calligraphie contemporaine', extrait: '', in_galerie: true };
const emptyExpo = { titre: '', lieu: '', dates: '', statut: 'passé', description: '', image: '', images: [] };
const emptyEvt = { titre: '', date: '', heure: '', lieu: '', type: 'Vernissage', statut: 'à venir', description: '', images: [] };

export default function AdminPage() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState('');
  const [tab, setTab] = useState<Tab>('store');
  const [initDone, setInitDone] = useState(false);
  const [initMsg, setInitMsg] = useState('');

  const [storeItems, setStoreItems] = useState<any[]>([]);
  const [expositions, setExpositions] = useState<any[]>([]);
  const [evenements, setEvenements] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null);
  const [editingOrder, setEditingOrder] = useState<string | null>(null);
  const [editOrderDraft, setEditOrderDraft] = useState<any>(null);
  const [savingOrder, setSavingOrder] = useState(false);
  const [orderSaveMsg, setOrderSaveMsg] = useState<{ num: string; ok: boolean } | null>(null);

  const [editStore, setEditStore] = useState<any>(null);
  const [editExpo, setEditExpo] = useState<any>(null);
  const [editEvt, setEditEvt] = useState<any>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetch('/api/admin/session', adminFetchInit)
      .then((r) => r.json())
      .then((data) => setLoggedIn(Boolean(data.authenticated)))
      .catch(() => setLoggedIn(false))
      .finally(() => setAuthChecking(false));
  }, []);

  const login = async () => {
    setLoginError('');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        ...adminJsonInit({ password: loginPass }),
      });
      if (res.ok) {
        setLoggedIn(true);
        setLoginPass('');
      } else {
        const data = await res.json().catch(() => ({}));
        setLoginError(data.error || 'Mot de passe incorrect');
      }
    } catch {
      setLoginError('Erreur de connexion');
    }
  };

  const logout = async () => {
    await fetch('/api/admin/logout', { method: 'POST', ...adminFetchInit }).catch(() => {});
    setLoggedIn(false);
  };

  const initDb = async () => {
    setInitMsg('Initialisation...');
    const r = await fetch('/api/admin/init', { method: 'POST', ...adminFetchInit });
    const data = await r.json();
    setInitMsg(data.ok ? '✅ ' + data.message : '❌ ' + data.error);
    setInitDone(data.ok);
    if (data.ok) { fetchAll(); }
  };

  const fetchOrders = useCallback(async () => {
    setOrdersLoading(true);
    try {
      const data = await fetch('/api/orders', adminFetchInit).then(r => r.json());
      if (Array.isArray(data)) setOrders(data);
    } catch {}
    setOrdersLoading(false);
  }, []);

  useEffect(() => {
    if (tab === 'commandes' && loggedIn) fetchOrders();
  }, [tab, loggedIn, fetchOrders]);

  const updateOrderStatus = async (orderNumber: string, status: string) => {
    setUpdatingOrder(orderNumber);
    try {
      const order = orders.find(o => o.order_number === orderNumber);
      await fetch(`/api/orders/${orderNumber}`, {
        method: 'PUT',
        ...adminJsonInit({ status }),
      });
      setOrders(prev => prev.map(o => o.order_number === orderNumber ? { ...o, status } : o));
    } catch {}
    setUpdatingOrder(null);
  };

  function openEditOrder(order: any) {
    setEditingOrder(order.order_number);
    setEditOrderDraft({
      status: order.status,
      nom: order.nom ?? '',
      email: order.email ?? '',
      telephone: order.telephone ?? '',
      customer_notes: order.notes ?? '',
      admin_notes: order.admin_notes ?? '',
      pays_residence: order.pays_residence ?? '',
      pays: order.pays ?? 'FR',
      shipping_cost: order.shipping_cost ?? 0,
      relay_point: order.relay_point ? { ...order.relay_point } : { id: '', nom: '', adresse: '', ville: '', code_postal: '' },
      shipping_address: order.shipping_address ? { ...order.shipping_address } : { rue: '', complement: '', code_postal: '', ville: '' },
      delivery_type: order.delivery_type,
      carrier: order.carrier ?? '',
      tracking_number: order.tracking_number ?? '',
      tracking_url: order.tracking_url ?? '',
    });
    setOrderSaveMsg(null);
  }

  async function saveOrderEdit(orderNumber: string) {
    setSavingOrder(true);
    setOrderSaveMsg(null);
    try {
      const d = editOrderDraft;
      const body: any = {
        status: d.status,
        nom: d.nom,
        email: d.email,
        telephone: d.telephone || null,
        customer_notes: d.customer_notes || null,
        admin_notes: d.admin_notes || null,
        pays_residence: d.pays_residence?.trim() || null,
        pays: d.pays,
        shipping_cost: Number(d.shipping_cost),
        carrier: d.carrier?.trim() || null,
        tracking_number: d.tracking_number?.trim() || null,
        tracking_url: d.tracking_url?.trim() || null,
      };
      if (d.delivery_type === 'relay') body.relay_point = d.relay_point;
      if (d.delivery_type === 'home') body.shipping_address = d.shipping_address;

      const res = await fetch(`/api/orders/${orderNumber}`, {
        method: 'PUT',
        ...adminJsonInit(body),
      });
      if (res.ok) {
        setOrders(prev => prev.map(o => o.order_number === orderNumber ? {
          ...o, ...body,
          relay_point: d.delivery_type === 'relay' ? d.relay_point : o.relay_point,
          shipping_address: d.delivery_type === 'home' ? d.shipping_address : o.shipping_address,
                          carrier: d.carrier,
                          tracking_number: d.tracking_number,
                          tracking_url: d.tracking_url,
                          notes: d.customer_notes,
                          admin_notes: d.admin_notes,
                          pays_residence: d.pays_residence,
        } : o));
        setOrderSaveMsg({ num: orderNumber, ok: true });
      } else {
        setOrderSaveMsg({ num: orderNumber, ok: false });
      }
    } catch {
      setOrderSaveMsg({ num: orderNumber, ok: false });
    }
    setSavingOrder(false);
  }

  const fetchAll = useCallback(async () => {
    const [s, e, ev] = await Promise.all([
      fetch('/api/store', adminFetchInit).then(r => r.json()),
      fetch('/api/expositions', adminFetchInit).then(r => r.json()),
      fetch('/api/evenements', adminFetchInit).then(r => r.json()),
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
    await fetch(url, { method, ...adminJsonInit(body) });
    await fetchAll(); setEditStore(null); setSaving(false); flash('✅ Article sauvegardé');
  };

  const deleteStore = async (id: number) => {
    if (!confirm('Supprimer cet article ?')) return;
    await fetch(`/api/store/${id}`, { method: 'DELETE', ...adminFetchInit });
    await fetchAll(); flash('Article supprimé');
  };

  const saveExpo = async () => {
    setSaving(true);
    const url = isNew ? '/api/expositions' : `/api/expositions/${editExpo.id}`;
    const method = isNew ? 'POST' : 'PUT';
    await fetch(url, { method, ...adminJsonInit(editExpo) });
    await fetchAll(); setEditExpo(null); setSaving(false); flash('✅ Exposition sauvegardée');
  };

  const deleteExpo = async (id: number) => {
    if (!confirm('Supprimer cette exposition ?')) return;
    await fetch(`/api/expositions/${id}`, { method: 'DELETE', ...adminFetchInit });
    await fetchAll(); flash('Exposition supprimée');
  };

  const saveEvt = async () => {
    setSaving(true);
    const url = isNew ? '/api/evenements' : `/api/evenements/${editEvt.id}`;
    const method = isNew ? 'POST' : 'PUT';
    await fetch(url, { method, ...adminJsonInit(editEvt) });
    await fetchAll(); setEditEvt(null); setSaving(false); flash('✅ Événement sauvegardé');
  };

  const deleteEvt = async (id: number) => {
    if (!confirm('Supprimer cet événement ?')) return;
    await fetch(`/api/evenements/${id}`, { method: 'DELETE', ...adminFetchInit });
    await fetchAll(); flash('Événement supprimé');
  };

  if (authChecking) {
    return (
      <div style={{ minHeight: '100vh', background: dark, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.75rem', letterSpacing: '0.2em', color: gold, textTransform: 'uppercase' }}>Chargement…</span>
      </div>
    );
  }

  if (!loggedIn) {
    return (
      <div style={{ minHeight: '100vh', background: dark, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ width: '100%', maxWidth: 360, border: `1px solid rgba(201,168,76,0.2)`, padding: '2.5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', color: light, fontWeight: 300, letterSpacing: '0.05em' }}>LookaGraphy</div>
            <div style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.68rem', letterSpacing: '0.3em', color: gold, textTransform: 'uppercase', marginTop: '0.3rem' }}>Backoffice</div>
          </div>
          <form onSubmit={e => { e.preventDefault(); login(); }}>
            <Field label="Mot de passe admin" value={loginPass} onChange={setLoginPass} type="password" placeholder="••••••••" autoComplete="current-password" />
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
      <div className="admin-header" style={{ background: dark, borderBottom: `1px solid rgba(201,168,76,0.15)` }}>
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
      <div className="admin-tabs" style={{ background: dark, gap: 0, borderBottom: `1px solid rgba(201,168,76,0.15)` }}>
        {([['store', 'Store'], ['expositions', 'Expositions'], ['evenements', 'Événements'], ['commandes', 'Commandes']] as [Tab, string][]).map(([k, label]) => (
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
              position: 'relative',
            }}
          >
            {label}
            {k === 'commandes' && orders.filter(o => o.status === 'en_attente').length > 0 && (
              <span style={{
                position: 'absolute', top: 8, right: 6,
                background: gold, color: dark,
                borderRadius: '50%', width: 16, height: 16,
                fontFamily: 'Montserrat, sans-serif', fontSize: '0.55rem', fontWeight: 700,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {orders.filter(o => o.status === 'en_attente').length}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="admin-content">

        {/* ── STORE ── */}
        {tab === 'store' && (
          <div>
            <div className="admin-section-head">
              {sectionTitle('Articles du Store')}
              <button onClick={() => { setEditStore({ ...emptyStore }); setIsNew(true); }} style={btnGold}>+<span className="admin-btn-text"> Nouvel article</span></button>
            </div>

            {editStore && (
              <div className="admin-form-pad" style={{ background: dark, border: `1px solid rgba(201,168,76,0.2)`, marginBottom: '2rem' }}>
                <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.3rem', color: light, marginBottom: '1.5rem' }}>{isNew ? 'Nouvel article' : 'Modifier l\'article'}</h3>
                <div className="admin-form-grid">
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
                <div className="admin-form-grid">
                  <Field label="Style (galerie)" value={editStore.style} onChange={(v: string) => setEditStore({ ...editStore, style: v })} />
                  <Field label="Extrait / auteur (galerie)" value={editStore.extrait} onChange={(v: string) => setEditStore({ ...editStore, extrait: v })} />
                </div>
                <Field label="Description" value={editStore.description} onChange={(v: string) => setEditStore({ ...editStore, description: v })} type="textarea" />
                <ImagesField label="Images (chemins /images/...)" value={editStore.images} onChange={(v: string[]) => setEditStore({ ...editStore, images: v })} />
                <Toggle label="Disponibilité" value={editStore.disponible} onChange={(v: boolean) => setEditStore({ ...editStore, disponible: v })} />
                <Toggle label="Afficher dans la galerie" value={editStore.in_galerie} onChange={(v: boolean) => setEditStore({ ...editStore, in_galerie: v })} />
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                  <button onClick={saveStore} disabled={saving} style={btnGold}>{saving ? 'Sauvegarde...' : 'Sauvegarder'}</button>
                  <button onClick={() => setEditStore(null)} style={btnOutline}>Annuler</button>
                </div>
              </div>
            )}

            <div style={{ display: 'grid', gap: '1px', background: 'rgba(201,168,76,0.1)' }}>
              {storeItems.map(item => (
                <div key={item.id} className="admin-item-row" style={{ background: '#2A2520', padding: '1rem 1.25rem' }}>
                  {item.images?.[0] && (
                    <img src={item.images[0]} alt="" style={{ width: 56, height: 56, objectFit: 'cover', flexShrink: 0 }} />
                  )}
                  <div className="admin-item-info">
                    <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1rem', color: light }}>{item.titre}</div>
                    <div style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.72rem', color: gold }}>{item.categorie} · {item.prix}€ · {item.disponible ? 'DISPO' : 'Indisponible'}</div>
                  </div>
                  <div className="admin-item-actions">
                    <button onClick={() => { setEditStore({ ...item, in_galerie: item.in_galerie ?? false }); setIsNew(false); }} style={btnOutline}><span className="admin-btn-text">Modifier</span><span className="admin-icon">✎</span></button>
                    <button onClick={() => deleteStore(item.id)} style={btnDanger}><span className="admin-btn-text">Supprimer</span><span className="admin-icon">✕</span></button>
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
            <div className="admin-section-head">
              {sectionTitle('Expositions')}
              <button onClick={() => { setEditExpo({ ...emptyExpo }); setIsNew(true); }} style={btnGold}>+<span className="admin-btn-text"> Nouvelle exposition</span></button>
            </div>

            {editExpo && (
              <div className="admin-form-pad" style={{ background: dark, border: `1px solid rgba(201,168,76,0.2)`, marginBottom: '2rem' }}>
                <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.3rem', color: light, marginBottom: '1.5rem' }}>{isNew ? 'Nouvelle exposition' : 'Modifier l\'exposition'}</h3>
                <div className="admin-form-grid">
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
                <div key={expo.id} className="admin-item-row" style={{ background: '#2A2520', padding: '1rem 1.25rem' }}>
                  {expo.image && (
                    <img src={expo.image} alt="" style={{ width: 56, height: 56, objectFit: 'cover', flexShrink: 0 }} />
                  )}
                  <div className="admin-item-info">
                    <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1rem', color: light }}>{expo.titre}</div>
                    <div style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.72rem', color: gold }}>{expo.lieu} · {expo.statut}</div>
                  </div>
                  <div className="admin-item-actions">
                    <button onClick={() => { setEditExpo({ ...expo, images: expo.images || [] }); setIsNew(false); }} style={btnOutline}><span className="admin-btn-text">Modifier</span><span className="admin-icon">✎</span></button>
                    <button onClick={() => deleteExpo(expo.id)} style={btnDanger}><span className="admin-btn-text">Supprimer</span><span className="admin-icon">✕</span></button>
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
            <div className="admin-section-head">
              {sectionTitle('Événements')}
              <button onClick={() => { setEditEvt({ ...emptyEvt }); setIsNew(true); }} style={btnGold}>+<span className="admin-btn-text"> Nouvel événement</span></button>
            </div>

            {editEvt && (
              <div className="admin-form-pad" style={{ background: dark, border: `1px solid rgba(201,168,76,0.2)`, marginBottom: '2rem' }}>
                <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.3rem', color: light, marginBottom: '1.5rem' }}>{isNew ? 'Nouvel événement' : 'Modifier l\'événement'}</h3>
                <div className="admin-form-grid">
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
                <div key={evt.id} className="admin-item-row" style={{ background: '#2A2520', padding: '1rem 1.25rem' }}>
                  <div className="admin-item-info">
                    <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1rem', color: light }}>{evt.titre}</div>
                    <div style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.72rem', color: gold }}>{evt.type} · {evt.date} · {evt.statut}</div>
                  </div>
                  <div className="admin-item-actions">
                    <button onClick={() => { setEditEvt({ ...evt, images: evt.images || [] }); setIsNew(false); }} style={btnOutline}><span className="admin-btn-text">Modifier</span><span className="admin-icon">✎</span></button>
                    <button onClick={() => deleteEvt(evt.id)} style={btnDanger}><span className="admin-btn-text">Supprimer</span><span className="admin-icon">✕</span></button>
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

        {/* ── COMMANDES ── */}
        {tab === 'commandes' && (
          <div>
            <div className="admin-section-head">
              {sectionTitle('Commandes')}
              <button onClick={fetchOrders} style={btnOutline}>↻ Actualiser</button>
            </div>

            {ordersLoading && (
              <div style={{ padding: '2rem', textAlign: 'center', fontFamily: 'Montserrat, sans-serif', fontSize: '0.82rem', color: 'rgba(245,240,232,0.4)' }}>
                Chargement…
              </div>
            )}

            {!ordersLoading && (
              <div style={{ display: 'grid', gap: '1px', background: 'rgba(201,168,76,0.1)' }}>
                {orders.length === 0 && (
                  <div style={{ background: '#2A2520', padding: '2rem', textAlign: 'center', fontFamily: 'Montserrat, sans-serif', fontSize: '0.82rem', color: 'rgba(245,240,232,0.4)' }}>
                    Aucune commande pour le moment.
                  </div>
                )}
                {orders.map(order => {
                  const statusColors: Record<string, string> = {
                    en_attente: '#E4C97A', paye: '#6fcf97', expedie: '#56CCF2', livre: '#6fcf97', annule: '#e05555',
                  };
                  const statusLabels: Record<string, string> = {
                    en_attente: 'En attente', paye: 'Payé', expedie: 'Expédié', livre: 'Livré', annule: 'Annulé',
                  };
                  const color = statusColors[order.status] ?? gold;
                  const isEditing = editingOrder === order.order_number;
                  const d = isEditing ? editOrderDraft : null;

                  return (
                    <div key={order.order_number} style={{ background: '#2A2520' }}>

                      {/* ── Ligne résumé ── */}
                      <div style={{ padding: '1.25rem', display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'flex-start' }}>
                        <div style={{ flex: 1, minWidth: 200 }}>
                          <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1rem', color: light, marginBottom: '0.2rem' }}>
                            {order.order_number}
                          </div>
                          <div style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.72rem', color: 'rgba(245,240,232,0.55)' }}>
                            {order.nom} · {order.email}{order.telephone ? ` · ${order.telephone}` : ''}
                            {order.pays_residence ? ` · Rés. ${order.pays_residence}` : ''}
                          </div>
                          <div style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.68rem', color: 'rgba(245,240,232,0.35)', marginTop: '0.15rem' }}>
                            {new Date(order.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </div>
                          <div style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.68rem', color: 'rgba(245,240,232,0.38)', marginTop: '0.25rem', lineHeight: 1.6 }}>
                            {(order.items ?? []).map((item: any, i: number) => (
                              <span key={i}>{item.qty}× {item.titre}{item.matiere ? ` (${item.matiere})` : ''}{i < (order.items?.length ?? 0) - 1 ? ' · ' : ''}</span>
                            ))}
                          </div>
                          <div style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.67rem', color: 'rgba(245,240,232,0.32)', marginTop: '0.2rem' }}>
                            {order.delivery_type === 'relay'
                              ? `📍 ${order.relay_point?.nom ?? 'Point Relais'}${order.relay_point?.ville ? `, ${order.relay_point.ville}` : ''} (${order.pays})`
                              : order.delivery_type === 'home'
                              ? `🏠 ${order.shipping_address?.rue ?? ''}, ${order.shipping_address?.code_postal ?? ''} ${order.shipping_address?.ville ?? ''} · ${Number(order.shipping_cost)} € port`
                              : '🌍 International'}
                          </div>
                          {order.tracking_number && (
                            <div style={{ marginTop: '0.3rem', fontFamily: 'Montserrat, sans-serif', fontSize: '0.67rem', color: 'rgba(201,168,76,0.75)' }}>
                              📦 Suivi{order.carrier ? ` (${order.carrier})` : ''} : {order.tracking_number}
                            </div>
                          )}
                          {order.notes && (
                            <div style={{ marginTop: '0.3rem', fontFamily: 'Montserrat, sans-serif', fontSize: '0.67rem', fontWeight: 300, color: 'rgba(245,240,232,0.38)', fontStyle: 'italic' }}>
                              💬 {order.notes}
                            </div>
                          )}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                          <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.25rem', color: gold }}>{Number(order.total).toFixed(2)} €</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <span style={{ display: 'inline-block', width: 7, height: 7, borderRadius: '50%', background: color }} />
                            <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.65rem', color, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                              {statusLabels[order.status] ?? order.status}
                            </span>
                          </div>
                          <button
                            onClick={() => isEditing ? setEditingOrder(null) : openEditOrder(order)}
                            style={{ ...btnOutline, fontSize: '0.65rem', padding: '0.35rem 0.9rem', marginTop: '0.25rem' }}
                          >
                            {isEditing ? '✕ Fermer' : '✎ Modifier'}
                          </button>
                        </div>
                      </div>

                      {/* ── Panneau d'édition expandable ── */}
                      {isEditing && d && (
                        <div style={{ borderTop: '1px solid rgba(201,168,76,0.15)', padding: '1.5rem 1.25rem', background: 'rgba(26,18,9,0.5)' }}>

                          {/* Statut */}
                          <div style={{ marginBottom: '1.5rem' }}>
                            <label style={labelStyle}>Statut de la commande</label>
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.4rem' }}>
                              {(['en_attente', 'paye', 'expedie', 'livre', 'annule'] as const).map(s => (
                                <button
                                  key={s}
                                  onClick={() => setEditOrderDraft({ ...d, status: s })}
                                  style={{
                                    fontFamily: 'Montserrat, sans-serif', fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase',
                                    padding: '0.45rem 0.85rem', border: 'none', cursor: 'pointer',
                                    background: d.status === s ? (statusColors[s] ?? gold) : 'rgba(245,240,232,0.08)',
                                    color: d.status === s ? dark : 'rgba(245,240,232,0.5)',
                                    fontWeight: d.status === s ? 600 : 300,
                                    transition: 'all 0.2s',
                                  }}
                                >
                                  {statusLabels[s]}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Coordonnées client */}
                          <div style={{ marginBottom: '1.5rem' }}>
                            <div style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.65rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: gold, marginBottom: '0.75rem', borderBottom: '1px solid rgba(201,168,76,0.1)', paddingBottom: '0.4rem' }}>
                              Coordonnées client
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem 1rem' }}>
                              <div style={{ gridColumn: '1/-1' }}>
                                <label style={labelStyle}>Nom complet</label>
                                <input style={inputStyle} value={d.nom} onChange={e => setEditOrderDraft({ ...d, nom: e.target.value })} />
                              </div>
                              <div>
                                <label style={labelStyle}>Email</label>
                                <input type="email" style={inputStyle} value={d.email} onChange={e => setEditOrderDraft({ ...d, email: e.target.value })} />
                              </div>
                              <div>
                                <label style={labelStyle}>Téléphone</label>
                                <input type="tel" style={inputStyle} value={d.telephone} onChange={e => setEditOrderDraft({ ...d, telephone: e.target.value })} placeholder="+33 6 00 00 00 00" />
                              </div>
                              <div style={{ gridColumn: '1/-1' }}>
                                <label style={labelStyle}>Pays de résidence</label>
                                <input style={inputStyle} value={d.pays_residence} onChange={e => setEditOrderDraft({ ...d, pays_residence: e.target.value })} placeholder="France" />
                              </div>
                            </div>
                          </div>

                          {/* Livraison — Mondial Relay */}
                          {d.delivery_type === 'relay' && (
                            <div style={{ marginBottom: '1.5rem' }}>
                              <div style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.65rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: gold, marginBottom: '0.75rem', borderBottom: '1px solid rgba(201,168,76,0.1)', paddingBottom: '0.4rem' }}>
                                📍 Point Relais Mondial Relay
                              </div>
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem 1rem' }}>
                                <div>
                                  <label style={labelStyle}>Pays</label>
                                  <select style={{ ...inputStyle }} value={d.pays} onChange={e => setEditOrderDraft({ ...d, pays: e.target.value })}>
                                    {[['FR','France'],['BE','Belgique'],['LU','Luxembourg'],['ES','Espagne'],['PT','Portugal'],['DE','Allemagne']].map(([code, label]) => (
                                      <option key={code} value={code}>{label}</option>
                                    ))}
                                  </select>
                                </div>
                                <div>
                                  <label style={labelStyle}>ID Point Relais</label>
                                  <input style={inputStyle} value={d.relay_point.id} onChange={e => setEditOrderDraft({ ...d, relay_point: { ...d.relay_point, id: e.target.value } })} placeholder="123456" />
                                </div>
                                <div style={{ gridColumn: '1/-1' }}>
                                  <label style={labelStyle}>Nom du point relais</label>
                                  <input style={inputStyle} value={d.relay_point.nom} onChange={e => setEditOrderDraft({ ...d, relay_point: { ...d.relay_point, nom: e.target.value } })} />
                                </div>
                                <div style={{ gridColumn: '1/-1' }}>
                                  <label style={labelStyle}>Adresse</label>
                                  <input style={inputStyle} value={d.relay_point.adresse} onChange={e => setEditOrderDraft({ ...d, relay_point: { ...d.relay_point, adresse: e.target.value } })} />
                                </div>
                                <div>
                                  <label style={labelStyle}>Code postal</label>
                                  <input style={inputStyle} value={d.relay_point.code_postal} onChange={e => setEditOrderDraft({ ...d, relay_point: { ...d.relay_point, code_postal: e.target.value } })} />
                                </div>
                                <div>
                                  <label style={labelStyle}>Ville</label>
                                  <input style={inputStyle} value={d.relay_point.ville} onChange={e => setEditOrderDraft({ ...d, relay_point: { ...d.relay_point, ville: e.target.value } })} />
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Livraison — Domicile */}
                          {d.delivery_type === 'home' && (
                            <div style={{ marginBottom: '1.5rem' }}>
                              <div style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.65rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: gold, marginBottom: '0.75rem', borderBottom: '1px solid rgba(201,168,76,0.1)', paddingBottom: '0.4rem' }}>
                                🏠 Adresse de livraison (domicile)
                              </div>
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem 1rem' }}>
                                <div style={{ gridColumn: '1/-1' }}>
                                  <label style={labelStyle}>Adresse (rue)</label>
                                  <input style={inputStyle} value={d.shipping_address.rue} onChange={e => setEditOrderDraft({ ...d, shipping_address: { ...d.shipping_address, rue: e.target.value } })} />
                                </div>
                                <div style={{ gridColumn: '1/-1' }}>
                                  <label style={labelStyle}>Complément</label>
                                  <input style={inputStyle} value={d.shipping_address.complement ?? ''} onChange={e => setEditOrderDraft({ ...d, shipping_address: { ...d.shipping_address, complement: e.target.value } })} placeholder="Bât. A, Apt. 3..." />
                                </div>
                                <div>
                                  <label style={labelStyle}>Code postal</label>
                                  <input style={inputStyle} value={d.shipping_address.code_postal} onChange={e => setEditOrderDraft({ ...d, shipping_address: { ...d.shipping_address, code_postal: e.target.value } })} />
                                </div>
                                <div>
                                  <label style={labelStyle}>Ville</label>
                                  <input style={inputStyle} value={d.shipping_address.ville} onChange={e => setEditOrderDraft({ ...d, shipping_address: { ...d.shipping_address, ville: e.target.value } })} />
                                </div>
                                <div>
                                  <label style={labelStyle}>Frais de livraison (€)</label>
                                  <input type="number" style={inputStyle} value={d.shipping_cost} onChange={e => setEditOrderDraft({ ...d, shipping_cost: e.target.value })} min="0" step="0.01" />
                                </div>
                              </div>
                            </div>
                          )}

                          {/* International */}
                          {d.delivery_type === 'international' && (
                            <div style={{ marginBottom: '1.5rem', padding: '0.85rem', background: 'rgba(245,240,232,0.04)', border: '1px solid rgba(201,168,76,0.1)' }}>
                              <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.72rem', color: 'rgba(245,240,232,0.45)' }}>
                                🌍 Livraison internationale — coordonnées à gérer directement avec le client.
                              </p>
                            </div>
                          )}

                          {/* Expédition & suivi */}
                          <div style={{ marginBottom: '1.5rem' }}>
                            <div style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.65rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: gold, marginBottom: '0.75rem', borderBottom: '1px solid rgba(201,168,76,0.1)', paddingBottom: '0.4rem' }}>
                              📦 Expédition & suivi colis
                            </div>
                            <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.68rem', color: 'rgba(245,240,232,0.45)', marginBottom: '0.85rem', lineHeight: 1.6 }}>
                              Backoffice uniquement — le client ne choisit pas. À renseigner quand vous expédiez (Mondial Relay, La Poste, Colissimo, DPD…). Affiché sur la page de suivi et dans les emails.
                            </p>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem 1rem' }}>
                              <div style={{ gridColumn: '1/-1' }}>
                                <label style={labelStyle}>Transporteur utilisé</label>
                                <input
                                  style={inputStyle}
                                  list="carrier-suggestions"
                                  value={d.carrier}
                                  onChange={e => setEditOrderDraft({ ...d, carrier: e.target.value })}
                                  placeholder="Ex : Mondial Relay, Colissimo…"
                                />
                                <datalist id="carrier-suggestions">
                                  {CARRIER_SUGGESTIONS.map(c => (
                                    <option key={c} value={c} />
                                  ))}
                                </datalist>
                              </div>
                              <div style={{ gridColumn: '1/-1' }}>
                                <label style={labelStyle}>Numéro de suivi</label>
                                <input
                                  style={inputStyle}
                                  value={d.tracking_number}
                                  onChange={e => setEditOrderDraft({ ...d, tracking_number: e.target.value })}
                                  placeholder="Ex : 12345678901234"
                                />
                              </div>
                              <div style={{ gridColumn: '1/-1' }}>
                                <label style={labelStyle}>Lien de suivi (optionnel)</label>
                                <input
                                  style={inputStyle}
                                  value={d.tracking_url}
                                  onChange={e => setEditOrderDraft({ ...d, tracking_url: e.target.value })}
                                  placeholder="https://…"
                                />
                              </div>
                            </div>
                          </div>

                          {d.customer_notes ? (
                            <div style={{ marginBottom: '1.5rem', padding: '0.85rem', background: 'rgba(245,240,232,0.04)', border: '1px solid rgba(201,168,76,0.1)' }}>
                              <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: gold, marginBottom: '0.5rem' }}>
                                Message client (checkout)
                              </p>
                              <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.72rem', color: 'rgba(245,240,232,0.55)', lineHeight: 1.6, fontStyle: 'italic' }}>
                                {d.customer_notes}
                              </p>
                            </div>
                          ) : null}

                          <div style={{ marginBottom: '1.5rem' }}>
                            <div style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.65rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: gold, marginBottom: '0.75rem', borderBottom: '1px solid rgba(201,168,76,0.1)', paddingBottom: '0.4rem' }}>
                              💬 Message au client (optionnel)
                            </div>
                            <textarea
                              style={{ ...inputStyle, resize: 'vertical', minHeight: 80, lineHeight: 1.6 }}
                              value={d.admin_notes}
                              onChange={e => setEditOrderDraft({ ...d, admin_notes: e.target.value })}
                              placeholder="Message envoyé avec les mises à jour de statut (email)"
                            />
                          </div>

                          {/* Boutons */}
                          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                            <button
                              onClick={() => saveOrderEdit(order.order_number)}
                              disabled={savingOrder}
                              style={{ ...btnGold, opacity: savingOrder ? 0.6 : 1 }}
                            >
                              {savingOrder ? 'Sauvegarde…' : 'Sauvegarder les modifications'}
                            </button>
                            <button onClick={() => setEditingOrder(null)} style={btnOutline}>Annuler</button>
                            {orderSaveMsg?.num === order.order_number && (
                              <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.72rem', color: orderSaveMsg?.ok ? '#6fcf97' : '#e05555' }}>
                                {orderSaveMsg?.ok ? '✓ Sauvegardé' : '✕ Erreur lors de la sauvegarde'}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
