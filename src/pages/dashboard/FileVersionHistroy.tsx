import * as React from "react";
import {
  Clock,
  Download,
  RotateCcw,
  User,
  FileText,
  ChevronRight,
  Info,
  Calendar,
  HardDrive,
  History,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface UserInfo {
  _id: string;
  name: string;
  email: string;
  avatar: string | null;
}

interface VersionInfo {
  _id: string;
  document: string;
  version: number;
  fileUrl: string;
  fileKey: string;
  fileSize: number;
  uploadedBy: UserInfo;
  changes: string;
  createdAt: string;
  updatedAt: string;
}

interface DocumentData {
  _id: string;
  title: string;
  originalFileName: string;
  fileType: string;
  currentVersion: number;
  versions: VersionInfo[];
}

// Dummy Data
const documentData: DocumentData = {
  _id: "67890abcdef",
  title: "Q4 Financial Report 2024",
  originalFileName: "financial-report-q4.pdf",
  fileType: "pdf",
  currentVersion: 4,
  versions: [
    {
      _id: "ver004",
      document: "67890abcdef",
      version: 4,
      fileUrl: "https://s3.amazonaws.com/docs/financial-report-v4.pdf",
      fileKey: "documents/2024/financial-report-v4.pdf",
      fileSize: 14923456,
      uploadedBy: {
        _id: "user001",
        name: "Abhishek Sharma",
        email: "abhishek@company.com",
        avatar: null,
      },
      changes: "Added Q4 revenue breakdown and updated profit margins",
      createdAt: "2025-10-17T07:41:00.000Z",
      updatedAt: "2025-10-17T07:41:00.000Z",
    },
    {
      _id: "ver003",
      document: "67890abcdef",
      version: 3,
      fileUrl: "https://s3.amazonaws.com/docs/financial-report-v3.pdf",
      fileKey: "documents/2024/financial-report-v3.pdf",
      fileSize: 14856320,
      uploadedBy: {
        _id: "user002",
        name: "Sarah Mitchell",
        email: "sarah@company.com",
        avatar: null,
      },
      changes: "Updated expense categories and cost analysis",
      createdAt: "2025-10-15T15:20:00.000Z",
      updatedAt: "2025-10-15T15:20:00.000Z",
    },
    {
      _id: "ver002",
      document: "67890abcdef",
      version: 2,
      fileUrl: "https://s3.amazonaws.com/docs/financial-report-v2.pdf",
      fileKey: "documents/2024/financial-report-v2.pdf",
      fileSize: 14234567,
      uploadedBy: {
        _id: "user003",
        name: "Michael Chen",
        email: "michael@company.com",
        avatar: null,
      },
      changes: "Corrected tax calculations and added compliance notes",
      createdAt: "2025-10-12T10:15:00.000Z",
      updatedAt: "2025-10-12T10:15:00.000Z",
    },
    {
      _id: "ver001",
      document: "67890abcdef",
      version: 1,
      fileUrl: "https://s3.amazonaws.com/docs/financial-report-v1.pdf",
      fileKey: "documents/2024/financial-report-v1.pdf",
      fileSize: 13987654,
      uploadedBy: {
        _id: "user001",
        name: "Abhishek Sharma",
        email: "abhishek@company.com",
        avatar: null,
      },
      changes: "Initial document upload",
      createdAt: "2025-10-10T09:30:00.000Z",
      updatedAt: "2025-10-10T09:30:00.000Z",
    },
  ],
};

// ✅ Format file size
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
};

// ✅ Format date
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const timeStr = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  if (diffDays === 0) return `Today at ${timeStr}`;
  if (diffDays === 1) return `Yesterday at ${timeStr}`;
  if (diffDays < 7) return `${diffDays} days ago`;

  return (
    date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }) + ` at ${timeStr}`
  );
};

// ✅ Get initials
const getInitials = (name: string): string =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

export default function FileVersionHistory() {
  const [selectedVersion, setSelectedVersion] = React.useState<VersionInfo | null>(null);

  const currentVersion = documentData.versions[0];
  const olderVersions = documentData.versions.slice(1);

  const handleRestore = (version: VersionInfo) => {
    alert(`Restoring version ${version.version}`);
  };

  const handleDownload = (version: VersionInfo) => {
    alert(`Downloading version ${version.version}`);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* HEADER */}
      <div className="border-b">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
            <FileText className="w-4 h-4" />
            <span>Documents</span>
            <ChevronRight className="w-4 h-4" />
            <span>Financial Reports</span>
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground">Version History</span>
          </div>

          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold flex gap-3">
                <History className="w-8 h-8" />
                {documentData.title}
              </h1>
              <p className="text-sm text-muted-foreground">{documentData.originalFileName}</p>
            </div>
            <Badge className="text-lg px-4 py-2">
              v{documentData.currentVersion}
            </Badge>
          </div>
        </div>
      </div>

      {/* BODY */}
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        <Alert>
          <Info className="w-4 h-4" />
          <AlertDescription>
            Restore or download previous versions anytime.
          </AlertDescription>
        </Alert>

        {/* Current Version */}
        <Card className="border-2">
          <CardContent className="p-6">
            <div className="flex gap-6">
              <Avatar className="w-14 h-14">
                <AvatarFallback>{getInitials(currentVersion.uploadedBy.name)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-lg font-semibold">{currentVersion.uploadedBy.name}</p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(currentVersion.createdAt)}
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button>Open Document</Button>
              <Button variant="outline" onClick={() => handleDownload(currentVersion)}>
                <Download className="w-4 h-4 mr-2" /> Download
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Previous Versions */}
        {olderVersions.map((version) => (
          <Card key={version._id} className="transition-all">
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div>
                  <p className="font-semibold">{version.uploadedBy.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(version.createdAt)}
                  </p>
                </div>

                <div className="ml-auto flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRestore(version)}
                  >
                    <RotateCcw className="w-3 h-3 mr-1" /> Restore
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDownload(version)}
                  >
                    <Download className="w-3 h-3 mr-1" /> Download
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
