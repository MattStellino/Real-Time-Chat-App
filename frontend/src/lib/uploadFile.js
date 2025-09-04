// uploadFile.js
import { CONFIG } from '../config';

// Usage: uploadFile(file, { onProgress, token, useCookies, signalRef })
export function uploadFile(file, opts = {}) {
  const { onProgress, token, useCookies = false, url = `${CONFIG.API_URL}/api/message/upload`, signalRef } = opts;

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    
    // Store xhr reference for cancellation
    if (signalRef) {
      signalRef.current = xhr;
    }
    
    xhr.open("POST", url);

    // If your API uses cookies (session auth), enable this:
    if (useCookies) {
      xhr.withCredentials = true; // requires server CORS to allow credentials
    }

    // If your API uses JWT in headers:
    if (token) {
      xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    }

    // IMPORTANT: don't set Content-Type manually for FormData
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () => {
      try {
        const json = JSON.parse(xhr.responseText || "{}");
        if (xhr.status >= 200 && xhr.status < 300) return resolve(json);
        if (xhr.status === 401) return reject(new Error("Unauthorized (401): check token/cookies"));
        return reject(new Error(json.error || `Upload failed (${xhr.status})`));
      } catch (e) {
        reject(new Error(`Upload parse error: ${e.message}`));
      }
    };

    xhr.onerror = () => reject(new Error("Network error during upload"));
    xhr.onabort = () => reject(new Error("Upload cancelled"));

    const fd = new FormData();
    fd.append("file", file);
    xhr.send(fd);
  });
}
