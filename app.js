/* ===== Konfigurasi ===== */
const API_BASE_URL = 'http://localhost:8000';   // ubah sesuai alamat Laravel
const FILE_FIELD = 'attachments[]';             // nama field upload foto (sesuaikan backend)
const STORAGE_URL = API_BASE_URL + '/storage/'; // dasar URL foto (sesuaikan backend)

const KAT = {toilet:'Toilet',kelas:'Kelas',lab:'Lab',lapangan:'Lapangan',listrik_ac:'Listrik / AC'};
const KI = {toilet:'toilet',kelas:'kelas',lab:'lab',lapangan:'lapangan',listrik_ac:'listrik'};
const URG = {rendah:'Rendah',sedang:'Sedang',mendesak:'Mendesak'};
const ST = {pending:'Menunggu',diproses:'Diproses',selesai:'Selesai',ditolak:'Ditolak'};
const ROLE = {siswa:'Siswa',guru:'Guru',admin:'Admin / Petugas',teknisi:'Teknisi'};
const ERR = {401:'Sesi berakhir, silakan masuk lagi.',403:'Anda tidak punya izin untuk aksi ini.',404:'Data tidak ditemukan.',422:'Data yang dikirim belum valid.'};
const IC = {home:'M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z',plus:'M12 5v14M5 12h14',list:'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01',
bell:'M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.9 1.9 0 0 0 3.4 0',user:'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8',
out:'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9',toilet:'M12 2.7s6 6.3 6 11a6 6 0 0 1-12 0c0-4.7 6-11 6-11z',
kelas:'M2 4h7a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H2zM22 4h-7a3 3 0 0 0-3 3v13a2 2 0 0 1 2-2h8z',lab:'M9 3h6M10 3v6L4.5 19a1.5 1.5 0 0 0 1.3 2.2h12.4a1.5 1.5 0 0 0 1.3-2.2L14 9V3M7.5 14h9',
lapangan:'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18',listrik:'M13 2L4 14h7l-1 8 9-12h-7z',
wrench:'M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2.4-.6-.6-2.4z',check:'M20 6L9 17l-5-5',clock:'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2',
x:'M18 6L6 18M6 6l12 12',image:'M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zM8.5 10a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM21 15l-5-5L5 21',
send:'M22 2L11 13M22 2l-7 20-4-9-9-4z',search:'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.3-4.3',bld:'M4 21V8l8-5 8 5v13M9 21v-7h6v7',arrow:'M5 12h14M13 5l7 7-7 7'};
const ic = (n, s = 18) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${IC[n]}"/></svg>`;

const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const S = {token: localStorage.getItem('token'), user: JSON.parse(localStorage.getItem('user') || 'null'), unread: 0, files: []};
const list = d => Array.isArray(d) ? d : (d?.data?.data || d?.data || d?.reports || []);
const nm = u => u?.nama || u?.name || '-';
const ini = n => nm({nama: n}).split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
const fdate = d => d ? new Date(d).toLocaleDateString('id-ID', {day:'numeric', month:'short', year:'numeric'}) : '';
const today = () => new Date().toLocaleDateString('id-ID', {weekday:'long', day:'numeric', month:'long', year:'numeric'});
const img = p => /^https?:/.test(p) ? p : STORAGE_URL + p;
const isStaff = () => ['admin', 'teknisi'].includes(S.user.role);

function toast(msg, type = 'success') {
  const el = document.createElement('div');
  el.className = `alert alert-${type === 'error' ? 'danger' : 'success'} shadow-sm`; el.textContent = msg;
  $('#toasts').append(el); setTimeout(() => el.remove(), 4000);
}
async function api(path, {method = 'GET', body, form} = {}) {
  const h = {Accept: 'application/json'};
  if (S.token) h.Authorization = 'Bearer ' + S.token;
  if (body) h['Content-Type'] = 'application/json';
  let res;
  try { res = await fetch(API_BASE_URL + path, {method, headers: h, body: form || (body && JSON.stringify(body))}); }
  catch { throw new Error('Tidak dapat terhubung ke server. Periksa API_BASE_URL.'); }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401 && path !== '/api/login') clearSession(true);
    const det = res.status === 422 && data.errors ? ' ' + Object.values(data.errors).flat().join(' ') : '';
    throw new Error((ERR[res.status] || data.message || 'Terjadi kesalahan server.') + det);
  }
  return data;
}
function clearSession(redirect) { S.token = S.user = null; localStorage.clear(); if (redirect) location.hash = '#/login'; }
const wrap = fn => async (...a) => { try { await fn(...a); } catch (e) { toast(e.message, 'error'); } };

