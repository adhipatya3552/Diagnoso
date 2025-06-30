import { formatDistanceToNow, format, isToday, isYesterday } from 'date-fns';

export const formatMessageTime = (timestamp: string): string => {
  const date = new Date(timestamp);
  
  if (isToday(date)) {
    return format(date, 'h:mm a');
  } else if (isYesterday(date)) {
    return `Yesterday, ${format(date, 'h:mm a')}`;
  } else {
    return format(date, 'MMM d, h:mm a');
  }
};

export const formatRelativeTime = (timestamp: string): string => {
  return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
};

export const formatBytes = (bytes: number, decimals = 2): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

export const getFileTypeIcon = (fileType: string): string => {
  if (fileType.startsWith('image/')) {
    return '🖼️';
  } else if (fileType === 'application/pdf') {
    return '📄';
  } else if (fileType.includes('word') || fileType.includes('document')) {
    return '📝';
  } else if (fileType.includes('excel') || fileType.includes('spreadsheet')) {
    return '📊';
  } else if (fileType.includes('audio')) {
    return '🔊';
  } else if (fileType.includes('video')) {
    return '🎬';
  }
  return '📎';
};

export const getFileExtension = (fileName: string): string => {
  return fileName.split('.').pop()?.toLowerCase() || '';
};

export const isImageFile = (fileType: string): boolean => {
  return fileType.startsWith('image/');
};

export const isPdfFile = (fileType: string): boolean => {
  return fileType === 'application/pdf';
};

export const isPreviewableFile = (fileType: string): boolean => {
  return isImageFile(fileType) || isPdfFile(fileType);
};