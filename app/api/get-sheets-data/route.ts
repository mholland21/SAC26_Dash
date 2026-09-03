import { NextRequest, NextResponse } from 'next/server';

const SHEET_ID = '1uMqoe9DBEWioVdpuzAik9YybGSmqm0qxSq8lm9B3Wb0';

export interface PicksData {
  week: string | number;
  member: string;
  group: string;
  pick: string;
  odds: string;
  score: string;
  loqypress: string;
  dollars: number | string;
}

export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.GOOGLE_SHEETS_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'GOOGLE_SHEETS_API_KEY environment variable is not set' },
        { status: 500 }
      );
    }

    const range = encodeURIComponent('Sheet1!A1:Z1000');
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${range}?key=${apiKey}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Google Sheets API error: ${response.statusText}`);
    }

    const data = await response.json();
    const rows = data.values || [];

    if (rows.length === 0) {
      return NextResponse.json([]);
    }

    const headers = rows[0].map((h: string) => h.toLowerCase().trim());
    const records: PicksData[] = [];

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];

      // Skip empty rows
      if (!row || row.every((cell: any) => !cell)) {
        continue;
      }

      const weekIdx = headers.indexOf('week');
      const memberIdx = headers.indexOf('member');
      const groupIdx = headers.indexOf('group');
      const pickIdx = headers.indexOf('pick');
      const oddsIdx = headers.indexOf('odds');
      const scoreIdx = headers.indexOf('score');
      const loqyIdx = headers.indexOf('loq/y/press');
      const dollarsIdx = headers.indexOf('dollars');

      const record: PicksData = {
        week: row[weekIdx] || '',
        member: row[memberIdx] || '',
        group: row[groupIdx] || '',
        pick: row[pickIdx] || '',
        odds: row[oddsIdx] || '',
        score: row[scoreIdx] || '',
        loqypress: row[loqyIdx] || '',
        dollars: row[dollarsIdx] || 0,
      };

      // Only include records that have at least a member
      if (record.member) {
        records.push(record);
      }
    }

    return NextResponse.json(records);
  } catch (error) {
    console.error('Function error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data' },
      { status: 500 }
    );
  }
}
