// ============================================
// js/auth.js
// SchoolHub Pro - Authentication Module
// منصة مدارس الجيل الجديد الخاصة
// ============================================

import { auth, db, generateEmail } from './firebase.js';
import {
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    sendPasswordResetEmail,
    setPersistence,
    browserLocalPersistence,
    browserSessionPersistence
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

// ============ Login Functions ============

/**
 * تسجيل الدخول للمستخدم
 * @param {string} code - كود المستخدم (4 أرقام)
 * @param {string} password - كلمة المرور (6 أرقام)
 * @param {boolean} rememberMe - تذكر الجلسة
 * @param {string} role - الدور المتوقع (student, teacher, admin)
 * @returns {Promise<Object>} بيانات المستخدم
 */
async function login(code, password, rememberMe = false, role = null) {
    try {
        // التحقق من صحة المدخلات
        if (!code || !password) {
            throw new Error('البيانات غير مكتملة. الرجاء إدخال الكود وكلمة المرور.');
        }
        
        // توليد البريد الإلكتروني من الكود
        let email;
        if (role === 'admin' || role === 'super_admin') {
            // للـ Admin يمكن استخدام البريد المباشر
            email = code.includes('@') ? code : generateEmail(code);
        } else {
            email = generateEmail(code);
        }
        
        // تعيين persistence حسب تذكر الجلسة
        await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
        
        // تسجيل الدخول عبر Firebase Auth
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // الحصول على بيانات المستخدم من Firestore
        const userProfile = await getUserProfile(user.uid);
        
        if (!userProfile) {
            // المستخدم غير موجود في Firestore
            await signOut(auth);
            throw new Error('حساب المستخدم غير موجود في النظام. الرجاء التواصل مع الإدارة.');
        }
        
        // التحقق من حالة المستخدم
        if (userProfile.status !== 'active') {
            await signOut(auth);
            
            if (userProfile.status === 'suspended') {
                throw new Error('الحساب موقوف. الرجاء التواصل مع الإدارة.');
            } else if (userProfile.status === 'inactive') {
                throw new Error('الحساب غير نشط. الرجاء التواصل مع الإدارة.');
            } else {
                throw new Error('الحساب غير متاح حاليًا.');
            }
        }
        
        // التحقق من الدور إذا تم تحديده
        if (role && userProfile.role !== role && userProfile.role !== 'super_admin') {
            await signOut(auth);
            throw new Error('عذرًا، ليس لديك صلاحية للوصول إلى هذه الصفحة.');
        }
        
        // إرجاع بيانات المستخدم
        return {
            user,
            profile: userProfile
        };
        
    } catch (error) {
        // تحويل أخطاء Firebase إلى رسائل عربية
        throw new Error(mapAuthError(error));
    }
}

/**
 * تسجيل دخول مباشر للـ Admin
 * @param {string} email - البريد الإلكتروني
 * @param {string} password - كلمة المرور
 * @param {boolean} rememberMe - تذكر الجلسة
 * @returns {Promise<Object>} بيانات المستخدم
 */
async function loginAdmin(email, password, rememberMe = true) {
    try {
        if (!email || !password) {
            throw new Error('الرجاء إدخال البريد الإلكتروني وكلمة المرور.');
        }
        
        await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
        
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        const userProfile = await getUserProfile(user.uid);
        
        if (!userProfile) {
            await signOut(auth);
            throw new Error('حساب المستخدم غير موجود في النظام.');
        }
        
        if (userProfile.status !== 'active') {
            await signOut(auth);
            throw new Error('الحساب غير نشط. الرجاء التواصل مع الإدارة.');
        }
        
        // التحقق من أن المستخدم Admin أو Super Admin
        if (userProfile.role !== 'admin' && userProfile.role !== 'super_admin') {
            await signOut(auth);
            throw new Error('عذرًا، ليس لديك صلاحية الوصول إلى لوحة الإدارة.');
        }
        
        return {
            user,
            profile: userProfile
        };
        
    } catch (error) {
        throw new Error(mapAuthError(error));
    }
}

// ============ Logout ============

/**
 * تسجيل الخروج
 * @returns {Promise<void>}
 */
async function logout() {
    try {
        await signOut(auth);
        // التوجيه إلى الصفحة الرئيسية
        window.location.href = '../index.html';
    } catch (error) {
        throw new Error('حدث خطأ أثناء تسجيل الخروج.');
    }
}

// ============ Session Management ============

/**
 * الحصول على المستخدم الحالي
 * @returns {Object|null} المستخدم الحالي
 */
function getCurrentUser() {
    return auth.currentUser;
}

/**
 * مراقبة حالة المصادقة
 * @param {Function} callback - دالة الاستدعاء
 * @returns {Function} دالة إلغاء المراقبة
 */
function watchAuthState(callback) {
    return onAuthStateChanged(auth, callback);
}

/**
 * الحصول على بيانات المستخدم من Firestore
 * @param {string} uid - معرف المستخدم
 * @returns {Promise<Object|null>} بيانات المستخدم
 */
async function getUserProfile(uid) {
    try {
        const userDocRef = doc(db, 'users', uid);
        const userDocSnap = await getDoc(userDocRef);
        
        if (userDocSnap.exists()) {
            return {
                uid: uid,
                ...userDocSnap.data()
            };
        }
        
        return null;
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
    const user = getCurrentUser();
    if (!user) return null;
    
    return await getUserProfile(user.uid);
}

// ============ Role-Based Redirect ============

/**
 * التوجيه حسب دور المستخدم
 * @param {Object} profile - بيانات المستخدم
 */
function redirectByRole(profile) {
    if (!profile || !profile.role) {
        window.location.href = '../unauthorized.html';
        return;
    }
    
    switch (profile.role) {
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

/**
 * التوجيه حسب دور المستخدم من صفحة login
 * @param {Object} profile - بيانات المستخدم
 */
function redirectAfterLogin(profile) {
    redirectByRole(profile);
}

// ============ Route Protection ============

/**
 * حماية المسارات - التحقق من المصادقة والدور
 * @param {string} requiredRole - الدور المطلوب
 * @returns {Promise<Object|null>} بيانات المستخدم أو null
 */
async function requireAuth(requiredRole = null) {
    return new Promise((resolve) => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            unsubscribe();
            
            if (!user) {
                // غير مسجل دخول
                window.location.href = '../index.html';
                resolve(null);
                return;
            }
            
            // الحصول على بيانات المستخدم
            const profile = await getUserProfile(user.uid);
            
            if (!profile) {
                // المستخدم غير موجود في Firestore
                window.location.href = '../unauthorized.html';
                resolve(null);
                return;
            }
            
            // التحقق من الحالة
            if (profile.status !== 'active') {
                await signOut(auth);
                window.location.href = '../index.html';
                resolve(null);
                return;
            }
            
            // التحقق من الدور
            if (requiredRole) {
                const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
                
                // Super Admin يصل لكل شيء
                if (profile.role === 'super_admin') {
                    resolve(profile);
                    return;
                }
                
                if (!roles.includes(profile.role)) {
                    window.location.href = '../unauthorized.html';
                    resolve(null);
                    return;
                }
            }
            
            resolve(profile);
        });
    });
}

/**
 * حماية المسارات مع الصلاحيات
 * @param {string} requiredRole - الدور المطلوب
 * @param {string} permission - الصلاحية المطلوبة
 * @returns {Promise<Object|null>} بيانات المستخدم أو null
 */
async function requirePermission(requiredRole, permission) {
    const profile = await requireAuth(requiredRole);
    
    if (!profile) return null;
    
    // Super Admin يملك كل الصلاحيات
    if (profile.role === 'super_admin') {
        return profile;
    }
    
    // التحقق من الصلاحية
    if (profile.permissions && profile.permissions.includes(permission)) {
        return profile;
    }
    
    // التحقق من الصلاحيات من admins collection
    if (profile.role === 'admin' && profile.linkedId) {
        try {
            const adminDocRef = doc(db, 'admins', profile.linkedId);
            const adminDocSnap = await getDoc(adminDocRef);
            
            if (adminDocSnap.exists()) {
                const adminData = adminDocSnap.data();
                if (adminData.permissions && adminData.permissions.includes(permission)) {
                    return profile;
                }
            }
        } catch (error) {
            console.error('Error checking permissions:', error);
        }
    }
    
    window.location.href = '../unauthorized.html';
    return null;
}

// ============ Password Reset ============

/**
 * إرسال رابط استعادة كلمة المرور
 * @param {string} code - كود المستخدم
 * @returns {Promise<void>}
 */
async function resetPassword(code) {
    try {
        const email = generateEmail(code);
        await sendPasswordResetEmail(auth, email);
    } catch (error) {
        throw new Error(mapAuthError(error));
    }
}

// ============ Error Mapping ============

/**
 * تحويل أخطاء Firebase إلى رسائل عربية
 * @param {Error} error - الخطأ
 * @returns {string} الرسالة العربية
 */
function mapAuthError(error) {
    const errorCode = error.code || '';
    const errorMessage = error.message || '';
    
    // أخطاء Firebase Auth الشائعة
    const errorMap = {
        'auth/invalid-credential': 'البريد الإلكتروني أو كلمة المرور غير صحيحة.',
        'auth/invalid-email': 'البريد الإلكتروني غير صالح.',
        'auth/user-disabled': 'الحساب معطل. الرجاء التواصل مع الإدارة.',
        'auth/user-not-found': 'المستخدم غير موجود.',
        'auth/wrong-password': 'كلمة المرور غير صحيحة.',
        'auth/too-many-requests': 'محاولات كثيرة. الرجاء المحاولة لاحقًا.',
        'auth/network-request-failed': 'خطأ في الاتصال بالشبكة. الرجاء التحقق من الإنترنت.',
        'auth/operation-not-allowed': 'العملية غير مسموحة.',
        'auth/weak-password': 'كلمة المرور ضعيفة. يجب أن تكون 6 أرقام.',
        'auth/email-already-in-use': 'البريد الإلكتروني مستخدم بالفعل.',
        'auth/requires-recent-login': 'الرجاء تسجيل الدخول مرة أخرى.',
        'auth/unauthorized-domain': 'النطاق غير مصرح به.',
        'auth/invalid-action-code': 'رمز العملية غير صالح.',
        'auth/expired-action-code': 'رمز العملية منتهي الصلاحية.',
        'permission-denied': 'ليس لديك صلاحية لهذه العملية.',
        'not-found': 'البيانات غير موجودة.',
        'unavailable': 'الخدمة غير متاحة حاليًا.',
        'failed-precondition': 'العملية فشلت.',
        'aborted': 'تم إلغاء العملية.',
        'already-exists': 'العنصر موجود بالفعل.'
    };
    
    // رسائل مخصصة من النظام
    if (!errorCode) {
        return errorMessage || 'حدث خطأ غير متوقع.';
    }
    
    return errorMap[errorCode] || errorMessage || 'حدث خطأ أثناء العملية.';
}

// ============ Export ============
export {
    login,
    loginAdmin,
    logout,
    getCurrentUser,
    watchAuthState,
    getUserProfile,
    getCurrentUserProfile,
    redirectByRole,
    redirectAfterLogin,
    requireAuth,
    requirePermission,
    resetPassword,
    mapAuthError
};