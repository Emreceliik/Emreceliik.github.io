let currentUser = null;
let currentUserProfile = null;
let currentSection = 'dashboard';
let calendarDate = new Date();
let allUsers = [];
let activeListeners = [];
let currentChatUser = null;
let currentTaskFilter = 'all';

const pageTitles = {
    dashboard: 'Ana Sayfa',
    calendar: 'Takvim',
    tasks: 'Görevler',
    messages: 'Mesajlar',
    users: 'Kullanıcılar',
    approvals: 'Onaylar'
};

// =================== AUTH ===================

auth.onAuthStateChanged(async (user) => {
    if (!user) {
        window.location.href = 'login.html';
        return;
    }
    currentUser = user;
    try {
        await loadUserProfile();
        if (currentUserProfile) {
            initApp();
        } else {
            auth.signOut();
        }
    } catch (e) {
        console.error('Init error:', e);
        auth.signOut();
    }
});

async function loadUserProfile() {
    const doc = await db.collection('users').doc(currentUser.uid).get();
    if (doc.exists) {
        currentUserProfile = { uid: currentUser.uid, ...doc.data() };
    }
}

function logout() {
    activeListeners.forEach(fn => fn());
    activeListeners = [];
    if (window._chatListener) { window._chatListener(); window._chatListener = null; }
    auth.signOut();
}

// =================== INIT ===================

async function initApp() {
    const name = currentUserProfile.displayName || currentUserProfile.username;
    document.getElementById('user-display-name').textContent = name;
    document.getElementById('user-role').textContent =
        currentUserProfile.role === 'admin' ? 'Yönetici' : 'Kullanıcı';
    document.getElementById('user-avatar').textContent = name.charAt(0).toUpperCase();
    document.getElementById('current-date').textContent =
        new Date().toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    if (currentUserProfile.role === 'admin') {
        document.querySelectorAll('.admin-only').forEach(el => {
            el.style.display = el.classList.contains('nav-label') ? 'block' : 'flex';
        });
    }

    await loadAllUsers();
    setupRealtimeListeners();
    navigateTo('dashboard');
}

// =================== NAVIGATION ===================

function navigateTo(section) {
    currentSection = section;

    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    const nav = document.querySelector(`[data-section="${section}"]`);
    if (nav) nav.classList.add('active');

    document.querySelectorAll('.content-section').forEach(s => s.style.display = 'none');
    const el = document.getElementById(`section-${section}`);
    if (el) el.style.display = 'block';

    document.getElementById('page-title').textContent = pageTitles[section] || '';

    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('sidebar-overlay').classList.remove('show');

    switch (section) {
        case 'dashboard': loadDashboard(); break;
        case 'calendar': renderCalendar(); break;
        case 'tasks': loadTasks(); break;
        case 'messages': loadConversations(); break;
        case 'users': loadUsers(); break;
        case 'approvals': loadApprovals(); break;
    }
}

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('open');
    document.getElementById('sidebar-overlay').classList.toggle('show');
}

// =================== ALL USERS ===================

async function loadAllUsers() {
    const snap = await db.collection('users').get();
    allUsers = [];
    snap.forEach(doc => allUsers.push({ uid: doc.id, ...doc.data() }));
}

function getUserName(uid) {
    const u = allUsers.find(x => x.uid === uid);
    return u ? (u.displayName || u.username) : 'Bilinmeyen';
}

// =================== REAL-TIME LISTENERS ===================

function setupRealtimeListeners() {
    const unsubMsg = db.collection('messages')
        .where('to', '==', currentUser.uid)
        .onSnapshot(snap => {
            let count = 0;
            snap.forEach(doc => { if (!doc.data().read) count++; });
            const badge = document.getElementById('unread-badge');
            badge.style.display = count > 0 ? 'block' : 'none';
            badge.textContent = count;
        }, err => console.error('Message listener error:', err));
    activeListeners.push(unsubMsg);

    if (currentUserProfile.role === 'admin') {
        const unsubApproval = db.collection('calendarEvents')
            .where('status', '==', 'pending')
            .onSnapshot(snap => {
                const badge = document.getElementById('approval-badge');
                badge.style.display = snap.size > 0 ? 'block' : 'none';
                badge.textContent = snap.size;
            }, err => console.error('Approval listener error:', err));
        activeListeners.push(unsubApproval);
    }
}

