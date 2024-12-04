import time
import pyqrcode
import tkinter as tk
from tkinter import font as tkFont
from tkinter import font
from tkinter import messagebox ,filedialog
from PIL import Image, ImageTk
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
import io
import re
import pandas
import requests

# Inisialisasi driver di luar fungsi agar dapat diakses secara global
driver = None
# pilih_aksi = tk.StringVar()
btnsave = None
list_entry_add_siswa = []

# Fungsi untuk mengambil dan menampilkan QR code di Tkinter
def fetch_and_show_qr_code():
    global driver, qr_label
    try:
        # Konfigurasi headless browser menggunakan Chrome
        chrome_options = Options()
        chrome_options.add_argument("--headless")
        chrome_options.add_argument("--disable-gpu")
        chrome_options.add_argument('--disable-dev-shm-usage')

        # Inisialisasi WebDriver
        driver = webdriver.Chrome(options=chrome_options)
        driver.get("https://web.whatsapp.com/")
        
        # Tunggu sebentar agar halaman selesai dimuat
        time.sleep(4)
        
        # Tunggu elemen dengan atribut data-ref muncul
        qr_element = driver.find_element("css selector", "div[data-ref]")

        # Dapatkan nilai dari atribut data-ref
        data_ref = qr_element.get_attribute("data-ref")
        
        # Buat QR code dari data-ref
        qr_code = pyqrcode.create(data_ref)

        # Simpan QR code ke dalam stream gambar PNG
        buffer = io.BytesIO()
        qr_code.png(buffer, scale=6)
        buffer.seek(0)

        # Buka gambar menggunakan PIL dan konversi ke format yang bisa digunakan di Tkinter
        qr_image = Image.open(buffer)
        qr_image_tk = ImageTk.PhotoImage(qr_image)

        # Jika ada QR code yang sudah ditampilkan sebelumnya, hapus
        if qr_label is not None:
            qr_label.destroy()

        # Label untuk menampilkan gambar QR code di Tkinter
        qr_label = tk.Label(qr_frame, image=qr_image_tk)
        qr_label.image = qr_image_tk  
        qr_label.pack(pady=20)

    except Exception as e:
        messagebox.showerror("Error", f"Gagal mengambil QR Code: {str(e)}")

# Fungsi ketika tombol login ditekan
# def login():
#     userid = username_entry.get()
#     password = password_entry.get()

#     # Prepare data to send to the backend
#     data = {
#         "username": userid,
#         "password": password
#     }

#     try:
#         # Send POST request to the Node.js login endpoint
#         response = requests.post("http://localhost:3000/login", json=data)

#         # Check the response from the server
#         if response.status_code == 200:
#             result = response.json()
#             if result.get("success") == 1:
#                 token = result.get("data")  # Retrieve the JWT token
#                 messagebox.showinfo("Login Success", "Login successful!")
                
#                 # Clear the login form
#                 username_entry.delete(0, tk.END)
#                 password_entry.delete(0, tk.END)
                
#                 # Switch to the next frame or functionality
#                 login_frame.pack_forget()
#                 menu_frame.pack(fill="both", expand=True)

#                 # Print the token for debugging purposes (you can store it securely if needed)
#                 print("Token:", token)

#             else:
#                 messagebox.showerror("Login Failed", "Invalid credentials")
#         else:
#             # If the server returned an error response
#             error_message = response.json().get("errors", [{"msg": "Unknown error"}])[0]["msg"]
#             messagebox.showerror("Login Failed", error_message)

#     except requests.exceptions.RequestException as e:
#         # Handle connection errors
#         messagebox.showerror("Error", f"Failed to connect to the backend: {e}")
def login():
    userid = email_entry.get()
    password = password_entry.get()

    if userid == "admin" and password == "admin":
        # Pindah ke frame QR Code
        email_entry.delete(0, tk.END)
        password_entry.delete(0, tk.END)
        login_frame.pack_forget()
        menu_frame.pack(fill="both", expand=True)
        # fetch_and_show_qr_code()
    else:
        messagebox.showerror("Login Failed", "Invalid username or password")

