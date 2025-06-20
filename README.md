<h1 align="center">
  <img alt="logo" src="./assets/icon.png" width="124px" style="border-radius:10px"/><br/> Rozo POS 
</h1>

## About

Rozo POS is a React Native mobile application built with Expo, designed to serve as a point-of-sale system for merchants.

## Setup

### Requirements

- [React Native dev environment](https://reactnative.dev/docs/environment-setup)
- [Node.js LTS release](https://nodejs.org/en/)
- [Git](https://git-scm.com/)
- [Watchman](https://facebook.github.io/watchman/docs/install#buildinstall), required only for macOS or Linux users
- [Pnpm](https://pnpm.io/installation)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)

### Installation

Clone the repo to your machine and install dependencies:

```sh
git clone https://github.com/user/repo-name

cd ./repo-name

pnpm install
```

## Usage

### Development

Start the development server:

```sh
pnpm start
```

Run on iOS:

```sh
pnpm ios
```

Run on Android:

```sh
pnpm android
```

Run on Web:

```sh
pnpm web
```

### Environment Variables

The app supports different environments:

- Development: `pnpm start`
- Staging: `pnpm start:staging`
- Production: `pnpm start:production`

## Stack

- **Framework**: [Expo](https://expo.dev/)
- **UI**: [React Native](https://reactnative.dev/) with [Gluestack](https://gluestack.io/)
- **Navigation**: [Expo Router](https://docs.expo.dev/router/introduction/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Data Fetching**: [React Query](https://tanstack.com/query/latest) with React Query Kit
- **Form Handling**: [React Hook Form](https://react-hook-form.com/)
- **Validation**: [Zod](https://zod.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) via [Gluestack](https://gluestack.io/)

## Folder Structure

```
src/
  ├── app/                # Expo Router file-based routing
  │   ├── (app)/         # App screens (protected routes)
  │   └── features/      # Feature-specific components
  ├── components/        # Shared components
  │   ├── samples/       # Example components
  │   └── ui/            # Core UI components (buttons, inputs, etc.)
  ├── hooks/             # Custom React hooks
  ├── lib/               # Shared utilities
  ├── modules/           # Feature modules
  │   ├── auth/          # Authentication logic
  │   └── i18n/          # Internationalization
  ├── resources/         # External resources
  │   └── api/           # API clients and services
  ├── styles/            # Global styles
  └── translations/      # Translation files
```
