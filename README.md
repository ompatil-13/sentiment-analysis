Sentiment Analysis App

A web application that analyzes text input and provides sentiment analysis (Positive, Negative, Neutral) using a cloud API. Built with React, TypeScript, Tailwind CSS, and shadcn-ui.

Features

Analyze user-provided text for sentiment.

Displays results in a clean and user-friendly UI.

Shows confidence or score for sentiment categories.

Responsive design suitable for desktop and mobile.

Easily extendable to multiple languages or APIs.

Tech Stack

Frontend: React, TypeScript, Tailwind CSS

UI Components: shadcn-ui

API Integration: Google Cloud Natural Language API (or any other sentiment analysis API)

Build Tool: Vite

Getting Started
Prerequisites

Node.js >= 18.x

npm or yarn

Google Cloud API Key (or other API credentials for sentiment analysis)

Installation

Clone the repository:

git clone https://github.com/<your-username>/<repository-name>.git
cd <repository-name>


Install dependencies:

npm install
# or
yarn install


Create a .env file in the root directory and add your API key:

VITE_API_KEY=your_api_key_here


Make sure to restart the development server after adding the .env file.

Start the development server:

npm run dev
# or
yarn dev


Open your browser at http://localhost:5173

Usage

Enter text in the input field.

Click the Analyze button.

View the sentiment results (Positive / Negative / Neutral) with corresponding confidence.

Project Structure
src/
├── components/       # Reusable UI components
├── pages/            # Page components
├── utils/            # Helper functions (API calls)
├── App.tsx           # Main app component
└── main.tsx          # Entry point

Screenshots




Contributing

Contributions are welcome! Please follow these steps:

Fork the repository

Create a new branch (git checkout -b feature/YourFeature)

Make your changes

Commit your changes (git commit -m 'Add some feature')

Push to the branch (git push origin feature/YourFeature)

Open a Pull Request

License

This project is licensed under the MIT License - see the LICENSE
 file for details.

Acknowledgements

React

Tailwind CSS

shadcn-ui

Google Cloud Natural Language API
