// ============================================
// js/firestore.js
// SchoolHub Pro - Firestore Operations
// منصة مدارس الجيل الجديد الخاصة
// ============================================

import { db } from './firebase.js';
import {
    collection,
    doc,
    getDoc,
    getDocs,
    addDoc,
    setDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    limit,
    startAfter,
    endBefore,
    limitToLast,
    writeBatch,
    serverTimestamp,
    Timestamp
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

// ============ Collection Names ============
const COLLECTIONS = {
    USERS: 'users',
    STUDENTS: 'students',
    TEACHERS: 'teachers',
    ADMINS: 'admins',
    STAGES: 'stages',
    CLASSES: 'classes',
    SUBJECTS: 'subjects',
    ATTENDANCE: 'attendance',
    EXPENSES: 'expenses',
    ANNOUNCEMENTS: 'announcements',
    MESSAGES: 'messages',
    EVENTS: 'events',
    SCHEDULES: 'schedules',
    SETTINGS: 'settings',
    SYSTEM_LOGS: 'system_logs',
    NOTIFICATIONS: 'notifications'
};

// ============ Read Operations ============

/**
 * الحصول على مستند واحد
 * @param {string} collectionName - اسم المجموعة
 * @param {string} docId - معرف المستند
 * @returns {Promise<Object|null>} بيانات المستند
 */
async function getDocument(collectionName, docId) {
    try {
        const docRef = doc(db, collectionName, docId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            return {
                id: docSnap.id,
                ...docSnap.data()
            };
        }
        
        return null;
    } catch (error) {
        console.error(`Error getting document from ${collectionName}:`, error);
        throw error;
    }
}

/**
 * الحصول على مستندات متعددة
 * @param {string} collectionName - اسم المجموعة
 * @param {Array} conditions - شروط الاستعلام
 * @param {Object} options - خيارات إضافية
 * @returns {Promise<Array>} المستندات
 */
async function getDocuments(collectionName, conditions = [], options = {}) {
    try {
        let q = collection(db, collectionName);
        
        // إضافة شروط where
        conditions.forEach(condition => {
            q = query(q, where(condition.field, condition.operator, condition.value));
        });
        
        // إضافة ترتيب
        if (options.orderBy) {
            const orderField = options.orderBy;
            const orderDirection = options.orderDirection || 'asc';
            q = query(q, orderBy(orderField, orderDirection));
        }
        
        // إضافة حد
        if (options.limit) {
            q = query(q, limit(options.limit));
        }
        
        const querySnapshot = await getDocs(q);
        const documents = [];
        
        querySnapshot.forEach((doc) => {
            documents.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        return documents;
    } catch (error) {
        console.error(`Error getting documents from ${collectionName}:`, error);
        throw error;
    }
}

/**
 * الحصول على جميع مستندات مجموعة
 * @param {string} collectionName - اسم المجموعة
 * @param {Object} options - خيارات
 * @returns {Promise<Array>} المستندات
 */
async function getAllDocuments(collectionName, options = {}) {
    return await getDocuments(collectionName, [], options);
}

/**
 * الحصول على مستندات متعددة بالتوازي
 * @param {Array} queries - مصفوفة استعلامات
 * @returns {Promise<Array>} نتائج الاستعلامات
 */
async function getDocumentsInParallel(queries) {
    try {
        const results = await Promise.all(
            queries.map(async ({ collectionName, conditions = [], options = {} }) => {
                return await getDocuments(collectionName, conditions, options);
            })
        );
        return results;
    } catch (error) {
        console.error('Error getting documents in parallel:', error);
        throw error;
    }
}

/**
 * الحصول على مستندات متعددة دفعة واحدة
 * @param {string} collectionName - اسم المجموعة
 * @param {Array} docIds - معرفات المستندات
 * @returns {Promise<Array>} المستندات
 */
async function getDocumentsByIds(collectionName, docIds) {
    try {
        if (!docIds || docIds.length === 0) return [];
        
        const documents = [];
        
        // تقسيم إلى دفعات من 10 (حد Firestore)
        for (let i = 0; i < docIds.length; i += 10) {
            const batch = docIds.slice(i, i + 10);
            const promises = batch.map(async (docId) => {
                const docRef = doc(db, collectionName, docId);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    return {
                        id: docSnap.id,
                        ...docSnap.data()
                    };
                }
                return null;
            });
            
            const batchResults = await Promise.all(promises);
            documents.push(...batchResults.filter(doc => doc !== null));
        }
        
        return documents;
    } catch (error) {
        console.error(`Error getting documents by IDs from ${collectionName}:`, error);
        throw error;
    }
}

// ============ Write Operations ============

/**
 * إنشاء مستند بمعرف تلقائي
 * @param {string} collectionName - اسم المجموعة
 * @param {Object} data - البيانات
 * @returns {Promise<string>} معرف المستند المنشأ
 */
async function createDocument(collectionName, data) {
    try {
        const dataWithTimestamp = {
            ...data,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        };
        
        const docRef = await addDoc(collection(db, collectionName), dataWithTimestamp);
        return docRef.id;
    } catch (error) {
        console.error(`Error creating document in ${collectionName}:`, error);
        throw error;
    }
}

/**
 * إنشاء مستند بمعرف محدد
 * @param {string} collectionName - اسم المجموعة
 * @param {string} docId - معرف المستند
 * @param {Object} data - البيانات
 * @returns {Promise<string>} معرف المستند
 */
async function setDocument(collectionName, docId, data, merge = true) {
    try {
        const dataWithTimestamp = {
            ...data,
            updatedAt: serverTimestamp()
        };
        
        if (!merge) {
            dataWithTimestamp.createdAt = serverTimestamp();
        }
        
        const docRef = doc(db, collectionName, docId);
        await setDoc(docRef, dataWithTimestamp, { merge });
        return docId;
    } catch (error) {
        console.error(`Error setting document in ${collectionName}:`, error);
        throw error;
    }
}

/**
 * تحديث مستند
 * @param {string} collectionName - اسم المجموعة
 * @param {string} docId - معرف المستند
 * @param {Object} data - البيانات المراد تحديثها
 * @returns {Promise<void>}
 */
async function updateDocument(collectionName, docId, data) {
    try {
        const docRef = doc(db, collectionName, docId);
        await updateDoc(docRef, {
            ...data,
            updatedAt: serverTimestamp()
        });
    } catch (error) {
        console.error(`Error updating document in ${collectionName}:`, error);
        throw error;
    }
}

/**
 * حذف مستند
 * @param {string} collectionName - اسم المجموعة
 * @param {string} docId - معرف المستند
 * @returns {Promise<void>}
 */
async function deleteDocument(collectionName, docId) {
    try {
        const docRef = doc(db, collectionName, docId);
        await deleteDoc(docRef);
    } catch (error) {
        console.error(`Error deleting document from ${collectionName}:`, error);
        throw error;
    }
}

// ============ Batch Operations ============

/**
 * إنشاء مستندات متعددة دفعة واحدة
 * @param {string} collectionName - اسم المجموعة
 * @param {Array} documents - المستندات [{id, data}]
 * @returns {Promise<void>}
 */
async function createDocumentsBatch(collectionName, documents) {
    try {
        const batch = writeBatch(db);
        
        documents.forEach(({ id, data }) => {
            const docRef = id 
                ? doc(db, collectionName, id) 
                : doc(collection(db, collectionName));
            
            batch.set(docRef, {
                ...data,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });
        });
        
        await batch.commit();
    } catch (error) {
        console.error(`Error creating documents batch in ${collectionName}:`, error);
        throw error;
    }
}

/**
 * تحديث مستندات متعددة دفعة واحدة
 * @param {string} collectionName - اسم المجموعة
 * @param {Array} updates - التحديثات [{id, data}]
 * @returns {Promise<void>}
 */
async function updateDocumentsBatch(collectionName, updates) {
    try {
        const batch = writeBatch(db);
        
        updates.forEach(({ id, data }) => {
            const docRef = doc(db, collectionName, id);
            batch.update(docRef, {
                ...data,
                updatedAt: serverTimestamp()
            });
        });
        
        await batch.commit();
    } catch (error) {
        console.error(`Error updating documents batch in ${collectionName}:`, error);
        throw error;
    }
}

/**
 * حذف مستندات متعددة دفعة واحدة
 * @param {string} collectionName - اسم المجموعة
 * @param {Array} docIds - معرفات المستندات
 * @returns {Promise<void>}
 */
async function deleteDocumentsBatch(collectionName, docIds) {
    try {
        const batch = writeBatch(db);
        
        docIds.forEach(docId => {
            const docRef = doc(db, collectionName, docId);
            batch.delete(docRef);
        });
        
        await batch.commit();
    } catch (error) {
        console.error(`Error deleting documents batch from ${collectionName}:`, error);
        throw error;
    }
}

// ============ Specialized Queries ============

/**
 * الحصول على مستندات بشرط واحد مع ترتيب وحد
 * @param {string} collectionName - اسم المجموعة
 * @param {string} field - الحقل
 * @param {string} operator - العملية
 * @param {*} value - القيمة
 * @param {Object} options - خيارات
 * @returns {Promise<Array>} المستندات
 */
async function queryDocuments(collectionName, field, operator, value, options = {}) {
    return await getDocuments(collectionName, [
        { field, operator, value }
    ], options);
}

/**
 * الحصول على مستندات بشرطين
 * @param {string} collectionName - اسم المجموعة
 * @param {Array} conditions - الشروط
 * @param {Object} options - خيارات
 * @returns {Promise<Array>} المستندات
 */
async function queryDocumentsWithMultipleConditions(collectionName, conditions, options = {}) {
    return await getDocuments(collectionName, conditions, options);
}

/**
 * الحصول على سجلات اليوم لتاريخ محدد
 * @param {string} collectionName - اسم المجموعة
 * @param {string} dateField - حقل التاريخ
 * @param {string} date - التاريخ
 * @param {Object} options - خيارات
 * @returns {Promise<Array>} المستندات
 */
async function getDocumentsByDate(collectionName, dateField, date, options = {}) {
    return await getDocuments(collectionName, [
        { field: dateField, operator: '==', value: date }
    ], options);
}

/**
 * الحصول على سجلات اليوم (باستخدام Timestamp)
 * @param {string} collectionName - اسم المجموعة
 * @param {string} dateField - حقل التاريخ
 * @returns {Promise<Array>} مستندات اليوم
 */
async function getTodayDocuments(collectionName, dateField = 'createdAt') {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const q = query(
            collection(db, collectionName),
            where(dateField, '>=', Timestamp.fromDate(today)),
            where(dateField, '<', Timestamp.fromDate(tomorrow)),
            orderBy(dateField, 'desc')
        );
        
        const querySnapshot = await getDocs(q);
        const documents = [];
        
        querySnapshot.forEach((doc) => {
            documents.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        return documents;
    } catch (error) {
        console.error(`Error getting today's documents from ${collectionName}:`, error);
        throw error;
    }
}

/**
 * الحصول على عدد المستندات في مجموعة
 * @param {string} collectionName - اسم المجموعة
 * @param {Array} conditions - شروط
 * @returns {Promise<number>} العدد
 */
async function countDocuments(collectionName, conditions = []) {
    try {
        const documents = await getDocuments(collectionName, conditions);
        return documents.length;
    } catch (error) {
        console.error(`Error counting documents in ${collectionName}:`, error);
        return 0;
    }
}

// ============ Pagination ============

/**
 * الحصول على مستندات مع الترقيم
 * @param {string} collectionName - اسم المجموعة
 * @param {Object} options - خيارات الترقيم
 * @returns {Promise<Object>} المستندات ومعلومات الترقيم
 */
async function getPaginatedDocuments(collectionName, options = {}) {
    try {
        const {
            conditions = [],
            orderByField = 'createdAt',
            orderDirection = 'desc',
            pageSize = 20,
            lastDoc = null,
            firstDoc = null
        } = options;
        
        let q = collection(db, collectionName);
        
        // إضافة شروط where
        conditions.forEach(condition => {
            q = query(q, where(condition.field, condition.operator, condition.value));
        });
        
        // إضافة ترتيب
        q = query(q, orderBy(orderByField, orderDirection));
        
        // إضافة الترقيم
        if (lastDoc) {
            q = query(q, startAfter(lastDoc));
        }
        
        if (firstDoc) {
            q = query(q, endBefore(firstDoc));
        }
        
        q = query(q, limit(pageSize));
        
        const querySnapshot = await getDocs(q);
        const documents = [];
        
        querySnapshot.forEach((doc) => {
            documents.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
        const firstVisible = querySnapshot.docs[0];
        
        return {
            documents,
            lastVisible,
            firstVisible,
            hasMore: documents.length === pageSize
        };
    } catch (error) {
        console.error(`Error getting paginated documents from ${collectionName}:`, error);
        throw error;
    }
}

// ============ Real-time Listeners ============

/**
 * الاستماع للتغييرات على مستند
 * @param {string} collectionName - اسم المجموعة
 * @param {string} docId - معرف المستند
 * @param {Function} callback - دالة الاستدعاء
 * @returns {Function} دالة إلغاء الاستماع
 */
function listenToDocument(collectionName, docId, callback) {
    const docRef = doc(db, collectionName, docId);
    return onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
            callback({
                id: docSnap.id,
                ...docSnap.data()
            });
        } else {
            callback(null);
        }
    });
}

/**
 * الاستماع للتغييرات على مجموعة
 * @param {string} collectionName - اسم المجموعة
 * @param {Function} callback - دالة الاستدعاء
 * @param {Array} conditions - شروط
 * @returns {Function} دالة إلغاء الاستماع
 */
function listenToCollection(collectionName, callback, conditions = []) {
    let q = collection(db, collectionName);
    
    conditions.forEach(condition => {
        q = query(q, where(condition.field, condition.operator, condition.value));
    });
    
    return onSnapshot(q, (querySnapshot) => {
        const documents = [];
        querySnapshot.forEach((doc) => {
            documents.push({
                id: doc.id,
                ...doc.data()
            });
        });
        callback(documents);
    });
}

// ============ Import onSnapshot ============
import { onSnapshot } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

// ============ Export ============
export {
    // Collections
    COLLECTIONS,
    
    // Read
    getDocument,
    getDocuments,
    getAllDocuments,
    getDocumentsInParallel,
    getDocumentsByIds,
    
    // Write
    createDocument,
    setDocument,
    updateDocument,
    deleteDocument,
    
    // Batch
    createDocumentsBatch,
    updateDocumentsBatch,
    deleteDocumentsBatch,
    
    // Specialized
    queryDocuments,
    queryDocumentsWithMultipleConditions,
    getDocumentsByDate,
    getTodayDocuments,
    countDocuments,
    
    // Pagination
    getPaginatedDocuments,
    
    // Real-time
    listenToDocument,
    listenToCollection
};