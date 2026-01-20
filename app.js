// ================= CONFIG =================
const API_BASE = "https://doc-api.azure-api.net";
const SUBSCRIPTION_KEY = "d71c1f8055294405bbe865843739cca4";

const fileInput = document.getElementById("fileInput");
const uploadBtn = document.getElementById("uploadBtn");
const tableBody = document.getElementById("fileTableBody");

// ================= COMMON HEADERS =================
function apiHeaders(extra = {}) {
  return {
    "Ocp-Apim-Subscription-Key": SUBSCRIPTION_KEY,
    ...extra
  };
}

// ================= LOAD DOCUMENTS =================
async function loadDocuments() {
  try {
    const res = await fetch(`${API_BASE}/documents`, {
      headers: apiHeaders()
    });

    if (!res.ok) throw new Error(await res.text());

    const docs = await res.json();
    tableBody.innerHTML = "";

    if (!Array.isArray(docs) || docs.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="3" class="empty">No documents found</td>
        </tr>`;
      return;
    }

    docs.forEach(doc => {
      tableBody.innerHTML += `
        <tr>
          <td>${doc.name}</td>
          <td>${(doc.size / 1024).toFixed(1)} KB</td>
          <td class="actions">
            <button onclick="downloadFile('${encodeURIComponent(doc.name)}')">
              Download
            </button>
            <button onclick="confirmDelete('${doc.id}', '${doc.name}')">
              Delete
            </button>
          </td>
        </tr>`;
    });
  } catch (err) {
    console.error("Load failed:", err);
    alert("Failed to load documents");
  }
}

// ================= UPLOAD =================
uploadBtn.onclick = async () => {
  const file = fileInput.files[0];
  if (!file) return alert("Select a file");

  const formData = new FormData();
  formData.append("file", file);

  try {
    const res = await fetch(`${API_BASE}/documents`, {
      method: "POST",
      body: formData
      // ⚠️ DO NOT set headers for multipart
    });

    if (!res.ok) throw new Error(await res.text());

    fileInput.value = "";
    await loadDocuments();
    alert("Upload successful ✅");
  } catch (err) {
    console.error("Upload failed:", err);
    alert("Upload failed");
  }
};

// ================= DOWNLOAD =================
async function downloadFile(encodedName) {
  const name = decodeURIComponent(encodedName);

  try {
    const res = await fetch(
      `${API_BASE}/documents/download?name=${encodeURIComponent(name)}`,
      {
        method: "GET",
        headers: {
          "Ocp-Apim-Subscription-Key": SUBSCRIPTION_KEY
        }
      }
    );

    if (!res.ok) {
      throw new Error(await res.text());
    }

    const blob = await res.blob();

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();

    a.remove();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error("Download failed:", err);
    alert("Download failed");
  }
}

// ================= DELETE =================
let deleteTarget = {};

function confirmDelete(id, name) {
  deleteTarget = { id, name };
  document.getElementById("modalOverlay").classList.remove("hidden");
}

document.getElementById("confirmDelete").onclick = async () => {
  try {
    const res = await fetch(
      `${API_BASE}/documents/${deleteTarget.id}`,
      {
        method: "DELETE",
        headers: apiHeaders()
      }
    );

    if (!res.ok) throw new Error(await res.text());

    document.getElementById("modalOverlay").classList.add("hidden");
    loadDocuments();
  } catch (err) {
    console.error("Delete failed:", err);
    alert("Delete failed");
  }
};

document.getElementById("cancelDelete").onclick = () => {
  document.getElementById("modalOverlay").classList.add("hidden");
};

// ================= INIT =================
loadDocuments();
