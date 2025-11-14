export interface TrashItem {
  id: string;
  name: string;
  type: string;               
  path: string;
  deletedAt: string;           
  daysUntilAutoDelete: number;
  autoDeleteDate: string;     
  size: number | null;
  description: string | null;

  deletedBy: {
    id: string;
    name: string;
    email: string;
    profilePic: string | null;
  } | null;                   
}
