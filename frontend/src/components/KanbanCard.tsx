import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2, User } from 'lucide-react';
import { Task } from '../types';

interface KanbanCardProps {
  task: Task;
  onClick: () => void;
  onDelete: () => void;
}

const KanbanCard: React.FC<KanbanCardProps> = ({ task, onClick, onDelete }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete();
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 cursor-pointer hover:shadow-md transition"
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className="font-medium text-gray-900 mb-1">{task.title}</h4>
          <p className="text-sm text-gray-600 line-clamp-2">{task.description}</p>
          
          <div className="flex items-center mt-3 space-x-2">
            {task.assigned_to && (
              <div className="flex items-center text-xs text-gray-500">
                <User className="w-3 h-3 mr-1" />
                <span>User {task.assigned_to}</span>
              </div>
            )}
            <div className="text-xs text-gray-400">
              {new Date(task.created_at).toLocaleDateString()}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-1">
          <button
            onClick={handleDelete}
            className="p-1 hover:bg-red-50 rounded text-gray-400 hover:text-red-600 transition"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <div
            {...listeners}
            className="p-1 hover:bg-gray-100 rounded cursor-grab active:cursor-grabbing"
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical className="w-4 h-4 text-gray-400" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default KanbanCard;