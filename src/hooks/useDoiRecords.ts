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
  partnerOverallScore?: number;
  partnerPassionScore?: number;
  partnerDurationFeedback?: string;
  partnerPositionFeedback?: string;
  partnerComment?: string;
  partnerReviewer?: string;
  partnerReviewedAt?: string;
  scene?: string;
  femaleOrgasm?: boolean;
  oralSex?: boolean;
  oralExplosion?: boolean;
  ejaculationMethod?: string;
}

export interface NewDoiRecord {
  date: string;
  time: string;
  durationMinutes: number;
  position?: string;
  passionScore?: number;
  notes?: string;
  scene?: string;
  femaleOrgasm?: boolean;
  oralSex?: boolean;
  oralExplosion?: boolean;
  ejaculationMethod?: string;
}

export interface PartnerReview {
  partnerOverallScore?: number;
  partnerPassionScore?: number;
  partnerDurationFeedback?: string;
  partnerPositionFeedback?: string;
  partnerComment?: string;
  partnerReviewer?: string;
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
          partnerOverallScore: r.partner_overall_score ?? undefined,
          partnerPassionScore: r.partner_passion_score ?? undefined,
          partnerDurationFeedback: r.partner_duration_feedback || undefined,
          partnerPositionFeedback: r.partner_position_feedback || undefined,
          partnerComment: r.partner_comment || undefined,
          partnerReviewer: r.partner_reviewer || undefined,
          partnerReviewedAt: r.partner_reviewed_at || undefined,
          scene: r.scene || undefined,
          femaleOrgasm: r.female_orgasm ?? undefined,
          oralSex: r.oral_sex ?? undefined,
          oralExplosion: r.oral_explosion ?? undefined,
          ejaculationMethod: r.ejaculation_method || undefined,
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
      scene: r.scene || null,
      female_orgasm: r.femaleOrgasm ?? null,
      oral_sex: r.oralSex ?? null,
      oral_explosion: r.oralExplosion ?? null,
      ejaculation_method: r.ejaculationMethod || null,
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

  const saveReview = async (id: string, review: PartnerReview) => {
    const { error } = await supabase
      .from('doi_records')
      .update({
        partner_overall_score: review.partnerOverallScore ?? null,
        partner_passion_score: review.partnerPassionScore ?? null,
        partner_duration_feedback: review.partnerDurationFeedback || null,
        partner_position_feedback: review.partnerPositionFeedback || null,
        partner_comment: review.partnerComment || null,
        partner_reviewer: review.partnerReviewer || null,
        partner_reviewed_at: new Date().toISOString(),
      } as any)
      .eq('id', id);
    if (error) {
      console.error('Error saving partner review:', error);
      return false;
    }
    return true;
  };

  return { records, loading, addRecord, deleteRecord, saveReview };
}