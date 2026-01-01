import { type JSX } from "react";
import { ChevronRight } from "lucide-react";
import type { ITreeNode } from "@/config/types/navigationTreeTypes";
import { isInActivePath } from "@/utils/helper/navigationTreeHelpers";

interface TreeNodeRendererProps {
  node: ITreeNode;
  parentId?: string;
  navigationTree: ITreeNode[];
  onClick: (node: ITreeNode) => void;
  level?: number;
}

export const TreeNodeRenderer = ({
  node,
  parentId,
  navigationTree,
  onClick,
  level = 0,
}: TreeNodeRendererProps): JSX.Element => {
  const hasChildren = node.children?.length > 0;
  const isActive = parentId === node.id;
  const isExpanded =
    isActive ||
    (parentId ? isInActivePath(navigationTree, node.id, parentId) : false);

  return (
    <div key={node.id} className="select-none">
      <div
        onClick={() => onClick(node)}
        className={`flex items-center gap-2 py-2 px-3 rounded-lg cursor-pointer transition-all hover:text-primary ${
          isActive ? "bg-[#F6FFFD] text-primary" : "text-muted-foreground"
        }`}
        style={{ paddingLeft: `${level * 16 + 12}px` }}
      >
        {hasChildren ? (
          <ChevronRight
            className={`w-4 h-4 transition-transform ${
              isExpanded ? "rotate-90" : ""
            }`}
          />
        ) : (
          <span className="w-4 h-4" />
        )}

        {/* Icon based on level and type */}
        {level === 0 ? (
          // Department/MyDrive icon
          <svg width="18" height="22" viewBox="0 0 18 22" fill="none">
            <path
              d="M1 18.5V3.5C1 2.83696 1.26339 2.20107 1.73223 1.73223C2.20107 1.26339 2.83696 1 3.5 1H16C16.2652 1 16.5196 1.10536 16.7071 1.29289C16.8946 1.48043 17 1.73478 17 2V20C17 20.2652 16.8946 20.5196 16.7071 20.7071C16.5196 20.8946 16.2652 21 16 21H3.5C2.83696 21 2.20107 20.7366 1.73223 20.2678C1.26339 19.7989 1 19.163 1 18.5ZM1 18.5C1 17.837 1.26339 17.2011 1.73223 16.7322C2.20107 16.2634 2.83696 16 3.5 16H17"
              stroke="#434343"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : isExpanded ? (
          // Open folder icon
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M6 14L7.5 11.1C7.66307 10.7761 7.91112 10.5027 8.21761 10.3089C8.5241 10.1152 8.8775 10.0084 9.24 9.99997H20M20 9.99997C20.3055 9.99944 20.6071 10.0689 20.8816 10.2031C21.1561 10.3372 21.3963 10.5325 21.5836 10.7738C21.7709 11.0152 21.9004 11.2963 21.9622 11.5955C22.024 11.8947 22.0164 12.2041 21.94 12.5L20.4 18.5C20.2886 18.9315 20.0362 19.3135 19.6829 19.5853C19.3296 19.857 18.8957 20.003 18.45 20H4C3.46957 20 2.96086 19.7893 2.58579 19.4142C2.21071 19.0391 2 18.5304 2 18V4.99997C2 4.46954 2.21071 3.96083 2.58579 3.58576C2.96086 3.21069 3.46957 2.99997 4 2.99997H7.9C8.23449 2.99669 8.56445 3.07736 8.8597 3.23459C9.15495 3.39183 9.40604 3.6206 9.59 3.89997L10.4 5.09997C10.5821 5.3765 10.83 5.60349 11.1215 5.76058C11.413 5.91766 11.7389 5.99992 12.07 5.99997H18C18.5304 5.99997 19.0391 6.21069 19.4142 6.58576C19.7893 6.96083 20 7.46954 20 7.99997V9.99997Z"
              stroke="#434343"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : (
          // Closed folder icon
          <svg width="22" height="19" viewBox="0 0 22 19" fill="none">
            <path
              d="M19 18C19.5304 18 20.0391 17.7893 20.4142 17.4142C20.7893 17.0391 21 16.5304 21 16V6C21 5.46957 20.7893 4.96086 20.4142 4.58579C20.0391 4.21071 19.5304 4 19 4H11.1C10.7655 4.00328 10.4355 3.92261 10.1403 3.76538C9.84505 3.60815 9.59396 3.37938 9.41 3.1L8.6 1.9C8.41789 1.62347 8.16997 1.39648 7.8785 1.2394C7.58702 1.08231 7.26111 1.00005 6.93 1H3C2.46957 1 1.96086 1.21071 1.58579 1.58579C1.21071 1.96086 1 2.46957 1 3V16C1 16.5304 1.21071 17.0391 1.58579 17.4142C1.96086 17.7893 2.46957 18 3 18H19Z"
              fill="#434343"
              stroke="#434343"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}

        <span className="flex-1 text-sm truncate text-[16px] text-[#1E1E1E]">
          {node.name}
        </span>
      </div>

      {hasChildren && isExpanded && (
        <div>
          {node.children.map((child) => (
            <TreeNodeRenderer
              key={child.id}
              node={child}
              parentId={parentId}
              navigationTree={navigationTree}
              onClick={onClick}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};