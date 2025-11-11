// import React, { useState } from 'react';
// import { Search, RotateCcw, Folder, FileText, ChevronDown, Check, X } from 'lucide-react';

// const TrashScreen = () => {
//   const [activeTab, setActiveTab] = useState('all');
//   const [deletedByOpen, setDeletedByOpen] = useState(false);
//   const [folderOpen, setFolderOpen] = useState(false);
//   const [dateDeletedOpen, setDateDeletedOpen] = useState(false);
//   const [deletedByFilter, setDeletedByFilter] = useState('Anyone');
//   const [folderFilter, setFolderFilter] = useState('All');
//   const [dateDeletedFilter, setDateDeletedFilter] = useState('Last 7 days');
//   const [searchQuery, setSearchQuery] = useState('');
//   const [showToast, setShowToast] = useState(false);
//   const [toastMessage, setToastMessage] = useState('');

//   const dummyData = [
//     {
//       id: 1,
//       name: 'demo',
//       type: 'folder',
//       deletedBy: 'You',
//       deletedDate: '9/11/2025 10:04 pm',
//       deletedOn: 'on web',
//     },
//     {
//       id: 2,
//       name: 'Annual Report 2024.pdf',
//       type: 'document',
//       deletedBy: 'John Smith',
//       deletedDate: '9/10/2025 3:22 pm',
//       deletedOn: 'on web',
//     },
//     {
//       id: 3,
//       name: 'Project Documents',
//       type: 'folder',
//       deletedBy: 'You',
//       deletedDate: '9/9/2025 1:15 pm',
//       deletedOn: 'on mobile',
//     },
//     {
//       id: 4,
//       name: 'Meeting Notes.docx',
//       type: 'document',
//       deletedBy: 'Sarah Johnson',
//       deletedDate: '9/8/2025 11:30 am',
//       deletedOn: 'on web',
//     },
//     {
//       id: 5,
//       name: 'Budget 2025',
//       type: 'folder',
//       deletedBy: 'You',
//       deletedDate: '9/7/2025 9:45 am',
//       deletedOn: 'on desktop',
//     },
//   ];

//   const handleRestore = (item) => {
//     setToastMessage(`Deleted 1 item.`);
//     setShowToast(true);
//     setTimeout(() => setShowToast(false), 4000);
//   };

//   const handleUndo = () => {
//     setShowToast(false);
//   };

//   const resetFilters = () => {
//     setDeletedByFilter('Anyone');
//     setFolderFilter('All');
//     setDateDeletedFilter('Last 7 days');
//     setSearchQuery('');
//   };

//   return (
//     <div className="min-h-screen bg-white text-gray-900">
//       {/* Header */}
//       <div className="border-b border-gray-200 px-8 py-6">
//         <h1 className="text-3xl font-normal mb-3 text-gray-900">Deleted files</h1>
//         <p className="text-gray-600">
//           Restore deleted files. Files are permanently deleted after 30 days.{' '}
//           <a href="#" className="text-blue-600 hover:underline">
//             Learn more
//           </a>
//         </p>
//       </div>

//       {/* Tabs */}
//       <div className="border-b border-gray-200 px-8">
//         <div className="flex gap-8">
//           <button
//             onClick={() => setActiveTab('all')}
//             className={`py-4 text-sm font-medium border-b-2 transition-colors ${
//               activeTab === 'all'
//                 ? 'border-gray-900 text-gray-900'
//                 : 'border-transparent text-gray-500 hover:text-gray-900'
//             }`}
//           >
//             All files
//           </button>
//           <button
//             onClick={() => setActiveTab('restorations')}
//             className={`py-4 text-sm font-medium border-b-2 transition-colors ${
//               activeTab === 'restorations'
//                 ? 'border-gray-900 text-gray-900'
//                 : 'border-transparent text-gray-500 hover:text-gray-900'
//             }`}
//           >
//             Restorations
//           </button>
//         </div>
//       </div>

//       {/* Filters */}
//       <div className="px-8 py-6 flex items-center justify-between border-b border-gray-200">
//         <div className="flex items-center gap-3">
//           <span className="text-sm text-gray-600">Filter by:</span>

