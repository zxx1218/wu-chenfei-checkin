import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface MilkteaRecord {
  id: string;
  date: string;
  time: string;
  type: 'milktea' | 'no_milktea';
  brand?: string;
  drinkName?: string;
  createdAt?: string;
}

export function useMilkteaRecords() {
  const [allRecords, setAllRecords] = useState<MilkteaRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const getTodayDateString = () => {
    return new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const hasNoMilkteaToday = useMemo(() => {
    const todayStr = getTodayDateString();
    return allRecords.some(r => r.type === 'no_milktea' && r.date === todayStr);
  }, [allRecords]);

  const todayMilkteaCount = useMemo(() => {
    const todayStr = getTodayDateString();
    return allRecords.filter(r => r.type === 'milktea' && r.date === todayStr).length;
  }, [allRecords]);

  const fetchRecords = async () => {
    const { data, error } = await supabase
      .from('milktea_records')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching milktea records:', error);
      return;
    }

    if (data) {
      setAllRecords(data.map(record => ({
        id: record.id,
        date: record.date,
        time: record.time,
        type: record.type as 'milktea' | 'no_milktea',
        brand: record.brand || undefined,
        drinkName: record.drink_name || undefined,
        createdAt: record.created_at,
      })));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRecords();

    const channel = supabase
      .channel('milktea_records_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'milktea_records' }, () => {
        fetchRecords();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const addMilkteaRecord = async (brand?: string, drinkName?: string) => {
    if (hasNoMilkteaToday) return false;

    const now = new Date();
    const { error } = await supabase
      .from('milktea_records')
      .insert({
        date: now.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' }),
        time: now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
        type: 'milktea',
        brand: brand || null,
        drink_name: drinkName || null,
      });

    if (error) {
      console.error('Error adding milktea record:', error);
      return false;
    }
    return true;
  };

  const addNoMilkteaRecord = async (): Promise<{ success: boolean; alreadyCheckedIn: boolean }> => {
    if (hasNoMilkteaToday) return { success: false, alreadyCheckedIn: true };
    if (todayMilkteaCount > 0) return { success: false, alreadyCheckedIn: false };

    const now = new Date();
    const { error } = await supabase
      .from('milktea_records')
      .insert({
        date: now.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' }),
        time: now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
        type: 'no_milktea',
      });

    if (error) {
      console.error('Error adding no milktea record:', error);
      return { success: false, alreadyCheckedIn: false };
    }
    return { success: true, alreadyCheckedIn: false };
  };

  const deleteRecord = async (id: string) => {
    const { error } = await supabase
      .from('milktea_records')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting milktea record:', error);
      return false;
    }
    setAllRecords(prev => prev.filter(r => r.id !== id));
    return true;
  };

  return {
    records: allRecords,
    loading,
    addMilkteaRecord,
    addNoMilkteaRecord,
    deleteRecord,
    hasNoMilkteaToday,
    todayMilkteaCount,
  };
}
