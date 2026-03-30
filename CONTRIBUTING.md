# Contributing to YourDDO 🛠

Thanks for your interest in contributing to **YourDDO** — an open-source toolkit to enhance crafting in *Dungeons & Dragons Online*! Whether you're a player, a dev, or just curious, we welcome your help.

---

## 🧭 Getting Started

1. **Fork** the repo
2. **Clone** your fork:
   ```bash
   git clone https://github.com/YOUR-USERNAME/yourddo.git
   ```
3. **Install dependencies**:
   ```bash
   yarn install
   ```
4. **Run locally**:
   ```bash
   yarn dev
   ```

---

## 💡 Ways to Contribute

### 🐛 Report a Bug
- Use the [Bug Report template](https://github.com/veteran-software/yourddo/issues/new?template=bug_report.yaml)
- Include steps to reproduce, your browser/device, and screenshots if possible

### ✨ Request a Feature
- Use the [Feature Request template](https://github.com/veteran-software/yourddo/issues/new?template=feature_request.yaml)
- Be specific about what it should do and how it helps players

### 🎨 Submit UI/UX Feedback
- Share ideas in [GitHub Discussions](https://github.com/veteran-software/yourddo/discussions) or file a UI Feedback issue

### 🧑‍💻 Code Contributions
- Check [open issues](https://github.com/veteran-software/yourddo/issues)
- Comment before starting to avoid duplicated effort
- Follow our [Coding Standards](#-coding-guidelines)

---

## 🧪 Pull Requests

When submitting a pull request:

- **Branch off `main`** and use a clear branch name (e.g. `fix/crafting-tooltip`, `feature/import-builder`)
- Include a **clear description** of what you changed and why
- Reference related issues using `Closes #123`
- Pass `yarn lint` and ensure `yarn build` (for type checking) succeeds before submitting. Our CI runs these checks on every PR.

---

## 🛠 CI/CD

We use GitHub Actions to automate linting and type checking for all pull requests. Ensure your code satisfies these checks to expedite the review process.

---

## ✍️ Coding Guidelines

- Use **TypeScript** and **React best practices**
- Stick to **functional components** and **hooks**
- Keep components modular and reusable
- Follow the existing file/folder structure
- Format code with Prettier (configured in repo)
- Use `yarn` (not `npm`) for package management

---

## 🤝 Code of Conduct

We follow the [Contributor Covenant](https://www.contributor-covenant.org/version/2/1/code_of_conduct/). Be respectful and inclusive. For more details, see our [Code of Conduct](CODE_OF_CONDUCT.md).

---

## 🛡 Security Policy

We take security seriously. Please do not report security vulnerabilities through public GitHub issues. Instead, see our [Security Policy](SECURITY.md) for instructions on how to report them.

---

## 🙌 Thanks!

Your feedback and ideas help us make YourDDO better for everyone.  
Roll high and happy crafting!

– The YourDDO Dev Team
