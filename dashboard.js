document.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem("token_simpasda");

    // 1. Validasi Login
    if (!token) {
        window.location.href = "login.html";
        return;
    }

    // 2. Load Sidebar secara Otomatis
    try {
        const responseSidebar = await fetch("sidebar.html");
        const htmlSidebar = await responseSidebar.text();
        document.getElementById("sidebar-container").innerHTML = htmlSidebar;
        
        // Tandai menu Dashboard sedang aktif (warna hijau menyala)
        document.getElementById("menu-dashboard").classList.add("active");
    } catch (err) {
        console.error("Gagal memuat sidebar:", err);
    }

    // 3. Ambil Data Ringkasan dari API Laravel
    // Sesuaikan URL ini dengan endpoint dashboard yang biasa kamu pakai di Laravel
    const API_DASHBOARD = "http://127.0.0.1:8000/api/dashboard-stats"; 

    fetch(API_DASHBOARD, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Accept": "application/json"
        }
    })
    .then(response => response.json())
    .then(hasil => {
        // Sesuaikan nama properti object di bawah ini dengan respon JSON asli dari Laravelmu
        document.getElementById("total-nasabah").innerText = hasil.total_nasabah || 0;
        document.getElementById("total-kurir").innerText = hasil.total_kurir || 0;
        document.getElementById("total-transaksi").innerText = hasil.total_transaksi || 0;
    })
    .catch(error => {
        console.error("Gagal mengambil data statistik dashboard:", error);
    });
});

// 4. Fungsi Logout Global
function logout() {
    if (confirm("Apakah Anda yakin ingin keluar?")) {
        localStorage.removeItem("token_simpasda");
        window.location.href = "login.html";
    }
}