export interface TaxFiling {
  id: string;
  filedDate: string;
  reference: string;
  document: File;
  updatedAt: string;
}

async function database() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open("pantiss-tax-filings", 1);
    request.onupgradeneeded = () => request.result.createObjectStore("filings", { keyPath: "id" });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error("Close other tabs and try again."));
  });
}

export async function loadTaxFilings(): Promise<TaxFiling[]> {
  const db = await database();
  try {
    return await new Promise((resolve, reject) => {
      const request = db.transaction("filings").objectStore("filings").getAll();
      request.onsuccess = () => resolve(request.result as TaxFiling[]);
      request.onerror = () => reject(request.error);
    });
  } finally { db.close(); }
}

export async function saveTaxFiling(filing: TaxFiling): Promise<void> {
  const db = await database();
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction("filings", "readwrite");
      transaction.objectStore("filings").put(filing);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error);
    });
  } finally { db.close(); }
}
