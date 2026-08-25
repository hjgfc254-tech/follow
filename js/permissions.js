// ============================================
// js/permissions.js
// SchoolHub Pro - Permissions Module
// منصة مدارس الجيل الجديد
// ============================================

import { getDocument } from './firestore.js';

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

// ============ Role Verification ============

/**
 * التحقق من دور المستخدم
 * @param {Object} user - بيانات المستخدم
 * @param {string|Array} roles - الأدوار المسموحة
 * @returns {boolean} هل الدور مسموح
 */
function hasRole(user, roles) {
    if (!user) return false;
    
    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    
    // Super Admin يصل لكل شيء
    if (user.role === ROLES.SUPER_ADMIN) {
        return true;
    }
    
    return allowedRoles.includes(user.role);
}

/**
 * التحقق من حالة المستخدم
 * @param {Object} user - بيانات المستخدم
 * @returns {boolean} هل المستخدم نشط
 */
function isActive(user) {
    return user && user.status === STATUS.ACTIVE;
}

/**
 * التحقق من أن المستخدم Super Admin
 */
function isSuperAdmin(user) {
    return user && user.role === ROLES.SUPER_ADMIN;
}

/**
 * التحقق من أن المستخدم Admin
 */
function isAdmin(user) {
    return user && (user.role === ROLES.ADMIN || user.role === ROLES.SUPER_ADMIN);
}

/**
 * التحقق من أن المستخدم Teacher
 */
function isTeacher(user) {
    return user && user.role === ROLES.TEACHER;
}

/**
 * التحقق من أن المستخدم Student
 */
function isStudent(user) {
    return user && user.role === ROLES.STUDENT;
}

// ============ Permission Checks ============

/**
 * التحقق من صلاحية المستخدم
 * @param {Object} user - بيانات المستخدم
 * @param {string} permission - الصلاحية المطلوبة
 * @returns {boolean} هل يملك الصلاحية
 */
function hasPermission(user, permission) {
    if (!user) return false;
    
    // Super Admin يملك كل الصلاحيات
    if (user.role === ROLES.SUPER_ADMIN) {
        return true;
    }
    
    // Admin - التحقق من permissions
    if (user.role === ROLES.ADMIN) {
        return user.permissions && user.permissions.includes(permission);
    }
    
    // Teacher و Student - صلاحيات افتراضية
    const defaultPermissions = getDefaultPermissions(user.role);
    return defaultPermissions.includes(permission);
}

/**
 * الحصول على الصلاحيات الافتراضية لدور
 * @param {string} role - الدور
 * @returns {Array} الصلاحيات
 */
function getDefaultPermissions(role) {
    const permissions = {
        teacher: [
            'students.read',
            'announcements.read',
            'messages.read',
            'messages.write',
            'events.read'
        ],
        student: [
            'announcements.read',
            'messages.read',
            'events.read'
        ]
    };
    
    return permissions[role] || [];
}

// ============ Permission Guards ============

/**
 * التحقق من الصلاحية وعرض رسالة إذا لم يملكها
 * @param {Object} user - بيانات المستخدم
 * @param {string} permission - الصلاحية
 * @returns {boolean} هل يملك الصلاحية
 */
function requirePermission(user, permission) {
    if (!hasPermission(user, permission)) {
        alert('عذرًا، ليس لديك صلاحية للوصول إلى هذه الميزة.');
        return false;
    }
    return true;
}

/**
 * التحقق من الدور وعرض رسالة إذا لم يملكه
 * @param {Object} user - بيانات المستخدم
 * @param {string|Array} roles - الأدوار
 * @returns {boolean} هل يملك الدور
 */
function requireRole(user, roles) {
    if (!hasRole(user, roles)) {
        alert('عذرًا، ليس لديك صلاحية للوصول إلى هذه الصفحة.');
        return false;
    }
    return true;
}

// ============ Export ============
export {
    // Constants
    ROLES,
    STATUS,
    
    // Role Verification
    hasRole,
    isActive,
    isSuperAdmin,
    isAdmin,
    isTeacher,
    isStudent,
    
    // Permission Checks
    hasPermission,
    getDefaultPermissions,
    
    // Permission Guards
    requirePermission,
    requireRole
};