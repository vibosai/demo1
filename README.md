# VibOS.ai - The Missing Link for Humanoid Robots

![VibOS Logo](public/logo-small-transparent.png)

VibOS is an innovative platform designed to enhance humanoid robots with human-like capabilities in three key areas:
- **Voice**: Natural speech interaction
- **Intelligence**: Advanced cognitive processing
- **Behavior**: Human-like interactions and responses

## 🚀 Features

- **Interactive Voice Agent**: Real-time voice interaction using OpenAI's Agents
- **Modern UI**: Sleek, responsive interface built with React and Tailwind CSS
- **Request Early Access**: User registration system for early adopters
- **Live Demo**: Interactive demonstration of voice capabilities

## 📋 Project Structure

```
├── public/                # Static assets
├── src/
│   ├── app/               # Next.js App Router pages
│   │   ├── api/           # API endpoints
│   │   ├── voice-agent/   # Voice agent demo page
│   │   └── page.tsx       # Home page
│   ├── components/        # React components
│   │   ├── ui/            # UI components
│   │   ├── hero.tsx       # Hero section
│   │   ├── product.tsx    # Product info
│   │   └── ...            # Other components
│   └── lib/               # Utility functions
└── ...                    # Config files
```

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/)
- **UI Library**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Voice Capability**: [@openai/agents](https://openai.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Development**: TypeScript, ESLint, Turbopack

## 🚦 Getting Started

### Prerequisites

- Node.js 18.0 or later
- npm package manager
- OpenAI API key with access to Realtime API

### Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```bash
OPENAI_API_KEY=your_openai_api_key_here
```

This API key is required for the voice agent demo functionality. You can obtain an API key from the [OpenAI platform](https://platform.openai.com/api-keys).

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/vibosai/demo1.git
   cd demo1
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Start the development server
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) with your browser

## 🌐 Pages

- **Home (`/`)**: Landing page with product information
- **Voice Agent Demo (`/voice-agent`)**: Interactive voice agent demonstration

## 📦 Component Overview

- **Navbar**: Site navigation
- **HeroSection**: Main landing banner with call-to-action
- **Product**: VibOS product description
- **Layers**: System architecture visualization
- **Audience**: Target audience information
- **Contact**: Contact form and information
- **Footer**: Site footer with links

## 🧪 Development

### Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 📄 License

This project is proprietary and confidential.

## 🤝 Contributing

Please contact the project maintainers for information about contributing.

---

Built with ❤️ by the VibOS team
