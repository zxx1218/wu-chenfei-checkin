import { useState, useEffect } from 'react';
import { BumpRecord, SeverityLevel } from '@/types/record';
import { supabase } from '@/integrations/supabase/client';

export function useRecords() {
  const [records, setRecords] = useState<BumpRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch records from database
  const fetchRecords = async () => {
    const { data, error } = await supabase
      .from('bump_records')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching records:', error);
      return;
    }

    if (data) {
      setRecords(data.map(record => ({
        id: record.id,
        date: record.date,
        time: record.time,
        type: record.type as 'bump' | 'safe',
        location: record.location || undefined,
        severity: record.severity as SeverityLevel | undefined,
      })));
    }
    setLoading(false);
  };

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

  return {
    records,
    loading,
    addBumpRecord,
    addSafeRecord,
  };
}
