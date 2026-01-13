const API_BASE = "https://doc-apim-gateway.azure-api.net/doc-functions-api";

const table = document.getElementById("documentsTable");
const uploadBtn = document.getElementById("uploadBtn");
const fileInput = document.getElementById("fileInput");

async function loadDocuments() {
  try {
    const res = await fetch(`${API_BASE}/documents`);
    if (!res.ok) throw new Error("Failed to load");

    const docs = await res.json();
    table.innerHTML = "";

    docs.forEach(doc => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${doc.name}</td>
        <td>${doc.size || "-"}</td>
        <td>
          <button onclick="downloadDoc('${doc.id}')">Download</button>
          <button onclick="confirmDelete('${doc.id}')">Delete</button>
        </td>
      `;
      table.appendChild(row);
    });
  } catch {
    alert("Failed to load documents");
  }
}

uploadBtn.onclick = async () => {
  if (!fileInput.files.length) return alert("Select a file");

  const file = fileInput.files[0];

  const res = await fetch(`${API_BASE}/documents`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: file.name,
      size: file.size
    })
  });

  if (!res.ok) return alert("Upload failed");

  fileInput.value = "";
  loadDocuments();
};

function downloadDoc(id) {
  window.open(`${API_BASE}/documents/${id}/download`);
}

/* DELETE MODAL */
let deleteId = null;

function confirmDelete(id) {
  deleteId = id;
  document.getElementById("modalOverlay").classList.remove("hidden");
}

document.getElementById("cancelDelete").onclick = () => {
  deleteId = null;
  document.getElementById("modalOverlay").classList.add("hidden");
};

document.getElementById("confirmDelete").onclick = async () => {
  await fetch(`${API_BASE}/documents/${deleteId}`, { method: "DELETE" });
  deleteId = null;
  document.getElementById("modalOverlay").classList.add("hidden");
  loadDocuments();
};

loadDocuments();
