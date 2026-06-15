# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Development
npm start                # Start Expo development server
npm run android         # Start Android emulator
npm run ios             # Start iOS simulator
npm run web             # Start web development server

# Package Installation (IMPORTANT: Always use --legacy-peer-deps flag)
npm install --legacy-peer-deps        # Install dependencies
npm install <package> --legacy-peer-deps    # Install new packages

# Code Quality (always use nvm prefix for consistency)
source /usr/share/nvm/init-nvm.sh && nvm use 23 && npm run lint            # Run ESLint
source /usr/share/nvm/init-nvm.sh && nvm use 23 && npm run lint:fix        # Fix ESLint issues automatically
source /usr/share/nvm/init-nvm.sh && nvm use 23 && npm run format          # Format code with Prettier
source /usr/share/nvm/init-nvm.sh && nvm use 23 && npm run format:check    # Check code formatting
source /usr/share/nvm/init-nvm.sh && nvm use 23 && npm run type-check      # TypeScript compilation check (no emit)
```

## Architecture Overview

**Chart2AI** is a React Native/Expo TypeScript application that converts astrological birth charts into detailed text descriptions using the chart2txt library. The app supports multi-chart analysis (natal, synastry, transits) with a structured prompt system for LLM integration.

### Core Data Flow

1. **Form Input** (`AstroForm.tsx`) → **Chart Generation** (`chartGenerator.ts`) → **API Integration** (`astroApi.ts`) → **Text Output** (`chart2txt`)
2. **Storage Layer**: AsyncStorage for form persistence, chart library, and result library
3. **Theme System**: Centralized dark sci-fi theme with React Native Paper integration

### Key Components

- `AstroForm.tsx` - Main multi-chart form with structured prompt system
- `ChartLibrary.tsx` - Chart management (CRUD operations, auto-save)
- `LocationAutocomplete.tsx` - Photon API integration with GPS support
- `ChartResultDialog.tsx` - Results display with copy/share functionality
- `PromptConfiguration.tsx` - Four-layer prompt system (voice, style, system, user)

### Data Architecture

```typescript
interface ChartFormData {
  charts: ChartData[]; // 1-10 charts (natal/event)
  transit?: TransitData; // Optional transit analysis
  houseSystem: 'P' | 'W' | 'E' | 'O'; // Placidus, Whole, Equal, Porphyry
  enableTransit: boolean;
  userPromptText: string; // Editable user prompt
  systemPromptEnabled: boolean; // Toggle for system prompt
  readingVoice: string; // "standard" | "none"
  readingStyle: string; // "modern" | "traditional" | "none"
}
```

### Storage Keys

- `chart2ai_form_data` - Form state persistence
- `@chart2ai_charts` - Chart library (100 chart limit)
- `@chart2ai_result_library` - Saved results (100 limit, FIFO)

## External APIs

1. **Photon API** (`https://photon.komoot.io/api/`) - Location geocoding and autocomplete
2. **simple-astro-api** (`https://simple-astro-api.netlify.app/api/positions`) - Planetary calculations
3. **chart2txt v0.6.0** - Astrological text generation (npm package)
4. **MailerLite API** - Email subscription management via Netlify serverless function

## Email Subscription System

The app includes an email subscription feature powered by MailerLite for user updates and announcements.

### Netlify Serverless Function

- **Endpoint**: `/.netlify/functions/subscribe-email`
- **Function**: `/functions/subscribe-email.js`
- **Method**: POST
- **Purpose**: Securely handles MailerLite API calls server-side

### Environment Configuration

Required environment variable in Netlify dashboard:

```
MAILERLITE_API_KEY=your_mailerlite_api_key_here
```

**Setup Instructions:**

1. Go to your Netlify dashboard > Site settings > Environment variables
2. Add `MAILERLITE_API_KEY` with your MailerLite API key
3. Redeploy the site for changes to take effect

### API Usage

**Request Format:**

```javascript
POST /.netlify/functions/subscribe-email
Content-Type: application/json

{
  "email": "user@example.com",
  "name": "User Name" // optional
}
```

**Response Format:**

```javascript
// Success
{
  "success": true,
  "message": "Successfully subscribed to updates!",
  "subscriber": {
    "email": "user@example.com",
    "id": "subscriber_id"
  }
}

// Error
{
  "error": "Error message here"
}
```

### Security Features

- API key stored securely in Netlify environment variables
- CORS headers configured for cross-origin requests
- Input validation and sanitization
- Rate limiting and error handling
- No sensitive data exposed to client-side code

## Theme System

All components use the centralized theme system:

```typescript
// Theme hook usage
const appTheme = useAppTheme();
const paperTheme = theme; // for PaperProvider

// Color palette (dark sci-fi)
theme.app.colors.background; // #08081a (dark blue/purple)
theme.app.colors.primary; // #00BFFF (cyan)
theme.app.colors.event; // #FF9800 (orange for event charts)
```

## Development Workflow

1. **Types First**: Update `src/types/index.ts` for new features
2. **Business Logic**: Implement in `src/utils/`
3. **UI Components**: Update in `src/components/`
4. **Verification**: Always run TypeScript check before committing

### Cross-Platform Considerations

- Native date/time pickers on mobile, HTML5 inputs on web
- Platform-specific dialog handling with proper z-index
- Web-specific CSS properties: avoid `outline`, use `borderWidth: 0`

### Chart Library Features

- **Auto-save**: Charts saved automatically after generation with last-used tracking
- **Quick Select**: Recent 5 charts in bottom sheet modal
- **Full Library**: Comprehensive edit/delete with search and sorting
- **Full Edit Capability**: Edit all chart data (name, date, time, location, event flag, unknown time)
- **Event Indicators**: Orange "Event" chips consistently shown throughout UI
- **Unknown Time Support**: Display "unknown" instead of time when applicable
- **Limits**: 100 charts max, alphabetical sorting

