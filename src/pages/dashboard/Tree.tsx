"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink } from "@/components/ui/breadcrumb";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FileText, Folder, FolderTree, ChevronRight, Loader2 } from "lucide-react";

export default function DMSExplorer() {
  const [selectedFolder, setSelectedFolder] = useState<any>(null);
  const [selectedDoc, setSelectedDoc] = useState<any>(null);

  // ✅ Fetch department tree
  const { data, isLoading, isError } = useQuery({
    queryKey: ["departmentTree"],
    queryFn: async () => {
      const res = await axios.get("http://localhost:3200/tree/generate");
      return res.data.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-500">
        <Loader2 className="animate-spin mr-2" /> Loading Department Tree...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-screen text-red-500">
        Failed to load department data.
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* LEFT PANEL */}
      <aside className="w-1/3 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b bg-white flex items-center justify-between">
          <h2 className="font-semibold text-gray-800 flex items-center gap-2">
            <FolderTree className="w-5 h-5 text-blue-600" />
            Explorer
          </h2>
        </div>

        <div className="p-3">
          <Input placeholder="Search departments..." className="h-9 text-sm" />
        </div>

        <ScrollArea className="flex-1 p-3">
          {data?.map((dept: any) => (
            <Accordion key={dept._id} type="single" collapsible className="mb-2">
              <AccordionItem value={dept._id}>
                <AccordionTrigger className="text-gray-800 hover:bg-gray-100 rounded-md px-2">
                  <div className="flex items-center gap-2">
                    <Folder className="w-4 h-4 text-blue-500" />
                    {dept.name}
                  </div>
                </AccordionTrigger>

                <AccordionContent>
                  {dept.folders.length === 0 ? (
                    <p className="text-sm text-gray-500 pl-6 italic">No folders</p>
                  ) : (
                    dept.folders.map((folder: any) => (
                      <Accordion
                        key={folder._id}
                        type="single"
                        collapsible
                        className="pl-4 border-l border-gray-200 mt-1"
                      >
                        <AccordionItem value={folder._id}>
                          <AccordionTrigger
                            className="text-gray-700 hover:bg-gray-50 rounded-md px-2 text-sm"
                            onClick={() => {
                              setSelectedFolder(folder);
                              setSelectedDoc(null);
                            }}
                          >
                            <div className="flex items-center gap-2">
                              <Folder className="w-4 h-4 text-yellow-500" />
                              {folder.name}
                            </div>
                          </AccordionTrigger>

                          <AccordionContent>
                            {folder.documents.length === 0 ? (
                              <p className="text-xs text-gray-500 pl-6 italic">
                                No documents
                              </p>
                            ) : (
                              <div className="pl-4 space-y-1">
                                {folder.documents.map((doc: any) => (
                                  <button
                                    key={doc._id}
                                    onClick={() => setSelectedDoc(doc)}
                                    className="flex w-full items-center text-left gap-2 text-xs px-2 py-1 hover:bg-gray-100 rounded-md transition"
                                  >
                                    <FileText className="w-3 h-3 text-gray-700" />
                                    <span className="truncate">{doc.title}</span>
                                  </button>
                                ))}
                              </div>
                            )}
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    ))
                  )}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          ))}
        </ScrollArea>
      </aside>

      {/* RIGHT PANEL */}
      <main className="flex-1 overflow-y-auto p-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="#">Home</BreadcrumbLink>
            </BreadcrumbItem>
            {selectedFolder && (
              <>
                <ChevronRight className="w-3 h-3 text-gray-400 mx-1" />
                <BreadcrumbItem>
                  <BreadcrumbLink href="#">{selectedFolder.name}</BreadcrumbLink>
                </BreadcrumbItem>
              </>
            )}
            {selectedDoc && (
              <>
                <ChevronRight className="w-3 h-3 text-gray-400 mx-1" />
                <BreadcrumbItem>
                  <BreadcrumbLink href="#">{selectedDoc.title}</BreadcrumbLink>
                </BreadcrumbItem>
              </>
            )}
          </BreadcrumbList>
        </Breadcrumb>

        {!selectedFolder && !selectedDoc && (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p>Select a folder or document from the left panel</p>
          </div>
        )}

        {/* Folder Details */}
        {selectedFolder && !selectedDoc && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Folder className="w-5 h-5 text-yellow-500" />
                {selectedFolder.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedFolder.documents.length === 0 ? (
                <p className="text-gray-500 italic">No documents found.</p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {selectedFolder.documents.map((doc: any) => (
                    <div
                      key={doc._id}
                      onClick={() => setSelectedDoc(doc)}
                      className="p-4 bg-white border rounded-xl shadow-sm hover:shadow-md transition cursor-pointer"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="w-5 h-5 text-gray-700" />
                        <span className="text-sm font-medium truncate">
                          {doc.title}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        {new Date(doc.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Document Details */}
        {selectedDoc && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="w-5 h-5 text-gray-700" />
                {selectedDoc.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-3">
                Document ID: <span className="font-mono">{selectedDoc._id}</span>
              </p>
              <Button variant="outline" size="sm">
                View / Download
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
