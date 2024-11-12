from cryptography.hazmat.primitives import serialization, hashes
from cryptography.hazmat.primitives.asymmetric import padding
from cryptography.hazmat.backends import default_backend
import base64

# Your PEM public key
pem_public_key = b"""
-----BEGIN PUBLIC KEY-----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCJJB+0j5RzWGlpIYzHbp+wvfQ5
3AjJ+sKISwW+C/Q62dJ4nsHCnr/TbFC1TV0AWzaAWFM6f/OrlWpZXlGiNcZAfKVJ
qVklm+SETPNG0C2puk7IWfYOsz9FhxaapdVx1QMnb7MiWzXDVA1eTaKwskxZjWoO
nONYbdoLtuHsrEQ3uQIDAQAB
-----END PUBLIC KEY-----
"""

# Load the public key
public_key = serialization.load_pem_public_key(
    pem_public_key,
    backend=default_backend()
)

# Message to be encrypted
message = b"Hello, RSA with the given public key!"

# Encrypt the message using the public key
ciphertext = public_key.encrypt(
    message,
    padding.OAEP(
        mgf=padding.MGF1(algorithm=hashes.SHA256()),
        algorithm=hashes.SHA256(),
        label=None
    )
)

# Encode the ciphertext to Base64 for easier display
ciphertext_base64 = base64.b64encode(ciphertext)
print("Encrypted message (Base64):", ciphertext_base64.decode())
