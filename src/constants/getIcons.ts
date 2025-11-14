import {
  Folder,
  FileText,
  FileSpreadsheet,
  Presentation,
  FileImage,
  FileVideo,
  FileAudio,
  FileArchive,
  FileCode,
  File,
  FileType
} from "lucide-react";

export const fileIconMap = {
  folder: {
    icon: Folder,
    color: "#5f6368", // grey
  },
  document: {
    icon: FileText,
    color: "#1a73e8", // blue
  },
  spreadsheet: {
    icon: FileSpreadsheet,
    color: "#188038", // green
  },
  presentation: {
    icon: Presentation,
    color: "#f9ab00", // yellow
  },
  image: {
    icon: FileImage,
    color: "#d93025", // red
  },
  pdf: {
    icon: FileType, // BEST alternative to FilePdf
    color: "#ea4335", // pdf red
  },
  video: {
    icon: FileVideo,
    color: "#d93025", // red-orange
  },
  audio: {
    icon: FileAudio,
    color: "#9334e6", // purple
  },
  zip: {
    icon: FileArchive,
    color: "#5f6368", // grey
  },
  code: {
    icon: FileCode,
    color: "#5e65d8", // purple-blue
  },
  other: {
    icon: File,
    color: "#80868b", // light grey
  },
};

export const getFileIcon = (type: string) => {
  return fileIconMap[type] || fileIconMap.other;
};
