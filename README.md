# Take Home Pay Calculator

A Next.js application that helps users calculate their expected take-home salary after various deductions including tax, pension contributions, student loan repayments, and other statutory deductions.

## Overview

This calculator provides users with an accurate estimate of their net salary based on current UK tax regulations, helping them understand the impact of various deductions on their gross salary.

### Planned Features

- Calculate income tax based on current UK rates
- National Insurance contributions
- Pension contribution calculations
- Student loan repayment estimates (Plans 1, 2, 4, and Postgraduate)
- Clear breakdown of all deductions
- Monthly and annual take-home pay views
- Responsive design for mobile and desktop

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Package Manager**: npm

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm 9.x or higher

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd take-me-home
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Available Scripts

- `npm run dev` - Start development server (with Turbopack)
- `npm run build` - Create production build
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Project Structure

```
take-me-home/
├── src/
│   ├── app/              # Next.js App Router pages
│   │   ├── layout.tsx    # Root layout
│   │   └── page.tsx      # Home page
│   ├── components/       # React components
│   ├── lib/              # Utility functions and helpers
│   └── types/            # TypeScript type definitions
├── public/               # Static assets
└── [config files]        # TypeScript, Tailwind, ESLint configs
```

## Development Guidelines

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development guidelines and conventions.

## Tax Year Information

Calculations are based on UK tax rates for the 2024/25 tax year (England, Wales, and Northern Ireland).

**Note**: This calculator provides estimates only and should not be considered financial advice. Actual take-home pay may vary based on individual circumstances.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

## License

[Add license information]

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.
