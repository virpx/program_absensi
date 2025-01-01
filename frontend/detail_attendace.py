import tkinter as tk
from tkinter import ttk
import requests
import json
# Sample data
tokenlogin = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3MzU3MDAxNzIsImRhdGEiOiJhZG1pbmxvZ2luIiwiaWF0IjoxNzM1NjEzNzcyfQ.iTkBpsCsRi_lvOr-NpvPRPH67U9kj0_zMmBaSsqn4HI"
datadetailabsen = []
def getdetailabsenanak(nisn):
    global datadetailabsen
    payload = {
        "login": tokenlogin,
        "data":nisn
    }
    response = requests.get("http://localhost:3000/detailabsen", data=payload)
    datadetailabsen = json.loads(response.text)
    table_detail_absensi.delete(*table_detail_absensi.get_children())
    name_label.config(text="Nama: "+datadetailabsen["data"][0]['nama'])
    class_label.config(text="Kelas: "+datadetailabsen["data"][0]['kelas'])
    for row in datadetailabsen["data"][1]:
        table_detail_absensi.insert("", "end", values=(row['untuktanggal'],row['status'],row['keterangan']))
# Create main window
root = tk.Tk()
root.title("Attendance")
root.configure(bg="white")

# Title Label
title_label = tk.Label(root, text="Detail Kehadiran", font=("Helvetica", 18, "bold"), bg="white")
title_label.pack(pady=10)

# Subtitle Frame to hold the name and class information on the left side
subtitle_frame = tk.Frame(root,bg="white")
subtitle_frame.pack(anchor="w", padx=20)

# Labels for "Nama" and "Kelas" inside the subtitle frame
name_label = tk.Label(subtitle_frame, text="Nama: Yoni", font=("Arial", 9),bg="white")
name_label.grid(row=0, column=0, sticky="w")
class_label = tk.Label(subtitle_frame, text="Kelas: 9", font=("Arial", 9),bg="white")
class_label.grid(row=1, column=0, sticky="w")

# Create Treeview Frame with padding to add space around the table
frame_table_detail = tk.Frame(root, padx=20, pady=10,bg="white")  # Adding padding here
frame_table_detail.pack(pady=10)

# Scrollbar for Treeview
scrollbar = tk.Scrollbar(frame_table_detail)
scrollbar.pack(side=tk.RIGHT, fill=tk.Y)

# Treeview
table_detail_absensi = ttk.Treeview(frame_table_detail, yscrollcommand=scrollbar.set, selectmode="none", columns=("date", "presence", "note"), show="headings")
table_detail_absensi.pack()

scrollbar.config(command=table_detail_absensi.yview)

# Define columns
table_detail_absensi.column("date", anchor=tk.CENTER, width=150)
table_detail_absensi.column("presence", anchor=tk.CENTER, width=100)
table_detail_absensi.column("note", anchor=tk.CENTER, width=200)

# Define headings
table_detail_absensi.heading("date", text="Date")
table_detail_absensi.heading("presence", text="Presence")
table_detail_absensi.heading("note", text="Note")


# Style for Treeview
style = ttk.Style()
style.configure("Treeview.Heading", font=("Helvetica", 12, "bold"))
style.configure("Treeview", rowheight=30, font=("Helvetica", 12))
getdetailabsenanak(123)

# Start the main event loop
root.mainloop()