# Fungsi untuk menampilkan QR Code dan cek login       
def qrcode():
    menu_frame.pack_forget()
    qr_frame.pack(fill="both", expand=True)
    fetch_and_show_qr_code()
    check_login_status()

# Fungsi untuk exit       
def exite():
    menu_frame.pack_forget()
    login_frame.pack(fill="both", expand=True)

# Fungsi untuk mengecek login setiap beberapa detik
def check_login_status():
    if is_logged_in():
        qr_frame.pack_forget()
        absen_frame.pack(fill="both", expand=True)
    else:
        # Cek lagi dalam 5 detik
        root.after(5000, check_login_status)

# Fungsi untuk kembali ke halaman login
def go_back():
    qr_frame.pack_forget()
    login_frame.pack(fill="both", expand=True)

# Fungsi untuk kembali ke halaman login
def go_login():
    absen_frame.pack_forget()
    login_frame.pack(fill="both", expand=True)    

# Fungsi yang dipanggil saat jendela Tkinter ditutup
def on_closing():
    global driver
    if driver:
        driver.quit()
    root.destroy() 

# Cek Login WA
def is_logged_in():
    try:
        # Coba cari elemen yang hanya ada jika login berhasil
        chat_list = driver.find_elements("css selector", "#side")
        return len(chat_list) > 0
    except Exception as e:
        return False

# Array berisi data siswa
data_siswa = [
    {"nisn": "1234567890", "nama": "Ahmad Fauzi", "no_hp_ortu": "082140950288"},
    {"nisn": "9876543210", "nama": "Siti Nurhaliza", "no_hp_ortu": "082140950288"},
    {"nisn": "1122334455", "nama": "Budi Santoso", "no_hp_ortu": "082140950288"},
    {"nisn": "5566778899", "nama": "Rina Agustina", "no_hp_ortu": "082140950288"},
    {"nisn": "6677889900", "nama": "Yusuf Kurniawan", "no_hp_ortu": "082140950288"},
]

# Cek qrcode absen
def on_key_release(event):
    current_text = nik_entry.get()

    if len(current_text) == 10:  # Cek jika panjang input 10 karakter
        siswa_ditemukan = next((siswa for siswa in data_siswa if siswa["nisn"] == current_text), None)

        if siswa_ditemukan:
            nama = siswa_ditemukan["nama"]
            no_hp = siswa_ditemukan["no_hp_ortu"]

            try:
                driver.get(f"https://web.whatsapp.com/send?phone=62{no_hp}&text=Selamat pagi Bapak/Ibu, kami ingin menyampaikan bahwa siswa {nama} telah hadir di sekolah.")

                # Tunggu beberapa saat agar pengguna dapat login
                time.sleep(15)

                # Klik tombol kirim pada WhatsApp Web (dengan Xpath)
                try:
                    send_button = driver.find_element("css selector", 'button[aria-label="Kirim"]')
                    send_button.click()
                    nama = ""
                    no_hp = ""
                except Exception as e:
                    messagebox.showerror("Error", f"Gagal menekan tombol kirim: {str(e)}")
                
            except Exception as e:
                messagebox.showerror("Error", f"Gagal membuka WhatsApp Web: {str(e)}")
        else:
            messagebox.showwarning("NISN Tidak Ditemukan", "NISN tidak ditemukan!")
        
        nik_entry.delete(0, tk.END)

def sanitize_phone_number(phone):
    phone = re.sub(r'\D', '', phone)
    if phone.startswith('+62'):
        phone = phone[3:]  
    elif phone.startswith('62'):
        phone = phone[2:]  
    elif phone.startswith('0'):
        phone = phone[1:]  
    return str(phone)

