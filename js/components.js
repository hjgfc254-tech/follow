// ============================================
// js/components.js
// SchoolHub Pro - Shared Components
// منصة مدارس الجيل الجديد الخاصة
// ============================================

import { auth } from './firebase.js';
import { getDocument } from './firestore.js';
import { logout, getCurrentUser, getUserProfile } from './auth.js';
import { isSuperAdmin, isAdmin, isTeacher, isStudent } from './permissions.js';
import { escapeHtml, showToast, createElement } from './utils.js';

// ============ Sidebar Component ============

/**
 * إنشاء Sidebar حسب دور المستخدم
 * @param {Object} profile - بيانات المستخدم
 * @param {string} currentPage - الصفحة الحالية
 * @returns {string} HTML الـ Sidebar
 */
async function renderSidebar(profile, currentPage = '') {
    if (!profile) return '';
    
    const role = profile.role;
    let menuItems = [];
    
    switch (role) {
        case 'super_admin':
        case 'admin':
            menuItems = getAdminMenuItems();
            break;
        case 'teacher':
            menuItems = await getTeacherMenuItems(profile);
            break;
        case 'student':
            menuItems = await getStudentMenuItems(profile);
            break;
        default:
            menuItems = [];
    }
    
    const sidebarHtml = `
        <div class="sidebar-header">
            <div class="sidebar-logo">🏫</div>
            <div>
                <h3 class="sidebar-title">SchoolHub Pro</h3>
                <p class="sidebar-subtitle">منصة مدارس الجيل الجديد</p>
            </div>
        </div>
        <nav class="sidebar-nav">
            <div class="sidebar-section">القائمة الرئيسية</div>
            ${menuItems.map(item => `
                <a href="${item.href}" class="sidebar-link ${currentPage === item.page ? 'active' : ''}">
                    <span class="sidebar-link-icon">${item.icon}</span>
                    <span class="sidebar-link-text">${item.text}</span>
                </a>
            `).join('')}
        </nav>
        <div class="sidebar-footer">
            <a href="#" class="sidebar-link" id="logoutBtn">
                <span class="sidebar-link-icon">🚪</span>
                <span class="sidebar-link-text">تسجيل الخروج</span>
            </a>
        </div>
    `;
    
    // إضافة sidebar للصفحة
    const sidebarContainer = document.getElementById('sidebarContainer');
    if (sidebarContainer) {
        sidebarContainer.innerHTML = sidebarHtml;
        
        // إضافة مستمع حدث لتسجيل الخروج
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                await handleLogout();
            });
        }
    }
    
    return sidebarHtml;
}

/**
 * الحصول على قائمة الـ Admin
 * @returns {Array} عناصر القائمة
 */
function getAdminMenuItems() {
    return [
        { href: 'dashboard.html', page: 'dashboard', icon: '📊', text: 'الرئيسية' },
        { href: 'students.html', page: 'students', icon: '👨‍🎓', text: 'الطلاب' },
        { href: 'teachers.html', page: 'teachers', icon: '👨‍🏫', text: 'المدرسون' },
        { href: 'stages.html', page: 'stages', icon: '📚', text: 'المراحل' },
        { href: 'classes.html', page: 'classes', icon: '🏫', text: 'الفصول' },
        { href: 'subjects.html', page: 'subjects', icon: '📖', text: 'المواد' },
        { href: 'attendance.html', page: 'attendance', icon: '✓', text: 'الحضور' },
        { href: 'expenses.html', page: 'expenses', icon: '💰', text: 'المصروفات' },
        { href: 'announcements.html', page: 'announcements', icon: '📢', text: 'الإعلانات' },
        { href: 'messages.html', page: 'messages', icon: '✉️', text: 'الرسائل' },
        { href: 'events.html', page: 'events', icon: '📅', text: 'الأحداث' },
        { href: 'schedules.html', page: 'schedules', icon: '🕐', text: 'الجداول' },
        { href: 'settings.html', page: 'settings', icon: '⚙️', text: 'الإعدادات' },
        { href: 'logs.html', page: 'logs', icon: '📋', text: 'السجلات' }
    ];
}

/**
 * الحصول على قائمة الـ Teacher
 * @param {Object} profile - بيانات المستخدم
 * @returns {Array} عناصر القائمة
 */
