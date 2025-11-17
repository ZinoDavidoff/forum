export interface User {
  id: string;
  username: string;
  email: string;
  fullName?: string;
  avatar?: string;
  bio?: string;
  location?: string;
  dueDate?: Date;
  birthDate?: Date;
  role: "user" | "moderator" | "admin";
  status: "active" | "suspended" | "banned";
  reputation: number;
  postCount: number;
  threadCount: number;
  lastSeenAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color: string;
  order: number;
  isActive: boolean;
  threadCount: number;
  postCount: number;
  parent?: Category;
  children?: Category[];
}

export interface Thread {
  id: string;
  title: string;
  slug: string;
  content: string;
  status: "open" | "closed" | "pinned" | "locked";
  isPinned: boolean;
  isLocked: boolean;
  isFeatured: boolean;
  viewCount: number;
  replyCount: number;
  likeCount: number;
  tags?: string[];
  author: User;
  category: Category;
  lastPost?: Post;
  createdAt: Date;
  updatedAt: Date;
}

export interface Post {
  id: string;
  content: string;
  isEdited: boolean;
  editedAt?: Date;
  likeCount: number;
  replyCount: number;
  isDeleted: boolean;
  attachments?: string[];
  author: User;
  thread: Thread;
  parentPost?: Post;
  replies?: Post[];
  depth?: number; // For nested comment display
  createdAt: Date;
  updatedAt: Date;
}

export interface Notification {
  id: string;
  type:
    | "reply"
    | "mention"
    | "reaction"
    | "follow"
    | "badge"
    | "message"
    | "system";
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: Date;
}

export interface Message {
  id: string;
  content: string;
  isRead: boolean;
  readAt?: Date;
  sender: User;
  recipient: User;
  createdAt: Date;
}
