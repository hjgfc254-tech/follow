// ============================================
// js/utils.js
// SchoolHub Pro - Utility Functions
// منصة مدارس الجيل الجديد الخاصة
// ============================================

// ============ Date Formatting ============

/**
 * تنسيق التاريخ إلى صيغة عربية
 * @param {Date|string|Timestamp} date - التاريخ
 * @param {Object} options - خيارات التنسيق
 * @returns {string} التاريخ المنسق
 */
function formatDate(date, options = {}) {
    if (!date) return '—';
    
    let dateObj;
    
    // تحويل Timestamp من Firestore
    if (date && typeof date.toDate === 'function') {
        dateObj = date.toDate();
    } else if (date instanceof Date) {
        dateObj = date;
    } else if (typeof date === 'string') {
        dateObj = new Date(date);
    } else {
        return '—';
    }
    
    const defaultOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };
    
    const mergedOptions = { ...defaultOptions, ...options };
    
    try {
        return new Intl.DateTimeFormat('ar-EG', mergedOptions).format(dateObj);
    } catch (error) {
        return dateObj.toLocaleDateString('ar-EG');
    }
}

/**
 * تنسيق الوقت
 * @param {Date|string|Timestamp} time - الوقت
 * @returns {string} الوقت المنسق
 */
function formatTime(time) {
    if (!time) return '—';
    
    let timeObj;
    
    if (time && typeof time.toDate === 'function') {
        timeObj = time.toDate();
    } else if (time instanceof Date) {
        timeObj = time;
    } else if (typeof time === 'string') {
        timeObj = new Date(`2000-01-01T${time}`);
    } else {
        return '—';
    }
    
    return new Intl.DateTimeFormat('ar-EG', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
    }).format(timeObj);
}

/**
 * تنسيق التاريخ والوقت معًا
 * @param {Date|string|Timestamp} dateTime - التاريخ والوقت
 * @returns {string} التاريخ والوقت
 */
