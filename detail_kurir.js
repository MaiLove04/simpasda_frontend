document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token_simpasda");
    if (!token) { window.location.href = "login.html"; return; }

    fetch("sidebar.html")
        .then(res => res.text())
        .then(html => {
            document.getElementById("sidebar-container").innerHTML = html;
            document.getElementById("menu-kurir").classList.add("active");
        });

    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');

    if (!id) {
        alert("ID Kurir tidak valid.");
        window.location.href = "kurir.html";
        return;
    }

    fetch(`http://127.0.0.1:8000/api/kurir/${id}`, {
        method: "GET",
        headers: { "Authorization": `Bearer ${token}`, "Accept": "application/json" }
    })
    .then(res => res.json())
    .then(hasil => {
        const data = hasil.data || hasil;
        const container = document.getElementById("detail-container");
        container.classList.remove("text-center", "py-5");
        
        const statusBadge = data.status === 'approved' || data.status === 'aktif'
            ? '<span class="badge bg-success px-3 py-2">Aktif / Disetujui</span>'
            : '<span class="badge bg-warning text-dark px-3 py-2">Pending / Menunggu Review</span>';

        container.innerHTML = `
            <table class="table table-bordered align-middle">
                <tbody>
                    <tr><th width="35%" class="px-3 py-3">Nama Kurir</th><td class="px-3 fw-semibold text-dark">${data.name || data.nama || '-'}</td></tr>
                    <tr><th class="px-3 py-3">Email Akun</th><td class="px-3">${data.email || '-'}</td></tr>
                    <tr><th class="px-3 py-3">Nomor Telepon/WA</th><td class="px-3">${data.no_hp || data.no_telp || data.telepon || '-'}</td></tr>
                    <tr><th class="px-3 py-3">Plat Kendaraan</th><td class="px-3"><span class="badge bg-dark text-white px-3 py-2" style="font-size:14px; letter-spacing:1px;">${data.plat_kendaraan || 'Tidak ada'}</span></td></tr>
                    <tr><th class="px-3 py-3">Status Akun</th><td class="px-3">${statusBadge}</td></tr>
                </tbody>
            </table>
        `;
    })
    .catch(() => { document.getElementById("detail-container").innerHTML = `<p class="text-danger text-center fw-semibold">Gagal memuat data dari server.</p>`; });
});