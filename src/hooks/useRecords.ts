import { useState, useEffect } from 'react';
import { BumpRecord, SeverityLevel } from '@/types/record';

const STORAGE_KEY = 'bump-records';

export function useRecords() {
  const [records, setRecords] = useState<BumpRecord[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setRecords(JSON.parse(stored));
    }
  }, []);

  const saveRecords = (newRecords: BumpRecord[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newRecords));
    setRecords(newRecords);
  };

  const addBumpRecord = (location: string, severity: SeverityLevel) => {
    const now = new Date();
    const newRecord: BumpRecord = {
      id: crypto.randomUUID(),
      date: now.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' }),
      time: now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      type: 'bump',
      location,
      severity,
    };
    saveRecords([newRecord, ...records]);
  };

  const addSafeRecord = () => {
    const now = new Date();
    const newRecord: BumpRecord = {
      id: crypto.randomUUID(),
      date: now.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' }),
      time: now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      type: 'safe',
    };
    saveRecords([newRecord, ...records]);
  };

  // Get records from the last 14 days
  const getRecentRecords = () => {
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
    
    return records.slice(0, 50); // Show last 50 records max for performance
  };

  return {
    records: getRecentRecords(),
    addBumpRecord,
    addSafeRecord,
  };
}
