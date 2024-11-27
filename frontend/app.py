import time
import pyqrcode
import tkinter as tk
from tkinter import messagebox ,filedialog
from PIL import Image, ImageTk
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
import io
import re
import pandas


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
        time.sleep(5)
        
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
def login():
    userid = username_entry.get()
    password = password_entry.get()

    if userid == "admin" and password == "admin":
        # Pindah ke frame QR Code
        username_entry.delete(0, tk.END)
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

def on_key_release(event):
    # Dapatkan teks dari entry
    current_text = nik_entry.get()

    # Jika panjang teks sudah mencapai 9 karakter
    if len(current_text) == 9:
        # Tampilkan messagebox dengan nomor yang di-input
        messagebox.showinfo("Nomor Diterima", f"Nomor yang Anda input: {current_text}")

        # Kosongkan entry setelah menampilkan messagebox
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

# def on_hover(event, canvas, color):
#     canvas.configure(bg=color)

# def on_leave(event, canvas, color):
#     canvas.configure(bg=color)

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
login_frame = tk.Frame(root)
login_frame.pack(fill="both", expand=True)
# login_frame = tk.Frame(root)

# Label di jendela utama
label = tk.Label(login_frame, text="Klik tombol login untuk mengambil QR code WhatsApp Web")
label.pack(pady=20)

# Username dan Password
username_label = tk.Label(login_frame, text="Username:")
username_label.pack()
username_entry = tk.Entry(login_frame)
username_entry.pack()

password_label = tk.Label(login_frame, text="Password:")
password_label.pack()
password_entry = tk.Entry(login_frame, show="*")  
password_entry.pack()

# Tombol Login
login_button = tk.Button(login_frame, text="Login", command=login)
login_button.pack(pady=20)

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

# Tombol Tambah Siswa di halaman database
tambah_siswa = tk.Button(databases_frame, text="Tambah Siswa", command=tambahSiswa)
tambah_siswa.pack(pady=20)

# Frame Database
tambahsiswa_frame = tk.Frame(root)

# Mengatur layout komponen pada window tambah siswa
tk.Button(tambahsiswa_frame, text="Load File Siswa", command=open_file_dialog).grid(row=0, column=0, padx=0, pady=0)
tk.Radiobutton(tambahsiswa_frame, text="Periode Baru", variable='', value=1).grid(row=0, column=1)
tk.Radiobutton(tambahsiswa_frame, text="Update Data", variable='', value=2).grid(row=0, column=2)

# Tombol Save di halaman Tamabah Siswa
btnsave = tk.Button(tambahsiswa_frame, text="Save", command='', state=tk.DISABLED)
btnsave.grid(row=0, column=4, padx=0, pady=0)

# Label kolom
tk.Label(tambahsiswa_frame, text="NISN", width=20, anchor="center").grid(row=1, column=0, padx=0, pady=0)
tk.Label(tambahsiswa_frame, text="Nama", width=20, anchor="center").grid(row=1, column=1, padx=0, pady=0)
tk.Label(tambahsiswa_frame, text="No TLP Ortu", width=20, anchor="center").grid(row=1, column=2, padx=0, pady=0)
tk.Label(tambahsiswa_frame, text="No TLP Walas", width=20, anchor="center").grid(row=1, column=3, padx=0, pady=0)
tk.Label(tambahsiswa_frame, text="Kelas", width=20, anchor="center").grid(row=1, column=4, padx=0, pady=0)

# Tombol Save di halaman Tamabah Siswa
btnexit = tk.Button(tambahsiswa_frame, text="Exit", command=tomenudatabase)
btnexit.grid(row=2, column=5, padx=0, pady=0)

# Frame Riport

# Menangani event ketika aplikasi ditutup
root.protocol("WM_DELETE_WINDOW", on_closing)

# Jalankan aplikasi
root.mainloop()
