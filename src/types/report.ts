export interface Report {
  id: number;
  loai_su_co: string;
  vi_do: number;
  kinh_do: number;
  trang_thai: string;
  muc_do_nghiem_trong: number;
  tieu_de: string;
  mo_ta?: string;
  nguoi_dung?: {
    ho_ten: string;
    email?: string;
    so_dien_thoai?: string;
  };
  created_at: string;
  updated_at?: string;
}

export interface Process {
  id: number;
  phan_anh_id: number;
  can_bo_id: number;
  noi_dung: string;
  trang_thai_moi: string;
  hinh_anh_minh_chung: string;
  thoi_gian: string;
  can_bo: {
    ho_ten: string;
    email: string;
    so_dien_thoai: string;
  };
  phan_anh: {
    id: number;
    loai_su_co: string;
    vi_do: number;
    kinh_do: number;
    muc_do_nghiem_trong: number;
  };
}

export interface AIStats {
  total_analyses: number;
  accuracy_rate: number;
  processing_time_avg: number;
  predictions_today: number;
  model_version: string;
  last_updated: string;
}
