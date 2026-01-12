const API_BASE =
  "https://doc-apim-gateway.azure-api.net/doc-functions-api";

document.addEventListener("DOMContentLoaded", loadDocuments);

async function loadDocuments() {
  const res = await fetch(`${API_BASE}/documents`);
  const docs = await res.json();

  const table = document.getElementById("documentsTable");
  table.innerHTML = "";

  docs.forEach(doc => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${doc.name}</td>
      <td>${doc.size || "-"}</td>
      <td>
        <button onclick="deleteDocument('${doc.id}')">Delete</button>
      </td>
    `;

    table.appendChild(row);
  });
}

async function deleteDocument(id) {
  if (!confirm("Delete this document?")) return;

  await fetch(`${API_BASE}/documents/${id}`, {
    method: "DELETE"
  });

  loadDocuments();
}

document.getElementById("uploadBtn").onclick = async () => {
  const file = document.getElementById("fileInput").files[0];
  if (!file) return alert("Choose a file first");

  const formData = new FormData();
  formData.append("file", file);

  await fetch(`${API_BASE}/documents`, {
    method: "POST",
    body: formData
  });

  document.getElementById("fileInput").value = "";
  loadDocuments();
};