/* ===== Komponen UI ===== */
const bg = s => `<span class="bg ${s}">${ST[s] || esc(s)}</span>`;
function ub(u) {
  const n = {rendah:1, sedang:2, mendesak:3}[u] || 1;
  return `<span class="ul"><span class="ub">${[6,10,14].map((h, k) => `<i class="${k < n ? 'f' : ''}" style="height:${h}px"></i>`).join('')}</span>${URG[u] || ''}</span>`;
}
function rw(r, m = '') {
  const side = m === 'n' ? '' : m === 'a' ? `<span class="sm m hm">${r.assigned_to ? 'Teknisi #' + esc(r.assigned_to) : 'Belum ditugaskan'}</span>` : `<span class="sm m hm">${fdate(r.created_at)}</span>`;
  return `<a class="rw ${m}" href="#/report/${r.id}"><div class="ct">${ic(KI[r.kategori] || 'toilet', 20)}</div>
  <div class="mw"><div class="cap">${KAT[r.kategori] || esc(r.kategori)} · #${r.id}</div><b>${esc(r.lokasi)}</b><div class="d">${esc(r.deskripsi)}</div></div>${side}<span class="hm">${ub(r.urgensi)}</span>${bg(r.status)}</a>`;
}
function stat(l, n, sub, v, i) {
  const c = {w: 'cd', s: 'sf', d: 'dk'}[v];
  return `<div class="${c} st s3">${v === 'd' ? '<i class="o1"></i>' : ''}<div class="t">${ic(i, 16)}${l}</div><div><b>${n}</b><div class="xs" style="opacity:.75;margin-top:6px">${sub}</div></div></div>`;
}
function tl(k, w = '') {
  const lb = ['Diterima', 'Diproses', 'Selesai'];
  return `<div class="tl ${w}">` + lb.map((t, i) => `<div class="k ${i < k ? 'f' : ''}"><u></u>${t}</div>` + (i < 2 ? `<div class="p"><i style="width:${k > i + 1 ? 100 : 0}%"></i></div>` : '')).join('') + '</div>';
}
const stepOf = s => ({pending: 1, diproses: 2, selesai: 3}[s] || 0);
function card(title, link, href, inner, cls) {
  return `<div class="cd ${cls}"><div class="cth"><h3>${title}</h3>${link ? `<a href="${href}">${link}${ic('arrow', 14)}</a>` : ''}</div>${inner}</div>`;
}
const empty = t => `<div class="empty">${ic('list', 28)}<div style="margin-top:8px">${t}</div></div>`;
const loading = '<div class="empty"><div class="spinner-border spinner-border-sm"></div> Memuat...</div>';
const notifText = n => n.data?.message || n.data?.pesan || n.data?.title || n.message || 'Notifikasi baru';
const nrow = n => `<div class="nt" data-n="${n.id}" data-l="${n.data?.report_id || ''}"><div class="ct">${ic('bell')}</div><div class="sp"><b class="sm">${esc(notifText(n))}</b><div class="xs m">${fdate(n.created_at)}</div></div><i style="${n.read_at ? 'border:1.5px solid #aebcd6' : 'background:var(--n)'}"></i></div>`;
function bindNotif() {
  document.querySelectorAll('[data-n]').forEach(el => el.onclick = wrap(async () => {
    await api(`/api/notifications/${el.dataset.n}/read`, {method: 'PATCH'});
    if (el.dataset.l) location.hash = '#/report/' + el.dataset.l; else route();
  }));
}