async function getTeacherMenuItems(profile) {
    return [
        { href: 'dashboard.html', page: 'dashboard', icon: '📊', text: 'الرئيسية' },
        { href: 'students.html', page: 'students', icon: '👨‍🎓', text: 'الطلاب' },
        { href: 'attendance.html', page: 'attendance', icon: '✓', text: 'الحضور' },
        { href: 'schedule.html', page: 'schedule', icon: '🕐', text: 'الجدول' },
        { href: 'announcements.html', page: 'announcements', icon: '📢', text: 'الإعلانات' },
        { href: 'messages.html', page: 'messages', icon: '✉️', text: 'الرسائل' },
        { href: 'profile.html', page: 'profile', icon: '👤', text: 'الملف الشخصي' }
    ];
}

/**
 * الحصول على قائمة الـ Student
 * @param {Object} profile - بيانات المستخدم
 * @returns {Array} عناصر القائمة
 */
async function getStudentMenuItems(profile) {
    return [
        { href: 'dashboard.html', page: 'dashboard', icon: '📊', text: 'الرئيسية' },
        { href: 'profile.html', page: 'profile', icon: '👤', text: 'ملفي' },
        { href: 'attendance.html', page: 'attendance', icon: '✓', text: 'الحضور' },
        { href: 'expenses.html', page: 'expenses', icon: '💰', text: 'المصروفات' },
        { href: 'schedule.html', page: 'schedule', icon: '🕐', text: 'الجدول' },
        { href: 'announcements.html', page: 'announcements', icon: '📢', text: 'الإعلانات' },
        { href: 'messages.html', page: 'messages', icon: '✉️', text: 'الرسائل' },
        { href: 'events.html', page: 'events', icon: '📅', text: 'الأحداث' }
    ];
}

// ============ Header Component ============

/**
 * إنشاء Header
 * @param {Object} profile - بيانات المستخدم
 * @param {string} pageTitle - عنوان الصفحة
 * @returns {string} HTML الـ Header
 */
function renderHeader(profile, pageTitle = '') {
    if (!profile) return '';
    
    const roleName = getRoleName(profile.role);
    const userInitial = profile.name ? profile.name.charAt(0) : '؟';
    
    const headerHtml = `
        <div class="header-left">
            <button class="header-toggle" id="sidebarToggle">☰</button>
            <div class="header-search">
                <input type="text" placeholder="بحث..." id="headerSearch">
                <span class="header-search-icon">🔍</span>
            </div>
        </div>
        <div class="header-right">
            <div class="header-user">
                <div class="header-avatar">${escapeHtml(userInitial)}</div>
                <div class="header-user-info">
                    <span class="header-user-name">${escapeHtml(profile.name || '')}</span>
                    <span class="header-user-role">${escapeHtml(roleName)}</span>
                </div>
            </div>
        </div>
    `;
    
    const headerContainer = document.getElementById('headerContainer');
    if (headerContainer) {
        headerContainer.innerHTML = headerHtml;
        
        // إضافة مستمع حدث لزر القائمة
        const sidebarToggle = document.getElementById('sidebarToggle');
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', toggleSidebar);
        }
        
        // إضافة مستمع حدث للبحث
        const headerSearch = document.getElementById('headerSearch');
        if (headerSearch) {
            headerSearch.addEventListener('input', handleSearch);
        }
    }
    
    return headerHtml;
}

/**
 * الحصول على اسم الدور بالعربية
 * @param {string} role - الدور
 * @returns {string} اسم الدور
 */
function getRoleName(role) {
    const roleNames = {
        'super_admin': 'مدير النظام',
        'admin': 'مشرف',
        'teacher': 'مدرس',
        'student': 'طالب'
    };
    return roleNames[role] || role;
}

// ============ Sidebar Toggle ============

/**
 * تبديل Sidebar (فتح/إغلاق)
 */
function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    
    if (sidebar) {
        sidebar.classList.toggle('open');
    }
    
    if (overlay) {
        overlay.classList.toggle('active');
    }
}

// ============ Search Handler ============

/**
 * معالجة البحث في الـ Header
 * @param {Event} event - حدث الإدخال
 */