//           {/* Deleted by Dropdown */}
//           <div className="relative">
//             <button
//               onClick={() => {
//                 setDeletedByOpen(!deletedByOpen);
//                 setFolderOpen(false);
//                 setDateDeletedOpen(false);
//               }}
//               className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-900 rounded-full text-sm hover:bg-gray-50 transition-colors"
//             >
//               <span>Deleted by: {deletedByFilter}</span>
//               <ChevronDown className="h-4 w-4" />
//             </button>

//             {deletedByOpen && (
//               <div className="absolute top-full mt-2 left-0 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
//                 <div className="p-3">
//                   <div className="relative mb-3">
//                     <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
//                     <input
//                       type="text"
//                       placeholder="Search by name or email"
//                       className="w-full pl-10 pr-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     />
//                   </div>
//                   <div className="space-y-1">
//                     <button
//                       onClick={() => {
//                         setDeletedByFilter('Anyone');
//                         setDeletedByOpen(false);
//                       }}
//                       className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-100 rounded text-sm text-left"
//                     >
//                       <span>Anyone</span>
//                       {deletedByFilter === 'Anyone' && <Check className="h-4 w-4" />}
//                     </button>
//                     <button
//                       onClick={() => {
//                         setDeletedByFilter('Only you');
//                         setDeletedByOpen(false);
//                       }}
//                       className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-100 rounded text-sm text-left"
//                     >
//                       <span>Only you</span>
//                       {deletedByFilter === 'Only you' && <Check className="h-4 w-4" />}
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>

//           {/* Folder Dropdown */}
//           <div className="relative">
//             <button
//               onClick={() => {
//                 setFolderOpen(!folderOpen);
//                 setDeletedByOpen(false);
//                 setDateDeletedOpen(false);
//               }}
//               className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-900 rounded-full text-sm hover:bg-gray-50 transition-colors"
//             >
//               <span>Folder</span>
//               <ChevronDown className="h-4 w-4" />
//             </button>

//             {folderOpen && (
//               <div className="absolute top-full mt-2 left-0 w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
//                 <div className="p-2 space-y-1">
//                   <button
//                     onClick={() => {
//                       setFolderFilter('All');
//                       setFolderOpen(false);
//                     }}
//                     className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-100 rounded text-sm text-left"
//                   >
//                     <span>All</span>
//                     {folderFilter === 'All' && <Check className="h-4 w-4" />}
//                   </button>
//                   <button
//                     onClick={() => {
//                       setFolderFilter('Folders only');
//                       setFolderOpen(false);
//                     }}
//                     className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-100 rounded text-sm text-left"
//                   >
//                     <span>Folders only</span>
//                     {folderFilter === 'Folders only' && <Check className="h-4 w-4" />}
//                   </button>
//                   <button
//                     onClick={() => {
//                       setFolderFilter('Documents only');
//                       setFolderOpen(false);
//                     }}
//                     className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-100 rounded text-sm text-left"
//                   >
//                     <span>Documents only</span>
//                     {folderFilter === 'Documents only' && <Check className="h-4 w-4" />}
//                   </button>
//                 </div>
//               </div>
//             )}
//           </div>

//           {/* Date deleted Dropdown */}
//           <div className="relative">
//             <button
//               onClick={() => {
//                 setDateDeletedOpen(!dateDeletedOpen);
//                 setDeletedByOpen(false);
//                 setFolderOpen(false);
//               }}
//               className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-900 rounded-full text-sm hover:bg-gray-50 transition-colors"
//             >
//               <span>Date deleted: {dateDeletedFilter}</span>
//               <ChevronDown className="h-4 w-4" />
//             </button>

