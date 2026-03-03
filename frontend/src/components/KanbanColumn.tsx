import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import KanbanCard from './KanbanCard';
import { Task } from '../types';

interface KanbanColumnProps {
  id: string;
  title: string;
  color: string;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onDeleteTask: (taskId: number) => void;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({
  id,
  title,
  color,
  tasks,
  onTaskClick,
  onDeleteTask,
}) => {
  const { setNodeRef } = useDroppable({ id });

  const getColorClasses = () => {
    switch (color) {
      case 'yellow':
        return 'bg-yellow-50 border-yellow-200';
      case 'green':
        return 'bg-green-50 border-green-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getHeaderColor = () => {
    switch (color) {
      case 'yellow':
        return 'bg-yellow-500';
      case 'green':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div
      ref={setNodeRef}
      className={`flex-1 min-w-[300px] rounded-lg border ${getColorClasses()} p-4 flex flex-col h-full`}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${getHeaderColor()}`} />
          <h3 className="font-semibold text-gray-700">{title}</h3>
          <span className="bg-white px-2 py-1 rounded-full text-xs font-medium text-gray-600">
            {tasks.length}
          </span>
        </div>
      </div>

      {/* Tasks */}
      <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
        <div className="flex-1 space-y-3 min-h-[200px]">
          {tasks.map((task) => (
            <KanbanCard
              key={task.id}
              task={task}
              onClick={() => onTaskClick(task)}
              onDelete={() => onDeleteTask(task.id)}
            />
          ))}
          {tasks.length === 0 && (
            <div className="h-20 border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center text-gray-400 text-sm">
              Drop tasks here
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
};

export default KanbanColumn;