function handleSearch(event) {
    const searchTerm = event.target.value.trim();
    
    // يمكن تخصيص هذا حسب الصفحة
    // سيتم تنفيذه في كل صفحة حسب احتياجها
    if (typeof window.handleGlobalSearch === 'function') {
        window.handleGlobalSearch(searchTerm);
    }
}

// ============ Logout Handler ============

/**
 * معالجة تسجيل الخروج
 */
async function handleLogout() {
    try {
        await logout();
        showToast('تم تسجيل الخروج بنجاح', 'success');
    } catch (error) {
        showToast(error.message || 'حدث خطأ أثناء تسجيل الخروج', 'error');
    }
}

// ============ Page Layout Component ============

/**
 * إنشاء الهيكل الأساسي للصفحة
 * @param {Object} profile - بيانات المستخدم
 * @param {string} pageTitle - عنوان الصفحة
 * @param {string} pageSubtitle - وصف الصفحة
 * @param {string} currentPage - الصفحة الحالية
 * @param {string} breadcrumb - مسار التنقل
 * @returns {string} HTML الهيكل
 */
async function renderPageLayout(profile, pageTitle, pageSubtitle = '', currentPage = '', breadcrumb = '') {
    const sidebar = await renderSidebar(profile, currentPage);
    const header = renderHeader(profile, pageTitle);
    
    const layoutHtml = `
        <div class="sidebar-overlay" id="sidebarOverlay"></div>
        <aside class="sidebar" id="sidebarContainer">
            ${sidebar}
        </aside>
        <div class="main-content">
            <header class="header" id="headerContainer">
                ${header}
            </header>
            <main class="main-content-inner">
                ${breadcrumb ? `
                    <div class="breadcrumb">
                        <a href="dashboard.html">الرئيسية</a>
                        <span class="breadcrumb-separator">/</span>
                        <span class="breadcrumb-current">${escapeHtml(breadcrumb)}</span>
                    </div>
                ` : ''}
                <div class="page-header">
                    <div>
                        <h1 class="page-title">${escapeHtml(pageTitle)}</h1>
                        ${pageSubtitle ? `<p class="page-subtitle">${escapeHtml(pageSubtitle)}</p>` : ''}
                    </div>
                    <div class="page-actions" id="pageActions"></div>
                </div>
                <div id="pageContent"></div>
            </main>
        </div>
    `;
    
    return layoutHtml;
}

/**
 * تهيئة الصفحة مع الهيكل الأساسي
 * @param {Object} profile - بيانات المستخدم
 * @param {Object} options - خيارات الصفحة
 */
async function initPage(profile, options = {}) {
    const {
        pageTitle = '',
        pageSubtitle = '',
        currentPage = '',
        breadcrumb = '',
        content = ''
    } = options;
    
    const appContainer = document.getElementById('app');
    if (!appContainer) return;
    
    // إنشاء الهيكل الأساسي
    const layoutHtml = await renderPageLayout(profile, pageTitle, pageSubtitle, currentPage, breadcrumb);
    
    // استبدال محتوى الصفحة
    appContainer.innerHTML = layoutHtml;
    
    // إضافة المحتوى
    const pageContent = document.getElementById('pageContent');
    if (pageContent && content) {
        pageContent.innerHTML = content;
    }
    
    // إضافة مستمع حدث للـ overlay
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', toggleSidebar);
    }
    
    // إضافة أزرار الإغلاق للمودالات
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', function() {
            const modal = this.closest('.modal-overlay');
            if (modal) {
                modal.style.display = 'none';
                document.body.style.overflow = '';
            }
        });
    });
}

// ============ Table Component ============

/**
 * إنشاء جدول
 * @param {Array} columns - أعمدة الجدول
 * @param {Array} data - البيانات
 * @param {Object} options - خيارات
 * @returns {string} HTML الجدول
 */