def open_file_dialog():
    """Buka file dialog untuk memilih file Excel dan load data."""
    file_path = filedialog.askopenfilename(
        title="Select an Excel File",
        filetypes=(("Excel files", "*.xls *.xlsx"), ("All files", "*.*"))
    )
    readata = pandas.read_excel(file_path)
    list_entry_add_siswa.clear()
    btnsave['state'] = tk.NORMAL 

    # Membuat entry grid berdasarkan jumlah data dari Excel
    for cntr in range(len(readata["nisn"])):
        list2 = []
        for i, col in enumerate(["nisn", "nama", "no hp ortu", "no hp walas", "kelas"]):
            entry = tk.Entry(tambahsiswa_frame, justify='center', width=20)
            entry.grid(column=i, row=2 + cntr)
            entry.insert(0, sanitize_phone_number(str(readata[col][cntr])) if 'no hp' in col else str(readata[col][cntr]))
            list2.append(entry)
        list_entry_add_siswa.append(list2)

def tambahSiswa():
    databases_frame.pack_forget()
    tambahsiswa_frame.pack(fill="both", expand=True)

def todata():
    menu_frame.pack_forget()
    databases_frame.pack(fill="both", expand=True)

def tomenudatabase():
    tambahsiswa_frame.pack_forget()
    menu_frame.pack(fill="both", expand=True)

# Fungsi untuk membuat tombol melingkar
def create_rounded_button(canvas, x, y, width, height, radius, text, command=None):
    # Gambar bentuk bulat di sekitar tombol
    canvas.create_oval(x, y, x + radius*2, y + radius*2, fill="purple", outline="")
    canvas.create_oval(x + width - radius*2, y, x + width, y + radius*2, fill="purple", outline="")
    canvas.create_oval(x, y + height - radius*2, x + radius*2, y + height, fill="purple", outline="")
    canvas.create_oval(x + width - radius*2, y + height - radius*2, x + width, y + height, fill="purple", outline="")
    
    # Menggambar persegi panjang di antara lingkaran untuk menyelesaikan tampilan melingkar
    canvas.create_rectangle(x + radius, y, x + width - radius, y + height, fill="purple", outline="")
    canvas.create_rectangle(x, y + radius, x + width, y + height - radius, fill="purple", outline="")

    # Menambahkan teks pada tombol
    button_text = canvas.create_text(x + width / 2, y + height / 2, text=text, fill="white", font=("Arial", 12, "bold"))

    # Menambahkan event klik pada tombol
    if command:
        canvas.tag_bind(button_text, "<Button-1>", lambda event: command())
        canvas.tag_bind("button_background", "<Button-1>", lambda event: command())

# Fungsi untuk memuat gambar dari folder assets
def load_image(path, width, height):
    image = Image.open(path)
    image = image.resize((width, height), Image.LANCZOS)
    return ImageTk.PhotoImage(image)

# Membuat antarmuka GUI menggunakan Tkinter
root = tk.Tk()
root.title("WhatsApp Web QR Code Fetcher")

# Ukuran window
root.geometry("1000x1000")

# Frame Login
login_frame = tk.Frame(root, bg="white")
login_frame.pack(fill="both", expand=True)

# Kiri frame
left_frame = tk.Frame(login_frame, bg="white", width=500)
left_frame.pack(fill="both", side="left", padx=10, pady=10)

# Tambahkan gambar ke kiri frame
try:
    original_image = Image.open("assets/login_image.png")
    resized_image = original_image.resize((400, 400))
    photo = ImageTk.PhotoImage(resized_image)
    image_label = tk.Label(left_frame, image=photo, borderwidth=0, highlightthickness=0, bg="white")
    image_label.pack(expand=True)  # Posisi di tengah secara vertikal
except Exception as e:
    error_label = tk.Label(left_frame, text="Gambar tidak ditemukan!", fg="red", bg="white")
    error_label.pack(expand=True)  # Posisi di tengah secara vertikal

