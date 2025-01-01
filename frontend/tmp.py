payload = {
    "username": userid,
    "password":password
}
response = requests.post("http://localhost:3000/login", data=payload)
datalogin = json.loads(response.text)
if datalogin["success"] == 0:
    messagebox.showerror("Login Failed", datalogin["data"])
else:
    # Pindah ke frame QR Code
    tokenlogin = datalogin["data"]
    email_entry.delete(0, tk.END)
    password_entry.delete(0, tk.END)
    login_frame.pack_forget()
    menu_frame.pack(fill="both", expand=True)
    # fetch_and_show_qr_code()