function renderTable(columns, data, options = {}) {
    if (!data || data.length === 0) {
        return `
            <div class="empty-state">
                <div class="empty-state-icon">📋</div>
                <div class="empty-state-title">لا توجد بيانات</div>
                <div class="empty-state-text">لم يتم العثور على أي سجلات</div>
            </div>
        `;
    }
    
    const tableHtml = `
        <div class="table-container">
            <table class="table">
                <thead>
                    <tr>
                        ${columns.map(col => `<th>${escapeHtml(col.label)}</th>`).join('')}
                        ${options.showActions ? '<th>إجراءات</th>' : ''}
                    </tr>
                </thead>
                <tbody>
                    ${data.map((item, index) => `
                        <tr>
                            ${columns.map(col => `
                                <td data-label="${escapeHtml(col.label)}">
                                    ${col.render ? col.render(item, index) : escapeHtml(item[col.field] || '—')}
                                </td>
                            `).join('')}
                            ${options.showActions ? `
                                <td class="actions-cell">
                                    ${options.actions ? options.actions(item, index) : ''}
                                </td>
                            ` : ''}
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
    
    return tableHtml;
}

// ============ Badge Component ============

/**
 * إنشاء Badge
 * @param {string} text - النص
 * @param {string} type - النوع
 * @returns {string} HTML الـ Badge
 */
function renderBadge(text, type = 'info') {
    const badgeTypes = {
        success: 'badge-success',
        warning: 'badge-warning',
        error: 'badge-error',
        info: 'badge-info',
        muted: 'badge-muted',
        royal: 'badge-royal'
    };
    
    const badgeClass = badgeTypes[type] || badgeTypes.info;
    return `<span class="badge ${badgeClass}">${escapeHtml(text)}</span>`;
}

// ============ Status Badge ============

/**
 * إنشاء Badge للحالة
 * @param {string} status - الحالة
 * @returns {string} HTML الـ Badge
 */
function renderStatusBadge(status) {
    const statusMap = {
        'active': { text: 'نشط', type: 'success' },
        'inactive': { text: 'غير نشط', type: 'muted' },
        'suspended': { text: 'موقوف', type: 'error' },
        'present': { text: 'حاضر', type: 'success' },
        'absent': { text: 'غائب', type: 'error' },
        'late': { text: 'متأخر', type: 'warning' },
        'excused': { text: 'معذور', type: 'info' },
        'paid': { text: 'مدفوع', type: 'success' },
        'partial': { text: 'جزئي', type: 'warning' },
        'unpaid': { text: 'غير مدفوع', type: 'error' },
        'cancelled': { text: 'ملغي', type: 'muted' },
        'published': { text: 'منشور', type: 'success' },
        'draft': { text: 'مسودة', type: 'muted' },
        'read': { text: 'مقروء', type: 'muted' },
        'unread': { text: 'غير مقروء', type: 'royal' }
    };
    
    const statusInfo = statusMap[status] || { text: status, type: 'info' };
    return renderBadge(statusInfo.text, statusInfo.type);
}

// ============ Attendance Status Component ============

/**
 * إنشاء أزرار الحضور
 * @param {string} studentId - معرف الطالب
 * @param {string} currentStatus - الحالة الحالية
 * @returns {string} HTML أزرار الحضور
 */
function renderAttendanceStatus(studentId, currentStatus = '') {
    const statuses = [
        { value: 'present', label: 'حاضر', class: 'present' },
        { value: 'absent', label: 'غائب', class: 'absent' },
        { value: 'late', label: 'متأخر', class: 'late' },
        { value: 'excused', label: 'معذور', class: 'excused' }
    ];
    
    return `
        <div class="attendance-buttons" data-student-id="${studentId}">
            ${statuses.map(status => `
                <button 
                    type="button" 
                    class="attendance-status ${status.class} ${currentStatus === status.value ? 'active' : ''}"
                    data-status="${status.value}"
                    onclick="window.selectAttendance('${studentId}', '${status.value}')"
                >
                    ${status.label}
                </button>
            `).join('')}
        </div>
    `;
}

// ============ Modal Form Component ============

/**
 * فتح Modal مع نموذج
 * @param {string} title - العنوان
 * @param {string} formContent - محتوى النموذج
 * @param {Function} onSave - دالة الحفظ
 * @returns {HTMLElement} عنصر الـ Modal
 */