# Inisiasi font
label_font = tkFont.Font(family="Helvetica", size=20, weight="bold")
entry_font = tkFont.Font(family="Helvetica", size=12)
button_font = tkFont.Font(family="Helvetica", size=12, weight="bold")

# Kanan frame
right_frame = tk.Frame(login_frame, bg="white", width=500)
right_frame.pack(fill="both", side="right", padx=10, pady=10)

# Sub-frame untuk memusatkan isi
center_frame = tk.Frame(right_frame, bg="white")
center_frame.pack(expand=True)  # Isi diatur agar berada di tengah secara vertikal dan horizontal

# Judul
title_label = tk.Label(center_frame, text="Login as a Admin User", font=label_font, bg="#F9F9F9", fg="#6F42C1")
title_label.pack(pady=(20, 10))

# Frame untuk input email
email_frame = tk.Frame(center_frame, bg="#F9F9F9")
email_frame.pack(pady=(5, 10))

# Email icon
email_icon = tk.Label(email_frame, text="👤", font=entry_font, bg="#F9F9F9", fg="#6F42C1")
email_icon.pack(side=tk.LEFT, padx=(0, 10))

# Email entry
email_entry = tk.Entry(email_frame, font=entry_font, fg="#6F42C1", width=30)
email_entry.insert(0, "")
email_entry.pack(side=tk.LEFT)

# Frame untuk input password
password_frame = tk.Frame(center_frame, bg="#F9F9F9")
password_frame.pack(pady=(5, 20))

# Password icon
password_icon = tk.Label(password_frame, text="🔒", font=entry_font, bg="#F9F9F9", fg="#6F42C1")
password_icon.pack(side=tk.LEFT, padx=(0, 10))

# Password entry
password_entry = tk.Entry(password_frame, font=entry_font, fg="#6F42C1", width=30, show="*")
password_entry.insert(0, "")
password_entry.pack(side=tk.LEFT)

# Login button
# create_rounded_button(center_frame, x=5, y=5, width=100, height=40, radius=20, text="LOGIN", command=login)
login_button = tk.Button(center_frame, text="LOGIN", command=login, font=button_font, 
                         fg="#FFFFFF", bg="#6F42C1", width=20, height=2, relief="flat")
login_button.pack(pady=(10, 10))


# Frame QR Code
qr_frame = tk.Frame(root , bg="white")

# Variabel untuk label gambar QR code
qr_label = None

# Menambahkan deskripsi
description_label = tk.Label(qr_frame, text="Scan the QR code above to proceed.", 
                              bg="white", fg="black", font=("Arial", 10))
description_label.pack(pady=10)

# Tombol Back di halaman QR Code
back_button = tk.Button(qr_frame, text="Back", command=go_back , bg="#4CAF50", fg="black", font=("Arial", 12, "bold"))
back_button.pack(pady=20)

# Frame Menu
menu_frame = tk.Frame(root, bg="white")
# menu_frame.pack(fill="both", expand=True)

# Palet warna utama
primary_color = "#6A1B9A"  # Ungu untuk aksen utama
background_color = "white"

# Section Tengah (terdiri dari kiri, tengah, dan kanan)
tengah_frame = tk.Frame(menu_frame, bg="white")
tengah_frame.place(relx=0.5, rely=0.4, anchor="center", relwidth=0.9, relheight=0.5)

# Bagian Kiri di Tengah
kiri_frame = tk.Frame(tengah_frame, bg=background_color, width=200)
kiri_frame.pack(fill="y", side="left", padx=10, pady=10)

# Bagian Tengah di Tengah
tengah_tengah_frame = tk.Frame(tengah_frame, bg=background_color, width=200)
tengah_tengah_frame.pack(fill="both", side="left", expand=True, padx=10, pady=10)

