// ================= CONFIG =================
const API = "https://doc-api.azure-api.net";

const fileInput = document.getElementById("fileInput");
const uploadBtn = document.getElementById("uploadBtn");
const tableBody = document.getElementById("fileTableBody");

// ================= LOAD DOCUMENTS =================
async function loadDocuments() {
  try {
    const res = await fetch(`${API}/documents`);
    if (!res.ok) throw new Error("Failed to load documents");

    const docs = await res.json();
    tableBody.innerHTML = "";

    if (!docs.length) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="3" class="empty">No documents found</td>
        </tr>`;
      return;
    }

    docs.forEach(d => {
      tableBody.innerHTML += `
        <tr>
          <td>${d.name}</td>
          <td>${(d.size / 1024).toFixed(1)} KB</td>
          <td class="actions">
            <button class="download" onclick="downloadFile('${d.name}')">
              Download
            </button>
            <button class="delete" onclick="confirmDelete('${d.id}','${d.name}')">
              Delete
            </button>
          </td>
        </tr>`;
    });
  } catch (err) {
    console.error(err);
    alert("Error loading documents");
  }
}

// ================= UPLOAD DOCUMENT =================
uploadBtn.onclick = async () => {
  const file = fileInput.files[0];
  if (!file) {
    alert("Please select a file");
    return;
  }

  const formData = new FormData();
  formData.append("file", file);

  try {
    const res = await fetch(`${API}/documents`, {
      method: "POST",
      body: formData   // 🚨 DO NOT SET CONTENT-TYPE
    });

    if (!res.ok) {
      const text = await res.text();
      console.error(text);
      alert("Upload failed");
      return;
    }

    fileInput.value = "";
    await loadDocuments();
    alert("Upload successful ✅");
  } catch (err) {
    console.error(err);
    alert("Upload error");
  }
};

// ================= DOWNLOAD =================
function downloadFile(name) {
  window.location.href = `${API}/documents/download?name=${encodeURIComponent(name)}`;
}

// ================= DELETE =================
let deleteTarget = {};

function confirmDelete(id, name) {
  deleteTarget = { id, name };
  document.getElementById("modalOverlay").classList.remove("hidden");
}

document.getElementById("confirmDelete").onclick = async () => {
  try {
    await fetch(`${API}/documents?id=${deleteTarget.id}&name=${deleteTarget.name}`, {
      method: "DELETE"
    });

    document.getElementById("modalOverlay").classList.add("hidden");
    loadDocuments();
  } catch (err) {
    console.error(err);
    alert("Delete failed");
  }
};

document.getElementById("cancelDelete").onclick = () => {
  document.getElementById("modalOverlay").classList.add("hidden");
};

// ================= INIT =================
loadDocuments();