// =================== DASHBOARD ===================

async function loadDashboard() {
    const grid = document.getElementById('stats-grid');
    let total = 0, pending = 0, progress = 0, done = 0;

    try {
        const snap = await db.collection('tasks').where('assignedTo', '==', currentUser.uid).get();
        total = snap.size;
        snap.forEach(doc => {
            const s = doc.data().status;
            if (s === 'pending') pending++;
            else if (s === 'in_progress') progress++;
            else if (s === 'completed') done++;
        });
    } catch (e) { console.error(e); }

    let pendingApprovals = 0;
    if (currentUserProfile.role === 'admin') {
        try {
            const snap = await db.collection('calendarEvents').where('status', '==', 'pending').get();
            pendingApprovals = snap.size;
        } catch (e) {}
    }

    grid.innerHTML = `
        <div class="stat-card">
            <div class="stat-icon blue"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg></div>
            <span class="stat-label">Toplam Görev</span>
            <span class="stat-number">${total}</span>
        </div>
        <div class="stat-card">
            <div class="stat-icon orange"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg></div>
            <span class="stat-label">Bekleyen</span>
            <span class="stat-number">${pending}</span>
        </div>
        <div class="stat-card">
            <div class="stat-icon blue"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg></div>
            <span class="stat-label">Devam Eden</span>
            <span class="stat-number">${progress}</span>
        </div>
        <div class="stat-card">
            <div class="stat-icon green"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg></div>
            <span class="stat-label">Tamamlanan</span>
            <span class="stat-number">${done}</span>
        </div>
        ${currentUserProfile.role === 'admin' ? `
        <div class="stat-card">
            <div class="stat-icon purple"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg></div>
            <span class="stat-label">Onay Bekleyen</span>
            <span class="stat-number">${pendingApprovals}</span>
        </div>` : ''}`;

    const actDiv = document.getElementById('recent-activity');
    try {
        const snap = await db.collection('tasks').where('assignedTo', '==', currentUser.uid).get();
        const tasks = [];
        snap.forEach(doc => tasks.push(doc.data()));
        tasks.sort((a, b) => (b.createdAt?.toDate?.() || 0) - (a.createdAt?.toDate?.() || 0));
        const recent = tasks.slice(0, 5);

        if (recent.length === 0) {
            actDiv.innerHTML = '<div class="empty-state"><p>Henüz aktivite yok</p></div>';
            return;
        }

        actDiv.innerHTML = '';
        recent.forEach(task => {
            actDiv.innerHTML += `
                <div class="activity-item">
                    <div class="activity-dot ${task.status}"></div>
                    <div class="activity-content">
                        <strong>${esc(task.title)}</strong>
                        <span class="activity-date">${fmtDate(task.createdAt?.toDate?.())}</span>
                    </div>
                    <span class="badge badge-${task.status}">${statusText(task.status)}</span>
                </div>`;
        });
    } catch (e) {
        actDiv.innerHTML = '<div class="empty-state"><p>Yüklenemedi</p></div>';
    }
}

// =================== CALENDAR ===================

function renderCalendar() {
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();

    document.getElementById('calendar-month-year').textContent =
        new Date(year, month).toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const grid = document.getElementById('calendar-grid');
    grid.innerHTML = '';

    ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].forEach(d => {
        grid.innerHTML += `<div class="calendar-day-header">${d}</div>`;
    });

    const startDay = firstDay === 0 ? 6 : firstDay - 1;
    for (let i = 0; i < startDay; i++) grid.innerHTML += '<div class="calendar-day empty"></div>';

    const today = new Date();
    for (let d = 1; d <= daysInMonth; d++) {
        const ds = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const isToday = d === today.getDate() && month === today.getMonth() && year === today.getFullYear();
        grid.innerHTML += `
            <div class="calendar-day${isToday ? ' today' : ''}" onclick="openAddEventModal('${ds}')">
                <span class="day-number">${d}</span>
                <div class="day-events" id="events-${ds}"></div>
            </div>`;
    }

    loadCalendarEvents(year, month);
}

