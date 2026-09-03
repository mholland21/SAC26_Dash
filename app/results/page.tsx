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

interface MemberTotals {
  member: string;
  total: number;
}

interface WeeklyTotals {
  week: string;
  member: string;
  total: number;
}

interface QuarterlyTotals {
  quarter: string;
  member: string;
  total: number;
}

export default function ResultsPage() {
  const [data, setData] = useState<PicksData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [overallTotals, setOverallTotals] = useState<MemberTotals[]>([]);
  const [quarterlyTotals, setQuarterlyTotals] = useState<QuarterlyTotals[]>([]);
  const [weeklyTotals, setWeeklyTotals] = useState<WeeklyTotals[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetch('/api/get-sheets-data');
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const results = await response.json();
        setData(results);

        // Calculate totals
        calculateTotals(results);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  function calculateTotals(rawData: PicksData[]) {
    // Helper function to determine quarter from week
    const getQuarter = (week: string | number): string => {
      const weekNum = parseInt(String(week), 10);
      if (isNaN(weekNum)) return 'Unknown';
      if (weekNum <= 4) return 'Q1';
      if (weekNum <= 8) return 'Q2';
      if (weekNum <= 12) return 'Q3';
      return 'Q4';
    };

    // Overall totals
    const overallMap = new Map<string, number>();
    // Quarterly totals
    const quarterlyMap = new Map<string, number>();
    // Weekly totals
    const weeklyMap = new Map<string, number>();

    rawData.forEach((item) => {
      const dollars = parseFloat(String(item.dollars)) || 0;
      const member = item.member || 'Unknown';
      const week = String(item.week);
      const quarter = getQuarter(item.week);

      // Overall
      const overallKey = member;
      overallMap.set(overallKey, (overallMap.get(overallKey) || 0) + dollars);

      // Quarterly
      const quarterlyKey = `${quarter}|${member}`;
      quarterlyMap.set(quarterlyKey, (quarterlyMap.get(quarterlyKey) || 0) + dollars);

      // Weekly
      const weeklyKey = `${week}|${member}`;
      weeklyMap.set(weeklyKey, (weeklyMap.get(weeklyKey) || 0) + dollars);
    });

    // Convert to arrays and sort
    const overall = Array.from(overallMap.entries())
      .map(([member, total]) => ({ member, total }))
      .sort((a, b) => a.member.localeCompare(b.member));

    const quarterly = Array.from(quarterlyMap.entries())
      .map(([key, total]) => {
        const [quarter, member] = key.split('|');
        return { quarter, member, total };
      })
      .sort((a, b) => {
        const quarterSort = a.quarter.localeCompare(b.quarter);
        return quarterSort !== 0 ? quarterSort : a.member.localeCompare(b.member);
      });

    const weekly = Array.from(weeklyMap.entries())
      .map(([key, total]) => {
        const [week, member] = key.split('|');
        return { week, member, total };
      })
      .sort((a, b) => {
        const weekNumA = parseInt(a.week, 10);
        const weekNumB = parseInt(b.week, 10);
        if (weekNumA !== weekNumB) {
          return isNaN(weekNumA) || isNaN(weekNumB) ? 0 : weekNumA - weekNumB;
        }
        return a.member.localeCompare(b.member);
      });

    setOverallTotals(overall);
    setQuarterlyTotals(quarterly);
    setWeeklyTotals(weekly);
  }

  if (loading) {
    return <div className="loading">Loading results data...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div>
      <h1>Results</h1>

      <h2>Overall Totals</h2>
      <table>
        <thead>
          <tr>
            <th>Member</th>
            <th>Total Dollars</th>
          </tr>
        </thead>
        <tbody>
          {overallTotals.map((item) => (
            <tr key={item.member}>
              <td>{item.member}</td>
              <td>${item.total.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Quarterly Totals</h2>
      <table>
        <thead>
          <tr>
            <th>Quarter</th>
            <th>Member</th>
            <th>Total Dollars</th>
          </tr>
        </thead>
        <tbody>
          {quarterlyTotals.map((item, index) => (
            <tr key={index}>
              <td>{item.quarter}</td>
              <td>{item.member}</td>
              <td>${item.total.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Weekly Totals</h2>
      <table>
        <thead>
          <tr>
            <th>Week</th>
            <th>Member</th>
            <th>Total Dollars</th>
          </tr>
        </thead>
        <tbody>
          {weeklyTotals.map((item, index) => (
            <tr key={index}>
              <td>Week {item.week}</td>
              <td>{item.member}</td>
              <td>${item.total.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
