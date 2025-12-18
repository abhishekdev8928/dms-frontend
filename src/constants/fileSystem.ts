// src/constants/fileSystem.ts

export const FOLDER_COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#64748B', // Slate
];

export const getFormattedDateTime = () => {
  const now = new Date();
  const formattedDate = now.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  const formattedTime = now.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });
  return `${formattedDate} at ${formattedTime}`;
};

export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
};

export const isImageFile = (filename: string) => {
  return /\.(jpg|jpeg|png|gif|webp|svg|bmp)$/i.test(filename);
};

export const getImageUrl = (fileUrl: string) => {
  return `https://d25i0k88dtrzqd.cloudfront.net/${fileUrl}`;
};

export const isFolder = (item: { type: string; itemType?: string }) => {
  return item.type === 'folder' || item.itemType === 'folder';
};