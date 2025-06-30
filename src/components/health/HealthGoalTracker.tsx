import React, { useState } from 'react';
import { Target, Check, Clock, Calendar, TrendingUp, Award, ChevronRight, Plus } from 'lucide-react';
import { ProgressIndicator } from '../ui/ProgressIndicator';
import { Button } from '../ui/Button';

export interface HealthGoal {
  id: string;
  title: string;
  description?: string;
  category: 'weight' | 'activity' | 'nutrition' | 'sleep' | 'vitals' | 'other';
  target: {
    value: number;
    unit: string;
  };
  current: {
    value: number;
    unit: string;
  };
  startDate: string;
  targetDate?: string;
  progress: number;
  streak?: number;
  history?: Array<{
    date: string;
    value: number;
  }>;
  status: 'active' | 'completed' | 'abandoned';
}

interface HealthGoalTrackerProps {
  goals: HealthGoal[];
  onAddGoal?: () => void;
  onViewGoal?: (goal: HealthGoal) => void;
  onUpdateGoal?: (goal: HealthGoal) => void;
  className?: string;
}

export const HealthGoalTracker: React.FC<HealthGoalTrackerProps> = ({
  goals,
  onAddGoal,
  onViewGoal,
  onUpdateGoal,
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState<'active' | 'completed' | 'all'>('active');
  
  const filteredGoals = goals.filter(goal => {
    if (activeTab === 'active') return goal.status === 'active';
    if (activeTab === 'completed') return goal.status === 'completed';
    return true; // 'all' tab
  });
  
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'weight':
        return 'bg-blue-100 text-blue-800';
      case 'activity':
        return 'bg-green-100 text-green-800';
      case 'nutrition':
        return 'bg-yellow-100 text-yellow-800';
      case 'sleep':
        return 'bg-purple-100 text-purple-800';
      case 'vitals':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'abandoned':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'green';
    if (progress >= 50) return 'blue';
    if (progress >= 25) return 'yellow';
    return 'red';
  };
  
  const getRemainingTime = (targetDate?: string) => {
    if (!targetDate) return null;
    
    const target = new Date(targetDate);
    const now = new Date();
    const diffTime = target.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    return `${diffDays} days left`;
  };
  
  return (
    <div className={`bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-800">Health Goals</h3>
        
        {onAddGoal && (
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={onAddGoal}
          >
            Add Goal
          </Button>
        )}
      </div>
      
      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('active')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'active'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          Active
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'completed'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          Completed
        </button>
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'all'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          All Goals
        </button>
      </div>
      
      {/* Goals List */}
      <div className="space-y-4">
        {filteredGoals.length > 0 ? (
          filteredGoals.map((goal) => (
            <div 
              key={goal.id}
              className="border border-gray-200 rounded-lg hover:shadow-md transition-all duration-300 overflow-hidden"
            >
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getCategoryColor(goal.category)}`}>
                      <Target className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800">{goal.title}</h4>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${getCategoryColor(goal.category)}`}>
                          {goal.category}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusColor(goal.status)}`}>
                          {goal.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {goal.streak && goal.streak > 0 && (
                    <div className="flex items-center space-x-1 bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">
                      <Award className="w-3 h-3" />
                      <span>{goal.streak} day streak</span>
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-600">Current: {goal.current.value} {goal.current.unit}</span>
                      <span className="text-sm text-gray-600">Target: {goal.target.value} {goal.target.unit}</span>
                    </div>
                    <ProgressIndicator
                      value={goal.progress}
                      color={getProgressColor(goal.progress)}
                      showLabel
                    />
                  </div>
                  
                  <div className="flex flex-col justify-center space-y-1">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span>Started: {new Date(goal.startDate).toLocaleDateString()}</span>
                    </div>
                    
                    {goal.targetDate && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span>
                          Target: {new Date(goal.targetDate).toLocaleDateString()} 
                          {getRemainingTime(goal.targetDate) && (
                            <span className="ml-1 text-blue-600">({getRemainingTime(goal.targetDate)})</span>
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                {goal.description && (
                  <p className="text-sm text-gray-600 mb-4">{goal.description}</p>
                )}
                
                <div className="flex justify-between items-center">
                  {goal.status === 'active' && onUpdateGoal && (
                    <Button
                      variant="outline"
                      size="sm"
                      icon={TrendingUp}
                      onClick={() => onUpdateGoal(goal)}
                    >
                      Update Progress
                    </Button>
                  )}
                  
                  {onViewGoal && (
                    <Button
                      variant={goal.status === 'active' ? 'secondary' : 'outline'}
                      size="sm"
                      iconPosition="right"
                      icon={ChevronRight}
                      onClick={() => onViewGoal(goal)}
                    >
                      View Details
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <Target className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-700 mb-2">No goals found</h4>
            <p className="text-gray-500 mb-6">
              {activeTab === 'active' 
                ? "You don't have any active health goals" 
                : activeTab === 'completed'
                ? "You haven't completed any health goals yet"
                : "You haven't set any health goals yet"
              }
            </p>
            
            {onAddGoal && (
              <Button
                variant="primary"
                icon={Plus}
                onClick={onAddGoal}
              >
                Create Your First Goal
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};