/* ===== Layout ===== */
function menu() {
  const r = S.user.role, m = [['dashboard', 'home', 'Dashboard']];
  if (r === 'admin') m.push(['reports', 'list', 'Semua Laporan']);
  else if (r === 'teknisi') m[0] = ['dashboard', 'home', 'Dashboard'], m.push(['reports', 'wrench', 'Tugas Saya']);
  else m.push(['create', 'plus', 'Buat Laporan'], ['reports', 'list', 'Riwayat']);
  m.push(['notifications', 'bell', 'Notifikasi'], ['profile', 'user', 'Profil']);
  return m;
}
function layout(title, sub, html, action = '') {
  const cur = location.hash.split('/')[1] || 'dashboard', u = S.user;
  $('#app').innerHTML = `<nav class="sd"><div class="lg"><i>${ic('bld', 20)}</i><span>Pengaduan<br>Fasilitas Sekolah</span></div>
  ${menu().map(([k, i, l]) => `<a class="nv ${cur === k || (cur === 'report' && k === 'reports') ? 'on' : ''}" href="#/${k}">${ic(i)}<span>${l}</span>${k === 'notifications' && S.unread ? `<em>${S.unread}</em>` : ''}</a>`).join('')}
  <div class="us gl rowf"><div class="av">${esc(ini(nm(u)))}</div><div class="sp"><b class="sm">${esc(nm(u))}</b><div class="xs" style="opacity:.8">${esc(ROLE[u.role] || u.role)}</div></div>
  <a href="#" onclick="logout();return false" title="Keluar" aria-label="Keluar">${ic('out', 16)}</a></div></nav>
  <main class="mn"><div class="hd"><div><h2>${title}</h2><p>${sub}</p></div>${action}</div><div id="view">${html}</div></main>`;
}

/* ===== Auth ===== */
function loginPage() {
  let mode = 'siswa';
  $('#app').innerHTML = `<div class="login"><div class="dk"><i class="o1" style="width:320px;height:320px;right:-100px;top:-100px"></i><i class="o2" style="width:260px;height:260px;right:120px;bottom:-110px"></i>
  <div class="lg" style="padding:0"><i>${ic('bld', 20)}</i><span>Pengaduan Fasilitas Sekolah</span></div>
  <div><div class="cap" style="color:#9fb3d9">Sistem pelaporan</div><h1 style="margin:12px 0 16px">Laporkan kerusakan,<br>pantau sampai selesai.</h1><p style="color:#c5d2ea;max-width:460px;line-height:1.6">Kerusakan toilet, kelas, lab, lapangan, dan listrik atau AC tercatat rapi, dan statusnya bisa dipantau siswa maupun petugas.</p></div>
  <div class="gl hm" style="max-width:460px"><div class="rowf"><div class="sp"><div class="xs" style="opacity:.8">Contoh pelacakan</div><b>Toilet putra, lantai 2</b></div><span class="bg diproses" style="color:var(--n)">Diproses</span></div>${tl(2, 'w')}</div></div>
  <div style="display:flex;align-items:center;justify-content:center;background:#fff;padding:24px"><form id="lf" class="cl" style="gap:16px"><div><h2 style="font-size:34px;font-weight:800;letter-spacing:-.02em">Masuk</h2><p class="m" style="margin-top:6px">Pilih peran Anda untuk melanjutkan.</p></div>
  <div class="seg"><button type="button" class="on" data-m="siswa">Siswa</button><button type="button" data-m="staf">Petugas dan Teknisi</button></div>
  <div id="f1"><label class="sm fw-bold" for="nisn">NISN</label><input class="fi mt-2" id="nisn" name="nisn" inputmode="numeric" placeholder="Contoh: 0051234567"><div class="xs m mt-2">Siswa masuk hanya dengan NISN, tanpa password.</div></div>
  <div id="f2" class="cl d-none"><div><label class="sm fw-bold" for="em">Email</label><input class="fi mt-2" id="em" type="email" name="email" placeholder="nama@sekolah.sch.id"></div><div><label class="sm fw-bold" for="pw">Password</label><input class="fi mt-2" id="pw" type="password" name="password"></div></div>
  <button class="bt" id="lb">Masuk ${ic('arrow', 16)}</button><p class="xs m">Akun dibuat oleh petugas sarpras sekolah. Hubungi petugas jika Anda belum terdaftar.</p></form></div></div>`;
  document.querySelectorAll('[data-m]').forEach(b => b.onclick = () => { mode = b.dataset.m;
    document.querySelectorAll('[data-m]').forEach(x => x.classList.toggle('on', x === b));
    $('#f1').classList.toggle('d-none', mode !== 'siswa'); $('#f2').classList.toggle('d-none', mode === 'siswa'); });
  $('#lf').onsubmit = wrap(async e => { e.preventDefault(); const f = Object.fromEntries(new FormData(e.target));
    const body = mode === 'siswa' ? {nisn: f.nisn?.trim()} : {email: f.email, password: f.password};
    if (!Object.values(body).every(Boolean)) return toast('Lengkapi data login terlebih dahulu.', 'error');
    $('#lb').disabled = true;
    try { const d = await api('/api/login', {method: 'POST', body});
      S.token = d.token || d.access_token || d.data?.token || d.data?.access_token; localStorage.setItem('token', S.token);
      const me = d.user || d.data?.user || await api('/api/me'); S.user = me.data || me; localStorage.setItem('user', JSON.stringify(S.user));
      location.hash = '#/dashboard'; route();
    } finally { $('#lb') && ($('#lb').disabled = false); } });
}
const logout = wrap(async () => { try { await api('/api/logout', {method: 'POST'}); } catch {} clearSession(true); });

