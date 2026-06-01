document.getElementById("form-login").addEventListener("submit", async (e) => {
    e.preventDefault(); // Mencegah reload halaman formalitas form

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const errorAlert = document.getElementById("error-alert");
    const btnSubmit = document.getElementById("btn-submit");

    // Sesuaikan dengan URL login API Laravel kamu (yang biasa ditembak Flutter)
    const LOGIN_URL = "http://127.0.0.1:8000/api/login"; 

    errorAlert.classList.add("d-none");
    btnSubmit.innerText = "Memproses...";
    btnSubmit.disabled = true;

    try {
        const response = await fetch(LOGIN_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({ email, password })
        });

        const hasil = await response.json();

        if (response.ok) {
            // LOGIN SUKSES! 
            // Simpan token token dari Laravel (misal namanya token atau token_akses)
            const token = hasil.token || hasil.access_token || hasil.data?.token;
            
            localStorage.setItem("token_simpasda", token);
            
            // Alihkan user langsung ke halaman jenis sampah (atau dashboard nanti)
            window.location.href = "jenis_sampah.html"; 
        } else {
            // LOGIN GAGAL (Password salah, dll)
            errorAlert.innerText = hasil.message || "Email atau password salah!";
            errorAlert.classList.remove("d-none");
        }
    } catch (error) {
        console.error("Error login:", error);
        errorAlert.innerText = "Tidak dapat terhubung ke server Laravel.";
        errorAlert.classList.remove("d-none");
    } finally {
        btnSubmit.innerText = "Masuk";
        btnSubmit.disabled = false;
    }
});