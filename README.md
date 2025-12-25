# eCommerce React Native Authentication App

A React Native authentication app built with Expo and TypeScript that integrates with an ASP.NET Core backend API.

## Features

- **Authentication System**
  - User login and registration
  - JWT token handling
  - Secure token storage (AsyncStorage)
  - Auth token automatically attached to API requests

- **Role-based experience (Admin / Manager / User)**
  - Roles are decoded from the JWT payload (supports common ASP.NET claim keys)
  - Separate dashboards and feature screens per role

- **Admin features**
  - Dashboard stats
  - User Management (paged list)
  - Activity Logs (paged list)
  - System Settings

- **Manager features**
  - Team Management (paged list + clear empty state)
  - Reports / Tasks / Inventory / Schedule (readable list UIs)
  - My Profile (structured card UI: email/name/userId/roles)

- **Cross-Platform**
  - iOS support
  - Android support
  - Web support (React Native Web)

- **Modern UI**
  - Clean and responsive design
  - Loading states and error handling
  - Form validation

- **API Integration**
  - Auth calls via Axios (with request interceptor for Bearer token)
  - Admin/Manager API calls via `fetch` with auth headers
  - Response normalization for common backend casing differences (e.g., `Users` vs `users`)

## Technology Stack

- **React Native** with Expo
- **TypeScript** for type safety
- **React Navigation** for routing
- **Axios** for HTTP requests
- **AsyncStorage** for data persistence
- **React Context** for state management

## Prerequisites

- Node.js 18+
- Expo CLI
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Start the Development Server

```bash
# Start Expo development server
npm start

# Run on web
npm run web

# Run on Android emulator
npm run android

# Run on iOS simulator (macOS only)
npm run ios
```

### 3. Backend API

Make sure your ASP.NET Core backend is running on `http://localhost:5289` with CORS enabled for:
- `http://localhost:8081` (React Native Web)
- `http://localhost:4200` (Angular app)

## API Base URL (important)

This app reads the API base URL from `config/api.config.ts`.

- **Android emulator** (default): `http://10.0.2.2:5289/api`
  - `10.0.2.2` is the special alias to your host machine `localhost`.
- **iOS simulator**: usually `http://localhost:5289/api`
- **Physical device**: use your machine LAN IP (e.g. `http://192.168.1.50:5289/api`)

## Project Structure

```
├── App.tsx                 # Main app component
├── app.json               # Expo configuration
├── tsconfig.json          # TypeScript configuration
├── package.json           # Dependencies and scripts
│
├── screens/               # Screen components
│   ├── LoginScreen.tsx    # Login form
│   ├── RegisterScreen.tsx # Registration form
│   ├── DashboardScreen.tsx # Base authenticated screen
│   ├── AdminDashboardScreen.tsx
│   ├── ManagerDashboardScreen.tsx
│   └── UserDashboardScreen.tsx
│
├── navigation/            # Navigation setup
│   └── AppNavigator.tsx   # Main navigator
│
├── context/               # React Context providers
│   └── AuthContext.tsx    # Authentication state
│
├── services/              # API services
│   └── auth.service.ts    # Authentication API calls
│   └── admin.service.ts   # Admin endpoints
│   └── manager.service.ts # Manager endpoints
│
├── types/                 # TypeScript type definitions
│   └── auth.types.ts      # Authentication types
│
├── config/                # Configuration files
│   └── api.config.ts      # API endpoints
│
└── assets/                # Static assets
```

## API Endpoints

The app connects to the following backend endpoints:

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

Role-based endpoints used by the app:

- **Manager**
  - `GET /api/manager/team?page=1&pageSize=20`
  - `GET /api/manager/reports`
  - `GET /api/manager/tasks`
  - `GET /api/manager/inventory`
  - `GET /api/manager/schedule`
  - `GET /api/manager/profile`
- **Admin**
  - `GET /api/admin/dashboard`
  - `GET /api/admin/users?page=1&pageSize=20`
  - `GET /api/admin/users/{userId}`
  - `POST /api/admin/users/{userId}/roles`
  - `POST /api/admin/users/{userId}/toggle-status`
  - `GET /api/admin/roles`
  - `GET /api/admin/activity-logs?page=1&pageSize=50`
  - `GET /api/admin/settings`

## Development

### Environment Configuration

Update `config/api.config.ts` to match your backend API URL:

```typescript
// Android emulator -> host machine localhost
export const API_URL = 'http://10.0.2.2:5289/api';

// iOS simulator: often http://localhost:5289/api
// Physical device: use your machine LAN IP (e.g. http://192.168.1.50:5289/api)
```

### Running on Different Platforms

1. **Web Development**: `npm run web` - Best for rapid UI development
2. **Android**: `npm run android` - Requires Android Studio and emulator
3. **iOS**: `npm run ios` - Requires Xcode (macOS only)
4. **Mobile Device**: Use Expo Go app and scan QR code

### Debugging

- **Web**: Use browser developer tools
- **Mobile**: Use React Native Flipper or Chrome DevTools
- **Network**: Monitor API calls in browser/Flipper

## Authentication Flow

1. User enters credentials on Login/Register screen
2. App sends request to ASP.NET Core API
3. Backend validates and returns JWT token
4. Token stored securely in device storage
5. Token automatically added to all API requests
6. User can access Admin/Manager/User dashboards based on JWT roles

## Common Issues

### CORS Errors
Ensure your ASP.NET Core backend has CORS configured:

```csharp
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(builder =>
    {
        builder.WithOrigins("http://localhost:4200", "http://localhost:8081")
               .AllowAnyMethod()
               .AllowAnyHeader();
    });
});

app.UseCors();
```

### Android Build Issues
1. Ensure JAVA_HOME is set to your JDK installation
2. Ensure ANDROID_HOME is set to your Android SDK
3. Start an Android emulator before running `npm run android`

### Can't reach backend from Android emulator
If your backend runs on your dev machine at `localhost:5289`, the Android emulator must use `10.0.2.2` (already configured by default).

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test on multiple platforms
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Backend Integration

This app is designed to work with the eCommerce Users Service ASP.NET Core backend. Make sure both applications are running for full functionality.