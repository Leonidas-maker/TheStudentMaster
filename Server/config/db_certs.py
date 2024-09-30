from cryptography import x509
from cryptography.x509.oid import NameOID
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.backends import default_backend
from datetime import datetime, timedelta, timezone
import os
from rich.console import Console

from config.general import ENVIRONMENT

# Generate a new private key with a secure exponent (65537)
def generate_private_key(password: str):
    # RSA private key with a public exponent of 65537 (secure and standard)
    private_key = rsa.generate_private_key(
        public_exponent=65537,  # Secure cryptographic exponent
        key_size=2048,          # Recommended key size (2048+ bits)
        backend=default_backend()
    )
    
    # Serialize the private key with password encryption
    pem = private_key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.TraditionalOpenSSL,
        encryption_algorithm=serialization.BestAvailableEncryption(password.encode())  # Use a password
    )
    
    return private_key, pem

# Generate a self-signed client certificate
def generate_client_certificate(private_key, issuer_name, subject_name):
    subject = issuer_name = x509.Name([
        x509.NameAttribute(NameOID.COUNTRY_NAME, u"DE"),
        x509.NameAttribute(NameOID.STATE_OR_PROVINCE_NAME, u"Baden-Wuerttemberg"),
        x509.NameAttribute(NameOID.LOCALITY_NAME, u"Mannheim"),
        x509.NameAttribute(NameOID.ORGANIZATION_NAME, issuer_name),
        x509.NameAttribute(NameOID.COMMON_NAME, subject_name),
    ])
    
    # Create the certificate using the public key of the private key
    cert = x509.CertificateBuilder().subject_name(
        subject
    ).issuer_name(
        issuer_name
    ).public_key(
        private_key.public_key()
    ).serial_number(
        x509.random_serial_number()
    ).not_valid_before(
        datetime.now(timezone.utc)
    ).not_valid_after(
        # Certificate valid for 365 days
        datetime.now(timezone.utc) + timedelta(days=365)
    ).add_extension(
        x509.SubjectAlternativeName([x509.DNSName(u"localhost")]),
        critical=False,
    ).sign(private_key, hashes.SHA256(), default_backend())
    
    # Serialize the certificate to PEM format
    pem = cert.public_bytes(serialization.Encoding.PEM)
    
    return pem

# Save the generated certificate and private key to files
def save_cert_and_key(cert_pem, key_pem, cert_path, key_path):
    with open(cert_path, "wb") as cert_file:
        cert_file.write(cert_pem)
    
    with open(key_path, "wb") as key_file:
        key_file.write(key_pem)

# Main function to generate the client certificate and save it in the Docker environment
def generate_client_cert(console: Console):
    certs_dir = "./config/certs"
    os.makedirs(certs_dir, exist_ok=True)
    
    client_cert_path = os.path.join(certs_dir, "client-cert.pem")
    client_key_path = os.path.join(certs_dir, "client-key.pem")
    
    # If prod password retrieved from Docker secrets else use a default password
    if ENVIRONMENT == "prod":
        try:
            with open("/run/secrets/client-cert-password", "r") as file:
                password = file.read().strip()
        except FileNotFoundError as e:
            raise RuntimeError("Client certificate password secret not found") from e
    else:
        if os.path.exists(client_cert_path) and os.path.exists(client_key_path):
            console.log("Running in dev mode, client certificate already exists. Skipping generation.", style="bold yellow")
            return
        password = "devpassword"
    
    # Generate private key and certificate
    private_key, private_key_pem = generate_private_key(password)
    client_cert_pem = generate_client_certificate(private_key, issuer_name="TheStudentMaster", subject_name="TheStudentMasterBackend")
    
    # Save the generated certificate and key to files
    save_cert_and_key(client_cert_pem, private_key_pem, client_cert_path, client_key_path)
    
    console.log("Client certificate and key generated successfully", style="bold green")
