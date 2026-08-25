// ============================================
// js/components.js
// SchoolHub Pro - Shared Components
// منصة مدارس الجيل الجديد
// ============================================

import { logout } from './auth.js';
import { escapeHtml, showToast } from './utils.js';

// ============ Sidebar Component ============

/**
 * إنشاء Sidebar حسب دور المستخدم
 * @param {Object} user - بيانات المستخدم
 * @param {string} currentPage - الصفحة الحالية
 * @returns {string} HTML الـ Sidebar
 */
function renderSidebar(user, currentPage = '') {
    if (!user) return '';
    
    const role = user.role;
    let menuItems = [];
    
    switch (role) {
        case 'super_admin':
        case 'admin':
            menuItems = getAdminMenuItems();
            break;
        case 'teacher':
            menuItems = getTeacherMenuItems();
            break;
        case 'student':
            menuItems = getStudentMenuItems();
            break;
        default:
            menuItems = [];
    }
    
    return `
        <div class="sidebar-header">
            <div class="sidebar-logo">🏫</div>
            <div>
                <h3 class="sidebar-title">الجيل الجديد</h3>
                <p class="sidebar-subtitle">نظام المتابعة</p>
            </div>
        </div>
        <nav class="sidebar-nav">
            <div class="sidebar-section">القائمة الرئيسية</div>
            ${menuItems.map(item => `
                <a href="${item.href}" class="sidebar-link ${currentPage === item.page ? 'active' : ''}">
                    <i class="fas ${item.icon}"></i>
                    <span class="sidebar-link-text">${item.text}</span>
                </a>
            `).join('')}
        </nav>
        <div class="sidebar-footer">
            <a href="#" class="sidebar-link" id="logoutBtn">
                <i class="fas fa-sign-out-alt"></i>
                <span class="sidebar-link-text">تسجيل الخروج</span>
            </a>
        </div>
    `;
}

/**
 * قائمة Admin
 */
function getAdminMenuItems() {
    return [
        { href: 'dashboard.html', page: 'dashboard', icon: 'fa-home', text: 'الرئيسية' },
        { href: 'students.html', page: 'students', icon: 'fa-user-graduate', text: 'الطلاب' },
        { href: 'teachers.html', page: 'teachers', icon: 'fa-chalkboard-teacher', text: 'المعلمون' },
        { href: 'stages.html', page: 'stages', icon: 'fa-layer-group', text: 'المراحل' },
        { href: 'classes.html', page: 'classes', icon: 'fa-book-open', text: 'الفصول' },
        { href: 'announcements.html', page: 'announcements', icon: 'fa-bell', text: 'الإعلانات' },
        { href: 'messages.html', page: 'messages', icon: 'fa-envelope', text: 'الرسائل' },
        { href: 'events.html', page: 'events', icon: 'fa-calendar-alt', text: 'الأحداث' },
        { href: 'settings.html', page: 'settings', icon: 'fa-cog', text: 'الإعدادات' },
        { href: 'logs.html', page: 'logs', icon: 'fa-list', text: 'السجلات' }
    ];
}

/**
 * قائمة Teacher
 */
function getTeacherMenuItems() {
    return [
        { href: 'dashboard.html', page: 'dashboard', icon: 'fa-home', text: 'الرئيسية' },
        { href: 'students.html', page: 'students', icon: 'fa-user-graduate', text: 'طلابي' },
        { href: 'announcements.html', page: 'announcements', icon: 'fa-bell', text: 'الإعلانات' },
        { href: 'messages.html', page: 'messages', icon: 'fa-envelope', text: 'الرسائل' },
        { href: 'profile.html', page: 'profile', icon: 'fa-user', text: 'ملفي' }
    ];
}

/**
 * قائمة Student
 */
function getStudentMenuItems() {
    return [
        { href: 'dashboard.html', page: 'dashboard', icon: 'fa-home', text: 'الرئيسية' },
        { href: 'profile.html', page: 'profile', icon: 'fa-user', text: 'ملفي' },
        { href: 'announcements.html', page: 'announcements', icon: 'fa-bell', text: 'الإعلانات' },
        { href: 'messages.html', page: 'messages', icon: 'fa-envelope', text: 'الرسائل' },
        { href: 'events.html', page: 'events', icon: 'fa-calendar-alt', text: 'الأحداث' }
    ];
}

// ============ Header Component ============

/**
 * إنشاء Header
 * @param {Object} user - بيانات المستخدم
 * @returns {string} HTML الـ Header
 */
