import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface DoiRecord {
  id: string;
  date: string;
  time: string;
  durationMinutes: number;
  position?: string;
  passionScore?: number;
  notes?: string;
  createdAt?: string;
}

export interface NewDoiRecord {
  date: string;
  time: string;
  durationMinutes: number;
  position?: string;
  passionScore?: number;
  notes?: string;
}

export function useDoiRecords() {
  const [records, setRecords] = useState<DoiRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRecords = async () => {
    const { data, error } = await supabase
      .from('doi_records')
      .select('*')
      .order('date', { ascending: false })
      .order('time', { ascending: false });

    if (error) {
      console.error('Error fetching doi records:', error);
      setLoading(false);
      return;
    }
    if (data) {
      setRecords(
        data.map((r: any) => ({
          id: r.id,
          date: r.date,
          time: r.time,
          durationMinutes: r.duration_minutes ?? 0,
          position: r.position || undefined,
          passionScore: r.passion_score ?? undefined,
          notes: r.notes || undefined,
          createdAt: r.created_at,
        }))
      );
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRecords();
    const channel = supabase
      .channel('doi_records_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'doi_records' }, () => {
        fetchRecords();
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const addRecord = async (r: NewDoiRecord) => {
    const { error } = await supabase.from('doi_records').insert({
      date: r.date,
      time: r.time,
      duration_minutes: r.durationMinutes,
      position: r.position || null,
      passion_score: r.passionScore ?? null,
      notes: r.notes || null,
    });
    if (error) {
      console.error('Error adding doi record:', error);
      return false;
    }
    return true;
  };

  const deleteRecord = async (id: string) => {
    const { error } = await supabase.from('doi_records').delete().eq('id', id);
    if (error) {
      console.error('Error deleting doi record:', error);
      return false;
    }
    setRecords((prev) => prev.filter((r) => r.id !== id));
    return true;
  };

  return { records, loading, addRecord, deleteRecord };
}