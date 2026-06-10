import { useState, useEffect, useMemo } from 'react';
import { milkteaApi } from '@/lib/api';

export interface MilkteaRecord {
  id: string;
  date: string;
  time: string;
  type: 'milktea' | 'no_milktea';
  brand?: string;
  drinkName?: string;
  image?: string;
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
    try {
      const data = await milkteaApi.getAll();
      
      console.log('API Response:', data);

      if (data && data.data && Array.isArray(data.data)) {
        setAllRecords(data.data.map((record: any) => ({
          id: record.id,
          date: record.date,
          time: record.time,
          type: record.type as 'milktea' | 'no_milktea',
          brand: record.brand || undefined,
          drinkName: record.drink_name || undefined,
          image: record.image || undefined,
          createdAt: record.created_at,
        })));
      } else {
        setAllRecords([]);
      }
    } catch (error) {
      console.error('Error fetching milktea records:', error);
      console.error('Error details:', error);
      setAllRecords([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRecords();
    
    // 设置定时器刷新数据，模拟实时更新
    const interval = setInterval(fetchRecords, 30000); // 每30秒刷新一次
    
    return () => {
      clearInterval(interval);
    };
  }, []);

  const addMilkteaRecord = async (brand?: string, drinkName?: string, image?: string) => {
    if (hasNoMilkteaToday) return false;

    const now = new Date();
    const record = {
      date: now.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' }),
      time: now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      type: 'milktea',
      brand: brand || null,
      drink_name: drinkName || null,
      image: image || null,
    };

    try {
      await milkteaApi.create(record);
      // Refresh the records
      fetchRecords();
      return true;
    } catch (error) {
      console.error('Error adding milktea record:', error);
      return false;
    }
  };

  const addNoMilkteaRecord = async (): Promise<{ success: boolean; alreadyCheckedIn: boolean }> => {
    if (hasNoMilkteaToday) return { success: false, alreadyCheckedIn: true };
    if (todayMilkteaCount > 0) return { success: false, alreadyCheckedIn: false };

    const now = new Date();
    const record = {
      date: now.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' }),
      time: now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      type: 'no_milktea',
    };

    try {
      await milkteaApi.create(record);
      // Refresh the records
      fetchRecords();
      return { success: true, alreadyCheckedIn: false };
    } catch (error) {
      console.error('Error adding no milktea record:', error);
      return { success: false, alreadyCheckedIn: false };
    }
  };

  const deleteRecord = async (id: string) => {
    try {
      await milkteaApi.delete(id);
      // Refresh the records
      fetchRecords();
      return true;
    } catch (error) {
      console.error('Error deleting milktea record:', error);
      return false;
    }
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