# Bagian Kanan di Tengah
kanan_frame = tk.Frame(tengah_frame, bg=background_color, width=200)
kanan_frame.pack(fill="y", side="right", padx=10, pady=10)

# Section Bawah
bawah_frame = tk.Frame(menu_frame, bg=background_color, height=80)
bawah_frame.pack(fill="x", side="bottom")

# Judul Menu
title_label = tk.Label(menu_frame, text="Main Menu", bg=background_color, fg="Black", font=("Arial", 24, "bold"))
title_label.pack(pady=10)

# Load Gambar
try:
    image_path = "assets/database.png"  # Pastikan jalur sesuai dengan lokasi file gambar Anda
    loaded_image = load_image(image_path, 250, 250)  # Mengatur ukuran gambar
    img_label = tk.Label(kiri_frame, image=loaded_image, bg="white")
    img_label.image = loaded_image  # Menyimpan referensi agar tidak dihapus oleh garbage collector
    img_label.pack(pady=20)
except FileNotFoundError:
    error_label = tk.Label(kiri_frame, text="Gambar tidak ditemukan!", fg="red", bg="white")
    error_label.pack(pady=20)

# Tombol Database di halaman Menu
database = tk.Canvas(kiri_frame, width=110, height=50, bg="white", highlightthickness=0)
database.place(relx=0.50, rely=0.85, anchor="center") 
create_rounded_button(database, x=5, y=5, width=100, height=40, radius=20, text="Database", command=todata)

# Load Gambar
try:
    image_path = "assets/reicon.png"  # Pastikan jalur sesuai dengan lokasi file gambar Anda
    loaded_image = load_image(image_path, 250, 250)  # Mengatur ukuran gambar
    img_label = tk.Label(tengah_tengah_frame, image=loaded_image, bg="white")
    img_label.image = loaded_image  # Menyimpan referensi agar tidak dihapus oleh garbage collector
    img_label.pack(pady=20)
except FileNotFoundError:
    error_label = tk.Label(tengah_tengah_frame, text="Gambar tidak ditemukan!", fg="red", bg="white")
    error_label.pack(pady=20)

# Tombol Riport di halaman Menu
riport = tk.Canvas(tengah_tengah_frame, width=110, height=50, bg="white", highlightthickness=0)
riport.place(relx=0.50, rely=0.85, anchor="center") 
create_rounded_button(riport, x=5, y=5, width=100, height=40, radius=20, text="Riport", command="")

# Load Gambar
try:
    image_path = "assets/abs.png"  # Pastikan jalur sesuai dengan lokasi file gambar Anda
    loaded_image = load_image(image_path, 250, 250)  # Mengatur ukuran gambar
    img_label = tk.Label(kanan_frame, image=loaded_image, bg="white")
    img_label.image = loaded_image  # Menyimpan referensi agar tidak dihapus oleh garbage collector
    img_label.pack(pady=20)
except FileNotFoundError:
    error_label = tk.Label(kanan_frame, text="Gambar tidak ditemukan!", fg="red", bg="white")
    error_label.pack(pady=20)

# Tombol Absensi Siswa di halaman Menu
absensi = tk.Canvas(kanan_frame, width=110, height=50, bg="white", highlightthickness=0)
absensi.place(relx=0.50, rely=0.85, anchor="center") 
create_rounded_button(absensi, x=5, y=5, width=100, height=40, radius=20, text="Absensi Siswa", command=qrcode)

# Tombol Exit di pojok kanan bawah pada bawah_frame
exited_canvas = tk.Canvas(bawah_frame, width=100, height=50, bg="white", highlightthickness=0)
exited_canvas.place(relx=0.85, rely=0.25, anchor="center") 
create_rounded_button(exited_canvas, x=5, y=5, width=90, height=40, radius=20, text="Exit", command=exite)

# Frame Absensi
absen_frame = tk.Frame(root,bg="white")
# absen_frame.pack(fill="both", expand=True)

