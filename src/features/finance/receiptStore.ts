export interface ClaimReceipt {
  id: string;
  name: string;
  type: string;
  size: number;
}

async function openStore(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("pantiss-claim-receipts", 1);
    request.onupgradeneeded = () => request.result.createObjectStore("receipts");
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveReceipts(files: File[]): Promise<ClaimReceipt[]> {
  if (!files.length) return [];
  const db = await openStore();
  const receipts = files.map((file) => ({ id: crypto.randomUUID(), name: file.name, type: file.type, size: file.size }));
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction("receipts", "readwrite");
      const store = transaction.objectStore("receipts");
      files.forEach((file, index) => store.put(file, receipts[index].id));
      transaction.oncomplete = () => resolve();
      transaction.onabort = () => reject(transaction.error);
      transaction.onerror = () => reject(transaction.error);
    });
    return receipts;
  } finally { db.close(); }
}

export async function loadReceipt(id: string): Promise<Blob | undefined> {
  const db = await openStore();
  try {
    return await new Promise<Blob | undefined>((resolve, reject) => {
      const request = db.transaction("receipts").objectStore("receipts").get(id);
      request.onsuccess = () => resolve(request.result instanceof Blob ? request.result : undefined);
      request.onerror = () => reject(request.error);
    });
  } finally { db.close(); }
}