async function loadCalendarEvents(year, month) {
    const mm = String(month + 1).padStart(2, '0');
    const start = `${year}-${mm}-01`;
    const end = `${year}-${mm}-${new Date(year, month + 1, 0).getDate()}`;

    try {
        const snap = await db.collection('calendarEvents')
            .where('date', '>=', start)
            .where('date', '<=', end)
            .get();

        snap.forEach(doc => {
            const ev = doc.data();
            const el = document.getElementById(`events-${ev.date}`);
            if (!el) return;

            if (ev.status === 'rejected') return;
            if (ev.status === 'pending' && currentUserProfile.role !== 'admin' && ev.createdBy !== currentUser.uid) return;

            const div = document.createElement('div');
            div.className = `event-dot ${ev.status}`;
            div.textContent = ev.title;
            div.title = `${ev.title} — ${approvalText(ev.status)}`;
            if (currentUserProfile.role === 'admin') {
                div.style.cursor = 'pointer';
                div.onclick = (e) => { e.stopPropagation(); openEventDetailModal(doc.id, ev); };
            }
            el.appendChild(div);
        });
    } catch (e) { console.error(e); }
}

function changeMonth(delta) {
    calendarDate.setMonth(calendarDate.getMonth() + delta);
    renderCalendar();
}

function openAddEventModal(dateStr) {
    const def = dateStr || new Date().toISOString().split('T')[0];
    openModal('Yeni Etkinlik Ekle', `
        <form onsubmit="submitEvent(event)">
            <div class="form-group">
                <label>Başlık</label>
                <input type="text" id="ev-title" required placeholder="Etkinlik başlığı">
            </div>
            <div class="form-group">
                <label>Tarih</label>
                <input type="date" id="ev-date" value="${def}" required>
            </div>
            <div class="form-group">
                <label>Açıklama</label>
                <textarea id="ev-desc" placeholder="Açıklama (opsiyonel)"></textarea>
            </div>
            ${currentUserProfile.role !== 'admin' ? `
            <div style="background:#fef3c7;padding:10px 14px;border-radius:8px;margin-bottom:16px;font-size:13px;color:#92400e">
                Etkinlikler admin onayından sonra takvimde görünecektir.
            </div>` : ''}
            <button type="submit" class="btn-primary" style="width:100%">Kaydet</button>
        </form>
    `);
}

