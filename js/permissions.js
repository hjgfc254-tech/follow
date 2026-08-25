// ============================================
// js/permissions.js
// SchoolHub Pro - Permissions Module
// منصة مدارس الجيل الجديد الخاصة
// ============================================

import { db } from './firebase.js';
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

// ============ Permission Constants ============

const PERMISSIONS = {
    // Students
    'students.read': 'قراءة الطلاب',
    'students.write': 'إدارة الطلاب',
    'students.delete': 'حذف الطلاب',
    
    // Teachers
    'teachers.read': 'قراءة المدرسين',
    'teachers.write': 'إدارة المدرسين',
    'teachers.delete': 'حذف المدرسين',
    
    // Stages
    'stages.read': 'قراءة المراحل',
    'stages.write': 'إدارة المراحل',
    'stages.delete': 'حذف المراحل',
    
    // Classes
    'classes.read': 'قراءة الفصول',
    'classes.write': 'إدارة الفصول',
    'classes.delete': 'حذف الفصول',
    
    // Subjects
    'subjects.read': 'قراءة المواد',
    'subjects.write': 'إدارة المواد',
    'subjects.delete': 'حذف المواد',
    
    // Attendance
    'attendance.read': 'قراءة الحضور',
    'attendance.write': 'تسجيل الحضور',
    'attendance.delete': 'حذف الحضور',
    
    // Expenses
    'expenses.read': 'قراءة المصروفات',
    'expenses.write': 'إدارة المصروفات',
    'expenses.delete': 'حذف المصروفات',
    
    // Announcements
    'announcements.read': 'قراءة الإعلانات',
    'announcements.write': 'إدارة الإعلانات',
    'announcements.delete': 'حذف الإعلانات',
    
    // Messages
    'messages.read': 'قراءة الرسائل',
    'messages.write': 'إرسال الرسائل',
    
    // Events
    'events.read': 'قراءة الأحداث',
    'events.write': 'إدارة الأحداث',
    'events.delete': 'حذف الأحداث',
    
    // Schedules
    'schedules.read': 'قراءة الجداول',
    'schedules.write': 'إدارة الجداول',
    'schedules.delete': 'حذف الجداول',
    
    // Settings
    'settings.read': 'قراءة الإعدادات',
    'settings.write': 'تعديل الإعدادات',
    
    // Logs
    'logs.read': 'قراءة السجلات'
};

// ============ Role Constants ============

const ROLES = {
    SUPER_ADMIN: 'super_admin',
    ADMIN: 'admin',
    TEACHER: 'teacher',
    STUDENT: 'student'
};

// ============ Status Constants ============

const STATUS = {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    SUSPENDED: 'suspended'
};

// ============ Permission Defaults ============

const DEFAULT_PERMISSIONS = {
    admin: [
        'students.read',
        'students.write',
        'teachers.read',
        'teachers.write',
        'stages.read',
        'stages.write',
        'classes.read',
        'classes.write',
        'subjects.read',
        'subjects.write',
        'attendance.read',
        'attendance.write',
        'expenses.read',
        'expenses.write',
        'announcements.read',
        'announcements.write',
        'messages.read',
        'messages.write',
        'events.read',
        'events.write',
        'schedules.read',
        'schedules.write'
    ],
    teacher: [
        'students.read',
        'attendance.read',
        'attendance.write',
        'announcements.read',
        'messages.read',
        'messages.write',
        'events.read',
        'schedules.read'
    ],
    student: [
        'announcements.read',
        'messages.read',
        'messages.write',
        'events.read',
        'schedules.read'
    ]
};

// ============ Permission Checks ============

/**
 * التحقق من صلاحية المستخدم
 * @param {Object} profile - بيانات المستخدم
 * @param {string} permission - الصلاحية المطلوبة
 * @returns {boolean} هل يملك الصلاحية
 */
function hasPermission(profile, permission) {
    if (!profile) return false;
    
    // Super Admin يملك كل الصلاحيات
    if (profile.role === ROLES.SUPER_ADMIN) {
        return true;
    }
    
    // Admin - التحقق من permissions
    if (profile.role === ROLES.ADMIN) {
        // التحقق من permissions في profile مباشرة
        if (profile.permissions && profile.permissions.includes(permission)) {
            return true;
        }
        
        // التحقق من permissions في admins collection
        if (profile.linkedId) {
            return checkAdminPermission(profile.linkedId, permission);
        }
        
        return false;
    }
    
    // Teacher و Student - استخدام الصلاحيات الافتراضية
    const defaultPerms = DEFAULT_PERMISSIONS[profile.role] || [];
    return defaultPerms.includes(permission);
}

/**
 * التحقق من صلاحية Admin من Firestore
 * @param {string} adminId - معرف الـ Admin
 * @param {string} permission - الصلاحية
 * @returns {Promise<boolean>} هل يملك الصلاحية
 */
async function checkAdminPermission(adminId, permission) {
    try {
        const adminDocRef = doc(db, 'admins', adminId);
        const adminDocSnap = await getDoc(adminDocRef);
        
        if (adminDocSnap.exists()) {
            const adminData = adminDocSnap.data();
            return adminData.permissions && adminData.permissions.includes(permission);
        }
        
        return false;
    } catch (error) {
        console.error('Error checking admin permission:', error);
        return false;
    }
}

/**
 * التحقق من صلاحية المستخدم بشكل متزامن مع Firestore
 * @param {Object} profile - بيانات المستخدم
 * @param {string} permission - الصلاحية المطلوبة
 * @returns {Promise<boolean>} هل يملك الصلاحية
 */