# Membuat dua section di dalam frame absensi

# Membuat frame atas dan bawah untuk menambah margin vertikal pada garis pemisah
top_margin = tk.Frame(absen_frame, height=20, bg="white")  # margin atas
top_margin.pack(fill="x")
section_kiri = tk.Frame(absen_frame, width=550, bg="white")
section_kiri.pack(side="left", fill="both", expand=True)

section_kanan = tk.Frame(absen_frame, width=250, bg="white")
section_kanan.pack(side="right", fill="both", expand=True)

# Membuat garis tegak lurus berwarna ungu sebagai pemisah
separator = tk.Canvas(absen_frame, width=20, height=560, bg="white", highlightthickness=0)
separator.create_line(10, 0, 10, 560, fill="purple", width=5)  # Garis ungu di tengah canvas
separator.pack(side="left", padx=10, pady=20)

# Isi section kiri

# NIK scan
nik = tk.Label(section_kiri, text="Barcode Scan", font=("Arial", 26, "bold"), fg="black", bg="white" )
nik.pack(pady=(100, 10), padx=(10, 0),anchor="center")

# Load Gambar
try:
    image_path = "assets/scan.png"  # Pastikan jalur sesuai dengan lokasi file gambar Anda
    loaded_image = load_image(image_path, 350, 350)  # Mengatur ukuran gambar
    img_label = tk.Label(section_kiri, image=loaded_image, bg="white")
    img_label.image = loaded_image  # Menyimpan referensi agar tidak dihapus oleh garbage collector
    img_label.pack(pady=20)
except FileNotFoundError:
    error_label = tk.Label(section_kiri, text="Gambar tidak ditemukan!", fg="red", bg="white")
    error_label.pack(pady=20)

# Isi section kanan

# Entry untuk input nomor
nik_entry = tk.Entry(
    section_kanan,
    font=("Helvetica", 14),       
    bg="#f0f0ff",                  
    fg="black",                    
    insertbackground="black",      
    highlightthickness=2,          
    highlightbackground="#a0a0ff", 
    relief="solid",                
    bd=1                           
)

nik_entry.place(relx=0.5, rely=0.4, anchor="center", width=200, height=30)  # Ukuran dan posisi

# Bind event key release pada entry
nik_entry.bind("<KeyRelease>", on_key_release)

# Membuat Canvas untuk tombol di section kanan
back_canvas = tk.Canvas(section_kanan, width=100, height=50, bg="white", highlightthickness=0)
back_canvas.place(relx=0.5, rely=0.6, anchor="center")  # Posisi di tengah secara horizontal, sedikit di bawah tengah secara vertikal

# Membuat tombol "Back" melingkar
create_rounded_button(back_canvas, x=5, y=5, width=90, height=40, radius=20, text="Back", command=go_login)

# Frame Database
databases_frame = tk.Frame(root)

# Palet warna utama
primary_color = "#6A1B9A"  # Ungu untuk aksen utama
background_color = "white"

# Section Tengah (terdiri dari kiri, tengah, dan kanan)
tengah_frame = tk.Frame(databases_frame, bg="white")
tengah_frame.place(relx=0.5, rely=0.4, anchor="center", relwidth=0.9, relheight=0.5)

# Bagian Kiri di Tengah
kiri_frame = tk.Frame(tengah_frame, bg=background_color, width=200)
kiri_frame.pack(fill="y", side="left", padx=10, pady=10)

# Bagian Tengah di Tengah
tengah_tengah_frame = tk.Frame(tengah_frame, bg=background_color, width=200)
tengah_tengah_frame.pack(fill="both", side="left", expand=True, padx=10, pady=10)

# Bagian Kanan di Tengah
kanan_frame = tk.Frame(tengah_frame, bg=background_color, width=200)
kanan_frame.pack(fill="y", side="right", padx=10, pady=10)