async function submitEvent(e) {
    e.preventDefault();
    const title = document.getElementById('ev-title').value.trim();
    const date = document.getElementById('ev-date').value;
    const desc = document.getElementById('ev-desc').value.trim();
    if (!title || !date) return;

    try {
        await db.collection('calendarEvents').add({
            title, date, description: desc,
            createdBy: currentUser.uid,
            createdByName: currentUserProfile.displayName || currentUserProfile.username,
            status: currentUserProfile.role === 'admin' ? 'approved' : 'pending',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        closeModal();
        renderCalendar();
    } catch (err) {
        console.error(err);
        alert('Etkinlik eklenemedi.');
    }
}

function openEventDetailModal(eventId, ev) {
    const isAdmin = currentUserProfile.role === 'admin';
    openModal('Etkinlik Detayı', `
        <form onsubmit="updateEvent(event, '${eventId}')">
            <div class="form-group">
                <label>Başlık</label>
                <input type="text" id="edit-ev-title" value="${esc(ev.title)}" required ${!isAdmin ? 'disabled' : ''}>
            </div>
            <div class="form-group">
                <label>Tarih</label>
                <input type="date" id="edit-ev-date" value="${ev.date}" required ${!isAdmin ? 'disabled' : ''}>
            </div>
            <div class="form-group">
                <label>Açıklama</label>
                <textarea id="edit-ev-desc" ${!isAdmin ? 'disabled' : ''}>${esc(ev.description || '')}</textarea>
            </div>
            <div class="form-group">
                <label>Durum</label>
                <select id="edit-ev-status" ${!isAdmin ? 'disabled' : ''}>
                    <option value="approved" ${ev.status === 'approved' ? 'selected' : ''}>Onaylandı</option>
                    <option value="pending" ${ev.status === 'pending' ? 'selected' : ''}>Onay Bekliyor</option>
                    <option value="rejected" ${ev.status === 'rejected' ? 'selected' : ''}>Reddedildi</option>
                </select>
            </div>
            <div style="font-size:12px;color:var(--text-muted);margin-bottom:16px">
                Ekleyen: ${esc(ev.createdByName || 'Bilinmeyen')}
            </div>
            ${isAdmin ? `
            <div style="display:flex;gap:10px">
                <button type="submit" class="btn-primary" style="flex:1">Güncelle</button>
                <button type="button" class="btn-danger" style="flex:0 0 auto" onclick="deleteEvent('${eventId}')">Sil</button>
            </div>` : ''}
        </form>
    `);
}

async function updateEvent(e, eventId) {
    e.preventDefault();
    const title = document.getElementById('edit-ev-title').value.trim();
    const date = document.getElementById('edit-ev-date').value;
    const desc = document.getElementById('edit-ev-desc').value.trim();
    const status = document.getElementById('edit-ev-status').value;
    if (!title || !date) return;

    try {
        await db.collection('calendarEvents').doc(eventId).update({
            title, date, description: desc, status
        });
        closeModal();
        renderCalendar();
    } catch (err) {
        console.error(err);
        alert('Etkinlik güncellenemedi.');
    }
}

async function deleteEvent(eventId) {
    if (!confirm('Bu etkinliği silmek istediğinize emin misiniz?')) return;
    try {
        await db.collection('calendarEvents').doc(eventId).delete();
        closeModal();
        renderCalendar();
    } catch (err) {
        console.error(err);
        alert('Etkinlik silinemedi.');
    }
}

// =================== TASKS ===================

async function loadTasks() {
    const el = document.getElementById('tasks-list');
    el.innerHTML = '<div class="empty-state"><p>Yükleniyor...</p></div>';

    try {
        let tasks = [];

        if (currentUserProfile.role === 'admin') {
            const snap = await db.collection('tasks').get();
            snap.forEach(doc => tasks.push({ id: doc.id, ...doc.data() }));
        } else {
            const s1 = await db.collection('tasks').where('assignedTo', '==', currentUser.uid).get();
            s1.forEach(doc => tasks.push({ id: doc.id, ...doc.data() }));
            const s2 = await db.collection('tasks').where('assignedBy', '==', currentUser.uid).get();
            s2.forEach(doc => { if (!tasks.find(t => t.id === doc.id)) tasks.push({ id: doc.id, ...doc.data() }); });
        }

        if (currentTaskFilter !== 'all') tasks = tasks.filter(t => t.status === currentTaskFilter);
        tasks.sort((a, b) => (b.createdAt?.toDate?.() || 0) - (a.createdAt?.toDate?.() || 0));

        if (!tasks.length) {
            el.innerHTML = '<div class="empty-state"><p>Görev bulunamadı</p></div>';
            return;
        }

        el.innerHTML = '';
        const isAdmin = currentUserProfile.role === 'admin';
        tasks.forEach(t => {
            el.innerHTML += `
                <div class="task-card">
                    <div class="task-info">
                        <div class="task-title">${esc(t.title)}</div>
                        <div class="task-meta">
                            <span>Atanan: ${esc(getUserName(t.assignedTo))}</span>
                            <span>Atayan: ${esc(getUserName(t.assignedBy))}</span>
                            ${t.dueDate ? `<span>Tarih: ${t.dueDate}</span>` : ''}
                        </div>
                        ${t.description ? `<div style="font-size:13px;color:var(--text-secondary);margin-top:6px">${esc(t.description)}</div>` : ''}
                    </div>
                    <div class="task-actions">
                        <span class="badge badge-${t.status}">${statusText(t.status)}</span>
                        ${isAdmin ? `
                        <select onchange="updateTaskStatus('${t.id}',this.value)">
                            <option value="pending" ${t.status === 'pending' ? 'selected' : ''}>Bekleyen</option>
                            <option value="in_progress" ${t.status === 'in_progress' ? 'selected' : ''}>Devam Eden</option>
                            <option value="completed" ${t.status === 'completed' ? 'selected' : ''}>Tamamlandı</option>
                        </select>
                        <button class="btn-danger btn-sm" onclick="deleteTask('${t.id}')">Sil</button>
                        ` : ''}
                    </div>
                </div>`;
        });
    } catch (e) {
        console.error(e);
        el.innerHTML = '<div class="empty-state"><p>Görevler yüklenemedi</p></div>';
    }
}

function filterTasks(filter, btn) {
    currentTaskFilter = filter;
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    loadTasks();
}

async function updateTaskStatus(id, status) {
    try {
        await db.collection('tasks').doc(id).update({ status });
        loadTasks();
    } catch (e) { alert('Güncelleme başarısız.'); }
}

async function deleteTask(id) {
    if (!confirm('Bu görevi silmek istediğinize emin misiniz?')) return;
    try {
        await db.collection('tasks').doc(id).delete();
        loadTasks();
    } catch (e) { alert('Görev silinemedi.'); }
}

function openTaskModal() {
    if (currentUserProfile.role !== 'admin') {
        alert('Sadece yöneticiler görev oluşturabilir.');
        return;
    }
    const opts = allUsers
        .map(u => `<option value="${u.uid}">${esc(u.displayName || u.username)}</option>`)
        .join('');

    openModal('Yeni Görev', `
        <form onsubmit="submitTask(event)">
            <div class="form-group">
                <label>Başlık</label>
                <input type="text" id="task-title" required placeholder="Görev başlığı">
            </div>
            <div class="form-group">
                <label>Açıklama</label>
                <textarea id="task-desc" placeholder="Açıklama"></textarea>
            </div>
            <div class="form-group">
                <label>Atanacak Kişi</label>
                <select id="task-assignee" required><option value="">Seçiniz</option>${opts}</select>
            </div>
            <div class="form-group">
                <label>Bitiş Tarihi</label>
                <input type="date" id="task-due">
            </div>
            <button type="submit" class="btn-primary" style="width:100%">Oluştur</button>
        </form>
    `);
}

async function submitTask(e) {
    e.preventDefault();
    if (currentUserProfile.role !== 'admin') return;
    const title = document.getElementById('task-title').value.trim();
    const desc = document.getElementById('task-desc').value.trim();
    const assignee = document.getElementById('task-assignee').value;
    const due = document.getElementById('task-due').value;
    if (!title || !assignee) return;

    try {
        await db.collection('tasks').add({
            title, description: desc,
            assignedTo: assignee,
            assignedBy: currentUser.uid,
            status: 'pending',
            dueDate: due || null,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        closeModal();
        loadTasks();
    } catch (err) { alert('Görev oluşturulamadı.'); }
}

// =================== MESSAGES ===================

async function loadConversations() {
    const el = document.getElementById('conversations-list');
    const others = allUsers.filter(u => u.uid !== currentUser.uid);

    if (!others.length) {
        el.innerHTML = '<div style="padding:20px;text-align:center;color:var(--text-muted);font-size:13px">Henüz başka kullanıcı yok</div>';
        return;
    }

    el.innerHTML = '';
    for (const u of others) {
        const name = u.displayName || u.username;
        let unread = 0;
        try {
            const snap = await db.collection('messages')
                .where('from', '==', u.uid)
                .where('to', '==', currentUser.uid)
                .get();
            snap.forEach(doc => { if (!doc.data().read) unread++; });
        } catch (e) {}

        const div = document.createElement('div');
        div.className = `conversation-item${currentChatUser === u.uid ? ' active' : ''}`;
        div.onclick = () => openChat(u.uid);
        div.innerHTML = `
            <div class="conv-avatar">${name.charAt(0).toUpperCase()}</div>
            <div class="conv-info">
                <div class="conv-name">${esc(name)}</div>
                <div class="conv-last-msg">${u.role === 'admin' ? 'Yönetici' : 'Kullanıcı'}</div>
            </div>
            ${unread > 0 ? '<div class="unread-dot"></div>' : ''}`;
        el.appendChild(div);
    }
}

async function openChat(uid) {
    currentChatUser = uid;
    const other = allUsers.find(u => u.uid === uid);
    const name = other ? (other.displayName || other.username) : '?';

    document.querySelectorAll('.conversation-item').forEach(i => i.classList.remove('active'));
    const items = document.querySelectorAll('.conversation-item');
    items.forEach(i => { if (i.querySelector('.conv-name')?.textContent === name) i.classList.add('active'); });

    document.getElementById('chat-area').innerHTML = `
        <div class="chat-header">
            <div class="conv-avatar" style="width:32px;height:32px;font-size:12px">${name.charAt(0).toUpperCase()}</div>
            <span>${esc(name)}</span>
        </div>
        <div class="chat-messages" id="chat-messages"></div>
        <div class="chat-input-area">
            <input type="text" id="chat-input" placeholder="Mesajınızı yazın..." onkeydown="if(event.key==='Enter')sendMessage()">
            <button onclick="sendMessage()">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
            </button>
        </div>`;

    // Mark as read
    try {
        const snap = await db.collection('messages')
            .where('from', '==', uid)
            .where('to', '==', currentUser.uid)
            .get();
        const batch = db.batch();
        snap.forEach(doc => { if (!doc.data().read) batch.update(doc.ref, { read: true }); });
        await batch.commit();
    } catch (e) {}

    listenChat(uid);
}

function listenChat(uid) {
    if (window._chatListener) { window._chatListener(); window._chatListener = null; }

    const chatId = [currentUser.uid, uid].sort().join('_');
    const unsub = db.collection('messages')
        .where('chatId', '==', chatId)
        .onSnapshot(snap => {
            const msgs = [];
            snap.forEach(doc => msgs.push({ id: doc.id, ...doc.data() }));
            msgs.sort((a, b) => (a.timestamp?.toDate?.() || 0) - (b.timestamp?.toDate?.() || 0));

            const box = document.getElementById('chat-messages');
            if (!box) return;

            if (!msgs.length) {
                box.innerHTML = '<div class="chat-placeholder">Henüz mesaj yok</div>';
                return;
            }

            box.innerHTML = '';
            msgs.forEach(m => {
                const sent = m.from === currentUser.uid;
                const time = m.timestamp?.toDate?.()
                    ? m.timestamp.toDate().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
                    : '';
                box.innerHTML += `
                    <div class="message-bubble ${sent ? 'sent' : 'received'}">
                        ${esc(m.content)}
                        <span class="message-time">${time}</span>
                    </div>`;
            });
            box.scrollTop = box.scrollHeight;
        }, err => console.error('Chat listener error:', err));

    window._chatListener = unsub;
}

async function sendMessage() {
    if (!currentChatUser) return;
    const input = document.getElementById('chat-input');
    const text = input.value.trim();
    if (!text) return;
    input.value = '';

    try {
        await db.collection('messages').add({
            chatId: [currentUser.uid, currentChatUser].sort().join('_'),
            from: currentUser.uid,
            to: currentChatUser,
            content: text,
            read: false,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
    } catch (e) { alert('Mesaj gönderilemedi.'); }
}

// =================== USERS (Admin) ===================

async function loadUsers() {
    await loadAllUsers();
    const tbody = document.getElementById('users-table-body');
    tbody.innerHTML = '';

    allUsers.forEach(u => {
        const name = u.displayName || u.username;
        const date = u.createdAt?.toDate?.() ? u.createdAt.toDate().toLocaleDateString('tr-TR') : '-';
        const isSelf = u.uid === currentUser.uid;
        tbody.innerHTML += `
            <tr>
                <td><div class="user-row-info">
                    <div class="user-avatar" style="width:32px;height:32px;font-size:12px">${name.charAt(0).toUpperCase()}</div>
                    ${esc(name)}
                </div></td>
                <td>${esc(u.username)}</td>
                <td><span class="badge badge-${u.role}">${u.role === 'admin' ? 'Yönetici' : 'Kullanıcı'}</span></td>
                <td>${date}</td>
                <td>
                    <div style="display:flex;gap:6px">
                        <button class="btn-primary btn-sm" onclick="openEditUserModal('${u.uid}')">Düzenle</button>
                        ${!isSelf ? `<button class="btn-danger btn-sm" onclick="deleteUser('${u.uid}')">Sil</button>` : ''}
                    </div>
                </td>
            </tr>`;
    });
}

function openEditUserModal(uid) {
    const u = allUsers.find(x => x.uid === uid);
    if (!u) return;

    openModal('Kullanıcı Düzenle', `
        <form onsubmit="saveUserEdit(event, '${uid}')">
            <div class="form-group">
                <label>Ad Soyad</label>
                <input type="text" id="edit-u-name" value="${esc(u.displayName || '')}" required>
            </div>
            <div class="form-group">
                <label>Kullanıcı Adı</label>
                <input type="text" value="${esc(u.username)}" disabled style="opacity:0.6">
                <div style="font-size:11px;color:var(--text-muted);margin-top:4px">Kullanıcı adı değiştirilemez</div>
            </div>
            <div class="form-group">
                <label>Rol</label>
                <select id="edit-u-role">
                    <option value="user" ${u.role === 'user' ? 'selected' : ''}>Kullanıcı</option>
                    <option value="admin" ${u.role === 'admin' ? 'selected' : ''}>Yönetici</option>
                </select>
            </div>
            <div class="form-group">
                <label>Yeni Şifre (boş bırakırsanız değişmez)</label>
                <input type="password" id="edit-u-pass" placeholder="Yeni şifre (opsiyonel)" minlength="6">
            </div>
            <button type="submit" class="btn-primary" style="width:100%" id="edit-u-btn">Kaydet</button>
        </form>
    `);
}

async function saveUserEdit(e, uid) {
    e.preventDefault();
    const name = document.getElementById('edit-u-name').value.trim();
    const role = document.getElementById('edit-u-role').value;
    const newPass = document.getElementById('edit-u-pass').value;
    if (!name) return;

    const btn = document.getElementById('edit-u-btn');
    btn.disabled = true;
    btn.textContent = 'Kaydediliyor...';

    try {
        await db.collection('users').doc(uid).update({ displayName: name, role });

        if (newPass && newPass.length >= 6) {
            const u = allUsers.find(x => x.uid === uid);
            if (u) {
                let secondaryApp;
                try { secondaryApp = firebase.app('Secondary'); }
                catch (err) { secondaryApp = firebase.initializeApp(firebaseConfig, 'Secondary'); }
                const sAuth = secondaryApp.auth();
                await sAuth.signInWithEmailAndPassword(u.email, newPass).catch(async () => {
                    await sAuth.signInWithEmailAndPassword(u.email, ADMIN_PASSWORD).catch(() => {});
                });
                const sUser = sAuth.currentUser;
                if (sUser && sUser.uid === uid) {
                    await sUser.updatePassword(newPass);
                }
                await sAuth.signOut();
            }
        }

        closeModal();
        await loadAllUsers();
        loadUsers();

        if (uid === currentUser.uid) {
            document.getElementById('user-display-name').textContent = name;
            currentUserProfile.displayName = name;
            currentUserProfile.role = role;
        }
    } catch (err) {
        console.error(err);
        alert('Bilgiler güncellendi ancak şifre değiştirilememiş olabilir.\n' + err.message);
        closeModal();
        await loadAllUsers();
        loadUsers();
    } finally {
        btn.disabled = false;
        btn.textContent = 'Kaydet';
    }
}

async function deleteUser(uid) {
    const u = allUsers.find(x => x.uid === uid);
    const name = u ? (u.displayName || u.username) : 'Bilinmeyen';

    if (!confirm(`"${name}" kullanıcısını silmek istediğinize emin misiniz?\n\nBu işlem geri alınamaz.`)) return;

    try {
        await db.collection('users').doc(uid).delete();

        const taskSnap = await db.collection('tasks').where('assignedTo', '==', uid).get();
        const batch = db.batch();
        taskSnap.forEach(doc => batch.delete(doc.ref));
        await batch.commit();

        await loadAllUsers();
        loadUsers();
        alert(`"${name}" silindi.`);
    } catch (err) {
        console.error(err);
        alert('Kullanıcı silinemedi: ' + err.message);
    }
}

function openCreateUserModal() {
    openModal('Yeni Kullanıcı', `
        <form onsubmit="createUser(event)">
            <div class="form-group">
                <label>Ad Soyad</label>
                <input type="text" id="nu-name" required placeholder="Adı ve soyadı">
            </div>
            <div class="form-group">
                <label>Kullanıcı Adı</label>
                <input type="text" id="nu-username" required placeholder="Giriş için kullanılacak">
            </div>
            <div class="form-group">
                <label>Şifre</label>
                <input type="password" id="nu-pass" required placeholder="En az 6 karakter" minlength="6">
            </div>
            <div class="form-group">
                <label>Rol</label>
                <select id="nu-role">
                    <option value="user">Kullanıcı</option>
                    <option value="admin">Yönetici</option>
                </select>
            </div>
            <button type="submit" class="btn-primary" style="width:100%" id="nu-btn">Oluştur</button>
        </form>
    `);
}

async function createUser(e) {
    e.preventDefault();
    const name = document.getElementById('nu-name').value.trim();
    const username = document.getElementById('nu-username').value.trim();
    const pass = document.getElementById('nu-pass').value;
    const role = document.getElementById('nu-role').value;
    if (!name || !username || !pass) return;

    const btn = document.getElementById('nu-btn');
    btn.disabled = true;
    btn.textContent = 'Oluşturuluyor...';

    try {
        let secondaryApp;
        try { secondaryApp = firebase.app('Secondary'); }
        catch (e) { secondaryApp = firebase.initializeApp(firebaseConfig, 'Secondary'); }

        const sAuth = secondaryApp.auth();
        const email = usernameToEmail(username);
        const cred = await sAuth.createUserWithEmailAndPassword(email, pass);

        await db.collection('users').doc(cred.user.uid).set({
            username, displayName: name, role, email,
            createdBy: currentUser.uid,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        await sAuth.signOut();

        closeModal();
        await loadAllUsers();
        loadUsers();
        alert(`"${name}" başarıyla oluşturuldu!\nKullanıcı adı: ${username}`);
    } catch (err) {
        if (err.code === 'auth/email-already-in-use') alert('Bu kullanıcı adı zaten mevcut.');
        else if (err.code === 'auth/weak-password') alert('Şifre en az 6 karakter olmalı.');
        else alert('Hata: ' + err.message);
    } finally {
        btn.disabled = false;
        btn.textContent = 'Oluştur';
    }
}

// =================== APPROVALS (Admin) ===================

async function loadApprovals() {
    const el = document.getElementById('approvals-list');
    el.innerHTML = '<div class="empty-state"><p>Yükleniyor...</p></div>';

    try {
        const snap = await db.collection('calendarEvents').where('status', '==', 'pending').get();
        if (snap.empty) {
            el.innerHTML = '<div class="empty-state"><p>Onay bekleyen etkinlik yok</p></div>';
            return;
        }

        el.innerHTML = '';
        snap.forEach(doc => {
            const ev = doc.data();
            el.innerHTML += `
                <div class="approval-card">
                    <div class="approval-info">
                        <h4>${esc(ev.title)}</h4>
                        <p>Tarih: ${ev.date}</p>
                        <p>Ekleyen: ${esc(ev.createdByName || 'Bilinmeyen')}</p>
                        ${ev.description ? `<p>${esc(ev.description)}</p>` : ''}
                    </div>
                    <div class="approval-actions">
                        <button class="btn-success" onclick="approveEvent('${doc.id}')">Onayla</button>
                        <button class="btn-danger" onclick="rejectEvent('${doc.id}')">Reddet</button>
                    </div>
                </div>`;
        });
    } catch (e) {
        el.innerHTML = '<div class="empty-state"><p>Yüklenemedi</p></div>';
    }
}

async function approveEvent(id) {
    try {
        await db.collection('calendarEvents').doc(id).update({
            status: 'approved', approvedBy: currentUser.uid,
            approvedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        loadApprovals();
    } catch (e) { alert('İşlem başarısız.'); }
}

async function rejectEvent(id) {
    try {
        await db.collection('calendarEvents').doc(id).update({
            status: 'rejected', rejectedBy: currentUser.uid,
            rejectedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        loadApprovals();
    } catch (e) { alert('İşlem başarısız.'); }
}

// =================== MODAL ===================

function openModal(title, html) {
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-body').innerHTML = html;
    document.getElementById('modal-overlay').style.display = 'flex';
}

function closeModal() {
    document.getElementById('modal-overlay').style.display = 'none';
}

// =================== UTILITIES ===================

function esc(s) {
    if (!s) return '';
    const d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
}

function fmtDate(d) {
    if (!d) return '-';
    return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' });
}

function statusText(s) {
    return { pending: 'Bekleyen', in_progress: 'Devam Eden', completed: 'Tamamlandı' }[s] || s;
}

function approvalText(s) {
    return { pending: 'Onay Bekliyor', approved: 'Onaylandı', rejected: 'Reddedildi' }[s] || s;
}