function openFormModal(title, formContent, onSave) {
    const modal = createElement('div', {
        class: 'modal-overlay',
        style: 'display: flex;'
    });
    
    modal.innerHTML = `
        <div class="modal">
            <div class="modal-header">
                <h3 class="modal-title">${escapeHtml(title)}</h3>
                <button class="modal-close">×</button>
            </div>
            <div class="modal-body">
                ${formContent}
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" id="modalCancel">إلغاء</button>
                <button class="btn btn-primary" id="modalSave">حفظ</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
    
    const closeModal = () => {
        modal.remove();
        document.body.style.overflow = '';
    };
    
    modal.querySelector('.modal-close').addEventListener('click', closeModal);
    modal.querySelector('#modalCancel').addEventListener('click', closeModal);
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    modal.querySelector('#modalSave').addEventListener('click', async () => {
        try {
            await onSave(modal);
            closeModal();
        } catch (error) {
            showToast(error.message || 'حدث خطأ أثناء الحفظ', 'error');
        }
    });
    
    return modal;
}

// ============ Loading Component ============

/**
 * عرض مؤشر تحميل في عنصر
 * @param {HTMLElement} element - العنصر
 * @param {string} message - الرسالة
 */
function showComponentLoading(element, message = 'جاري التحميل...') {
    if (!element) return;
    
    element.innerHTML = `
        <div class="loading-container">
            <div>
                <div class="loading-spinner"></div>
                <div class="loading-text">${escapeHtml(message)}</div>
            </div>
        </div>
    `;
}

// ============ Empty State Component ============

/**
 * عرض حالة فارغة
 * @param {HTMLElement} element - العنصر
 * @param {string} message - الرسالة
 * @param {string} icon - الأيقونة
 * @param {string} actionText - نص الزر
 * @param {Function} onAction - دالة الزر
 */
function showComponentEmptyState(element, message = 'لا توجد بيانات', icon = '📋', actionText = '', onAction = null) {
    if (!element) return;
    
    element.innerHTML = `
        <div class="empty-state">
            <div class="empty-state-icon">${icon}</div>
            <div class="empty-state-title">${escapeHtml(message)}</div>
            <div class="empty-state-text">لم يتم العثور على أي بيانات حاليًا</div>
            ${actionText ? `
                <button class="btn btn-primary" id="emptyStateAction">${escapeHtml(actionText)}</button>
            ` : ''}
        </div>
    `;
    
    if (actionText && onAction) {
        const actionBtn = element.querySelector('#emptyStateAction');
        if (actionBtn) {
            actionBtn.addEventListener('click', onAction);
        }
    }
}

// ============ Error State Component ============

/**
 * عرض حالة خطأ
 * @param {HTMLElement} element - العنصر
 * @param {string} message - رسالة الخطأ
 */
function showComponentErrorState(element, message = 'حدث خطأ أثناء التحميل') {
    if (!element) return;
    
    element.innerHTML = `
        <div class="error-state">
            <div class="error-state-icon">⚠️</div>
            <div class="empty-state-title">${escapeHtml(message)}</div>
            <button class="btn btn-primary mt-2" onclick="location.reload()">
                إعادة المحاولة
            </button>
        </div>
    `;
}

// ============ Stats Card Component ============

/**
 * إنشاء بطاقة إحصائية
 * @param {Object} stat - بيانات الإحصائية
 * @returns {string} HTML البطاقة
 */
function renderStatCard(stat) {
    const { label, value, icon, color = 'blue', change = null } = stat;
    
    return `
        <div class="stat-card">
            <div class="stat-icon ${color}">${icon}</div>
            <div class="stat-label">${escapeHtml(label)}</div>
            <div class="stat-value">${escapeHtml(String(value))}</div>
            ${change ? `
                <div class="stat-change ${change.type === 'up' ? 'text-success' : change.type === 'down' ? 'text-error' : ''}">
                    ${change.icon || ''} ${escapeHtml(change.text || '')}
                </div>
            ` : ''}
        </div>
    `;
}

// ============ Export ============
export {
    // Sidebar
    renderSidebar,
    getAdminMenuItems,
    getTeacherMenuItems,
    getStudentMenuItems,
    
    // Header
    renderHeader,
    getRoleName,
    
    // Layout
    renderPageLayout,
    initPage,
    
    // Toggle
    toggleSidebar,
    
    // Logout
    handleLogout,
    
    // Table
    renderTable,
    
    // Badges
    renderBadge,
    renderStatusBadge,
    
    // Attendance
    renderAttendanceStatus,
    
    // Modal
    openFormModal,
    
    // States
    showComponentLoading,
    showComponentEmptyState,
    showComponentErrorState,
    
    // Stats
    renderStatCard
};