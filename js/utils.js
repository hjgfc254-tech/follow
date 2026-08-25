// ============================================
// js/utils.js
// SchoolHub Pro - Utility Functions
// منصة مدارس الجيل الجديد
// ============================================

// ============ Session Management ============

/**
 * حفظ جلسة المستخدم الحالي
 * @param {Object} user - بيانات المستخدم
 */
function saveSession(user) {
    localStorage.setItem('schoolhub_session', JSON.stringify({
        code: user.code,
        name: user.name,
        role: user.role,
        linkedId: user.linkedId,
        phone: user.phone || '',
        classId: user.classId || '',
        stageId: user.stageId || '',
        loginTime: Date.now()
    }));
}

/**
 * الحصول على جلسة المستخدم الحالي
 * @returns {Object|null} بيانات المستخدم
 */
function getSession() {
    const session = localStorage.getItem('schoolhub_session');
    if (!session) return null;
    
    try {
        return JSON.parse(session);
    } catch (error) {
        return null;
    }
}

/**
 * حذف جلسة المستخدم
 */
function clearSession() {
    localStorage.removeItem('schoolhub_session');
}

/**
 * التحقق من وجود جلسة نشطة
 * @returns {boolean} هل يوجد جلسة
 */
function hasSession() {
    return getSession() !== null;
}

// ============ Password Encoding ============

/**
 * تشفير كلمة المرور (Base64 بسيط)
 * @param {string} password - كلمة المرور
 * @returns {string} كلمة المرور المشفرة
 */
function encodePassword(password) {
    try {
        return btoa(password);
    } catch (error) {
        return password;
    }
}

/**
 * فك تشفير كلمة المرور
 * @param {string} encoded - كلمة المرور المشفرة
 * @returns {string} كلمة المرور الأصلية
 */
function decodePassword(encoded) {
    try {
        return atob(encoded);
    } catch (error) {
        return encoded;
    }
}

// ============ Date Formatting ============

/**
 * تنسيق التاريخ إلى صيغة عربية
 * @param {Date|string|Timestamp} date - التاريخ
 * @returns {string} التاريخ المنسق
 */
