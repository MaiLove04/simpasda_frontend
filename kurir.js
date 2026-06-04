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
            const menuKurir = document.getElementById("menu-kurir");
            if (menuKurir) menuKurir.classList.add("active");
        })
        .catch(err => console.error("Gagal memuat sidebar:", err));

    // Inisialisasi Modal Bootstrap 5 global
    const kurirModalEl = document.getElementById('kurirModal');
    const modalBootstrap = new bootstrap.Modal(kurirModalEl);
    let dataKurirGlobal = [];

    const API_URL = "http://127.0.0.1:8000/api/kurir"; 
    const containerTabel = document.getElementById("tabel-kurir");

    // Helper Headers agar tidak menulis ulang token berkali-kali
    const getHeaders = (isMultipart = false) => {
        const headers = {
            "Authorization": `Bearer ${token}`,
            "Accept": "application/json"
        };
        // Jika kirim JSON biasa (seperti DELETE), tambahkan Content-Type. 
        // Jika kirim FormData (Upload Foto), biarkan browser menentukan boundary-nya sendiri (isMultipart = true)
        if (!isMultipart) {
            headers["Content-Type"] = "application/json";
        }
        return headers;
    };

    // =========================================================================
    // 3. AMBIL DATA DARI API LARAVEL (READ)
    // =========================================================================
    function fetchDataKurir() {
        fetch(API_URL, {
            method: "GET",
            headers: getHeaders()
        })
        .then(response => {
            if (response.status === 401) {
                localStorage.removeItem("token_simpasda");
                window.location.href = "login.html";
            }
            return response.json();
        })
        .then(hasil => {
            if (hasil.status === 'success' || hasil.data) {
                dataKurirGlobal = hasil.data || hasil;
                
                if (dataKurirGlobal.length === 0) {
                    containerTabel.innerHTML = `
                        <tr>
                            <td colspan="7" class="text-muted py-4">Belum ada armada kurir terdaftar.</td>
                        </tr>`;
                    return;
                }

                let barisHtml = "";
                dataKurirGlobal.forEach((item, index) => {
                    // Penanganan URL Foto Profil
                    const fotoUrl = item.foto ? `http://127.0.0.1:8000/${item.foto}` : 'https://placehold.co/100x100?text=No+Image';

                    // Status badge penanda akun aktif/belum disetujui
                    const statusBadge = item.status === 'approved' || item.status === 'aktif'
                        ? `<span class="badge bg-success-subtle text-success border border-success-subtle px-2 py-1 rounded-pill small">Aktif</span>`
                        : `<span class="badge bg-warning-subtle text-warning border border-warning-subtle px-2 py-1 rounded-pill small">Pending</span>`;

                    barisHtml += `
                        <tr>
                            <td class="fw-medium">${index + 1}</td>
                            <td>
                                <img src="${fotoUrl}" class="avatar-table border shadow-sm" alt="Foto ${item.name}">
                            </td>
                            <td class="fw-semibold text-start text-dark">${item.name || item.nama}</td>
                            <td class="text-start small">
                                <div class="fw-medium"><i class="bi bi-envelope me-1 text-muted"></i>${item.email}</div>
                                <div class="text-muted"><i class="bi bi-whatsapp me-1 text-success"></i>${item.no_hp || item.no_telp || '-'}</div>
                            </td>
                            <td class="text-start small text-muted text-truncate" style="max-w-xs">${item.alamat || '-'}</td>
                            <td>${statusBadge}</td>
                            <td>
                                <div class="d-flex justify-content-center gap-1">
                                    <a href="detail_kurir.html?id=${item.id}" class="btn btn-sm btn-outline-primary py-1 px-2" title="Pantau">
                                        <i class="bi bi-search"></i>
                                    </a>
                                    <button type="button" class="btn btn-sm btn-outline-warning py-1 px-2 btn-edit-kurir" data-id="${item.id}" title="Edit">
                                        <i class="bi bi-pencil-square"></i>
                                    </button>
                                    <button type="button" class="btn btn-sm btn-outline-danger py-1 px-2 btn-hapus-kurir" data-id="${item.id}" title="Hapus">
                                        <i class="bi bi-trash"></i>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    `;
                });

                containerTabel.innerHTML = barisHtml;
                inisialisasiTombolAksi(); // Daftarkan event listener untuk tombol baru
            }
        })
        .catch(error => {
            console.error("Error muat data kurir:", error);
            containerTabel.innerHTML = `
                <tr>
                    <td colspan="7" class="text-danger py-4">Gagal mengambil data armada dari server.</td>
                </tr>`;
        });
    }

    // Jalankan fungsi load data pertama kali halaman siap
    fetchDataKurir();

    // =========================================================================
    // 4. LOGIKA MODAL (OPEN ADD / EDIT)
    // =========================================================================
    window.openKurirModal = function(mode, id = null) {
        const form = document.getElementById('form-kurir');
        form.reset();
        
        const labelModal = document.getElementById('kurirModalLabel');
        const pwdHint = document.getElementById('pwd-hint');
        const wrapperBank = document.getElementById('wrapper-bank-sampah');
        const inputId = document.getElementById('kurir-id');

        if (mode === 'add') {
            labelModal.innerText = "Tambah Kurir Lapangan Baru";
            inputId.value = "";
            document.getElementById('password').required = true;
            pwdHint.classList.add('d-none');
            wrapperBank.classList.remove('d-none');
        } else {
            labelModal.innerText = "Ubah Data Kurir Lapangan";
            document.getElementById('password').required = false;
            pwdHint.classList.remove('d-none');
            wrapperBank.classList.add('d-none');

            const kurir = dataKurirGlobal.find(item => item.id == id);
            if (kurir) {
                inputId.value = kurir.id;
                document.getElementById('name').value = kurir.name;
                document.getElementById('email').value = kurir.email;
                document.getElementById('no_hp').value = kurir.no_hp || kurir.no_telp || '';
                document.getElementById('alamat').value = kurir.alamat || '';
            }
        }
        modalBootstrap.show();
    };

    // Binding event klik ke tombol Edit & Hapus dinamis di tabel
    function inisialisasiTombolAksi() {
        document.querySelectorAll('.btn-edit-kurir').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                openKurirModal('edit', id);
            });
        });

        document.querySelectorAll('.btn-hapus-kurir').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                deleteKurir(id);
            });
        });
    }

    // =========================================================================
    // 5. PROSES SIMPAN / PERBARUI DATA (STORE & UPDATE)
    // =========================================================================
    document.getElementById('form-kurir').addEventListener('submit', function(e) {
        e.preventDefault();

        const id = document.getElementById('kurir-id').value;
        const formData = new FormData();

        formData.append('name', document.getElementById('name').value);
        formData.append('email', document.getElementById('email').value);
        formData.append('no_hp', document.getElementById('no_hp').value);
        formData.append('alamat', document.getElementById('alamat').value);

        const password = document.getElementById('password').value;
        if (password) formData.append('password', password);

        const fileFoto = document.getElementById('foto').files[0];
        if (fileFoto) formData.append('foto', fileFoto);

        let finalUrl = API_URL;
        
        if (id) {
            // Mode EDIT: Menggunakan Form Method Spoofing agar Laravel membaca sebagai PUT
            finalUrl = `${API_URL}/${id}`;
            formData.append('_method', 'PUT');
        } else {
            // Mode TAMBAH
            formData.append('bank_sampah_id', document.getElementById('bank_sampah_id').value);
        }

        fetch(finalUrl, {
            method: 'POST', // Tetap POST karena upload file multipart tidak mendukung native PUT di PHP lama
            headers: getHeaders(true), // true menyatakan multipart
            body: formData
        })
        .then(async response => {
            const result = await response.json();
            if (response.ok) {
                showNotification('success', result.message || 'Data kurir berhasil diproses!');
                modalBootstrap.hide();
                fetchDataKurir(); // Refresh data tabel
            } else {
                showNotification('danger', result.message || 'Terjadi kesalahan validasi.');
            }
        })
        .catch(err => {
            console.error(err);
            showNotification('danger', 'Gagal memproses data ke server.');
        });
    });

    // =========================================================================
    // 6. PROSES HAPUS (DESTROY)
    // =========================================================================
    function deleteKurir(id) {
        if (confirm("Apakah Anda yakin ingin menghapus data kurir ini secara permanen?")) {
            fetch(`${API_URL}/${id}`, {
                method: 'DELETE',
                headers: getHeaders()
            })
            .then(async response => {
                const result = await response.json();
                if (response.ok) {
                    showNotification('success', result.message || 'Kurir berhasil dihapus.');
                    fetchDataKurir();
                } else {
                    showNotification('danger', result.message || 'Gagal menghapus kurir.');
                }
            })
            .catch(err => {
                console.error(err);
                showNotification('danger', 'Koneksi ke server terputus.');
            });
        }
    }

    // Helper Notifikasi Alert Dinamis
    function showNotification(type, message) {
        const alertContainer = document.getElementById('alert-container');
        alertContainer.innerHTML = `
            <div class="alert alert-${type} alert-dismissible fade show shadow-sm" role="alert">
                <i class="bi ${type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'} me-2"></i>
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        `;
        setTimeout(() => {
            const alertNode = document.querySelector('.alert');
            if (alertNode) {
                const bsAlert = new bootstrap.Alert(alertNode);
                bsAlert.close();
            }
        }, 4000);
    }
});