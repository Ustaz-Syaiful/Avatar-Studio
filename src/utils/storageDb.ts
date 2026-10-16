import { SavedAvatarRecord } from '../types';

const DB_NAME = 'AvatarKuStudioDB';
const DB_VERSION = 1;
const STORE_NAME = 'saved_avatars';

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) {
      reject(new Error('IndexedDB not supported'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('created_at', 'created_at', { unique: false });
        store.createIndex('student_name', 'student_name', { unique: false });
        store.createIndex('class_name', 'class_name', { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveLocalAvatar(record: SavedAvatarRecord): Promise<void> {
  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(record);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('IndexedDB failed, fallback to localStorage', err);
    try {
      const existing = getLocalStorageAvatars();
      const filtered = existing.filter((a) => a.id !== record.id);
      filtered.unshift(record);
      // Keep only last 10 in localStorage to avoid quota limits
      localStorage.setItem('avatarku_saved_avatars', JSON.stringify(filtered.slice(0, 10)));
    } catch (e) {
      console.error('LocalStorage write failed:', e);
    }
  }
}

export async function getLocalAvatars(): Promise<SavedAvatarRecord[]> {
  try {
    const db = await openDatabase();
    return await new Promise<SavedAvatarRecord[]>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => {
        const results = (req.result as SavedAvatarRecord[]) || [];
        // Sort descending by created_at
        results.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        resolve(results);
      };
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('IndexedDB read failed, fallback to localStorage', err);
    return getLocalStorageAvatars();
  }
}

export async function deleteLocalAvatar(id: string): Promise<void> {
  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('IndexedDB delete failed, fallback to localStorage', err);
  }

  try {
    const existing = getLocalStorageAvatars().filter((a) => a.id !== id);
    localStorage.setItem('avatarku_saved_avatars', JSON.stringify(existing));
  } catch {
    // Ignore
  }
}

function getLocalStorageAvatars(): SavedAvatarRecord[] {
  try {
    const data = localStorage.getItem('avatarku_saved_avatars');
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}
