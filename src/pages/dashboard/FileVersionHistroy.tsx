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
  Loader2,
  AlertCircle,
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
}

interface VersionInfo {
  id: string;
  version: number;
  fileUrl: string;
  fileKey: string;
  fileSize: number;
  uploadedBy: UserInfo;
  uploadedAt: string;
  changes: string;
  isCurrentVersion: boolean;
}

interface VersionHistoryResponse {
  success: boolean;
  data: {
    documentId: string;
    currentVersion: number;
    versions: VersionInfo[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalVersions: number;
      limit: number;
    };
  };
}

interface DocumentInfo {
  title: string;
  originalFileName: string;
  fileType: string;
}

// Format file size
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
};

// Format date
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

// Get initials
const getInitials = (name: string): string =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

export default function FileVersionHistory() {
  const [versions, setVersions] = React.useState<VersionInfo[]>([]);
  const [documentInfo, setDocumentInfo] = React.useState<DocumentInfo | null>(null);
  const [currentVersion, setCurrentVersion] = React.useState<number>(1);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [pagination, setPagination] = React.useState({
    currentPage: 1,
    totalPages: 1,
    totalVersions: 0,
    limit: 10,
  });

  // Replace with your actual document ID (could come from URL params)
  const documentId = "68ff784d54e385f4b888513d";
  const API_BASE_URL = "http://localhost:3200/api"; // Update with your API URL

  // Fetch version history
  const fetchVersionHistory = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${API_BASE_URL}/documents/${documentId}/versions?page=${page}&limit=10&sortBy=version&sortOrder=desc`,
        {
          headers: {
            Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2OTAxNzI2N2RlMTU1OWZmYjBhNDIyNWEiLCJlbWFpbCI6ImFiaGlzaGVrLnNoYXJtYUBkaWdpaG9zdC5pbiIsInJvbGUiOiJzdXBlcmFkbWluIiwiaWF0IjoxNzYxNzkwNzIzLCJleHAiOjE3NjIzOTU1MjN9.fomYGBNKLFX1P9WEph2iho5qMZYRUHj3xvXQbRsOEEc`, // Add your auth token
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch version history");
      }

      const data: VersionHistoryResponse = await response.json();

      if (data.success) {
        setVersions(data.data.versions);
        setCurrentVersion(data.data.currentVersion);
        setPagination(data.data.pagination);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Fetch document info
  const fetchDocumentInfo = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/documents/${documentId}`, {
        headers: {
          Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2OTAxNzI2N2RlMTU1OWZmYjBhNDIyNWEiLCJlbWFpbCI6ImFiaGlzaGVrLnNoYXJtYUBkaWdpaG9zdC5pbiIsInJvbGUiOiJzdXBlcmFkbWluIiwiaWF0IjoxNzYxNzkwNzIzLCJleHAiOjE3NjIzOTU1MjN9.fomYGBNKLFX1P9WEph2iho5qMZYRUHj3xvXQbRsOEEc`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch document info");
      }

      const data = await response.json();
      if (data.success) {
        setDocumentInfo({
          title: data.data.title,
          originalFileName: data.data.originalFileName,
          fileType: data.data.fileType,
        });
      }
    } catch (err) {
      console.error("Error fetching document info:", err);
    }
  };

  // Download specific version
  const handleDownload = async (version: VersionInfo) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/documents/${documentId}/versions/${version.version}/download`,
        {
          headers: {
            Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2OTAxNzI2N2RlMTU1OWZmYjBhNDIyNWEiLCJlbWFpbCI6ImFiaGlzaGVrLnNoYXJtYUBkaWdpaG9zdC5pbiIsInJvbGUiOiJzdXBlcmFkbWluIiwiaWF0IjoxNzYxNzkwNzIzLCJleHAiOjE3NjIzOTU1MjN9.fomYGBNKLFX1P9WEph2iho5qMZYRUHj3xvXQbRsOEEc`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to download version");
      }

      const data = await response.json();
      if (data.success) {
        // Open the file URL in a new tab or trigger download
        window.open(data.data.fileUrl, "_blank");
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Download failed");
    }
  };

  // Restore version (you'll need to implement this endpoint)
  const handleRestore = async (version: VersionInfo) => {
    if (!confirm(`Are you sure you want to restore version ${version.version}?`)) {
      return;
    }

    try {
      // Implement restore API call here
      alert(`Restoring version ${version.version} - API endpoint needed`);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Restore failed");
    }
  };

  // Load data on mount
  React.useEffect(() => {
    fetchVersionHistory();
    fetchDocumentInfo();
  }, []);

  // Loading state
  if (loading && versions.length === 0) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading version history...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center p-6">
        <Alert className="max-w-md">
          <AlertCircle className="w-4 h-4" />
          <AlertDescription>{error}</AlertDescription>
          <Button onClick={() => fetchVersionHistory()} className="mt-4" variant="outline">
            Retry
          </Button>
        </Alert>
      </div>
    );
  }

  const currentVersionData = versions.find((v) => v.isCurrentVersion);
  const olderVersions = versions.filter((v) => !v.isCurrentVersion);

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
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <History className="w-8 h-8" />
                {documentInfo?.title || "Loading..."}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {documentInfo?.originalFileName || ""}
              </p>
            </div>
            <Badge className="text-lg px-4 py-2">v{currentVersion}</Badge>
          </div>

          {/* Stats */}
          <div className="flex gap-6 mt-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <HardDrive className="w-4 h-4" />
              <span>Total Versions: {pagination.totalVersions}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>
                Last Updated:{" "}
                {currentVersionData ? formatDate(currentVersionData.uploadedAt) : "N/A"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* BODY */}
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        <Alert>
          <Info className="w-4 h-4" />
          <AlertDescription>
            View, download, or restore previous versions of this document.
          </AlertDescription>
        </Alert>

        {/* Current Version */}
        {currentVersionData && (
          <Card className="border-2 border-primary">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Badge variant="default" className="text-sm">
                  Current Version
                </Badge>
                <Badge variant="outline">v{currentVersionData.version}</Badge>
              </div>

              <div className="flex gap-6 mb-4">
                <Avatar className="w-14 h-14">
                  <AvatarFallback>
                    {getInitials(currentVersionData.uploadedBy.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-lg font-semibold">
                    {currentVersionData.uploadedBy.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {currentVersionData.uploadedBy.email}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {formatDate(currentVersionData.uploadedAt)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">
                    {formatFileSize(currentVersionData.fileSize)}
                  </p>
                </div>
              </div>

              {currentVersionData.changes && (
                <div className="bg-muted p-3 rounded-md mb-4">
                  <p className="text-sm font-medium mb-1">Changes:</p>
                  <p className="text-sm text-muted-foreground">
                    {currentVersionData.changes}
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <Button onClick={() => window.open(currentVersionData.fileUrl, "_blank")}>
                  <FileText className="w-4 h-4 mr-2" /> Open Document
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleDownload(currentVersionData)}
                >
                  <Download className="w-4 h-4 mr-2" /> Download
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Previous Versions Header */}
        {olderVersions.length > 0 && (
          <div className="flex items-center gap-2 pt-4">
            <History className="w-5 h-5 text-muted-foreground" />
            <h2 className="text-xl font-semibold">Previous Versions</h2>
            <Badge variant="secondary">{olderVersions.length}</Badge>
          </div>
        )}

        {/* Previous Versions List */}
        {olderVersions.map((version) => (
          <Card key={version.id} className="transition-all hover:shadow-md">
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <Avatar className="w-10 h-10">
                  <AvatarFallback>
                    {getInitials(version.uploadedBy.name)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold">{version.uploadedBy.name}</p>
                    <Badge variant="outline" className="text-xs">
                      v{version.version}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {version.uploadedBy.email}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    <Clock className="w-3 h-3 inline mr-1" />
                    {formatDate(version.uploadedAt)}
                  </p>

                  {version.changes && (
                    <div className="mt-3 bg-muted/50 p-2 rounded text-sm">
                      <span className="font-medium">Changes: </span>
                      {version.changes}
                    </div>
                  )}
                </div>

                <div className="text-right space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    {formatFileSize(version.fileSize)}
                  </p>
                  <div className="flex gap-2">
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
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center gap-2 pt-6">
            <Button
              variant="outline"
              disabled={pagination.currentPage === 1}
              onClick={() => fetchVersionHistory(pagination.currentPage - 1)}
            >
              Previous
            </Button>
            <div className="flex items-center gap-2 px-4">
              <span className="text-sm text-muted-foreground">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
            </div>
            <Button
              variant="outline"
              disabled={pagination.currentPage === pagination.totalPages}
              onClick={() => fetchVersionHistory(pagination.currentPage + 1)}
            >
              Next
            </Button>
          </div>
        )}

        {/* Empty State */}
        {versions.length === 0 && !loading && (
          <Card className="p-12 text-center">
            <History className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Version History</h3>
            <p className="text-muted-foreground">
              This document doesn't have any version history yet.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}