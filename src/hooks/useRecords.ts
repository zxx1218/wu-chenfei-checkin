import { useState, useEffect, useMemo } from 'react';
import { BumpRecord, SeverityLevel } from '@/types/record';
import { supabase } from '@/integrations/supabase/client';

export function useRecords() {
  const [allRecords, setAllRecords] = useState<BumpRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });

  // Fetch all records from database
  const fetchRecords = async () => {
    const { data, error } = await supabase
      .from('bump_records')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching records:', error);
      return;
    }

    if (data) {
      setAllRecords(data.map(record => ({
        id: record.id,
        date: record.date,
        time: record.time,
        type: record.type as 'bump' | 'safe',
        location: record.location || undefined,
        severity: record.severity as SeverityLevel | undefined,
        createdAt: record.created_at,
      })));
    }
    setLoading(false);
  };

  // Filter records by date range
  const filteredRecords = useMemo(() => {
    if (!dateRange.from && !dateRange.to) {
      return allRecords;
    }

    return allRecords.filter(record => {
      const recordDate = new Date(record.createdAt || record.date);
      
      if (dateRange.from && dateRange.to) {
        const from = new Date(dateRange.from);
        from.setHours(0, 0, 0, 0);
        const to = new Date(dateRange.to);
        to.setHours(23, 59, 59, 999);
        return recordDate >= from && recordDate <= to;
      }
      
      if (dateRange.from) {
        const from = new Date(dateRange.from);
        from.setHours(0, 0, 0, 0);
        return recordDate >= from;
      }
      
      return true;
    });
  }, [allRecords, dateRange]);

  useEffect(() => {
    fetchRecords();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('bump_records_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'bump_records',
        },
        () => {
          fetchRecords();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const addBumpRecord = async (location: string, severity: SeverityLevel) => {
    const now = new Date();
    const newRecord = {
      date: now.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' }),
      time: now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      type: 'bump' as const,
      location,
      severity,
    };

    const { error } = await supabase
      .from('bump_records')
      .insert(newRecord);

    if (error) {
      console.error('Error adding bump record:', error);
    }
  };

  const addSafeRecord = async () => {
    const now = new Date();
    const newRecord = {
      date: now.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' }),
      time: now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      type: 'safe' as const,
    };

    const { error } = await supabase
      .from('bump_records')
      .insert(newRecord);

    if (error) {
      console.error('Error adding safe record:', error);
    }
  };

  const deleteRecord = async (id: string) => {
    const { error } = await supabase
      .from('bump_records')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting record:', error);
      return false;
    }
    
    // Update local state immediately
    setAllRecords(prev => prev.filter(record => record.id !== id));
    return true;
  };

  const setFilterDateRange = (range: { from: Date | undefined; to: Date | undefined }) => {
    setDateRange(range);
  };

  return {
    records: filteredRecords,
    allRecords,
    loading,
    addBumpRecord,
    addSafeRecord,
    deleteRecord,
    setFilterDateRange,
    dateRange,
  };
}