/* ===== Halaman ===== */
async function dashboardPage() {
  const role = S.user.role, admin = role === 'admin', tek = role === 'teknisi';
  layout('Dashboard', today(), loading);
  const [rs, dash, ns] = await Promise.all([api(admin ? '/api/admin/reports' : '/api/reports'),
    admin ? api('/api/admin/dashboard').catch(() => ({})) : {}, api('/api/notifications').catch(() => [])]);
  const rep = list(rs), c = dash.data || dash, nl = list(ns);
  S.unread = nl.filter(n => !n.read_at).length;
  const cnt = s => c[s] ?? c.by_status?.[s] ?? rep.filter(r => r.status === s).length;
  const cur = rep.find(r => r.status === 'diproses') || rep[0];
  const head = admin ? `${cnt('pending')} laporan menunggu penugasan teknisi.` : tek ? `${cnt('diproses')} tugas sedang dikerjakan.`
    : cnt('diproses') ? `${cnt('diproses')} laporan Anda sedang diproses.` : 'Belum ada laporan yang diproses.';
  const btn = isStaff() ? `<a class="bt w" href="#/reports">${ic('arrow', 16)}Lihat laporan</a>` : `<a class="bt w" href="#/create">${ic('plus', 16)}Buat laporan baru</a>`;
  const hero = `<div class="dk s6 r2"><i class="o1"></i><i class="o2"></i><div><div style="opacity:.8;font-size:14px">Halo, ${esc(nm(S.user).split(' ')[0])}</div>
    <h2 style="font-size:32px;font-weight:800;letter-spacing:-.02em;line-height:1.15;margin:8px 0 20px;max-width:380px">${head}</h2>${btn}</div>
    ${cur ? `<a class="gl" href="#/report/${cur.id}"><div class="rowf"><div class="sp"><div class="xs" style="opacity:.8">Terakhir diperbarui · #${cur.id}</div><b>${esc(cur.lokasi)}</b></div><span class="bg ${cur.status}" style="color:var(--n);background:#fff">${ST[cur.status] || ''}</span></div>${tl(stepOf(cur.status), 'w')}</a>` : '<div class="gl xs">Belum ada laporan.</div>'}</div>`;
  const pend = rep.filter(r => r.status === 'pending');
  const kat = Object.keys(KAT).map(k => [KAT[k], rep.filter(r => r.kategori === k).length]), mx = Math.max(1, ...kat.map(x => x[1]));
  const left = admin ? card('Perlu ditangani', 'Semua', '#/reports', (pend.length ? pend : rep).slice(0, 4).map(r => rw(r, 'a')).join('') || empty('Belum ada laporan.'), 's7')
    : card(tek ? 'Tugas terbaru' : 'Laporan terbaru', 'Lihat semua', '#/reports', rep.slice(0, 4).map(r => rw(r, 'n')).join('') || empty('Belum ada laporan.'), 's8');
  const right = admin ? card('Laporan per kategori', '', '', kat.map(([k, n]) => `<div style="margin-top:14px"><div class="rowf sm"><b class="sp">${k}</b><span class="m">${n}</span></div><div class="bar"><i style="width:${n / mx * 100}%"></i></div></div>`).join(''), 's5')
    : card('Notifikasi', 'Semua', '#/notifications', nl.slice(0, 3).map(nrow).join('') || empty('Tidak ada notifikasi.'), 's4');
  $('#view').innerHTML = `<div class="bento">${hero}${stat('Menunggu', cnt('pending'), admin ? 'Belum ditugaskan' : 'Belum ditangani', 'w', 'clock')}${stat('Diproses', cnt('diproses'), 'Sedang diperbaiki', 's', 'wrench')}${stat('Selesai', cnt('selesai'), 'Perbaikan tuntas', 'd', 'check')}${stat('Ditolak', cnt('ditolak'), 'Tidak dilanjutkan', 'w', 'x')}${left}${right}</div>`;
  bindNotif();
}

