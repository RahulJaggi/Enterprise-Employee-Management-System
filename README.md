# 🏢 Enterprise Employee Management System

Welcome to the **Enterprise Employee Management System**—a modern, responsive, and robust single-page application (SPA) designed to manage organizational directories, hierarchies, department allocation, and employee profiles. 

This repository houses the frontend client built on the modern **Angular Stack** utilizing state-of-the-art Angular features (Signals, Standalone Components, and clean routing).

---

## 🚀 Key Features

* **Live Dashboard:** Quick visualization of organizational health, employee distributions, and departmental counts.
* **Employee Directory:** Complete CRUD operations for employee records, featuring real-time filtering, multi-field searching, and sorting.
* **Department Management:** Manage departments, assign employees, and structure management hierarchies.
* **Role & Profile Views:** Beautiful user profiles displaying job titles, contact information, department mappings, and system roles.
* **Responsive Layout:** A premium, adaptive design optimized for widescreen monitors, tablets, and mobile devices.

---

## 🛠️ Technology Stack

- **Framework:** [Angular](https://angular.dev/) v21.x (utilizing Standalone Component architecture and Signals for fine-grained reactivity)
- **Language:** [TypeScript](https://www.typescriptlang.org/) v5.9.x
- **State Management:** Angular Signals & [RxJS](https://rxjs.dev/) for asynchronous data flows
- **Styling:** Modern Vanilla CSS (CSS Grid, Flexbox, Custom CSS variables for easy theme customization)
- **Unit Testing:** [Vitest](https://vitest.dev/) for blazing-fast unit tests

---

## 📂 Directory Structure

A brief overview of the project structure:

```text
├── public/                  # Static assets (favicons, fonts, images)
├── src/
│   ├── app/
│   │   ├── app.config.ts    # Application-wide configurations and providers
│   │   ├── app.routes.ts    # Application routing definitions
│   │   ├── app.ts           # Root component class
│   │   ├── app.html         # Root HTML template
│   │   └── app.css          # Global root styles
│   ├── index.html           # Main HTML entry point
│   ├── main.ts              # Application bootstrap entry point
│   └── styles.css           # Global stylesheet and custom properties
├── angular.json             # Angular CLI workspace configuration
├── package.json             # Project dependencies and script scripts
├── tsconfig.json            # Base TypeScript configuration
└── vite.config.ts           # Vitest configuration
```

---

## 💻 Getting Started

### Prerequisites

Make sure you have [Node.js](https://nodejs.org/) (v20+ recommended) and [npm](https://www.npmjs.com/) installed on your machine.

### Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/RahulJaggi/Enterprise-Employee-Management-System.git
cd Enterprise-Employee-Management-System
npm install
```

### Development Server

Run the development server locally:

```bash
npm start
```

Once the server is running, navigate to `http://localhost:4200/` in your browser. The application will automatically reload if you change any of the source files.

### Building

To compile and build the production-ready assets:

```bash
npm run build
```

The optimized build files will be output to the `dist/employee-management-system/` directory.

### Running Unit Tests

Run the test suite using Vitest:

```bash
npm run test
```

---

## 📄 License

This project is licensed under the MIT License.
