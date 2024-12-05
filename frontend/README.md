
# Solar Sizing Bill Calculator with AI

A web application for calculating solar sizing bills using AI integration.

## Table of Contents

- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Project Structure](#project-structure)
- [Usage](#usage)
- [Running Tests](#running-tests)
- [Common Errors and Solutions](#common-errors-and-solutions)
- [Contributing](#contributing)
- [License](#license)

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm (version 6 or higher)

### Installation

Clone the repository:

```bash
git clone https://github.com/yourusername/solar-sizing-bill-calculator-with-ai.git
```

Navigate to the project directory:

```bash
cd solar-sizing-bill-calculator-with-ai
```

Install the dependencies:

```bash
npm install
```

## Project Structure

```
src/
├── api/
│   ├── client/
│   │   ├── axiosClient.js
│   │   └── apiConfig.js
│   ├── base/
│   │   └── BaseApiService.js
│   ├── services/
│   │   ├── billApi.js
│   │   └── quoteApi.js
│   └── middleware/
│       ├── authMiddleware.js
│       └── errorHandler.js
├── components/
│   └── ... (UI components)
├── core/
│   ├── events/
│   │   └── EventBus.js
│   └── ... (core utilities)
├── store/
│   └── solarSizingState.js
├── js/
│   ├── app.js
│   └── tests/
│       ├── app.test.js
│       └── ... (other tests)
└── config/
    └── environment.js
```

- **api/**: Contains the API layer, including the client setup, base service, specific service implementations, and middleware.
- **components/**: Contains the UI components built using LitHTML or other frameworks.
- **core/**: Core utilities like the EventBus for application-wide event handling.
- **store/**: Application state management.
- **js/**: Main application entry point and JavaScript tests.
- **config/**: Environment configurations.

## Usage

To start the application, you can use:

```bash
npm start
```

*(Note: Ensure that you have the appropriate start script in your `package.json` and that any required environment variables are set.)*

## Running Tests

We are using Jest for testing. To run the tests, use:

```bash
npm test
```