# Section Bawah
bawah_frame = tk.Frame(databases_frame, bg=background_color, height=80)
bawah_frame.pack(fill="x", side="bottom")

# Judul Menu
title_label = tk.Label(databases_frame, text="Menu Database", bg=background_color, fg="Black", font=("Arial", 24, "bold"))
title_label.pack(pady=10)

# Load Gambar
try:
    image_path = "assets/database.png"  # Pastikan jalur sesuai dengan lokasi file gambar Anda
    loaded_image = load_image(image_path, 250, 250)  # Mengatur ukuran gambar
    img_label = tk.Label(kiri_frame, image=loaded_image, bg="white")
    img_label.image = loaded_image  # Menyimpan referensi agar tidak dihapus oleh garbage collector
    img_label.pack(pady=20)
except FileNotFoundError:
    error_label = tk.Label(kiri_frame, text="Gambar tidak ditemukan!", fg="red", bg="white")
    error_label.pack(pady=20)

# Tombol Database di halaman Menu
database = tk.Canvas(kiri_frame, width=110, height=50, bg="white", highlightthickness=0)
database.place(relx=0.50, rely=0.85, anchor="center") 
create_rounded_button(database, x=5, y=5, width=100, height=40, radius=20, text="Input Data", command="")

# Load Gambar
try:
    image_path = "assets/reicon.png"  # Pastikan jalur sesuai dengan lokasi file gambar Anda
    loaded_image = load_image(image_path, 250, 250)  # Mengatur ukuran gambar
    img_label = tk.Label(tengah_tengah_frame, image=loaded_image, bg="white")
    img_label.image = loaded_image  # Menyimpan referensi agar tidak dihapus oleh garbage collector
    img_label.pack(pady=20)
except FileNotFoundError:
    error_label = tk.Label(tengah_tengah_frame, text="Gambar tidak ditemukan!", fg="red", bg="white")
    error_label.pack(pady=20)

# Tombol Riport di halaman Menu
riport = tk.Canvas(tengah_tengah_frame, width=150, height=50, bg="white", highlightthickness=0)
riport.place(relx=0.50, rely=0.85, anchor="center") 
create_rounded_button(riport, x=5, y=5, width=140, height=40, radius=20, text="Backup Database", command="")

# Load Gambar
try:
    image_path = "assets/abs.png"  # Pastikan jalur sesuai dengan lokasi file gambar Anda
    loaded_image = load_image(image_path, 250, 250)  # Mengatur ukuran gambar
    img_label = tk.Label(kanan_frame, image=loaded_image, bg="white")
    img_label.image = loaded_image  # Menyimpan referensi agar tidak dihapus oleh garbage collector
    img_label.pack(pady=20)
except FileNotFoundError:
    error_label = tk.Label(kanan_frame, text="Gambar tidak ditemukan!", fg="red", bg="white")
    error_label.pack(pady=20)

# Tombol Absensi Siswa di halaman Menu
absensi = tk.Canvas(kanan_frame, width=150, height=50, bg="white", highlightthickness=0)
absensi.place(relx=0.50, rely=0.85, anchor="center") 
create_rounded_button(absensi, x=5, y=5, width=140, height=40, radius=20, text="Update Presensi", command="")

# Tombol Exit di pojok kanan bawah pada bawah_frame
exited_canvas = tk.Canvas(bawah_frame, width=100, height=50, bg="white", highlightthickness=0)
exited_canvas.place(relx=0.85, rely=0.25, anchor="center") 
create_rounded_button(exited_canvas, x=5, y=5, width=90, height=40, radius=20, text="Exit", command="")

# Frame input data list siswa

# Frame backup database

# Frame update presensi kehadiran siswa

# Frame Riport

# Menangani event ketika aplikasi ditutup
root.protocol("WM_DELETE_WINDOW", on_closing)

# Jalankan aplikasi
root.mainloop()