function formatDate(date) {
    if (!date) return '—';
    
    let dateObj;
    
    if (date && typeof date.toDate === 'function') {
        dateObj = date.toDate();
    } else if (date instanceof Date) {
        dateObj = date;
    } else if (typeof date === 'string') {
        dateObj = new Date(date);
    } else {
        return '—';
    }
    
    return new Intl.DateTimeFormat('ar-EG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(dateObj);
}

/**
 * الحصول على التاريخ الحالي بصيغة YYYY-MM-DD
 * @returns {string} التاريخ الحالي
 */
function getTodayDate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// ============ Currency Formatting ============

/**
 * تنسيق المبلغ كعملة مصرية
 * @param {number} amount - المبلغ
 * @returns {string} المبلغ المنسق
 */
function formatCurrency(amount) {
    if (amount === null || amount === undefined || isNaN(amount)) return '—';
    
    return new Intl.NumberFormat('ar-EG', {
        style: 'currency',
        currency: 'EGP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

// ============ Validation ============

/**
 * التحقق من كود المستخدم (4 أرقام)
 * @param {string|number} code - الكود
 * @returns {boolean} هل الكود صحيح
 */
function validateCode(code) {
    const codeStr = String(code);
    return /^\d{4}$/.test(codeStr);
}

/**
 * التحقق من كلمة المرور (6 أرقام)
 * @param {string} password - كلمة المرور
 * @returns {boolean} هل كلمة المرور صحيحة
 */
function validatePassword(password) {
    return /^\d{6}$/.test(password);
}

/**
 * التحقق من رقم الهاتف المصري
 * @param {string} phone - رقم الهاتف
 * @returns {boolean} هل الرقم صحيح
 */
function validatePhone(phone) {
    if (!phone) return true; // اختياري
    return /^01[0-9]{9}$/.test(phone);
}

/**
 * التحقق من أن القيمة غير فارغة
 * @param {string} value - القيمة
 * @returns {boolean} هل القيمة غير فارغة
 */
function validateRequired(value) {
    return value !== null && value !== undefined && String(value).trim() !== '';
}

// ============ HTML Escaping ============

/**
 * تحويل النص إلى HTML آمن
 * @param {string} text - النص
 * @returns {string} النص الآمن
 */
function escapeHtml(text) {
    if (!text) return '';
    
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ============ Toast Notifications ============

/**
 * عرض إشعار Toast
 * @param {string} message - الرسالة
 * @param {string} type - النوع (success, error, warning, info)
 * @param {number} duration - مدة العرض
 */
function showToast(message, type = 'info', duration = 3000) {
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container';
        document.body.appendChild(toastContainer);
    }
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };
    
    toast.innerHTML = `
        <span>${icons[type] || icons.info}</span>
        <span>${escapeHtml(message)}</span>
        <button class="toast-close" style="background:none;border:none;cursor:pointer;font-size:18px;color:var(--mute);">×</button>
    `;
    
    toastContainer.appendChild(toast);
    
    const closeToast = () => {
        toast.style.animation = 'fadeIn 0.3s reverse';
        setTimeout(() => {
            toast.remove();
            if (toastContainer.children.length === 0) {
                toastContainer.remove();
            }
        }, 300);
    };
    
    toast.querySelector('.toast-close').addEventListener('click', closeToast);
    setTimeout(closeToast, duration);
}

// ============ Loading ============

/**
 * إظهار مؤشر تحميل
 * @param {string} message - رسالة التحميل
 * @returns {HTMLElement} عنصر التحميل
 */
function showLoading(message = 'جاري التحميل...') {
    const loadingOverlay = document.createElement('div');
    loadingOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(255, 255, 255, 0.8);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        z-index: 9999;
    `;
    
    loadingOverlay.innerHTML = `
        <div class="loading-spinner"></div>
        <div class="loading-text">${escapeHtml(message)}</div>
    `;
    
    document.body.appendChild(loadingOverlay);
    return loadingOverlay;
}

/**
 * إخفاء مؤشر التحميل
 * @param {HTMLElement} loadingElement - عنصر التحميل
 */
function hideLoading(loadingElement) {
    if (loadingElement) {
        loadingElement.remove();
    }
}

// ============ Confirmation ============

/**
 * عرض رسالة تأكيد
 * @param {string} message - رسالة التأكيد
 * @param {string} title - العنوان
 * @returns {Promise<boolean>} هل تم التأكيد
 */
async function confirmAction(message = 'هل أنت متأكد؟', title = 'تأكيد') {
    return new Promise((resolve) => {
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.style.display = 'flex';
        
        overlay.innerHTML = `
            <div class="modal" style="max-width: 400px;">
                <div class="modal-header">
                    <h3 class="modal-title">${escapeHtml(title)}</h3>
                    <button class="modal-close">×</button>
                </div>
                <div class="modal-body">
                    <p style="text-align: center; font-size: 16px;">${escapeHtml(message)}</p>
                </div>
                <div class="modal-footer" style="justify-content: center;">
                    <button class="btn btn-primary confirm-yes">تأكيد</button>
                    <button class="btn btn-outline confirm-no">إلغاء</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(overlay);
        
        const closeModal = (result) => {
            overlay.remove();
            resolve(result);
        };
        
        overlay.querySelector('.modal-close').addEventListener('click', () => closeModal(false));
        overlay.querySelector('.confirm-no').addEventListener('click', () => closeModal(false));
        overlay.querySelector('.confirm-yes').addEventListener('click', () => closeModal(true));
        
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeModal(false);
        });
    });
}

// ============ URL Helpers ============

/**
 * الحصول على Query Parameter من URL
 * @param {string} param - اسم المعامل
 * @returns {string|null} قيمة المعامل
 */
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

// ============ Export ============
export {
    // Session
    saveSession,
    getSession,
    clearSession,
    hasSession,
    
    // Password
    encodePassword,
    decodePassword,
    
    // Date
    formatDate,
    getTodayDate,
    
    // Currency
    formatCurrency,
    
    // Validation
    validateCode,
    validatePassword,
    validatePhone,
    validateRequired,
    
    // HTML
    escapeHtml,
    
    // Toast
    showToast,
    
    // Loading
    showLoading,
    hideLoading,
    
    // Confirmation
    confirmAction,
    
    // URL
    getQueryParam
};