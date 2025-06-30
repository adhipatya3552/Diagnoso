import React, { useState, useEffect } from 'react';
import { Shield, Heart, Activity, Brain, Apple, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { ProgressIndicator } from '../ui/ProgressIndicator';

interface HealthScoreCategory {
  id: string;
  name: string;
  score: number;
  weight: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  factors: {
    name: string;
    value: number;
    target: number;
    weight: number;
    description?: string;
  }[];
}

interface HealthScoreCalculatorProps {
  categories: HealthScoreCategory[];
  className?: string;
}

export const HealthScoreCalculator: React.FC<HealthScoreCalculatorProps> = ({
  categories,
  className = ''
}) => {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [overallScore, setOverallScore] = useState(0);
  
  // Calculate overall score
  useEffect(() => {
    const totalWeight = categories.reduce((sum, category) => sum + category.weight, 0);
    const weightedScore = categories.reduce((sum, category) => sum + (category.score * category.weight), 0);
    setOverallScore(Math.round(weightedScore / totalWeight));
  }, [categories]);
  
  const toggleCategory = (id: string) => {
    setExpandedCategory(expandedCategory === id ? null : id);
  };
  
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-blue-500';
    if (score >= 40) return 'text-yellow-500';
    return 'text-red-500';
  };
  
  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Improvement';
  };
  
  return (
    <div className={`bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 ${className}`}>
      <h3 className="text-xl font-semibold text-gray-800 mb-6">Health Score</h3>
      
      {/* Overall Score */}
      <div className="flex flex-col items-center mb-8">
        <div className="relative mb-4">
          <div className="w-40 h-40">
            <ProgressIndicator
              variant="circular"
              value={overallScore}
              color={
                overallScore >= 80 ? 'green' :
                overallScore >= 60 ? 'blue' :
                overallScore >= 40 ? 'yellow' : 'red'
              }
              size="lg"
            />
          </div>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-4xl font-bold ${getScoreColor(overallScore)}`}>{overallScore}</span>
            <span className="text-sm text-gray-500">{getScoreLabel(overallScore)}</span>
          </div>
        </div>
        
        <p className="text-sm text-gray-600 text-center max-w-md">
          Your health score is calculated based on various factors including vital signs, lifestyle habits, and medical history.
        </p>
      </div>
      
      {/* Categories */}
      <div className="space-y-4">
        {categories.map((category) => (
          <div key={category.id} className="border border-gray-200 rounded-lg overflow-hidden">
            <div 
              className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => toggleCategory(category.id)}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${category.color}`}>
                  <category.icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-800">{category.name}</h4>
                  <div className="flex items-center space-x-2">
                    <ProgressIndicator
                      value={category.score}
                      color={
                        category.score >= 80 ? 'green' :
                        category.score >= 60 ? 'blue' :
                        category.score >= 40 ? 'yellow' : 'red'
                      }
                      size="sm"
                      className="w-20"
                    />
                    <span className={`text-sm font-medium ${getScoreColor(category.score)}`}>
                      {category.score}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">Weight: {category.weight}%</span>
                {expandedCategory === category.id ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </div>
            </div>
            
            {/* Expanded Category Details */}
            {expandedCategory === category.id && (
              <div className="p-4 bg-gray-50 border-t border-gray-200 animate-slide-down">
                <div className="space-y-4">
                  {category.factors.map((factor, index) => (
                    <div key={index} className="bg-white p-3 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <h5 className="font-medium text-gray-800">{factor.name}</h5>
                          {factor.description && (
                            <div className="group relative">
                              <Info className="w-4 h-4 text-gray-400 cursor-help" />
                              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 p-2 bg-gray-800 text-white text-xs rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                                {factor.description}
                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-800 rotate-45"></div>
                              </div>
                            </div>
                          )}
                        </div>
                        <span className="text-sm text-gray-500">Weight: {factor.weight}%</span>
                      </div>
                      
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-600">Current: {factor.value}</span>
                        <span className="text-sm text-gray-600">Target: {factor.target}</span>
                      </div>
                      
                      <ProgressIndicator
                        value={Math.min(100, (factor.value / factor.target) * 100)}
                        color={
                          factor.value >= factor.target ? 'green' :
                          factor.value >= factor.target * 0.8 ? 'blue' :
                          factor.value >= factor.target * 0.6 ? 'yellow' : 'red'
                        }
                        size="sm"
                      />
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-start space-x-2">
                    <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-blue-800 font-medium">How to improve your {category.name.toLowerCase()} score:</p>
                      <ul className="mt-2 space-y-1 text-sm text-blue-700">
                        <li>• Focus on factors with the lowest scores first</li>
                        <li>• Set realistic goals for gradual improvement</li>
                        <li>• Consult with your healthcare provider for personalized advice</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};