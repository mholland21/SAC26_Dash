'use client';

import { useEffect, useState } from 'react';

interface PicksData {
  week: string | number;
  member: string;
  group: string;
  pick: string;
  odds: string;
  score: string;
  loqypress: string;
  dollars: number | string;
}

export default function PicksPage() {
  const [data, setData] = useState<PicksData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedWeek, setSelectedWeek] = useState<string>('');
  const [weeks, setWeeks] = useState<string[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetch('/api/get-sheets-data');
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const results = await response.json();
        setData(results);

        // Extract unique weeks and sort them
        const uniqueWeeks = Array.from(
          new Set(results.map((item: PicksData) => String(item.week)))
        )
          .filter((x): x is string => Boolean(x))
          .sort((a, b) => {
            const numA = parseInt(a, 10);
            const numB = parseInt(b, 10);
            return isNaN(numA) || isNaN(numB) ? 0 : numA - numB;
          });

        setWeeks(uniqueWeeks as string[]);
        if (uniqueWeeks.length > 0) {
          setSelectedWeek(uniqueWeeks[0] as string);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return <div className="loading">Loading picks data...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  const filteredData = data.filter((item) => String(item.week) === selectedWeek);
  const collegeData = filteredData.filter((item) => item.group === 'C');
  const nflData = filteredData.filter((item) => item.group === 'P');

  const renderTable = (tableData: PicksData[], title: string) => {
    return (
      <div key={title}>
        <h2>{title}</h2>
        <table>
          <thead>
            <tr>
              <th>Week</th>
              <th>Member</th>
              <th>Pick</th>
              <th>Odds</th>
              <th>Score</th>
              <th>LOQ/Y/Press</th>
            </tr>
          </thead>
          <tbody>
            {tableData.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', color: '#999' }}>
                  No data available for this week
                </td>
              </tr>
            ) : (
              tableData.map((item, index) => (
                <tr key={index}>
                  <td>{item.week}</td>
                  <td>{item.member}</td>
                  <td>{item.pick}</td>
                  <td>{item.odds}</td>
                  <td>{item.score}</td>
                  <td>{item.loqypress}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div>
      <h1>Picks</h1>
      <div>
        <label htmlFor="week-filter">Filter by Week: </label>
        <select
          id="week-filter"
          value={selectedWeek}
          onChange={(e) => setSelectedWeek(e.target.value)}
        >
          {weeks.map((week) => (
            <option key={week} value={week}>
              Week {week}
            </option>
          ))}
        </select>
      </div>

      {renderTable(collegeData, 'College')}
      {renderTable(nflData, 'NFL')}
    </div>
  );
}
