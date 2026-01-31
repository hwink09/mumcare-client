# React + TypeScript Boilerplate

Modern and production-ready starter template for building web applications.

**Created by:** [hwinkdev](https://github.com/hwink09) | [YouTube Channel](https://www.youtube.com/@hwinkdev.official)

---

## ✨ What's Inside?

- ⚡ **Vite** - Fast development and build
- ⚛️ **React 19** - Latest React version
- 📘 **TypeScript** - Type safety
- 🎨 **Tailwind CSS** - Easy styling
- 🧩 **shadcn/ui** - Beautiful UI components
- 🔄 **Redux Toolkit** - State management ready
- 📏 **ESLint** - Code quality

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

---

## 📁 Folder Structure

```
src/
├── components/
│   ├── forms/        # Form components (Input, etc.)
│   ├── shared/       # Reusable components (Header, Footer)
│   └── ui/           # shadcn/ui components (Button, etc.)
├── hooks/            # Custom hooks (useAuth, etc.)
├── layouts/          # Page layouts (AuthLayout, MainLayout)
├── pages/            # Your pages (HomePage, LoginPage)
├── redux/            # Redux store setup
├── services/         # API calls
├── types/            # TypeScript types
└── lib/              # Utility functions
```

---

## 💡 How to Use

### Adding a New Page
1. Create a file in `src/pages/` (e.g., `AboutPage.tsx`)
2. Import and use components from `src/components/`
3. Wrap with a layout from `src/layouts/`

### Adding UI Components
Use shadcn/ui CLI to add components:
```bash
npx shadcn@latest add [component-name]
```

### API Calls
Create services in `src/services/` to handle API requests.

---

## 📚 Learn More

- [GitHub](https://github.com/hwink09)
- [YouTube Tutorials](https://www.youtube.com/@hwinkdev.official)

---

## 📝 License

Free to use for your projects!

