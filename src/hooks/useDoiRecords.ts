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
  doiRating?: '超赞' | '还行' | '一般' | '不太行'; // 这次doi评价
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
  videoUrl?: string; // 添加视频URL字段
}

export interface NewDoiRecord {
  date: string;
  time: string;
  durationMinutes: number;
  position?: string;
  passionScore?: number;
  notes?: string;
  doiRating?: '超赞' | '还行' | '一般' | '不太行'; // 这次doi评价
  scene?: string;
  femaleOrgasm?: boolean;
  oralSex?: boolean;
  oralExplosion?: boolean;
  ejaculationMethod?: string;
  videoUrl?: string; // 添加视频URL字段
  videoFile?: File; // 添加视频文件字段
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
    try {
      const data = await doiApi.getAll();
      
      if (data && data.data && Array.isArray(data.data)) {
        setRecords(
          data.data.map((r: any) => ({
            id: r.id,
            date: r.date,
            time: r.time,
            durationMinutes: r.duration_minutes ?? 0,
            position: r.position || undefined,
            passionScore: r.passion_score ?? undefined,
            notes: r.notes || undefined,
            doiRating: r.doi_rating || undefined, // 添加doi评价字段
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
            videoUrl: r.video_url || undefined, // 添加视频URL字段
          }))
        );
      }
    } catch (error) {
      console.error('Error fetching doi records:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
    // Note: We're not implementing real-time updates since the local backend doesn't support it
    // In a production environment, you might want to use WebSocket or polling for real-time updates
  }, []);

  const addRecord = async (r: NewDoiRecord) => {
    try {
      // 检查是否包含视频文件，如果是则使用FormData方式上传
      if (r.videoFile && r.videoFile instanceof File) {
        await doiApi.create({
          date: r.date,
          time: r.time,
          duration_minutes: r.durationMinutes,
          position: r.position || null,
          passion_score: r.passionScore ?? null,
          notes: r.notes || null,
          doi_rating: r.doiRating || null, // 添加doi评价字段
          scene: r.scene || null,
          female_orgasm: r.femaleOrgasm ?? null,
          oral_sex: r.oralSex ?? null,
          oral_explosion: r.oralExplosion ?? null,
          ejaculation_method: r.ejaculationMethod || null,
          videoFile: r.videoFile, // 传递视频文件
        });
      } else {
        await doiApi.create({
          date: r.date,
          time: r.time,
          duration_minutes: r.durationMinutes,
          position: r.position || null,
          passion_score: r.passionScore ?? null,
          notes: r.notes || null,
          doi_rating: r.doiRating || null, // 添加doi评价字段
          scene: r.scene || null,
          female_orgasm: r.femaleOrgasm ?? null,
          oral_sex: r.oralSex ?? null,
          oral_explosion: r.oralExplosion ?? null,
          ejaculation_method: r.ejaculationMethod || null,
          video_url: r.videoUrl || null, // 添加视频URL参数
        });
      }
      // Refresh the records
      fetchRecords();
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

  const updateRecord = async (id: string, updatedData: Partial<DoiRecord>) => {
    try {
      await doiApi.update(id, {
        date: updatedData.date,
        time: updatedData.time,
        duration_minutes: updatedData.durationMinutes,
        position: updatedData.position || null,
        passion_score: updatedData.passionScore ?? null,
        notes: updatedData.notes || null,
        doi_rating: updatedData.doiRating || null, // 添加doi评价字段
        scene: updatedData.scene || null,
        female_orgasm: updatedData.femaleOrgasm ?? null,
        oral_sex: updatedData.oralSex ?? null,
        oral_explosion: updatedData.oralExplosion ?? null,
        ejaculation_method: updatedData.ejaculationMethod || null,
        video_url: updatedData.videoUrl || null, // 添加视频URL参数
      });
      // Refresh the records
      fetchRecords();
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
      // Refresh the records
      fetchRecords();
      return true;
    } catch (error) {
      console.error('Error saving partner review:', error);
      return false;
    }
  };

  return { records, loading, addRecord, deleteRecord, saveReview, updateRecord, refresh: fetchRecords };
}