

# Password Strength — Rust + WebAssembly + React (Web Demo)

> A modern web app that evaluates password strength using a Rust core compiled to WebAssembly (WASM) plus zxcvbn for advanced heuristics — with a generator that produces strong, meaningful password variants.  
> Built with **Vite + React + Tailwind + Rust + wasm-bindgen**.

---

## 🧭 Table of Contents

1. [Project Overview](#project-overview)
2. [Features](#features)
3. [Repository Layout](#repository-layout)
4. [Prerequisites](#prerequisites)
5. [Quick Start — Local Development](#quick-start--local-development)
6. [Build for Production](#build-for-production)
7. [Rust + WASM Build Notes](#rust--wasm-build-notes)
8. [Security & Preflight Checklist](#security--preflight-checklist)
9. [Automated Checks (Recommended)](#automated-checks-recommended)
10. [GitHub Actions CI Example](#github-actions-ci-example)
11. [Recommended .gitignore](#recommended-gitignore)
12. [License](#license)

---

## 🧩 Project Overview

This tool provides **real-time password strength testing** using both:
- A **Rust/WASM** engine that computes entropy and pattern metrics.
- **zxcvbn** for heuristic-based feedback and human password patterns.

It also includes a **Password Generator** that creates **5 high-strength, meaningful variants** related to the user’s entered password.

### Architecture
- **Rust Core (`pwd_strength`)** → compiled to WASM
- **React Frontend (`web-demo`)** → uses Vite + Tailwind for fast, modern UI
- **JS Bridge (`pwdStrength.js`)** → calls Rust WASM from React

---

## ⚙️ Features

✅ Rust-based entropy and scoring  
✅ zxcvbn integration for human-readable feedback  
✅ Password generator with 5 smart high-strength variants  
✅ Real-time UI feedback with strength bar  
✅ Tailwind + glassmorphism interface  
✅ All local — no external APIs, secure by design  

---

## 🗂️ Repository Layout

```

/
├─ rust-core/                 # Rust library (pwd_strength)
│  ├─ Cargo.toml
│  └─ src/
├─ wasm-bindings/             # wasm-bindgen output (pwd_strength.js, wasm)
├─ web-demo/                  # React app (Vite + Tailwind)
│  ├─ public/
│  │  ├─ wasm/                # wasm files copied here
│  │  └─ bg-layout.png
│  ├─ src/
│  │  ├─ App.jsx              # main UI
│  │  ├─ pwdStrength.js       # WASM loader
│  │  └─ ...
│  └─ package.json
└─ README.md

````

---

## 🧰 Prerequisites

You’ll need these installed:

- [Rust](https://www.rust-lang.org/tools/install)
- `wasm-bindgen-cli`:  
  ```bash
  cargo install wasm-bindgen-cli
````

* WASM target:

  ```bash
  rustup target add wasm32-unknown-unknown
  ```
* Node.js 18+ and npm/pnpm
* Git (optional but recommended)

---

## 🚀 Quick Start — Local Development

### 1️⃣ Build the Rust Core

```bash
cd rust-core
cargo build --release --target wasm32-unknown-unknown
```

### 2️⃣ Generate WASM Bindings

```bash
wasm-bindgen --target web --out-dir ../wasm-bindings ./target/wasm32-unknown-unknown/release/pwd_strength.wasm
```

### 3️⃣ Copy the WASM to the Web Demo

```bash
cp -r ../wasm-bindings/* ../web-demo/public/wasm/
```

### 4️⃣ Run the React App

```bash
cd ../web-demo
npm install
npm run dev
```

🖥️ Open [http://localhost:5173](http://localhost:5173) in your browser.
Your app should load with the background image and UI panel.

---

## 🏗️ Build for Production

```bash
cd web-demo
npm run build
```

Output will be generated in `web-demo/dist/`.

Deploy the contents of `dist/` to your static hosting provider (Netlify, Vercel, GitHub Pages, etc).
Make sure your host serves `.wasm` files with:

```
Content-Type: application/wasm
```

---

## 🦀 Rust + WASM Build Notes

Whenever you change Rust code, rebuild with:

```bash
cd rust-core
cargo build --release --target wasm32-unknown-unknown
wasm-bindgen --target web --out-dir ../wasm-bindings ./target/wasm32-unknown-unknown/release/pwd_strength.wasm
cp -r ../wasm-bindings/* ../web-demo/public/wasm/
```

Optionally, automate with a small script in the root folder.

---

## 🛡️ Security & Preflight Checklist

Before committing or pushing to GitHub:

### 🔍 1. Search for secrets or passwords

```bash
git grep -n -I --line-number -e "password" -e "secret" -e "api_key" || true
```

### 🔎 2. Audit npm packages

```bash
cd web-demo
npm audit
```

### 🧹 3. Lint and format

```bash
cd rust-core && cargo fmt && cargo clippy -- -D warnings
cd ../web-demo && npm run format
```

### ⚠️ 4. Verify no sensitive images or EXIF data

Ensure `bg-layout.png` and other assets don’t contain embedded metadata.

---

## 🤖 Automated Checks (Recommended)

Use **gitleaks** or **git-secrets** to prevent committing secrets.

Install & run locally:

```bash
gitleaks detect --source . --exit-code
```

Add a pre-commit hook to run:

```bash
cargo fmt && npm run format && npm audit
```

---

## 🧪 GitHub Actions CI Example

Create `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build-wasm:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions-rs/toolchain@v1
        with:
          profile: minimal
          toolchain: stable
          components: rustfmt, clippy
      - name: Install wasm target
        run: rustup target add wasm32-unknown-unknown
      - name: Build release wasm
        run: |
          cd rust-core
          cargo build --release --target wasm32-unknown-unknown
          wasm-bindgen --target web --out-dir ../wasm-bindings ./target/wasm32-unknown-unknown/release/pwd_strength.wasm
      - name: Copy wasm to web demo
        run: cp -r wasm-bindings/* web-demo/public/wasm/

  build-frontend:
    runs-on: ubuntu-latest
    needs: build-wasm
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: |
          cd web-demo
          npm ci
          npm run build
      - name: Upload build artifact
        uses: actions/upload-artifact@v4
        with:
          name: web-dist
          path: web-demo/dist
```

---

## 🧾 Recommended `.gitignore`

```
# Node
node_modules/
dist/
.vite/
npm-debug.log*
package-lock.json

# Rust
/target/
**/*.rs.bk

# Optional: exclude wasm output
# wasm-bindings/
# web-demo/public/wasm/

# OS files
.DS_Store
Thumbs.db
```

---

## 🧪 Testing

### Rust tests:

```bash
cd rust-core
cargo test
```

### Frontend manual test:

```bash
cd web-demo
npm run dev
# open http://localhost:5173
```

---

## 🔒 Final Notes

* No passwords are sent to any server — everything runs locally in the browser.
* Keep `.wasm` files up to date with Rust source.
* Rotate any exposed credentials immediately if accidentally committed.

---

## 📄 License

**MIT License**

Free to use, modify, and distribute with attribution.

---

✨ *Built with Rust, React, and a passion for secure software.* 🔐

```

---

✅ **Instructions to use:**

1. In **VS Code**, create a new file:  
   `README.md`

2. Paste everything above (from `# Password Strength...` down).

3. Save and preview with `Ctrl+Shift+V` (Markdown preview).

4. Commit and push to GitHub — it will render beautifully with headings, code blocks, and emojis.

---