async function hasPermissionAsync(profile, permission) {
    if (!profile) return false;
    
    // Super Admin يملك كل الصلاحيات
    if (profile.role === ROLES.SUPER_ADMIN) {
        return true;
    }
    
    // Admin
    if (profile.role === ROLES.ADMIN) {
        if (profile.permissions && profile.permissions.includes(permission)) {
            return true;
        }
        
        if (profile.linkedId) {
            return await checkAdminPermission(profile.linkedId, permission);
        }
        
        return false;
    }
    
    // Teacher و Student
    const defaultPerms = DEFAULT_PERMISSIONS[profile.role] || [];
    return defaultPerms.includes(permission);
}

// ============ Role Verification ============

/**
 * التحقق من دور المستخدم
 * @param {Object} profile - بيانات المستخدم
 * @param {string|Array} roles - الأدوار المسموحة
 * @returns {boolean} هل الدور مسموح
 */
function hasRole(profile, roles) {
    if (!profile) return false;
    
    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    
    // Super Admin يصل لكل شيء
    if (profile.role === ROLES.SUPER_ADMIN) {
        return true;
    }
    
    return allowedRoles.includes(profile.role);
}

/**
 * التحقق من حالة المستخدم
 * @param {Object} profile - بيانات المستخدم
 * @returns {boolean} هل المستخدم نشط
 */
function isActive(profile) {
    return profile && profile.status === STATUS.ACTIVE;
}

/**
 * التحقق من أن المستخدم Super Admin
 * @param {Object} profile - بيانات المستخدم
 * @returns {boolean}
 */
function isSuperAdmin(profile) {
    return profile && profile.role === ROLES.SUPER_ADMIN;
}

/**
 * التحقق من أن المستخدم Admin
 * @param {Object} profile - بيانات المستخدم
 * @returns {boolean}
 */
function isAdmin(profile) {
    return profile && (profile.role === ROLES.ADMIN || profile.role === ROLES.SUPER_ADMIN);
}

/**
 * التحقق من أن المستخدم Teacher
 * @param {Object} profile - بيانات المستخدم
 * @returns {boolean}
 */
function isTeacher(profile) {
    return profile && profile.role === ROLES.TEACHER;
}

/**
 * التحقق من أن المستخدم Student
 * @param {Object} profile - بيانات المستخدم
 * @returns {boolean}
 */
function isStudent(profile) {
    return profile && profile.role === ROLES.STUDENT;
}

// ============ Permission Guards ============

/**
 * التحقق من الصلاحية وعرض رسالة إذا لم يملكها
 * @param {Object} profile - بيانات المستخدم
 * @param {string} permission - الصلاحية
 * @returns {boolean} هل يملك الصلاحية
 */
function requirePermission(profile, permission) {
    if (!hasPermission(profile, permission)) {
        showAccessDenied();
        return false;
    }
    return true;
}

/**
 * التحقق من الدور وعرض رسالة إذا لم يملكه
 * @param {Object} profile - بيانات المستخدم
 * @param {string|Array} roles - الأدوار
 * @returns {boolean} هل يملك الدور
 */
function requireRole(profile, roles) {
    if (!hasRole(profile, roles)) {
        showAccessDenied();
        return false;
    }
    return true;
}

/**
 * التحقق من الصلاحية بشكل متزامن
 * @param {Object} profile - بيانات المستخدم
 * @param {string} permission - الصلاحية
 * @returns {Promise<boolean>} هل يملك الصلاحية
 */
async function requirePermissionAsync(profile, permission) {
    const hasPerm = await hasPermissionAsync(profile, permission);
    if (!hasPerm) {
        showAccessDenied();
        return false;
    }
    return true;
}

// ============ UI Helper ============

/**
 * عرض رسالة عدم وجود صلاحية
 */
function showAccessDenied() {
    // عرض رسالة
    alert('عذرًا، ليس لديك صلاحية للوصول إلى هذه الميزة.');
    
    // يمكن أيضًا التوجيه إلى صفحة unauthorized
    // window.location.href = '../unauthorized.html';
}

// ============ Get Permissions List ============

/**
 * الحصول على قائمة الصلاحيات المتاحة
 * @returns {Object} الصلاحيات
 */
function getPermissionsList() {
    return PERMISSIONS;
}

/**
 * الحصول على الصلاحيات الافتراضية لدور
 * @param {string} role - الدور
 * @returns {Array} الصلاحيات
 */
function getDefaultPermissions(role) {
    return DEFAULT_PERMISSIONS[role] || [];
}

/**
 * التحقق من صحة اسم الصلاحية
 * @param {string} permission - اسم الصلاحية
 * @returns {boolean} هل الصلاحية صحيحة
 */
function isValidPermission(permission) {
    return permission in PERMISSIONS;
}

// ============ Export ============
export {
    // Constants
    PERMISSIONS,
    ROLES,
    STATUS,
    DEFAULT_PERMISSIONS,
    
    // Permission Checks
    hasPermission,
    hasPermissionAsync,
    checkAdminPermission,
    
    // Role Verification
    hasRole,
    isActive,
    isSuperAdmin,
    isAdmin,
    isTeacher,
    isStudent,
    
    // Permission Guards
    requirePermission,
    requireRole,
    requirePermissionAsync,
    
    // Helpers
    getPermissionsList,
    getDefaultPermissions,
    isValidPermission
};