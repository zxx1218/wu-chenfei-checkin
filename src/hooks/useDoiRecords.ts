import { useState, useEffect } from 'react';
import { doiApi } from '@/lib/api';

export interface DoiRecord {
  id: string;
  date: string;
  time: string;
  durationMinutes: number;
  position?: string;
  passionScore?: number;
  notes?: string;
  doiRating?: '超赞' | '还行' | '一般' | '不太行';
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
  videoUrl?: string;
  videoFile?: File;
}

export interface NewDoiRecord {
  date: string;
  time: string;
  durationMinutes: number;
  position?: string;
  passionScore?: number;
  notes?: string;
  doiRating?: '超赞' | '还行' | '一般' | '不太行';
  scene?: string;
  femaleOrgasm?: boolean;
  oralSex?: boolean;
  oralExplosion?: boolean;
  ejaculationMethod?: string;
  videoUrl?: string;
  videoFile?: File;
}

export interface PartnerReview {
  partnerOverallScore?: number;
  partnerPassionScore?: number;
  partnerDurationFeedback?: string;
  partnerPositionFeedback?: string;
  partnerComment?: string;
  partnerReviewer?: string;
}

function mapRecord(r: any): DoiRecord {
  return {
    id: r.id,
    date: r.date,
    time: r.time,
    durationMinutes: r.duration_minutes ?? 0,
    position: r.position || undefined,
    passionScore: r.passion_score ?? undefined,
    notes: r.notes || undefined,
    doiRating: r.doi_rating || undefined,
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
    videoUrl: r.video_url || undefined,
  };
}

function toApiFields(data: Partial<DoiRecord> | NewDoiRecord) {
  return {
    date: data.date,
    time: data.time,
    duration_minutes: data.durationMinutes,
    position: data.position || null,
    passion_score: data.passionScore ?? null,
    notes: data.notes || null,
    doi_rating: data.doiRating || null,
    scene: data.scene || null,
    female_orgasm: data.femaleOrgasm ?? null,
    oral_sex: data.oralSex ?? null,
    oral_explosion: data.oralExplosion ?? null,
    ejaculation_method: data.ejaculationMethod || null,
    videoFile: data.videoFile,
    video_url: data.videoUrl || null,
  };
}

export function useDoiRecords() {
  const [records, setRecords] = useState<DoiRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRecords = async () => {
    try {
      const data = await doiApi.getAll();
      if (data?.data && Array.isArray(data.data)) {
        setRecords(data.data.map(mapRecord));
      }
    } catch (error) {
      console.error('Error fetching doi records:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const addRecord = async (r: NewDoiRecord, onProgress?: (progress: number) => void) => {
    try {
      await doiApi.create(toApiFields(r), onProgress);
      await fetchRecords();
      return true;
    } catch (error) {
      console.error('Error adding doi record:', error);
      return false;
    }
  };

  const deleteRecord = async (id: string) => {
    try {
      await doiApi.delete(id);
      setRecords((prev) => prev.filter((r) => r.id !== id));
      return true;
    } catch (error) {
      console.error('Error deleting doi record:', error);
      return false;
    }
  };

  const updateRecord = async (id: string, updatedData: Partial<DoiRecord>, onProgress?: (progress: number) => void) => {
    try {
      await doiApi.update(id, toApiFields(updatedData), onProgress);
      await fetchRecords();
      return true;
    } catch (error) {
      console.error('Error updating doi record:', error);
      return false;
    }
  };

  const saveReview = async (id: string, review: PartnerReview) => {
    try {
      await doiApi.update(id, {
        partner_overall_score: review.partnerOverallScore ?? null,
        partner_passion_score: review.partnerPassionScore ?? null,
        partner_duration_feedback: review.partnerDurationFeedback || null,
        partner_position_feedback: review.partnerPositionFeedback || null,
        partner_comment: review.partnerComment || null,
        partner_reviewer: review.partnerReviewer || null,
        partner_reviewed_at: new Date().toISOString(),
      });
      await fetchRecords();
      return true;
    } catch (error) {
      console.error('Error saving partner review:', error);
      return false;
    }
  };

  return { records, loading, addRecord, deleteRecord, saveReview, updateRecord, refresh: fetchRecords };
}
