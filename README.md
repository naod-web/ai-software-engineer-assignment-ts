## HTTP Client with OAuth2 Token Authentication
📋 Overview
This library provides an HttpClient class that enriches API requests with OAuth2 Authorization headers. It intelligently manages the token lifecycle:

Accepts tokens as class instances or plain objects (deserialized from storage).

Automatically refreshes expired or missing tokens.

Injects the valid Bearer token into request headers.

The core challenge solved was ensuring the client correctly recognizes and processes plain object tokens, a common scenario when loading tokens from localStorage or API responses.

✨ Features
Dual Token Support: Handles both OAuth2Token class instances and plain JavaScript objects.

Automatic Expiration Check: Calculates token expiry and triggers a refresh (refreshOAuth2()) only when necessary.

Minimal & Focused: Clean, single-responsibility classes with no external HTTP dependencies for the core logic.

Comprehensive Test Suite: 100% coverage of token scenarios using Jest.

Containerized Testing: Dockerfile provided for a consistent, isolated test environment.

## Prerequisites
Node.js (v18 or later)
npm (v9 or later)
Docker (for containerized tests)

## Installation

1. Clone your forked repository:
git clone https://github.com/MoeYasir ai-software-engineer-assignment-ts.git

cd /ai-software-engineer-assignment-ts

2. Install dependencies:
npm install

🧪 Running Tests
Execute the test suite directly on your machine:
npm test

## With Docker(We have two option one is manual start or with command)

1. Build the Docker image:
docker build -t http-client-tests .

Note: If you encounter SSL certificate errors during the build (common in some corporate networks), use the host's network stack:

docker build --network=host -t http-client-tests .

2. Run the tests inside the container:
docker run --rm http-client-tests

or in one line we can use

docker build --network=host -t http-client-tests . && docker run --rm http-client-tests

## Docker Implementation

Dockerfile:
FROM node:18-alpine
WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .
CMD ["npm", "test"]

This setup guarantees that tests run identically regardless of the host system's configuration.

## Project Structure
.
├── src/
│   ├── httpClient.ts      # Core HttpClient logic with the bug fix
│   └── tokens.ts          # OAuth2Token class definition
├── tests/
│   └── httpClient.test.ts # Test suite covering all token scenarios
├── Dockerfile             # Container definition for testing
├── package.json           # Project manifest with pinned dependencies
├── tsconfig.json          # TypeScript compiler configuration
└── README.md              # This file

🛠️ Technical Decisions & Bug Fix

 key bug was identified and fixed in this project:

The Problem: The request() method only recognized tokens that were instances of the OAuth2Token class. It failed to check the expiration or generate a header for tokens stored as plain objects (e.g., { accessToken: '...', expiresAt: 123 }), even though the type system allowed them.

The Solution: Added type-safe helper functions (isValidTokenObject, isTokenExpired) that check for the presence and type of required properties (accessToken, expiresAt). This allows the client to seamlessly handle both representations, fulfilling the type contract and expected behavior.

For a detailed explanation, please see EXPLANATION.md.