function formatDateTime(dateTime) {
    if (!dateTime) return '—';
    
    let dateObj;
    
    if (dateTime && typeof dateTime.toDate === 'function') {
        dateObj = dateTime.toDate();
    } else if (dateTime instanceof Date) {
        dateObj = dateTime;
    } else if (typeof dateTime === 'string') {
        dateObj = new Date(dateTime);
    } else {
        return '—';
    }
    
    return new Intl.DateTimeFormat('ar-EG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
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

/**
 * الحصول على اسم اليوم بالعربية
 * @param {string} dateString - التاريخ بصيغة YYYY-MM-DD
 * @returns {string} اسم اليوم
 */
function getDayName(dateString) {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    return days[date.getDay()];
}

/**
 * حساب العمر من تاريخ الميلاد
 * @param {string} birthDate - تاريخ الميلاد
 * @returns {number} العمر بالسنوات
 */
function calculateAge(birthDate) {
    if (!birthDate) return null;
    
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    
    return age;
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

/**
 * تنسيق رقم عادي
 * @param {number} number - الرقم
 * @returns {string} الرقم المنسق
 */
function formatNumber(number) {
    if (number === null || number === undefined || isNaN(number)) return '—';
    
    return new Intl.NumberFormat('ar-EG').format(number);
}

// ============ Validation Functions ============

/**
 * التحقق من صحة البريد الإلكتروني
 * @param {string} email - البريد الإلكتروني
 * @returns {boolean} هل البريد صحيح
 */
function validateEmail(email) {
    if (!email) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * التحقق من صحة رقم الهاتف المصري
 * @param {string} phone - رقم الهاتف
 * @returns {boolean} هل الرقم صحيح
 */
function validatePhone(phone) {
    if (!phone) return false;
    const phoneRegex = /^01[0-9]{9}$/;
    return phoneRegex.test(phone);
}

/**
 * التحقق من كود الطالب/المدرس (4 أرقام)
 * @param {string|number} code - الكود
 * @returns {boolean} هل الكود صحيح
 */
function validateCode(code) {
    const codeStr = String(code);
    const codeRegex = /^\d{4}$/;
    return codeRegex.test(codeStr);
}

/**
 * التحقق من كلمة المرور (6 أرقام)
 * @param {string} password - كلمة المرور
 * @returns {boolean} هل كلمة المرور صحيحة
 */
function validatePassword(password) {
    const passwordRegex = /^\d{6}$/;
    return passwordRegex.test(password);
}

/**
 * التحقق من أن القيمة غير فارغة
 * @param {string} value - القيمة
 * @returns {boolean} هل القيمة غير فارغة
 */
function validateRequired(value) {
    return value !== null && value !== undefined && String(value).trim() !== '';
}

/**
 * التحقق من أن القيمة رقم صحيح
 * @param {string|number} value - القيمة
 * @returns {boolean} هل القيمة رقم
 */
function validateNumber(value) {
    return !isNaN(Number(value)) && Number(value) >= 0;
}

// ============ HTML Escaping (XSS Prevention) ============

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

/**
 * تعيين النص بأمان في عنصر HTML
 * @param {HTMLElement} element - العنصر
 * @param {string} text - النص
 */
function setTextContent(element, text) {
    if (element) {
        element.textContent = text || '';
    }
}

/**
 * تنظيف النص من أي HTML
 * @param {string} text - النص
 * @returns {string} النص النظيف
 */
function sanitizeText(text) {
    if (!text) return '';
    return String(text).replace(/<[^>]*>/g, '');
}

// ============ DOM Helpers ============

/**
 * الحصول على عنصر بالـ ID
 * @param {string} id - معرف العنصر
 * @returns {HTMLElement|null} العنصر
 */
function getElement(id) {
    return document.getElementById(id);
}

/**
 * إنشاء عنصر HTML
 * @param {string} tag - نوع العنصر
 * @param {Object} attributes - الخصائص
 * @param {string} textContent - النص
 * @returns {HTMLElement} العنصر المنشأ
 */
function createElement(tag, attributes = {}, textContent = '') {
    const element = document.createElement(tag);
    
    Object.keys(attributes).forEach(key => {
        if (key === 'class') {
            element.className = attributes[key];
        } else if (key === 'dataset') {
            Object.keys(attributes[key]).forEach(dataKey => {
                element.dataset[dataKey] = attributes[key][dataKey];
            });
        } else if (key.startsWith('on')) {
            element.addEventListener(key.substring(2).toLowerCase(), attributes[key]);
        } else {
            element.setAttribute(key, attributes[key]);
        }
    });
    
    if (textContent) {
        element.textContent = textContent;
    }
    
    return element;
}

/**
 * تفريغ عنصر من جميع الأبناء
 * @param {HTMLElement} element - العنصر
 */
function clearElement(element) {
    if (element) {
        element.innerHTML = '';
    }
}

// ============ Toast Notifications ============

/**
 * عرض إشعار Toast
 * @param {string} message - الرسالة
 * @param {string} type - النوع (success, warning, error, info)
 * @param {number} duration - مدة العرض بالمللي ثانية
 */
function showToast(message, type = 'info', duration = 3000) {
    // إنشاء حاوية toast إذا لم تكن موجودة
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container';
        document.body.appendChild(toastContainer);
    }
    
    // إنشاء toast
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    // الأيقونات
    const icons = {
        success: '✅',
        warning: '⚠️',
        error: '❌',
        info: 'ℹ️'
    };
    
    toast.innerHTML = `
        <span class="toast-icon">${icons[type] || icons.info}</span>
        <div class="toast-content">
            <div class="toast-message">${escapeHtml(message)}</div>
        </div>
        <button class="toast-close">×</button>
    `;
    
    // إضافة toast للحاوية
    toastContainer.appendChild(toast);
    
    // إغلاق toast
    const closeToast = () => {
        toast.style.animation = 'fadeIn 0.3s reverse';
        setTimeout(() => {
            toast.remove();
            if (toastContainer.children.length === 0) {
                toastContainer.remove();
            }
        }, 300);
    };
    
    // زر الإغلاق
    toast.querySelector('.toast-close').addEventListener('click', closeToast);
    
    // إغلاق تلقائي
    setTimeout(closeToast, duration);
}

// ============ Loading Indicators ============

/**
 * إظهار مؤشر تحميل
 * @param {string} message - رسالة التحميل
 * @returns {HTMLElement} عنصر التحميل
 */
function showLoading(message = 'جاري التحميل...') {
    const loadingOverlay = document.createElement('div');
    loadingOverlay.className = 'loading-overlay';
    loadingOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(255, 255, 255, 0.8);
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

/**
 * إظهار تحميل داخل عنصر
 * @param {HTMLElement} element - العنصر
 * @param {string} message - رسالة التحميل
 */
function showElementLoading(element, message = 'جاري التحميل...') {
    if (!element) return;
    
    clearElement(element);
    element.innerHTML = `
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
 * @param {HTMLElement} element - العنصر
 * @param {string} message - الرسالة
 * @param {string} icon - الأيقونة
 */
function showEmptyState(element, message = 'لا توجد بيانات حاليًا', icon = '📋') {
    if (!element) return;
    
    clearElement(element);
    element.innerHTML = `
        <div class="empty-state">
            <div class="empty-state-icon">${icon}</div>
            <div class="empty-state-title">${escapeHtml(message)}</div>
            <div class="empty-state-text">لم يتم العثور على أي بيانات</div>
        </div>
    `;
}

/**
 * عرض حالة خطأ
 * @param {HTMLElement} element - العنصر
 * @param {string} message - رسالة الخطأ
 */
function showErrorState(element, message = 'حدث خطأ أثناء تحميل البيانات') {
    if (!element) return;
    
    clearElement(element);
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

// ============ Confirmation Dialog ============

/**
 * عرض رسالة تأكيد
 * @param {string} message - رسالة التأكيد
 * @param {string} title - العنوان
 * @returns {Promise<boolean>} هل تم التأكيد
 */
async function confirmAction(message = 'هل أنت متأكد؟', title = 'تأكيد') {
    return new Promise((resolve) => {
        // إنشاء modal
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.innerHTML = `
            <div class="modal" style="max-width: 400px;">
                <div class="modal-header">
                    <h3 class="modal-title">${escapeHtml(title)}</h3>
                    <button class="modal-close">×</button>
                </div>
                <div class="modal-body">
                    <p style="text-align: center; font-size: 1.1rem;">${escapeHtml(message)}</p>
                </div>
                <div class="modal-footer" style="justify-content: center;">
                    <button class="btn btn-danger confirm-yes">تأكيد</button>
                    <button class="btn btn-secondary confirm-no">إلغاء</button>
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
        
        // إغلاق عند النقر خارج الـ modal
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                closeModal(false);
            }
        });
    });
}

