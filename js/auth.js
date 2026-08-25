// ============================================
// js/auth.js
// SchoolHub Pro - Custom Authentication
// منصة مدارس الجيل الجديد
// ============================================

import { db } from './firebase.js';
import { getDocument, loginWithCode } from './firestore.js';
import { saveSession, getSession, clearSession, encodePassword, showToast } from './utils.js';

// ============ Login ============

/**
 * تسجيل الدخول بالكود وكلمة المرور
 * @param {string} code - كود المستخدم (4 أرقام)
 * @param {string} password - كلمة المرور (6 أرقام)
 * @param {string} expectedRole - الدور المتوقع (student, teacher, admin)
 * @returns {Promise<Object>} بيانات المستخدم
 */
async function login(code, password, expectedRole = null) {
    try {
        // التحقق من المدخلات
        if (!code || !password) {
            throw new Error('الرجاء إدخال الكود وكلمة المرور');
        }
        
        // البحث عن المستخدم في Firestore
        const user = await loginWithCode(code, password);
        
        if (!user) {
            throw new Error('المستخدم غير موجود');
        }
        
        // التحقق من الحالة
        if (user.status !== 'active') {
            throw new Error('الحساب غير نشط. الرجاء التواصل مع الإدارة.');
        }
        
        // التحقق من الدور
        if (expectedRole && user.role !== expectedRole && user.role !== 'super_admin') {
            throw new Error('عذرًا، ليس لديك صلاحية للوصول إلى هذه الصفحة.');
        }
        
        // حفظ الجلسة
        saveSession({
            code: user.code,
            name: user.name,
            role: user.role,
            linkedId: user.linkedId,
            phone: user.phone || '',
            classId: user.classId || '',
            stageId: user.stageId || ''
        });
        
        return user;
        
    } catch (error) {
        throw new Error(error.message || 'حدث خطأ أثناء تسجيل الدخول');
    }
}

/**
 * تسجيل دخول الإدارة
 * @param {string} code - كود المدير
 * @param {string} password - كلمة المرور
 * @returns {Promise<Object>} بيانات المستخدم
 */
async function loginAdmin(code, password) {
    const user = await login(code, password, 'admin');
    
    // التأكد من أن المستخدم Admin أو Super Admin
    if (user.role !== 'admin' && user.role !== 'super_admin') {
        clearSession();
        throw new Error('عذرًا، ليس لديك صلاحية الوصول إلى لوحة الإدارة.');
    }
    
    return user;
}

// ============ Logout ============

/**
 * تسجيل الخروج
 */
async function logout() {
    clearSession();
    window.location.href = '../index.html';
}

// ============ Session Management ============

/**
 * الحصول على المستخدم الحالي من الجلسة
 * @returns {Object|null} بيانات المستخدم
 */
function getCurrentUser() {
    return getSession();
}

/**
 * الحصول على بيانات المستخدم الكاملة من Firestore
 * @param {string} code - كود المستخدم
 * @returns {Promise<Object|null>} بيانات المستخدم
 */
async function getUserProfile(code) {
    try {
        return await getDocument('users', code);
    } catch (error) {
        console.error('Error getting user profile:', error);
        return null;
    }
}

/**
 * الحصول على بيانات المستخدم الحالي
 * @returns {Promise<Object|null>} بيانات المستخدم
 */
async function getCurrentUserProfile() {
    const session = getCurrentUser();
    if (!session) return null;
    
    return await getUserProfile(session.code);
}

// ============ Role-Based Redirect ============

/**
 * التوجيه حسب دور المستخدم
 * @param {Object} user - بيانات المستخدم
 */
function redirectByRole(user) {
    if (!user || !user.role) {
        window.location.href = '../unauthorized.html';
        return;
    }
    
    switch (user.role) {
        case 'super_admin':
        case 'admin':
            window.location.href = '../admin/dashboard.html';
            break;
        case 'teacher':
            window.location.href = '../teacher/dashboard.html';
            break;
        case 'student':
            window.location.href = '../student/dashboard.html';
            break;
        default:
            window.location.href = '../unauthorized.html';
    }
}

// ============ Route Protection ============

/**
 * حماية المسارات - التحقق من الجلسة والدور
 * @param {string|Array} requiredRole - الدور المطلوب
 * @returns {Promise<Object|null>} بيانات المستخدم أو null
 */
async function requireAuth(requiredRole = null) {
    const session = getCurrentUser();
    
    if (!session) {
        window.location.href = '../index.html';
        return null;
    }
    
    // الحصول على بيانات المستخدم الكاملة للتحقق من الحالة
    const user = await getUserProfile(session.code);
    
    if (!user) {
        clearSession();
        window.location.href = '../index.html';
        return null;
    }
    
    if (user.status !== 'active') {
        clearSession();
        window.location.href = '../index.html';
        return null;
    }
    
    if (requiredRole) {
        const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
        
        // Super Admin يصل لكل شيء
        if (user.role === 'super_admin') {
            return user;
        }
        
        if (!roles.includes(user.role)) {
            window.location.href = '../unauthorized.html';
            return null;
        }
    }
    
    return user;
}

/**
 * حماية المسارات مع الصلاحيات
 * @param {string} requiredRole - الدور المطلوب
 * @param {string} permission - الصلاحية المطلوبة
 * @returns {Promise<Object|null>} بيانات المستخدم
 */
async function requirePermission(requiredRole, permission) {
    const user = await requireAuth(requiredRole);
    
    if (!user) return null;
    
    // Super Admin يملك كل الصلاحيات
    if (user.role === 'super_admin') {
        return user;
    }
    
    // التحقق من الصلاحية
    if (user.permissions && user.permissions.includes(permission)) {
        return user;
    }
    
    window.location.href = '../unauthorized.html';
    return null;
}

// ============ Export ============
export {
    login,
    loginAdmin,
    logout,
    getCurrentUser,
    getUserProfile,
    getCurrentUserProfile,
    redirectByRole,
    requireAuth,
    requirePermission
};