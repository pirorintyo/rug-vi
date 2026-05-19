export type UserRole = "USER" | "ADMIN";

export interface VideoSummary {
  id: string;
  title: string;
  youtubeUrl: string;
  postedAt: string;
  createdAt: string;
}

export interface CommentData {
  id: string;
  body: string;
  order: number;
}

export interface SegmentData {
  id: string;
  startTime: number;
  endTime: number;
  order: number;
  comments: CommentData[];
}

export interface PostData {
  id: string;
  userId: string;
  videoId: string;
  createdAt: string;
  updatedAt: string;
  user: { id: string; displayName: string };
  segments: SegmentData[];
}

// Form types
export interface CommentField {
  body: string;
}

export interface SegmentField {
  startTime: string;
  endTime: string;
  comments: CommentField[];
}

export interface PostFormValues {
  segments: SegmentField[];
}