// ============ Modal Helpers ============

/**
 * فتح Modal
 * @param {HTMLElement} modalElement - عنصر الـ modal
 */
function openModal(modalElement) {
    if (modalElement) {
        modalElement.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

/**
 * إغلاق Modal
 * @param {HTMLElement} modalElement - عنصر الـ modal
 */
function closeModal(modalElement) {
    if (modalElement) {
        modalElement.style.display = 'none';
        document.body.style.overflow = '';
    }
}

/**
 * إنشاء Modal جديد
 * @param {string} title - العنوان
 * @param {string} content - المحتوى
 * @returns {HTMLElement} عنصر الـ modal
 */
function createModal(title, content) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.style.display = 'none';
    
    overlay.innerHTML = `
        <div class="modal">
            <div class="modal-header">
                <h3 class="modal-title">${escapeHtml(title)}</h3>
                <button class="modal-close">×</button>
            </div>
            <div class="modal-body">
                ${content}
            </div>
        </div>
    `;
    
    overlay.querySelector('.modal-close').addEventListener('click', () => closeModal(overlay));
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            closeModal(overlay);
        }
    });
    
    document.body.appendChild(overlay);
    return overlay;
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

/**
 * إضافة Query Parameter إلى URL
 * @param {string} url - الرابط
 * @param {Object} params - المعاملات
 * @returns {string} الرابط مع المعاملات
 */
function buildUrl(url, params = {}) {
    const urlObj = new URL(url, window.location.origin);
    Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
            urlObj.searchParams.set(key, params[key]);
        }
    });
    return urlObj.toString();
}

// ============ Debounce ============

/**
 * تأخير تنفيذ دالة
 * @param {Function} func - الدالة
 * @param {number} wait - مدة الانتظار بالمللي ثانية
 * @returns {Function} الدالة المؤجلة
 */
function debounce(func, wait = 300) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ============ Random Helpers ============

/**
 * توليد ID فريد
 * @param {string} prefix - بادئة
 * @returns {string} ID فريد
 */
function generateId(prefix = '') {
    return `${prefix}${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * تحويل نص إلى slug
 * @param {string} text - النص
 * @returns {string} slug
 */
function slugify(text) {
    if (!text) return '';
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\u0600-\u06FF\w\-]+/g, '')
        .replace(/\-\-+/g, '-');
}

// ============ Export All Functions ============
export {
    // Date Formatting
    formatDate,
    formatTime,
    formatDateTime,
    getTodayDate,
    getDayName,
    calculateAge,
    
    // Currency
    formatCurrency,
    formatNumber,
    
    // Validation
    validateEmail,
    validatePhone,
    validateCode,
    validatePassword,
    validateRequired,
    validateNumber,
    
    // HTML Escaping
    escapeHtml,
    setTextContent,
    sanitizeText,
    
    // DOM Helpers
    getElement,
    createElement,
    clearElement,
    
    // Toast
    showToast,
    
    // Loading
    showLoading,
    hideLoading,
    showElementLoading,
    
    // States
    showEmptyState,
    showErrorState,
    
    // Confirmation
    confirmAction,
    
    // Modal
    openModal,
    closeModal,
    createModal,
    
    // URL
    getQueryParam,
    buildUrl,
    
    // Utilities
    debounce,
    generateId,
    slugify
};