async function reportsPage() {
  const admin = S.user.role === 'admin', tek = S.user.role === 'teknisi';
  layout(admin ? 'Semua laporan' : tek ? 'Tugas saya' : 'Riwayat pengaduan', admin ? 'Kelola dan tugaskan laporan masuk' : tek ? 'Laporan yang ditugaskan kepada Anda' : 'Semua laporan yang pernah Anda kirim', loading,
    S.user.role === 'siswa' ? `<a class="bt" href="#/create">${ic('plus', 16)}Buat laporan</a>` : '');
  const all = list(await api(admin ? '/api/admin/reports' : '/api/reports'));
  const F = {status: '', kategori: '', urgensi: '', q: ''};
  $('#view').innerHTML = '<div class="cl" style="gap:16px"><div id="fl"></div><div class="cd" id="ls"></div></div>';
  const sel = (k, o, l) => `<select class="fi" style="width:auto" data-k="${k}"><option value="">${l}</option>${Object.entries(o).map(([v, t]) => `<option value="${v}" ${F[k] === v ? 'selected' : ''}>${t}</option>`).join('')}</select>`;
  $('#fl').innerHTML = admin ? `<div class="rowf" style="flex-wrap:wrap"><input class="fi sp" style="min-width:220px" data-k="q" placeholder="Cari lokasi atau deskripsi"> ${sel('status', ST, 'Semua status')}${sel('kategori', KAT, 'Semua kategori')}${sel('urgensi', URG, 'Semua urgensi')}</div>` : '';
  const draw = () => {
    const q = F.q.toLowerCase(), rows = all.filter(r => ['status', 'kategori', 'urgensi'].every(k => !F[k] || r[k] === F[k]) && (!q || (r.lokasi + ' ' + r.deskripsi).toLowerCase().includes(q)));
    if (!admin) $('#fl').innerHTML = `<div class="rowf" style="flex-wrap:wrap">${['', ...Object.keys(ST)].map(s => `<span class="ch ${F.status === s ? 'x' : ''}" data-s="${s}">${s ? ST[s] : 'Semua'}<em>${s ? all.filter(r => r.status === s).length : all.length}</em></span>`).join('')}</div>`;
    $('#ls').innerHTML = `<div class="sm m" style="margin-bottom:6px">Menampilkan ${rows.length} laporan</div>` + (rows.length ? rows.map(r => rw(r, admin ? 'a' : '')).join('') : empty('Tidak ada laporan yang cocok.'));
    document.querySelectorAll('[data-s]').forEach(s => s.onclick = () => { F.status = s.dataset.s; draw(); });
  };
  document.querySelectorAll('[data-k]').forEach(s => s[s.tagName === 'INPUT' ? 'oninput' : 'onchange'] = () => { F[s.dataset.k] = s.value; draw(); });
  draw();
}

