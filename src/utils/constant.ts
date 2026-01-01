
export const ROLES = {
  SUPER_ADMIN: "SUPER_ADMIN",
  ADMIN: "ADMIN",
  DEPT_OWNER: "DEPT_OWNER",
  FOLDER_MANAGER: "FOLDER_MANAGER",
  USER: "USER",
} as const;




export const ALLOWED_FILE_TYPES = {
 
  documents: {
    extensions: ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt', '.rtf', '.csv', '.odt', '.ods', '.odp'],
    mimeTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain',
      'text/rtf',
      'text/csv',
      'application/vnd.oasis.opendocument.text',
      'application/vnd.oasis.opendocument.spreadsheet',
      'application/vnd.oasis.opendocument.presentation',
    ],
  },

  /**
   * 📷 Images - 8 formats
   */
  images: {
    extensions: ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.webp', '.svg'],
    mimeTypes: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/bmp',
      'image/tiff',
      'image/webp',
      'image/svg+xml',
    ],
  },

  /**
   * 📚 Archives - 6 formats
   * ⚠️ Requires virus scanning before download
   */
  archives: {
    extensions: ['.zip', '.rar', '.7z', '.tar', '.gz', '.tar.gz'],
    mimeTypes: [
      'application/zip',
      'application/x-zip-compressed',
      'application/x-rar-compressed',
      'application/x-7z-compressed',
      'application/x-tar',
      'application/gzip',
      'application/x-gzip',
    ],
  },

  /**
   * 🎞️ Videos - 6 formats
   * ⚠️ Optional - Enable only if required
   */
  videos: {
    extensions: ['.mp4', '.mov', '.avi', '.wmv', '.flv', '.mkv'],
    mimeTypes: [
      'video/mp4',
      'video/quicktime',
      'video/x-msvideo',
      'video/x-ms-wmv',
      'video/x-flv',
      'video/x-matroska',
    ],
  },

  /**
   * 🎵 Audio - 5 formats
   * ⚠️ Optional - Enable only if required
   */
  audio: {
    extensions: ['.mp3', '.wav', '.ogg', '.m4a', '.flac'],
    mimeTypes: [
      'audio/mpeg',
      'audio/wav',
      'audio/ogg',
      'audio/mp4',
      'audio/flac',
    ],
  },

  /**
   * 📐 Design/Engineering - 3 formats
   * ⚠️ For specific departments only
   */
  design: {
    extensions: ['.dwg', '.dxf', '.svg'],
    mimeTypes: [
      'application/acad',
      'application/x-acad',
      'application/dxf',
      'image/svg+xml',
    ],
  },

  /**
   * 💻 Data/Config - 2 formats
   * ⚠️ For metadata/config only
   */
  data: {
    extensions: ['.json', '.xml'],
    mimeTypes: [
      'application/json',
      'application/xml',
      'text/xml',
    ],
  },
} as const;


export const BLOCKED_FILE_TYPES = {
  /**
   * ❌ Executables & Installers
   */
  executables: {
    extensions: ['.exe', '.msi', '.com', '.bat', '.cmd', '.scr', '.pif', '.application', '.gadget', '.msp', '.apk'],
    reason: 'Executable files can run malicious code',
  },

  /**
   * ❌ Scripts & Code
   */
  scripts: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.vbs', '.vbe', '.wsf', '.wsh', '.ps1', '.psm1', '.sh', '.bash', '.zsh', '.fish'],
    reason: 'Script files can execute unauthorized commands',
  },

  /**
   * ❌ Programming Languages
   */
  code: {
    extensions: ['.py', '.rb', '.php', '.pl', '.cgi', '.asp', '.aspx', '.jsp', '.jar', '.class', '.cpp', '.c', '.cs', '.go', '.rs'],
    reason: 'Source code files pose security risks',
  },

  /**
   * ❌ System & Library Files
   */
  system: {
    extensions: ['.dll', '.sys', '.drv', '.ocx', '.cpl', '.inf', '.ini', '.reg'],
    reason: 'System files can compromise OS integrity',
  },

  /**
   * ❌ Disk Images & Shortcuts
   */
  disk: {
    extensions: ['.iso', '.img', '.dmg', '.vhd', '.vmdk', '.lnk', '.url', '.desktop'],
    reason: 'Disk images and shortcuts can hide malware',
  },

  /**
   * ❌ P2P & Torrents
   */
  p2p: {
    extensions: ['.torrent', '.magnet'],
    reason: 'P2P files not allowed in enterprise DMS',
  },

  /**
   * ❌ Database Files
   */
  database: {
    extensions: ['.sql', '.db', '.sqlite', '.mdb', '.accdb'],
    reason: 'Database files may contain sensitive data',
  },
} as const;


