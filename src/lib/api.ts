import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

// Bump Records API
export const bumpApi = {
  getAll: () => axios.get(`${API_BASE_URL}/bump-records`).then(res => res.data),
  getById: (id: string) => axios.get(`${API_BASE_URL}/bump-records/${id}`).then(res => res.data),
  create: (data: any) => axios.post(`${API_BASE_URL}/bump-records`, data).then(res => res.data),
  update: (id: string, data: any) => axios.put(`${API_BASE_URL}/bump-records/${id}`, data).then(res => res.data),
  delete: (id: string) => axios.delete(`${API_BASE_URL}/bump-records/${id}`).then(res => res.data),
  getByDate: (date: string) => axios.get(`${API_BASE_URL}/bump-records/date/${date}`).then(res => res.data),
};

// DOI Records API
export const doiApi = {
  getAll: () => axios.get(`${API_BASE_URL}/doi-records`).then(res => res.data),
  getById: (id: string) => axios.get(`${API_BASE_URL}/doi-records/${id}`).then(res => res.data),
  create: (data: any, onUploadProgress?: (progress: number) => void) => {
    // 检查是否有视频文件需要上传
    const formData = new FormData();

    // 添加普通字段
    Object.keys(data).forEach((key) => {
      if (data[key] !== null && data[key] !== undefined) {
        // 如果是视频文件对象，跳过，稍后单独处理
        if (key === 'videoFile') return;
        formData.append(key, data[key]);
      }
    });

    // 如果有视频文件，添加到formData
    if (data.videoFile) {
      formData.append('video', data.videoFile, data.videoFile.name);
    }

    return axios.post(`${API_BASE_URL}/doi-records`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: onUploadProgress ? (progressEvent) => {
        const progress = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
        onUploadProgress(progress);
      } : undefined
    }).then(res => res.data);
  },
  update: (id: string, data: any, onUploadProgress?: (progress: number) => void) => {
    // 检查是否有视频文件需要上传
    const formData = new FormData();

    // 添加普通字段
    Object.keys(data).forEach((key) => {
      if (data[key] !== null && data[key] !== undefined) {
        // 如果是视频文件对象，跳过，稍后单独处理
        if (key === 'videoFile') return;
        formData.append(key, data[key]);
      }
    });

    // 如果有视频文件，添加到formData
    if (data.videoFile) {
      formData.append('video', data.videoFile, data.videoFile.name);
    }

    return axios.put(`${API_BASE_URL}/doi-records/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: onUploadProgress ? (progressEvent) => {
        const progress = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
        onUploadProgress(progress);
      } : undefined
    }).then(res => res.data);
  },
  delete: (id: string) => axios.delete(`${API_BASE_URL}/doi-records/${id}`).then(res => res.data),
  getByDate: (date: string) => axios.get(`${API_BASE_URL}/doi-records/date/${date}`).then(res => res.data),
};

// Milktea Records API
export const milkteaApi = {
  getAll: () => axios.get(`${API_BASE_URL}/milktea-records`).then(res => res.data),
  getById: (id: string) => axios.get(`${API_BASE_URL}/milktea-records/${id}`).then(res => res.data),
  create: (data: any) => axios.post(`${API_BASE_URL}/milktea-records`, data).then(res => res.data),
  update: (id: string, data: any) => axios.put(`${API_BASE_URL}/milktea-records/${id}`, data).then(res => res.data),
  delete: (id: string) => axios.delete(`${API_BASE_URL}/milktea-records/${id}`).then(res => res.data),
  getByDate: (date: string) => axios.get(`${API_BASE_URL}/milktea-records/date/${date}`).then(res => res.data),
};

// User Settings API
export const userSettingsApi = {
  getAll: () => axios.get(`${API_BASE_URL}/user-settings`).then(res => res.data),
  getByKey: (key: string) => axios.get(`${API_BASE_URL}/user-settings/${encodeURIComponent(key)}`).then(res => res.data),
  set: (key: string, value: string | number) =>
    axios.put(`${API_BASE_URL}/user-settings/${encodeURIComponent(key)}`, { value }).then(res => res.data),
  delete: (key: string) => axios.delete(`${API_BASE_URL}/user-settings/${encodeURIComponent(key)}`).then(res => res.data),
};