function createPage() {
  S.files = [];
  const urgInfo = {rendah: 'Tidak mengganggu kegiatan', sedang: 'Mengganggu sebagian kegiatan', mendesak: 'Berbahaya atau menghentikan kegiatan'};
  layout('Buat laporan', 'Laporkan kerusakan fasilitas. Semua kolom bertanda * wajib diisi.', `<form id="cf" class="bento">
  <div class="cd s8 cl" style="gap:20px"><div><b class="sm">Kategori kerusakan *</b><div class="cg mt-2">${Object.entries(KAT).map(([v, t], i) => `<label><input type="radio" name="kategori" value="${v}" ${i ? '' : 'checked'}><span class="ck">${ic(KI[v], 22)}${t}</span></label>`).join('')}</div></div>
  <div><label class="sm fw-bold" for="lk">Lokasi *</label><input class="fi mt-2" id="lk" name="lokasi" placeholder="Contoh: Toilet putra, lantai 2 Blok B"></div>
  <div><label class="sm fw-bold" for="ds">Deskripsi kerusakan *</label><textarea class="fi mt-2" id="ds" name="deskripsi" rows="4" placeholder="Jelaskan kerusakan yang terjadi"></textarea></div>
  <div><b class="sm">Tingkat urgensi *</b><div class="ug mt-2">${Object.entries(URG).map(([v, t]) => `<label><input type="radio" name="urgensi" value="${v}" ${v === 'sedang' ? 'checked' : ''}><span class="uc">${ub(v)}<span class="xs m">${urgInfo[v]}</span></span></label>`).join('')}</div></div>
  <div><div class="rowf"><b class="sm sp">Foto kerusakan</b><span class="xs m" id="fc">0 dari 2 foto</span></div><div class="rowf mt-2" id="prev" style="align-items:flex-start;flex-wrap:wrap"></div><input type="file" id="fi" accept="image/*" hidden></div>
  <div class="rowf" style="justify-content:flex-end;border-top:1px solid #eef1f6;padding-top:18px"><a class="bt o" href="#/reports">Batal</a><button class="bt" id="sb">Kirim laporan ${ic('send', 16)}</button></div></div>
  <div class="cl s4" style="gap:16px"><div class="dk" style="min-height:230px"><i class="o1"></i><i class="o2"></i><div class="xs" style="opacity:.8">Ringkasan laporan</div>
  <div class="gl cl sm" style="gap:10px"><div class="rowf"><span class="sp" style="opacity:.8">Kategori</span><b id="sk"></b></div><div class="rowf"><span class="sp" style="opacity:.8">Lokasi</span><b id="sl" style="text-align:right"></b></div><div class="rowf"><span class="sp" style="opacity:.8">Urgensi</span><b id="su"></b></div><div class="rowf"><span class="sp" style="opacity:.8">Foto</span><b id="sf"></b></div></div>
  <div class="sm">Status awal laporan: <b>Menunggu</b></div></div>
  <div class="cd cl"><h3 class="ttl">Setelah laporan dikirim</h3>${['Petugas sarpras meninjau laporan Anda.', 'Teknisi ditugaskan dan status berubah menjadi Diproses.', 'Pantau progres dan kirim pesan lewat halaman detail laporan.'].map((t, i) => `<div class="rowf" style="align-items:flex-start"><div class="av" style="width:28px;height:28px;font-size:12px;background:var(--n);color:#fff">${i + 1}</div><span class="sm">${t}</span></div>`).join('')}</div></div></form>`);
  const f = $('#cf'), sync = () => { const d = new FormData(f);
    $('#sk').textContent = KAT[d.get('kategori')]; $('#sl').textContent = d.get('lokasi') || '-'; $('#su').textContent = URG[d.get('urgensi')]; $('#sf').textContent = S.files.length ? S.files.length + ' terlampir' : 'Tidak ada'; };
  const prev = () => { $('#fc').textContent = `${S.files.length} dari 2 foto`;
    $('#prev').innerHTML = S.files.map((x, i) => `<div><img class="ph" alt="" src="${URL.createObjectURL(x)}"><div class="xs m mt-1">${esc(x.name.slice(0, 14))} · <a href="#" data-r="${i}"><u>Hapus</u></a></div></div>`).join('') + (S.files.length < 2 ? `<button type="button" class="dz" id="addf">${ic('plus', 20)}Tambah foto</button>` : '');
    document.querySelectorAll('[data-r]').forEach(a => a.onclick = e => { e.preventDefault(); S.files.splice(a.dataset.r, 1); prev(); });
    $('#addf') && ($('#addf').onclick = () => $('#fi').click()); sync(); };
  $('#fi').onchange = e => { const x = e.target.files[0]; e.target.value = ''; if (!x) return;
    if (x.size > 2 * 1024 * 1024) return toast('Ukuran foto maksimal 2 MB.', 'error'); S.files.push(x); prev(); };
  f.oninput = sync; f.onchange = sync; prev();
  f.onsubmit = wrap(async e => { e.preventDefault(); const fd = new FormData(f);
    if (!fd.get('lokasi').trim() || !fd.get('deskripsi').trim()) return toast('Lokasi dan deskripsi wajib diisi.', 'error');
    S.files.forEach(x => fd.append(FILE_FIELD, x)); $('#sb').disabled = true;
    try { const d = await api('/api/reports', {method: 'POST', form: fd}); toast('Laporan berhasil dikirim.'); const id = (d.data || d).id; location.hash = id ? '#/report/' + id : '#/reports'; }
    finally { $('#sb') && ($('#sb').disabled = false); } });
}