//             {dateDeletedOpen && (
//               <div className="absolute top-full mt-2 left-0 w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
//                 <div className="p-2 space-y-1">
//                   <button
//                     onClick={() => {
//                       setDateDeletedFilter('Last 7 days');
//                       setDateDeletedOpen(false);
//                     }}
//                     className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-100 rounded text-sm text-left"
//                   >
//                     <span>Last 7 days</span>
//                     {dateDeletedFilter === 'Last 7 days' && <Check className="h-4 w-4" />}
//                   </button>
//                   <button
//                     onClick={() => {
//                       setDateDeletedFilter('Last 30 days');
//                       setDateDeletedOpen(false);
//                     }}
//                     className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-100 rounded text-sm text-left"
//                   >
//                     <span>Last 30 days</span>
//                     {dateDeletedFilter === 'Last 30 days' && <Check className="h-4 w-4" />}
//                   </button>
//                   <button
//                     onClick={() => {
//                       setDateDeletedFilter('Older');
//                       setDateDeletedOpen(false);
//                     }}
//                     className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-100 rounded text-sm text-left"
//                   >
//                     <span>Older</span>
//                     {dateDeletedFilter === 'Older' && <Check className="h-4 w-4" />}
//                   </button>
//                 </div>
//               </div>
//             )}
//           </div>

//           {/* Device Dropdown (Disabled) */}
//           <div className="relative">
//             <button
//               disabled
//               className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-400 rounded-full text-sm cursor-not-allowed"
//             >
//               <span>Device</span>
//               <ChevronDown className="h-4 w-4" />
//             </button>
//           </div>
//         </div>

//         {/* Reset Filters */}
//         <button
//           onClick={resetFilters}
//           className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
//         >
//           <RotateCcw className="h-4 w-4" />
//           Reset filters
//         </button>
//       </div>

//       {/* Table */}
//       <div className="px-8 py-6">
//         <div className="border border-gray-200 rounded-lg overflow-hidden">
//           {/* Table Header */}
//           <div className="grid grid-cols-[2fr_1fr_1fr] gap-4 px-6 py-4 bg-gray-50 border-b border-gray-200">
//             <div className="text-sm font-medium text-gray-700">Name</div>
//             <div className="text-sm font-medium text-gray-700">Deleted by</div>
//             <div className="text-sm font-medium text-gray-700">Date deleted</div>
//           </div>

//           {/* Table Rows */}
//           <div className="divide-y divide-gray-200 bg-white">
//             {dummyData.map((item) => (
//               <button
//                 key={item.id}
//                 onClick={() => handleRestore(item)}
//                 className="w-full grid grid-cols-[2fr_1fr_1fr] gap-4 px-6 py-4 hover:bg-gray-50 transition-colors text-left"
//               >
//                 <div className="flex items-center gap-3">
//                   {item.type === 'folder' ? (
//                     <Folder className="h-5 w-5 text-blue-500 flex-shrink-0" />
//                   ) : (
//                     <FileText className="h-5 w-5 text-gray-500 flex-shrink-0" />
//                   )}
//                   <span className="text-sm text-gray-900">{item.name}</span>
//                 </div>
//                 <div className="flex items-center">
//                   <span className="text-sm text-gray-700">{item.deletedBy}</span>
//                 </div>
//                 <div className="flex items-center">
//                   <div>
//                     <div className="text-sm text-gray-900">{item.deletedDate}</div>
//                     <div className="text-xs text-gray-500">{item.deletedOn}</div>
//                   </div>
//                 </div>
//               </button>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* Toast Notification */}
//       {showToast && (
//         <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white rounded-full shadow-lg px-6 py-4 flex items-center gap-4 animate-in fade-in slide-in-from-bottom-4">
//           <Check className="h-5 w-5 flex-shrink-0" />
//           <span className="text-sm font-medium">{toastMessage}</span>
//           <div className="flex items-center gap-3 ml-4 border-l border-gray-700 pl-4">
//             <button
//               onClick={handleUndo}
//               className="text-sm font-medium hover:underline"
//             >
//               Undo
//             </button>
//             <button
//               onClick={() => setShowToast(false)}
//               className="text-sm font-medium hover:underline"
//             >
//               Close
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default TrashScreen;





const RestorePage = () => {
  return (
    <div>RestorePage</div>
  )
}

export default RestorePage