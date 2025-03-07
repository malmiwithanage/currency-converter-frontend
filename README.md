# Currency Converter

A simple currency converter web app that allows users to convert between various currencies. The app fetches live exchange rates and provides an intuitive user interface for seamless currency conversions.

## Features
- Convert between multiple currencies.
- Display transaction history of previous conversions.
- Real-time currency conversion with rates provided by the [Exchange Rate API](https://www.exchangerate-api.com).

## Live Site
You can access the live version of the app here:  
[Currency Converter](https://currency-converter-frontend-rho.vercel.app/)

## Technologies Used
- **Frontend**: React.js, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express, MongoDB
- **API**: Exchange Rate API for live currency rates.

## How It Works
1. Select a **From Country** and **To Country**.
2. Enter the amount you want to convert.
3. The app fetches live exchange rates and displays the converted amount in real time.
4. Each transaction is stored in the transaction history.

## Attribution
The live exchange rates are powered by the [Exchange Rate API](https://www.exchangerate-api.com).

## How to Run Locally
1. Clone the repository:
    ```bash
    git clone <repository-url>
    ```
2. Install dependencies:
    ```bash
    npm install
    ```
3. Start the development server:
    ```bash
    npm run dev
    ```
