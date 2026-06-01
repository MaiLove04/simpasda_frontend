document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token_simpasda");

    // 1. Proteksi Halaman
    if (!token) {
        window.location.href = "login.html";
        return;
    }

    // 2. Load Sidebar Dinamis
    fetch("sidebar.html")
        .then(res => res.text())
        .then(html => {
            document.getElementById("sidebar-container").innerHTML = html;
            // Aktifkan menu Data Kurir di sidebar
            document.getElementById("menu-kurir").classList.add("active");
        })
        .catch(err => console.error("Gagal memuat sidebar:", err));

    // 3. Ambil Data dari API Laravel
    const API_URL = "http://127.0.0.1:8000/api/kurir"; 
    const containerTabel = document.getElementById("tabel-kurir");

    fetch(API_URL, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Accept": "application/json",
            "Content-Type": "application/json"
        }
    })
    .then(response => {
        if (response.status === 401) {
            localStorage.removeItem("token_simpasda");
            window.location.href = "login.html";
        }
        return response.json();
    })
    .then(hasil => {
        const listKurir = hasil.data || hasil;

        if (listKurir.length === 0) {
            containerTabel.innerHTML = `
                <tr>
                    <td colspan="6" class="text-muted py-4">Belum ada armada kurir terdaftar.</td>
                </tr>`;
            return;
        }

        let barisHtml = "";

        listKurir.forEach((item, index) => {
            // Status badge penanda akun aktif/belum disetujui
            const statusBadge = item.status === 'approved' || item.status === 'aktif'
                ? `<span class="badge bg-success">Aktif</span>`
                : `<span class="badge bg-warning text-dark">Pending</span>`;

            barisHtml += `
                <tr>
                    <td>${index + 1}</td>
                    <td class="fw-semibold text-start text-dark px-3">${item.name || item.nama}</td>
                    <td>${item.email}</td>
                    <td>${item.no_telp || item.telepon || '-'}</td>
                    <td>${statusBadge}</td>
                    <td>
                        <div class="d-flex justify-content-center gap-2">
                            <a href="detail_kurir.html?id=${item.id}" class="btn btn-outline-primary btn-sm rounded-3">
                                <i class="bi bi-search"></i> Pantau
                            </a>
                        </div>
                    </td>
                </tr>
            `;
        });

        containerTabel.innerHTML = barisHtml;
    })
    .catch(error => {
        console.error("Error muat data kurir:", error);
        containerTabel.innerHTML = `
            <tr>
                <td colspan="6" class="text-danger py-4">
                    Gagal mengambil data armada dari server.
                </td>
            </tr>`;
    });
});