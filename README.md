
# 0DEV 🚀

**0dev** is an NL-first* platform that offers a flexible environment for working with data, enabling fast, intuitive methods to access, analyze, and visualize data **<u>with significantly less complexity</u>**.

Today, accessing data typically requires extensive developer involvement, and deriving insights often demands data scientists’ expertise. While 0dev isn’t designed to replace these roles, it seeks to make data more accessible to everyone, reducing dependency on specialized skills.

 NL-first: 0dev is designed to be natural language first, meaning users can interact with the platform using natural language queries. Initially, we provide the functionalities through a combination of (classic?) UI and NL, but as we develop the platform further, we aim to enable more and more functionalities through NL.

With 0dev, you can answer questions like:

- How many users signed up last week?
- What is the average revenue per user?

Results from these queries can also be visualized as tables and charts in a report which can be saved and easily shared with your team.

The platform is built with extensibility in mind, allowing users to add new data sources, query engines, AI models, and more. The vision for 0dev is to expand its capabilities both horizontally and vertically: horizontally, by adding more and more AI-driven functionality, and vertically, by enhancing existing features for even greater depth and utility.

[![YouTube Video](https://img.shields.io/badge/Watch%20on-YouTube-red?style=for-the-badge&logo=youtube)](https://www.youtube.com/embed/K9B3AWI8uIE)
[![Join us on Discord](https://img.shields.io/badge/Join%20our-Discord-blue?style=for-the-badge&logo=discord)](https://discord.gg/GNSCWZm6kT)

---

## Table of Contents
- [0DEV 🚀](#0dev-)
  - [Table of Contents](#table-of-contents)
  - [Features](#features)
  - [Installation](#installation)
    - [Prerequisites](#prerequisites)
    - [Setup Instructions](#setup-instructions)
  - [Backend Overview](#backend-overview)
    - [Backend Tech Stack:](#backend-tech-stack)
  - [Frontend Overview](#frontend-overview)
    - [Frontend Tech Stack:](#frontend-tech-stack)
    - [Screenshots:](#screenshots)
  - [Contributing](#contributing)
  - [License](#license)

---

## Features

- **Data Source Management**: Easily connect and manage multiple data sources.
- **Query Builder**: Execute powerful queries across connected data sources.
- **Report Generation**: Generate and visualize reports from your query results.
- **User-friendly Interface**: Modern and clean UI for streamlined data operations.
- **Open-Source**: 0dev is free and customizable to suit your data management needs.

---

## Installation

### Prerequisites
- Node.js (version >= 16.x)
- Docker (optional but recommended for deployment)
- MongoDB (for data persistence)

### Setup Instructions
1. **Clone the repository:**
   ```bash
   git clone https://github.com/0dev-hq/0dev
   cd 0dev
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the development environment:**
   - **Frontend**:
     ```bash
     cd front
     npm run dev
     ```
   - **Backend**:
     ```bash
     cd back
     npm run dev
     ```

---

## Backend Overview

The backend of 0dev is built using **Node.js** and **Express**, handling API calls, data source connections, query executions, and report generation. Here are some key components:

- **Data Source Management**: 
  - Supports multiple data source connections (MongoDB, PostgreSQL, etc.).
  - Handles connection pooling and management.
  
- **Query Execution**: 
  - Exposes a robust query engine allowing users to write SQL-like queries to extract data.
  
- **Report Generation**:
  - Supports generating structured reports in various formats (tables, charts, etc.).
  
### Backend Tech Stack:
- **Node.js** (JavaScript runtime)
- **Express** (Web framework)
- **Mongoose** (MongoDB ORM)
- **Jest** (For testing)

---

## Frontend Overview

The frontend is built using **React** with **Tailwind CSS** for styling. It provides a clean and responsive UI for users to interact with data sources, build queries, and view reports.

- **Data Source UI**: Users can connect to various data sources with a simple form interface.
- **Query Builder**: Allows users to create and execute queries on connected data sources through an intuitive UI.
- **Report Viewer**: Displays the results of queries in visual formats like tables or charts.

### Frontend Tech Stack:
- **React** (JavaScript library for building UI)
- **Tailwind CSS** (Utility-first CSS framework)
- **Vite** (Fast build tool and development server)

### Screenshots:
![0dev UI](your-screenshot-link)

---

## Contributing

We welcome contributions! Here’s how you can get involved:

1. **Fork the repository**.
2. **Create a new branch** (`git checkout -b feature/your-feature`).
3. **Commit your changes** (`git commit -m 'Add new feature'`).
4. **Push to the branch** (`git push origin feature/your-feature`).
5. Open a **Pull Request**!

---

## License

This project is licensed under the Apache 2 License - see the [LICENSE](LICENSE) file for details.

---
