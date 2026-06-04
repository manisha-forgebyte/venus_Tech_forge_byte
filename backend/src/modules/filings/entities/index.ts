export type FilingRecord = {
  fid: number;
  cid: number;
  uid?: number | null;
  status?: string | null;
  isActive: boolean;
};
