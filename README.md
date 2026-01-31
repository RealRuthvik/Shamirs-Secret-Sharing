# Shamir's Secret Sharing (SSS)

This project is a web-based implementation of **Shamir's Secret Sharing (SSS)**. It allows users to split sensitive text or images into multiple cryptographic shares. To recover the original secret, a minimum number of shares (the **threshold**) must be combined.

If fewer than the threshold number of shares are available, it is **mathematically impossible** to reconstruct the secret.

---

## Features

- **Text Encryption & Decryption**  
  Convert secret messages into cryptographic shares and reconstruct them later.

- **Image Encryption & Decryption**  
  Image files are processed as byte data, split into chunks, and converted into shares stored inside a ZIP archive.

- **Web Interface**  
  A brutalist-style frontend built using HTML, CSS, and JavaScript.

- **FastAPI Backend**  
  A Python backend responsible for all cryptographic and mathematical operations.

- **Terminal Version**  
  A standalone CLI script for command-line usage.

---

## How the Math Works

The implementation is based on **polynomial interpolation over a finite field**, following the original scheme proposed by Adi Shamir.

---

### 1. The Polynomial

To hide a secret, we generate a random polynomial of degree \( k - 1 \), where \( k \) is the minimum number of shares required for recovery.

\[
P(x) = a_0 + a_1x + a_2x^2 + \dots + a_{k-1}x^{k-1}
\]

- **\( a_0 \) (the constant term)**  
  This is the secret. Recovering \( P(0) \) reveals the original secret.

- **\( a_1, \dots, a_{k-1} \)**  
  These are randomly generated coefficients, freshly chosen for each encryption.

---

### 2. Creating Shares

Each share corresponds to a point on the polynomial:

\[
(x_i, y_i) \quad \text{where} \quad y_i = P(x_i)
\]

- The \( x \)-value is a unique share index (e.g., \( 1, 2, 3, \dots \)).
- The \( y \)-value is computed by evaluating the polynomial at that \( x \).

Each share individually reveals **no information** about the secret.

---

### 3. Finite Field Arithmetic

All computations are performed inside a finite field to prevent integer overflow and ensure cryptographic security.

This project uses the **Mersenne prime**:

\[
p = 2^{521} - 1
\]

Every operation is performed modulo \( p \):

- Addition  
- Multiplication  
- Exponentiation  

\[
\text{result} \equiv \text{operation} \pmod{p}
\]

This guarantees that all values remain bounded and reversible.

---

### 4. Recovery (Lagrange Interpolation)

When at least \( k \) valid shares are available, the secret can be reconstructed using **Lagrange interpolation**.

Given \( k \) points, there exists exactly one polynomial of degree \( k - 1 \) that passes through all of them. The secret is recovered by computing:

\[
P(0) = a_0
\]

Lagrange interpolation directly evaluates this value without reconstructing the full polynomial explicitly.

---

## File Structure

```text
.
├── main.py           # FastAPI application and API routes
├── sss.py            # Core secret sharing and reconstruction logic
├── sss-terminal.py   # Command-line version of the tool
├── index.html        # Web UI for encryption
├── recover.html      # Web UI for recovery
├── script.js         # Frontend logic and form handling
└── style.css         # Brutalist-style UI styling
