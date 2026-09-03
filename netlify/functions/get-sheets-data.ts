import { Handler } from '@netlify/functions';

const SHEET_ID = '1uMqoe9DBEWioVdpuzAik9YybGSmqm0qxSq8lm9B3Wb0';
const SHEET_GID = '0';

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

function parseCSV(csvText: string): Record<string, string>[] {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return [];

  // Parse header
  const headerLine = lines[0];
  const headers = parseCSVLine(headerLine).map(h => h.toLowerCase().trim());

  // Parse rows
  const rows: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = parseCSVLine(line);
    const row: Record<string, string> = {};

    headers.forEach((header, index) => {
      row[header] = values[index] ? String(values[index]).trim() : '';
    });

    rows.push(row);
  }

  return rows;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        current += '"';
        i++; // Skip next quote
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current);
  return result;
}

async function fetchSheetData(): Promise<PicksData[]> {
  try {
    const csvUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${SHEET_GID}`;

    const response = await fetch(csvUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch CSV: ${response.statusText}`);
    }

    const csvText = await response.text();
    const rows = parseCSV(csvText);

    if (rows.length === 0) {
      return [];
    }

    const records: PicksData[] = [];

    rows.forEach((row: Record<string, string>) => {
      const getColumnValue = (columnNames: string[]): string => {
        const key = Object.keys(row).find(k =>
          columnNames.some(name => k.includes(name.toLowerCase()))
        );
        return key ? row[key] : '';
      };

      const record: PicksData = {
        week: getColumnValue(['week']),
        member: getColumnValue(['member']),
        group: getColumnValue(['group']),
        pick: getColumnValue(['pick']),
        odds: getColumnValue(['odds']),
        score: getColumnValue(['score']),
        loqypress: getColumnValue(['loq', 'press']),
        dollars: getColumnValue(['dollars']) || '0',
      };

      if (record.member && record.week) {
        records.push(record);
      }
    });

    return records;
  } catch (error) {
    console.error('Error fetching sheet data:', error);
    throw error;
  }
}

const handler: Handler = async (event, context) => {
  try {
    const data = await fetchSheetData();
    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch data' }),
    };
  }
};

export default handler;