async function detailPage(id) {
  layout('Laporan #' + id, 'Detail dan tracking', loading, `<a class="bt o" href="#/reports">Kembali</a>`);
  const d = await api('/api/reports/' + id), r = d.data || d, role = S.user.role, admin = role === 'admin';
  const cm = list(await api(`/api/reports/${id}/comments`).catch(() => []));
  const ph = (r.attachments || []).map(a => `<a href="${img(a.path)}" target="_blank" rel="noopener"><img class="ph" alt="Foto kerusakan" src="${img(a.path)}"></a>`).join('');
  const k = stepOf(r.status);
  const panel = (t, inner) => `<div class="cd cl"><h3 class="ttl">${t}</h3>${inner}</div>`;
  const stp = panel('Perbarui status', `<form id="sf" class="cl"><select class="fi" name="status">${Object.entries(ST).map(([v, t]) => `<option value="${v}" ${r.status === v ? 'selected' : ''}>${t}</option>`).join('')}</select><textarea class="fi" name="catatan" rows="2" placeholder="Catatan perbaikan"></textarea><button class="bt">Simpan status ${ic('check', 16)}</button></form>`);
  const asg = panel('Tugaskan teknisi', `<form id="af" class="cl"><input class="fi" name="assigned_to" type="number" min="1" placeholder="ID teknisi" value="${esc(r.assigned_to || '')}"><button class="bt">Tugaskan ${ic('wrench', 16)}</button></form>`);
  const hs = panel('Hasil perbaikan', `<form id="rf" class="cl"><input class="fi" type="file" name="${FILE_FIELD}" accept="image/*" multiple><textarea class="fi" name="catatan" rows="2" placeholder="Catatan hasil perbaikan"></textarea><button class="bt">Unggah hasil ${ic('send', 16)}</button></form>`);
  $('#view').innerHTML = `<div class="bento">
  <div class="cd s8"><div class="rowf" style="align-items:flex-start"><div class="ct">${ic(KI[r.kategori] || 'toilet', 20)}</div><div class="sp"><div class="cap">${KAT[r.kategori] || ''} · #${r.id}</div><h3 style="font-size:22px;font-weight:800;letter-spacing:-.01em">${esc(r.lokasi)}</h3></div>${bg(r.status)}</div>
  <p style="margin:14px 0 16px;line-height:1.6">${esc(r.deskripsi)}</p>${ph ? `<div class="rowf" style="flex-wrap:wrap">${ph}</div>` : ''}
  <div class="dv" style="margin:18px 0 10px"></div>${r.status === 'ditolak' ? '<div class="sm m">Laporan ini ditolak dan tidak dilanjutkan.</div>' : tl(k)}</div>
  <div class="cd s4 cl"><h3 class="ttl">Informasi</h3>${[['Pelapor', nm(r.user)], ['Tanggal', fdate(r.created_at)], ['Urgensi', URG[r.urgensi] || '-'], ['Teknisi', r.assigned_to ? '#' + r.assigned_to : 'Belum ditugaskan']].map(([a, b]) => `<div class="rowf"><span class="sm m sp">${a}</span><b class="sm">${esc(b)}</b></div>`).join('')}</div>
  <div class="cd s8"><div class="cth"><h3>Percakapan</h3></div><div id="cl">${cm.length ? cm.map(c => `<div class="cm"><div class="av">${esc(ini(nm(c.user)))}</div><div class="sp"><b class="sm">${esc(nm(c.user))}</b> <span class="xs m">${fdate(c.created_at)}</span><div class="sm" style="margin-top:2px">${esc(c.pesan)}</div></div></div>`).join('') : empty('Belum ada pesan.')}</div>
  <form id="cmf" class="rowf" style="margin-top:8px"><input class="fi sp" name="pesan" placeholder="Tulis pesan..."><button class="bt">Kirim ${ic('send', 16)}</button></form></div>
  <div class="cl s4" style="gap:16px">${admin ? asg + stp + hs : role === 'teknisi' ? stp : ''}</div></div>`;
  const on = (sel, fn) => $(sel) && ($(sel).onsubmit = wrap(async e => { e.preventDefault(); await fn(e.target); detailPage(id); }));
  on('#cmf', f => { if (!f.pesan.value.trim()) throw new Error('Pesan tidak boleh kosong.'); return api(`/api/reports/${id}/comments`, {method: 'POST', body: {pesan: f.pesan.value}}); });
  on('#af', async f => { if (!f.assigned_to.value) throw new Error('Isi ID teknisi.'); await api(`/api/admin/reports/${id}/assign`, {method: 'POST', body: {assigned_to: +f.assigned_to.value}}); toast('Teknisi ditugaskan.'); });
  on('#sf', async f => { await api(`/api/admin/reports/${id}/status`, {method: 'PATCH', body: {status: f.status.value, catatan: f.catatan.value}}); toast('Status diperbarui.'); });
  on('#rf', async f => { const fd = new FormData(f); if (fd.getAll(FILE_FIELD).every(x => !x.size)) throw new Error('Pilih foto hasil perbaikan.');
    await api(`/api/admin/reports/${id}/resolution`, {method: 'POST', form: fd}); toast('Hasil perbaikan diunggah.'); });
}

