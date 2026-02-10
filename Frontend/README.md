# 📄 DocuSignPro Frontend

A beautiful, modern frontend for a digital document signing platform built with React, TypeScript, and Tailwind CSS.

## ✨ Features

- 🔐 **Authentication** - Secure login and registration
- 📤 **Document Upload** - Drag & drop PDF upload with validation
- 📊 **Dashboard** - Overview of document signing activity
- 📝 **Signature Types** - Type, draw, or upload signatures
- 🎨 **Beautiful UI** - Modern, responsive design with Tailwind CSS
- 🚀 **Fast & Smooth** - Built with Vite for optimal performance
- 📱 **Mobile Responsive** - Works seamlessly on all devices

## 🛠️ Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Axios** - API calls
- **Framer Motion** - Animations
- **React Hot Toast** - Notifications
- **React PDF** - PDF viewing
- **React Signature Canvas** - Drawing signatures
- **Lucide React** - Beautiful icons

## 📦 Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd document-signing-frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
```

Edit `.env` and set your API URL:
```
VITE_API_BASE_URL=http://localhost:5000/api
```

4. **Start the development server**
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## 🏗️ Build for Production

```bash
npm run build
```

The optimized build will be in the `dist` folder.

## 📁 Project Structure

```
src/
├── app/                    # App configuration
│   ├── App.tsx            # Main app component
│   └── router.tsx         # Route definitions
├── components/            # Reusable components
│   ├── layout/           # Layout components (Navbar, Footer)
│   ├── pdf/              # PDF viewer components
│   ├── signature/        # Signature components
│   └── ui/               # UI components (Button, Input, Modal, etc.)
├── context/              # React context
│   └── AuthContext.tsx   # Authentication context
├── pages/                # Page components
│   ├── Auth/            # Login, Register
│   ├── Dashboard/       # Dashboard
│   ├── Documents/       # Document pages
│   └── Signing/         # Signing pages
├── services/            # API services
│   ├── api.ts          # Axios instance
│   ├── auth.service.ts # Authentication API
│   ├── document.service.ts # Document API
│   └── signature.service.ts # Signature API
├── utils/              # Utility functions
│   ├── constants.ts    # App constants
│   ├── formatDate.ts   # Date formatting
│   └── validation.ts   # Form validation
└── styles/            # Global styles
    └── globals.css    # Tailwind + custom styles
```

## 🎨 UI Components

The app includes a comprehensive set of reusable UI components:

- **Button** - Multiple variants (primary, secondary, danger, ghost)
- **Input** - Form inputs with validation and icons
- **Modal** - Animated modal dialogs
- **Badge** - Status badges for documents
- **Loader** - Loading spinners
- **Navbar** - Responsive navigation
- **Footer** - Site footer

## 🔐 Authentication

The app uses JWT tokens for authentication:

1. User logs in → receives JWT token
2. Token stored in localStorage
3. Token sent with every API request
4. Auto-logout on token expiry

## 📝 Signature Features

Three signature methods are supported:

1. **Typed Signature** - Type name and choose from elegant fonts
2. **Draw Signature** - Draw using mouse or touchscreen
3. **Upload Signature** - Upload an image file

## 🎯 API Integration

The frontend connects to your backend API. Make sure to:

1. Update `VITE_API_BASE_URL` in `.env`
2. Backend should be running on the configured port
3. CORS should be enabled on the backend

## 📱 Responsive Design

The app is fully responsive with:

- Mobile-first approach
- Adaptive navigation (hamburger menu on mobile)
- Touch-friendly interfaces
- Optimized layouts for all screen sizes

## 🚀 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🎨 Customization

### Colors

Edit `tailwind.config.js` to customize the color scheme:

```javascript
colors: {
  primary: {
    // Your custom colors
  }
}
```

### Fonts

Add custom fonts in `src/styles/globals.css`:

```css
@import url('your-font-url');
```

## 📄 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API URL | `http://localhost:5000/api` |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Icons by [Lucide](https://lucide.dev/)
- UI inspiration from modern design trends
- Built with ❤️ using React and Tailwind CSS

## 📞 Support

For support, email your-email@example.com or open an issue in the repository.

---

Made with ❤️ by Your Name