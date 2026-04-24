# SRM Full Stack Engineering Challenge - Round 1

## Overview
This repository contains the solution for the SRM Full Stack Engineering Challenge. It features a Node.js (Express) REST API and a modern React + Tailwind frontend built with Vite. The application parses hierarchical graph data, detects trees and cycles, and displays the structured insights in a neo-noir dark-themed UI.

## Project Structure
- `api/` - The Express.js REST API backend
- `client/` - The React + Tailwind frontend

## Requirements
- Node.js (v18+ recommended)
- npm or yarn

## Setup & Run Instructions

### 1. Backend (API)
1. Navigate to the API directory:
   ```bash
   cd api
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the server:
   ```bash
   npm start
   # Or run with node: node index.js
   ```
   *The server will start on port 3001 by default.*

### 2. Frontend (Client)
1. Open a new terminal and navigate to the Client directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   *The frontend will run on a local port (usually http://localhost:5173).*

## Key Features
- **API `POST /bfhl`**: Validates node structures, detects cycles and multiple parents, builds hierarchies, and calculates depths.
- **Frontend App**: Sends payloads to the API, displaying rich visual feedback using recursion-based Tree Viewers, error states, and responsive dark-mode cards.

## Deployment Notes
- Make sure to enable CORS in your hosting provider's settings if necessary, though `cors` is implemented in the Express backend.
- Ensure the base API URL in `client/src/App.jsx` points to your deployed backend URL.

## Submitted By
- Tarang Patra
- RA2311029010026