async function notificationsPage() {
  layout('Notifikasi', 'Pembaruan laporan Anda', loading);
  const ns = list(await api('/api/notifications')), un = ns.filter(n => !n.read_at);
  S.unread = un.length;
  layout('Notifikasi', un.length ? `${un.length} notifikasi belum dibaca` : 'Semua sudah dibaca', '', un.length ? `<button class="bt o" id="ra">${ic('check', 16)}Tandai semua dibaca</button>` : '');
  $('#view').innerHTML = `<div class="bento"><div class="cd s8">${ns.length ? ns.map(nrow).join('') : empty('Tidak ada notifikasi.')}</div>
  <div class="dk s4" style="min-height:200px"><i class="o1"></i><i class="o2"></i><div class="xs" style="opacity:.8">Belum dibaca</div><div style="font-size:56px;font-weight:800;line-height:1">${un.length}</div><div class="gl sm">Klik notifikasi untuk membuka laporan terkait.</div></div></div>`;
  bindNotif();
  $('#ra') && ($('#ra').onclick = wrap(async () => { await Promise.all(un.map(n => api(`/api/notifications/${n.id}/read`, {method: 'PATCH'}))); toast('Semua notifikasi ditandai dibaca.'); notificationsPage(); }));
}
function profilePage() {
  const u = S.user;
  layout('Profil', 'Informasi akun Anda', `<div class="bento"><div class="dk s5" style="min-height:240px"><i class="o1"></i><i class="o2"></i><div class="av" style="width:64px;height:64px;font-size:20px">${esc(ini(nm(u)))}</div><div><h3 style="font-size:24px;font-weight:800">${esc(nm(u))}</h3><div style="opacity:.8">${esc(ROLE[u.role] || u.role)}</div></div></div>
  <div class="cd s7 cl"><div><div class="cap">${u.nisn ? 'NISN' : 'Email'}</div><b>${esc(u.nisn || u.email || '-')}</b></div><div class="dv"></div><div><div class="cap">Peran</div><b>${esc(ROLE[u.role] || u.role)}</b></div><div><button class="bt" onclick="logout()">Keluar ${ic('out', 16)}</button></div></div></div>`);
}

/* ===== Router & proteksi halaman ===== */
const ROLE_ONLY = {create: ['siswa', 'guru']};
const route = wrap(async () => {
  const [, page = 'dashboard', arg] = location.hash.split('/');
  if (!S.token || !S.user) return page === 'login' ? loginPage() : (location.hash = '#/login');
  if (page === 'login') return (location.hash = '#/dashboard');
  if (ROLE_ONLY[page] && !ROLE_ONLY[page].includes(S.user.role)) { location.hash = '#/dashboard'; return toast('Halaman tidak tersedia untuk peran Anda.', 'error'); }
  api('/api/notifications').then(n => { S.unread = list(n).filter(x => !x.read_at).length; }).catch(() => {});
  await ({dashboard: dashboardPage, reports: reportsPage, create: createPage, notifications: notificationsPage, profile: profilePage,
    report: () => detailPage(arg)}[page] || dashboardPage)();
});
window.addEventListener('hashchange', route); route();