function renderHeader(user) {
    if (!user) return '';
    
    const roleName = getRoleName(user.role);
    const userInitial = user.name ? user.name.charAt(0) : '؟';
    
    return `
        <button class="header-toggle" id="sidebarToggle">
            <i class="fas fa-bars"></i>
        </button>
        <div class="header-user">
            <div class="header-avatar">${escapeHtml(userInitial)}</div>
            <div class="header-user-info">
                <span class="header-user-name">${escapeHtml(user.name || '')}</span>
                <span class="header-user-role">${escapeHtml(roleName)}</span>
            </div>
        </div>
    `;
}

/**
 * الحصول على اسم الدور بالعربية
 */
function getRoleName(role) {
    const roleNames = {
        'super_admin': 'مدير النظام',
        'admin': 'مشرف',
        'teacher': 'معلم',
        'student': 'طالب'
    };
    return roleNames[role] || role;
}

// ============ Sidebar Toggle ============

/**
 * تبديل Sidebar
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

// ============ Logout Handler ============

/**
 * معالجة تسجيل الخروج
 */
async function handleLogout() {
    try {
        await logout();
    } catch (error) {
        showToast(error.message || 'حدث خطأ أثناء تسجيل الخروج', 'error');
    }
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
        info: 'badge-royal',
        muted: 'badge-muted',
        premium: 'badge-premium'
    };
    
    const badgeClass = badgeTypes[type] || badgeTypes.info;
    return `<span class="badge ${badgeClass}">${escapeHtml(text)}</span>`;
}

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
        'published': { text: 'منشور', type: 'success' },
        'draft': { text: 'مسودة', type: 'muted' },
        'archived': { text: 'مؤرشف', type: 'muted' },
        'read': { text: 'مقروء', type: 'muted' },
        'unread': { text: 'غير مقروء', type: 'premium' }
    };
    
    const statusInfo = statusMap[status] || { text: status, type: 'info' };
    return renderBadge(statusInfo.text, statusInfo.type);
}

// ============ Stat Card Component ============

/**
 * إنشاء بطاقة إحصائية
 * @param {Object} stat - بيانات الإحصائية
 * @returns {string} HTML البطاقة
 */
function renderStatCard(stat) {
    const { label, value, icon, color = 'royal' } = stat;
    
    return `
        <div class="stat-card">
            <i class="fas ${icon}" style="color: var(--${color}); font-size: 24px; margin-bottom: 8px;"></i>
            <div class="stat-number">${escapeHtml(String(value))}</div>
            <div class="stat-label">${escapeHtml(label)}</div>
        </div>
    `;
}

// ============ Loading ============

/**
 * عرض مؤشر تحميل
 * @param {string} message - الرسالة
 * @returns {string} HTML التحميل
 */
function renderLoading(message = 'جاري التحميل...') {
    return `
        <div class="loading-container">
            <div>
                <div class="loading-spinner"></div>
                <div class="loading-text">${escapeHtml(message)}</div>
            </div>
        </div>
    `;
}

/**
 * عرض حالة فارغة
 * @param {string} message - الرسالة
 * @param {string} icon - الأيقونة
 * @returns {string} HTML الحالة الفارغة
 */
function renderEmptyState(message = 'لا توجد بيانات', icon = 'fa-inbox') {
    return `
        <div class="empty-state">
            <div class="empty-state-icon">
                <i class="fas ${icon}" style="font-size: 48px; color: var(--mute);"></i>
            </div>
            <div class="empty-state-title">${escapeHtml(message)}</div>
            <div class="empty-state-text">لم يتم العثور على أي بيانات حاليًا</div>
        </div>
    `;
}

/**
 * عرض حالة خطأ
 * @param {string} message - رسالة الخطأ
 * @returns {string} HTML الخطأ
 */
function renderErrorState(message = 'حدث خطأ أثناء التحميل') {
    return `
        <div class="error-state">
            <div class="error-state-icon">
                <i class="fas fa-exclamation-triangle" style="font-size: 48px; color: var(--red);"></i>
            </div>
            <div class="empty-state-title">${escapeHtml(message)}</div>
            <button class="btn btn-primary mt-2" onclick="location.reload()">
                إعادة المحاولة
            </button>
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
    
    // Toggle
    toggleSidebar,
    
    // Logout
    handleLogout,
    
    // Badges
    renderBadge,
    renderStatusBadge,
    
    // Stats
    renderStatCard,
    
    // States
    renderLoading,
    renderEmptyState,
    renderErrorState
};