const API = "https://doc-apim-gateway.azure-api.net/doc-functions-api";
const table = document.getElementById("documentsTable");
const fileInput = document.getElementById("fileInput");

async function loadDocuments() {
  const res = await fetch(`${API}/documents`);
  const docs = await res.json();
  table.innerHTML = "";

  docs.forEach(d => {
    table.innerHTML += `
      <tr>
        <td>${d.name}</td>
        <td>${(d.size / 1024).toFixed(1)} KB</td>
        <td>
          <button onclick="download('${d.name}')">Download</button>
          <button onclick="confirmDelete('${d.id}','${d.name}')">Delete</button>
        </td>
      </tr>`;
  });
}

document.getElementById("uploadBtn").onclick = async () => {
  const file = fileInput.files[0];
  if (!file) return alert("Select file");

  const reader = new FileReader();
  reader.onload = async () => {
    const base64 = reader.result.split(",")[1];

    await fetch(`${API}/documents`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: file.name, content: base64 })
    });

    loadDocuments();
  };
  reader.readAsDataURL(file);
};

function download(name) {
  window.location = `${API}/documents/download?name=${name}`;
}

/* Delete modal */
let del = {};

function confirmDelete(id, name) {
  del = { id, name };
  document.getElementById("modalOverlay").classList.remove("hidden");
}

document.getElementById("confirmDelete").onclick = async () => {
  await fetch(`${API}/documents?id=${del.id}&name=${del.name}`, {
    method: "DELETE"
  });
  document.getElementById("modalOverlay").classList.add("hidden");
  loadDocuments();
};

document.getElementById("cancelDelete").onclick = () =>
  document.getElementById("modalOverlay").classList.add("hidden");

loadDocuments();
