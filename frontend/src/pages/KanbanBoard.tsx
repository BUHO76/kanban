import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import toast from 'react-hot-toast';
import { ArrowLeft, Plus } from 'lucide-react';
import { projectService } from '../services/api';
import KanbanColumn from '../components/KanbanColumn';
import TaskModal from '../components/TaskModal';
import { Task, Project } from '../types';

const KanbanBoard: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [users, setUsers] = useState<any[]>([]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (projectId) {
      fetchProject();
      fetchTasks();
      fetchUsers();
    }
  }, [projectId]);

  const fetchProject = async () => {
    try {
      const data = await projectService.getProject(Number(projectId));
      setProject(data);
    } catch (error) {
      toast.error('Failed to load project');
      navigate('/dashboard');
    }
  };

  const fetchTasks = async () => {
    try {
      const data = await projectService.getTasks(Number(projectId));
      setTasks(data);
    } catch (error) {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setUsers([]);
    } catch (error) {
      console.error('Failed to load users');
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const activeTask = tasks.find((t) => t.id === active.id);
    
    if (!activeTask) return;

    // If dropping over a column
    if (over.id.toString().startsWith('column-')) {
      const newStatus = over.id.toString().replace('column-', '') as 'TODO' | 'IN_PROGRESS' | 'DONE';
      
      if (activeTask.status !== newStatus) {
        // Update local state optimistically
        const updatedTasks = tasks.map(t => 
          t.id === active.id ? { ...t, status: newStatus } : t
        );
        setTasks(updatedTasks);

        // Update on server
        try {
          await projectService.updateTask(Number(active.id), { status: newStatus });
          toast.success('Task status updated');
        } catch (error) {
          toast.error('Failed to update task status');
          // Revert on error
          fetchTasks();
        }
      }
    } else {
      // Reordering within same column
      const overTask = tasks.find((t) => t.id === over.id);
      if (overTask && activeTask.status === overTask.status) {
        const oldIndex = tasks.findIndex((t) => t.id === active.id);
        const newIndex = tasks.findIndex((t) => t.id === over.id);
        
        const newTasks = arrayMove(tasks, oldIndex, newIndex);
        setTasks(newTasks);
      }
    }
  };

  const handleCreateTask = async (taskData: any) => {
    try {
      const newTask = await projectService.createTask(Number(projectId), {
        ...taskData,
        status: 'TODO'
      });
      setTasks([...tasks, newTask]);
      toast.success('Task created successfully');
      setIsTaskModalOpen(false);
    } catch (error) {
      toast.error('Failed to create task');
    }
  };

  const handleUpdateTask = async (taskId: number, taskData: any) => {
    try {
      const updatedTask = await projectService.updateTask(taskId, taskData);
      setTasks(tasks.map(t => t.id === taskId ? updatedTask : t));
      toast.success('Task updated successfully');
      setSelectedTask(null);
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    
    try {
      await projectService.deleteTask(taskId);
      setTasks(tasks.filter(t => t.id !== taskId));
      toast.success('Task deleted successfully');
    } catch (error) {
      toast.error('Failed to delete task');
    }
  };

  const getColumnTasks = (status: 'TODO' | 'IN_PROGRESS' | 'DONE') => {
    return tasks.filter(task => task.status === status);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const columns = [
    { id: 'column-TODO', title: 'To Do', status: 'TODO' as const, color: 'gray' },
    { id: 'column-IN_PROGRESS', title: 'In Progress', status: 'IN_PROGRESS' as const, color: 'yellow' },
    { id: 'column-DONE', title: 'Done', status: 'DONE' as const, color: 'green' },
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{project?.name}</h1>
            <p className="text-gray-600 mt-1">{project?.description}</p>
          </div>
        </div>
        <button
          onClick={() => setIsTaskModalOpen(true)}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Task
        </button>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <div className="flex space-x-6 h-full min-w-[900px]">
            {columns.map((column) => (
              <KanbanColumn
                key={column.id}
                id={column.id}
                title={column.title}
                color={column.color}
                tasks={getColumnTasks(column.status)}
                onTaskClick={(task) => setSelectedTask(task)}
                onDeleteTask={handleDeleteTask}
              />
            ))}
          </div>
        </DndContext>
      </div>

      {/* Task Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSubmit={handleCreateTask}
        users={users}
      />

      {/* Edit Task Modal */}
      {selectedTask && (
        <TaskModal
          isOpen={true}
          onClose={() => setSelectedTask(null)}
          onSubmit={(data) => handleUpdateTask(selectedTask.id, data)}
          task={selectedTask}
          users={users}
        />
      )}
    </div>
  );
};

export default KanbanBoard;