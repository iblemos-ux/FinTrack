
// Mock window.storage if it doesn't exist to satisfy the user's snippet requirement
if (!(window as any).storage) {
  (window as any).storage = {
    get: async (key: string) => {
      console.log(`[Storage] GET ${key}`);
      const data = localStorage.getItem(key);
      console.log(`[Storage] Raw data for ${key}:`, data ? "Found (length " + data.length + ")" : "NULL");
      return data ? JSON.parse(data) : null;
    },
    set: async (key: string, value: any) => {
      console.log(`[Storage] SET ${key}`, value);
      try {
        localStorage.setItem(key, JSON.stringify(value));
        console.log(`[Storage] Success saving ${key}`);
      } catch (err) {
        console.error(`[Storage] Error saving ${key}`, err);
      }
    }
  };
}

export const storage = (window as any).storage;
