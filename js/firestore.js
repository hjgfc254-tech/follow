// ============================================
// js/firestore.js
// SchoolHub Pro - Firestore Operations
// منصة مدارس الجيل الجديد
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
    writeBatch,
    serverTimestamp,
    Timestamp,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

// ============ Collection Names ============
const COLLECTIONS = {
    USERS: 'users',
    STUDENTS: 'students',
    TEACHERS: 'teachers',
    ADMINS: 'admins',
    STAGES: 'stages',
    CLASSES: 'classes',
    ANNOUNCEMENTS: 'announcements',
    MESSAGES: 'messages',
    EVENTS: 'events',
    SETTINGS: 'settings',
    SYSTEM_LOGS: 'system_logs',
    NOTIFICATIONS: 'notifications'
};

// ============ Read Operations ============

/**
 * الحصول على مستند واحد
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
 * الحصول على مستندات متعددة بشروط
 */
async function getDocuments(collectionName, conditions = [], options = {}) {
    try {
        let q = collection(db, collectionName);
        
        conditions.forEach(condition => {
            q = query(q, where(condition.field, condition.operator, condition.value));
        });
        
        if (options.orderBy) {
            q = query(q, orderBy(options.orderBy, options.orderDirection || 'asc'));
        }
        
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
 */
async function getAllDocuments(collectionName, options = {}) {
    return await getDocuments(collectionName, [], options);
}

/**
 * الحصول على مستندات بالتوازي
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
 * الحصول على مستندات متعددة بمعرفاتها
 */
async function getDocumentsByIds(collectionName, docIds) {
    try {
        if (!docIds || docIds.length === 0) return [];
        
        const documents = [];
        
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
 * الحصول على الطلاب المسندين لمدرس (حسب الفصول)
 */
async function getStudentsByClassIds(classIds) {
    try {
        if (!classIds || classIds.length === 0) return [];
        
        // تقسيم الفصول لدفعات من 10 (حد Firestore للـ in query)
        const allStudents = [];
        
        for (let i = 0; i < classIds.length; i += 10) {
            const batch = classIds.slice(i, i + 10);
            const q = query(
                collection(db, COLLECTIONS.STUDENTS),
                where('classId', 'in', batch),
                where('status', '==', 'active')
            );
            
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach((doc) => {
                allStudents.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
        }
        
        return allStudents;
    } catch (error) {
        console.error('Error getting students by class IDs:', error);
        throw error;
    }
}

/**
 * الحصول على طلاب مرحلة معينة
 */
async function getStudentsByStageId(stageId) {
    return await getDocuments(COLLECTIONS.STUDENTS, [
        { field: 'stageId', operator: '==', value: stageId }
    ]);
}

/**
 * الحصول على طلاب فصل معين
 */
async function getStudentsByClassId(classId) {
    return await getDocuments(COLLECTIONS.STUDENTS, [
        { field: 'classId', operator: '==', value: classId }
    ]);
}

/**
 * تسجيل دخول بالكود وكلمة المرور
 */
async function loginWithCode(code, password) {
    try {
        const userDoc = await getDocument(COLLECTIONS.USERS, code);
        
        if (!userDoc) {
            throw new Error('المستخدم غير موجود');
        }
        
        if (userDoc.status !== 'active') {
            throw new Error('الحساب غير نشط');
        }
        
        if (userDoc.password !== password) {
            throw new Error('كلمة المرور غير صحيحة');
        }
        
        return userDoc;
    } catch (error) {
        throw error;
    }
}

// ============ Pagination ============

/**
 * الحصول على مستندات مع الترقيم
 */
async function getPaginatedDocuments(collectionName, options = {}) {
    try {
        const {
            conditions = [],
            orderByField = 'createdAt',
            orderDirection = 'desc',
            pageSize = 20,
            lastDoc = null
        } = options;
        
        let q = collection(db, collectionName);
        
        conditions.forEach(condition => {
            q = query(q, where(condition.field, condition.operator, condition.value));
        });
        
        q = query(q, orderBy(orderByField, orderDirection));
        
        if (lastDoc) {
            q = query(q, startAfter(lastDoc));
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
        
        return {
            documents,
            lastVisible,
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
    getStudentsByClassIds,
    getStudentsByStageId,
    getStudentsByClassId,
    loginWithCode,
    
    // Pagination
    getPaginatedDocuments,
    
    // Real-time
    listenToDocument,
    listenToCollection
};