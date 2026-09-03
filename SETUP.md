# Setup Instructions

This application displays sports picks and results from a Google Sheet.

## Prerequisites

1. **Google Sheets API Key**: You need to set up a Google Sheets API key to fetch data from the sheet.
   - Go to https://console.cloud.google.com/
   - Create a new project or select an existing one
   - Enable the "Google Sheets API"
   - Create an API key (you can restrict it to Google Sheets API for security)
   - Copy the API key

2. **Environment Variables**: Set up your environment variables:
   - Create a file called `.env.local` in the root directory
   - Add: `GOOGLE_SHEETS_API_KEY=your_api_key_here` (replace with your actual key)

## Application Structure

### Pages

1. **Picks** (`/picks`)
   - Displays picks data from the Google Sheet
   - Filterable by Week
   - Split into two tables:
     - College (Group "C")
     - NFL (Group "P")
   - Shows columns: Week, Member, Pick, Odds, Score, LOQ/Y/Press

2. **Results** (`/results`)
   - Shows totals of the "Dollars" column for each member
   - Three tables:
     - Overall Totals: Sum of all dollars by member
     - Quarterly Totals: Sum grouped by quarter and member
     - Weekly Totals: Sum grouped by week and member

### API Endpoints

- `/api/get-sheets-data`: Fetches data from Google Sheet (ID: 1uMqoe9DBEWioVdpuzAik9YybGSmqm0qxSq8lm9B3Wb0)

## Development

To run locally:
```bash
npm install
npm run dev
```

The app will start at http://localhost:3000

## Build & Deploy

The application will automatically build and deploy when you push to the main branch on Netlify.

```bash
npm run build
```
