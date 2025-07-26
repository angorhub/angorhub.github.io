# 🚀 Angor Hub

A decentralized crowdfunding platform built on Bitcoin and Nostr protocols. Angor Hub allows users to discover, invest in, and manage innovative projects with transparency and security.

## ✨ Features

### 🌐 Multi-Environment Support
- **Standalone Mode**: Full-featured web application with complete Nostr authentication
- **MiniApp Mode**: Optimized for running inside Yakihonne as a MiniApp
- **Smart Detection**: Automatically detects and adapts to the execution environment

### 🔐 Authentication
- **Nostr Integration**: Secure authentication using Nostr keys and extensions
- **MiniApp Compatible**: Authentication is managed by parent application when running as MiniApp
- **Profile Management**: Complete user profile and settings management

### 💰 Bitcoin Integration
- **Multi-Network Support**: Works on both Bitcoin mainnet and testnet
- **Lightning Zaps**: Support for Lightning Network micro-payments
- **Investment Tracking**: Real-time investment and funding progress
- **Currency Formatting**: Professional Bitcoin amount display

### 📱 MiniApp Capabilities

When running as a MiniApp in Yakihonne:

- **Seamless Integration**: Automatically detects MiniApp environment
- **Hidden Login UI**: Authentication handled by parent application
- **Parent Communication**: Can send messages to the parent MiniApp
- **Optimized Experience**: Tailored UI for embedded environments

#### MiniApp Detection

The app uses the Smart Widget Handler API to detect if it's running inside Yakihonne:

```typescript
import { useMiniApp } from '@/hooks/useMiniApp';

function MyComponent() {
  const { isMiniApp, isLoading, sendMessageToParent } = useMiniApp();
  
  if (isMiniApp) {
    // Running inside Yakihonne
    return <MiniAppUI />;
  } else {
    // Running standalone
    return <StandaloneUI />;
  }
}
```

## 🛠️ Development

### Prerequisites
- Node.js 18+ 
- npm or pnpm

### Installation
```bash
npm install
```

### Development Server
```bash
npm run dev
```

### Build
```bash
npm run build
```

### Testing MiniApp Mode

To test MiniApp functionality, you can simulate the environment by adding the Smart Widget Handler to your browser console:

```javascript
window.smartWidgetHandler = {
  isInsideSmartWidget: () => true,
  sendMessageToSmartWidget: (message) => {
    console.log('Message to parent:', message);
  }
};
```

## 📊 Project Structure

```
src/
├── components/          # Reusable UI components
├── hooks/              # Custom React hooks
│   └── useMiniApp.ts   # MiniApp detection hook
├── pages/              # Page components
│   └── MiniAppPage.tsx # MiniApp status page
├── services/           # API and external services
└── types/              # TypeScript type definitions
```

## 🎯 Environment-Specific Features

### Standalone Mode
- Full Nostr authentication UI
- Complete user profile management  
- Direct Bitcoin wallet integration
- All investment and zap capabilities

### MiniApp Mode
- Hidden authentication UI (managed by Yakihonne)
- Streamlined project discovery
- Parent application communication
- Optimized responsive design

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test in both standalone and MiniApp modes
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.