### Structured Prompt System

Four-layer prompt generation:

1. **Reading Voice** - Voice/tone configuration
   - Dropdown: "Standard" (warm, accessible) | "None" (omit)
   - Default: Standard, provides conversational guidance text
2. **Reading Style** - Astrological approach selection
   - Dropdown: "Modern" (psychological) | "Traditional" (classical) | "None" (omit)
   - Default: Modern, defines interpretation methodology
3. **System Prompt** - Hardcoded interpretation guidelines
   - Ships with application, defines interpretation quality and style
   - Toggle to omit system prompt if desired
   - Read-only display with expand/collapse functionality
   - Versioned for future updates (`systemPrompt.ts`)
4. **User Prompt** - Simple text editor for custom prompts
   - Basic text area for immediate editing on main form
   - No templates or library functionality
   - Direct input for custom interpretation guidance

Final output: `Voice + Style + System + User + Chart Data` (double newlines between sections)

### Result Library System

- **Auto-Save Results**: Complete chart generation results automatically saved
- **Auto-Generated Names**: Based on chart names, configuration, and timestamp
- **Dual Loading**: View results or populate form for re-generation
- **CRUD Operations**: Rename, delete, and manage saved results
- **Storage Limit**: 100 results maximum with oldest-first removal (FIFO)
- **Rich Summaries**: 2-3 line previews with chart names, config, and prompt text
- **Complete Data**: Stores form data, raw chart text, and display text with prompts

## Architecture Patterns

### Portal vs Modal Strategy

- **Modal Components**: ChartResultDialog uses React Native Modal for guaranteed top layer
- **Portal Components**: ChartLibrary, ResultLibrary, LoadingDialog use centralized Portal management
- **Layering Solution**: Modal components always appear above Portal components
- **Mixed Architecture**: Each dialog type uses most appropriate rendering method

### Component Organization

**Modular Directory Structure**: Components are organized into functional modules for better maintainability:

```
src/components/
├── chart-input/          # Form components for entering chart data
│   ├── ChartForm.tsx
│   ├── ChartFormDialog.tsx
│   ├── DateTimeInput.tsx
│   ├── LocationAutocomplete.tsx
│   ├── LocationModal.tsx
│   ├── MobileWebDatePicker.tsx
│   ├── MobileWebTimePicker.tsx
│   └── index.ts
├── chart-management/     # Chart library and storage components
│   ├── ChartLibrary.tsx
│   ├── ChartQuickSelect.tsx
│   ├── ResultLibrary.tsx
│   └── index.ts
├── chart-generation/     # Main workflow and generation components
│   ├── AstroForm.tsx
│   ├── AdvancedAstrologyOptions.tsx
│   ├── ReadingVoiceCard.tsx
│   ├── TransitAnalysisCard.tsx
│   ├── UserPromptCard.tsx
│   ├── UserPromptEditor.tsx
│   ├── LoadingDialog.tsx
│   └── index.ts
├── chart-results/        # Result display and sharing components
│   ├── ChartResultDialog.tsx
│   ├── ChartSummarySection.tsx
│   ├── ShareInstructionsSection.tsx
│   └── index.ts
└── shared/              # Common/cross-cutting components
    ├── ResponsiveDialog.tsx
    ├── SectionDivider.tsx
    ├── WebResponsiveContainer.tsx
    ├── InfoDialog.tsx
    ├── EmailSubscriptionForm.tsx
    └── index.ts
```

**Import Patterns**:

- Each module exports components via `index.ts` files
- Import from modules: `import { ComponentName } from '../components/module-name'`
- Cross-module imports use relative paths: `import Component from '../other-module/Component'`
- Core dependencies use depth-2 paths: `import { useAppTheme } from '../../theme'`

**Architectural Benefits**:

- **Separation of Concerns**: Components grouped by functional purpose
- **Scalability**: Easy to locate and modify related components
- **Clean Imports**: Barrel exports reduce import complexity
- **Maintainability**: Logical organization reduces cognitive overhead

## Common Issues

### Platform Detection

- **IMPORTANT**: Always use `getPlatformInfo()` from `src/utils/platform.ts` instead of React Native's `Platform.OS` directly
- The utility provides consistent platform detection and additional flags like `isNative`, `isDesktop`, `isMobile`
- Example: `const platformInfo = getPlatformInfo(); platformInfo.isWeb` instead of `Platform.OS === 'web'`

### Web Platform

- Use `ResponsiveDialog` for proper web dialog behavior
- Apply platform-specific height/scrolling styles
- Handle CSS incompatibilities (no `outline`, use `borderWidth: 0`)
- Portal layering: React Native Paper Portals render to same Portal.Host, making z-index ineffective

### Location Services

- 300ms debounce, 3-character minimum for autocomplete
- GPS fallback for transit analysis using expo-location
- Request cancellation for stale API calls

### Data Migration

- Automatic defaults for new fields in ChartFormData (no migration scripts needed)
- Storage key organization: `@chart2ai_charts` vs old `@chart2ai_people`
- Breaking changes handled with graceful fallbacks

### Chart Generation

- **chart2txt v0.6.0**: Array-based MultiChartData integration
- **Event Support**: Proper chartType assignment ('natal'/'event'/'transit')
- **Multiple Charts**: N charts + optional transit analysis
- **Error Handling**: User-friendly API error messages
- **Auto-Save Integration**: Results automatically saved to Result Library
- Use `chart.isEvent` flag to determine chart type
- Handle unknown time with `chart.unknownTime` boolean
- Validate all form data before API calls using `chartValidation.ts`
