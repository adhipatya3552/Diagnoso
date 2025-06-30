import React, { useState } from 'react';
import { Heart, Activity, Pill, Brain, Apple, Moon, Weight, Thermometer, TrendingUp, Plus, Calendar, Target, Clock, Award, AlertCircle } from 'lucide-react';
import { HealthMetricsGrid } from '../../components/health/HealthMetricsGrid';
import { HealthChart } from '../../components/health/HealthChart';
import { HealthTimeline } from '../../components/health/HealthTimeline';
import { HealthScoreCalculator } from '../../components/health/HealthScoreCalculator';
import { HealthGoalTracker, HealthGoal } from '../../components/health/HealthGoalTracker';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { useToast } from '../../hooks/useToast';

export const HealthDashboard: React.FC = () => {
  const { success } = useToast();
  const [showMetricModal, setShowMetricModal] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<any>(null);
  
  // Mock health metrics data
  const healthMetrics = [
    {
      id: 'blood-pressure',
      title: 'Blood Pressure',
      value: '120/80',
      unit: 'mmHg',
      icon: Heart,
      trend: 'stable' as const,
      trendValue: '0%',
      status: 'normal' as const,
      target: 120,
      progress: 90,
      lastUpdated: '2 hours ago',
      description: 'Your blood pressure is within the normal range.'
    },
    {
      id: 'heart-rate',
      title: 'Heart Rate',
      value: 72,
      unit: 'bpm',
      icon: Activity,
      trend: 'down' as const,
      trendValue: '-3%',
      status: 'normal' as const,
      target: 70,
      progress: 95,
      lastUpdated: '1 hour ago',
      description: 'Your resting heart rate is in the healthy range.'
    },
    {
      id: 'weight',
      title: 'Weight',
      value: 165,
      unit: 'lbs',
      icon: Weight,
      trend: 'down' as const,
      trendValue: '-2 lbs',
      status: 'good' as const,
      target: 160,
      progress: 80,
      lastUpdated: '2 days ago',
      description: 'You\'re making good progress toward your weight goal.'
    },
    {
      id: 'temperature',
      title: 'Temperature',
      value: 98.6,
      unit: '°F',
      icon: Thermometer,
      trend: 'stable' as const,
      status: 'normal' as const,
      target: 98.6,
      progress: 100,
      lastUpdated: '3 days ago',
      description: 'Your body temperature is normal.'
    }
  ];
  
  // Mock blood pressure data for chart
  const bloodPressureData = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    
    // Generate realistic blood pressure data with some variation
    const systolic = 120 + Math.floor(Math.random() * 10) - 5;
    
    return {
      date: date.toISOString(),
      value: systolic,
      annotation: i === 25 ? 'Started new medication' : undefined
    };
  });
  
  // Mock heart rate data for chart
  const heartRateData = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    
    // Generate realistic heart rate data with some variation
    const heartRate = 72 + Math.floor(Math.random() * 8) - 4;
    
    return {
      date: date.toISOString(),
      value: heartRate,
      annotation: i === 15 ? 'Started exercise program' : undefined
    };
  });
  
  // Mock health timeline events
  const timelineEvents = [
    {
      id: '1',
      title: 'Annual Physical Examination',
      description: 'Comprehensive health check with Dr. Sarah Johnson. All results within normal ranges.',
      date: '2025-01-02',
      time: '10:00 AM',
      category: 'appointment' as const,
      icon: Calendar,
      status: 'completed' as const,
      metadata: {
        doctor: 'Dr. Sarah Johnson',
        location: 'Diagnosa Medical Center',
        duration: '45 minutes'
      }
    },
    {
      id: '2',
      title: 'Started New Blood Pressure Medication',
      description: 'Began taking Lisinopril 10mg once daily as prescribed by Dr. Johnson.',
      date: '2024-12-28',
      category: 'medication' as const,
      icon: Pill,
      status: 'in-progress' as const,
      metadata: {
        medication: 'Lisinopril 10mg',
        frequency: 'Once daily',
        prescribedBy: 'Dr. Sarah Johnson'
      }
    },
    {
      id: '3',
      title: 'Blood Test Results',
      description: 'Cholesterol levels slightly elevated. Doctor recommended dietary changes.',
      date: '2024-12-20',
      category: 'test' as const,
      icon: Activity,
      status: 'completed' as const,
      metadata: {
        totalCholesterol: '210 mg/dL',
        ldl: '130 mg/dL',
        hdl: '45 mg/dL',
        triglycerides: '150 mg/dL'
      }
    },
    {
      id: '4',
      title: 'Reached 10,000 Steps Goal',
      description: 'Achieved daily step goal for 7 consecutive days.',
      date: '2024-12-15',
      category: 'achievement' as const,
      icon: Award,
      status: 'completed' as const,
      metadata: {
        streak: '7 days',
        averageSteps: '10,342',
        caloriesBurned: '~2,500'
      }
    }
  ];
  
  // Mock health score categories
  const healthScoreCategories = [
    {
      id: 'vitals',
      name: 'Vital Signs',
      score: 85,
      weight: 30,
      icon: Heart,
      color: 'bg-red-100 text-red-800',
      factors: [
        {
          name: 'Blood Pressure',
          value: 120,
          target: 120,
          weight: 40,
          description: 'Systolic blood pressure in mmHg'
        },
        {
          name: 'Heart Rate',
          value: 72,
          target: 70,
          weight: 30,
          description: 'Resting heart rate in beats per minute'
        },
        {
          name: 'Oxygen Saturation',
          value: 98,
          target: 98,
          weight: 30,
          description: 'Blood oxygen level percentage'
        }
      ]
    },
    {
      id: 'physical',
      name: 'Physical Activity',
      score: 65,
      weight: 25,
      icon: Activity,
      color: 'bg-green-100 text-green-800',
      factors: [
        {
          name: 'Daily Steps',
          value: 8500,
          target: 10000,
          weight: 40,
          description: 'Average daily step count'
        },
        {
          name: 'Exercise Minutes',
          value: 120,
          target: 150,
          weight: 40,
          description: 'Weekly moderate-intensity exercise in minutes'
        },
        {
          name: 'Active Days',
          value: 4,
          target: 5,
          weight: 20,
          description: 'Days per week with at least 30 minutes of activity'
        }
      ]
    },
    {
      id: 'nutrition',
      name: 'Nutrition',
      score: 70,
      weight: 25,
      icon: Apple,
      color: 'bg-yellow-100 text-yellow-800',
      factors: [
        {
          name: 'Fruit & Vegetable Servings',
          value: 4,
          target: 5,
          weight: 35,
          description: 'Daily servings of fruits and vegetables'
        },
        {
          name: 'Water Intake',
          value: 6,
          target: 8,
          weight: 25,
          description: 'Daily water consumption in cups'
        },
        {
          name: 'Processed Food Limit',
          value: 3,
          target: 2,
          weight: 40,
          description: 'Weekly processed food meals (lower is better)'
        }
      ]
    },
    {
      id: 'sleep',
      name: 'Sleep Quality',
      score: 75,
      weight: 20,
      icon: Moon,
      color: 'bg-purple-100 text-purple-800',
      factors: [
        {
          name: 'Sleep Duration',
          value: 7,
          target: 8,
          weight: 50,
          description: 'Average nightly sleep in hours'
        },
        {
          name: 'Sleep Efficiency',
          value: 85,
          target: 90,
          weight: 30,
          description: 'Percentage of time in bed actually sleeping'
        },
        {
          name: 'Consistent Schedule',
          value: 80,
          target: 100,
          weight: 20,
          description: 'Consistency of sleep/wake times'
        }
      ]
    }
  ];
  
  // Mock health goals
  const healthGoals: HealthGoal[] = [
    {
      id: '1',
      title: 'Reduce Blood Pressure',
      description: 'Lower systolic blood pressure to healthy range through medication, diet, and exercise',
      category: 'vitals',
      target: {
        value: 120,
        unit: 'mmHg'
      },
      current: {
        value: 130,
        unit: 'mmHg'
      },
      startDate: '2024-12-01',
      targetDate: '2025-03-01',
      progress: 70,
      streak: 14,
      status: 'active'
    },
    {
      id: '2',
      title: 'Increase Daily Step Count',
      description: 'Reach 10,000 steps per day consistently',
      category: 'activity',
      target: {
        value: 10000,
        unit: 'steps'
      },
      current: {
        value: 8500,
        unit: 'steps'
      },
      startDate: '2024-12-15',
      targetDate: '2025-02-15',
      progress: 85,
      streak: 5,
      status: 'active'
    },
    {
      id: '3',
      title: 'Improve Sleep Duration',
      description: 'Consistently get 8 hours of sleep per night',
      category: 'sleep',
      target: {
        value: 8,
        unit: 'hours'
      },
      current: {
        value: 7,
        unit: 'hours'
      },
      startDate: '2024-11-15',
      targetDate: '2025-01-15',
      progress: 60,
      status: 'active'
    },
    {
      id: '4',
      title: 'Weight Loss Goal',
      description: 'Lose 10 pounds through healthy diet and regular exercise',
      category: 'weight',
      target: {
        value: 160,
        unit: 'lbs'
      },
      current: {
        value: 165,
        unit: 'lbs'
      },
      startDate: '2024-12-01',
      targetDate: '2025-03-01',
      progress: 50,
      status: 'active'
    }
  ];
  
  const handleMetricClick = (metric: any) => {
    setSelectedMetric(metric);
    setShowMetricModal(true);
  };
  
  const handleAddGoal = () => {
    success('Goal creation feature coming soon!');
  };
  
  const handleViewGoal = (goal: HealthGoal) => {
    success(`Viewing details for goal: ${goal.title}`);
  };
  
  const handleUpdateGoal = (goal: HealthGoal) => {
    success(`Updating progress for goal: ${goal.title}`);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Health Dashboard</h1>
            <p className="text-gray-600 mt-2">Track your health metrics and progress</p>
          </div>
          
          <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 py-3 rounded-xl shadow-lg">
            <div className="flex items-center space-x-2">
              <Heart className="w-5 h-5" />
              <span className="font-semibold">Health Score: 75%</span>
            </div>
          </div>
        </div>
        
        {/* Health Metrics */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Key Health Metrics</h2>
            <Button
              variant="outline"
              size="sm"
              icon={Plus}
              onClick={() => success('Add metric feature coming soon!')}
            >
              Add Metric
            </Button>
          </div>
          
          <HealthMetricsGrid
            metrics={healthMetrics}
            onMetricClick={handleMetricClick}
          />
        </div>
        
        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <HealthChart
            title="Blood Pressure"
            data={bloodPressureData}
            unit="mmHg"
            color="#EF4444"
            normalRange={{ min: 90, max: 120 }}
          />
          
          <HealthChart
            title="Heart Rate"
            data={heartRateData}
            unit="bpm"
            color="#3B82F6"
            normalRange={{ min: 60, max: 100 }}
          />
        </div>
        
        {/* Health Score and Goals */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <HealthScoreCalculator categories={healthScoreCategories} />
          
          <HealthGoalTracker
            goals={healthGoals}
            onAddGoal={handleAddGoal}
            onViewGoal={handleViewGoal}
            onUpdateGoal={handleUpdateGoal}
          />
        </div>
        
        {/* Health Timeline */}
        <div className="mb-8">
          <HealthTimeline
            events={timelineEvents}
            title="Recent Health Events"
          />
        </div>
        
        {/* Health Alerts */}
        <div className="bg-red-50 rounded-xl p-6 border border-red-200 shadow-lg">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-red-800 mb-2">Health Alerts</h3>
              <div className="space-y-3">
                <div className="p-3 bg-white rounded-lg border border-red-200">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-red-500" />
                    <p className="font-medium text-red-800">Medication Reminder</p>
                  </div>
                  <p className="text-sm text-red-700 mt-1">
                    Remember to take your Lisinopril 10mg today at 8:00 PM
                  </p>
                </div>
                
                <div className="p-3 bg-white rounded-lg border border-red-200">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-red-500" />
                    <p className="font-medium text-red-800">Upcoming Appointment</p>
                  </div>
                  <p className="text-sm text-red-700 mt-1">
                    Follow-up with Dr. Johnson on January 15, 2025 at 2:00 PM
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Metric Detail Modal */}
      {selectedMetric && (
        <Modal
          isOpen={showMetricModal}
          onClose={() => setShowMetricModal(false)}
          title={selectedMetric.title}
          size="lg"
        >
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  selectedMetric.status === 'normal' ? 'bg-blue-100 text-blue-800' :
                  selectedMetric.status === 'good' ? 'bg-green-100 text-green-800' :
                  selectedMetric.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  <selectedMetric.icon className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-3xl font-bold text-gray-900">{selectedMetric.value}</span>
                    {selectedMetric.unit && (
                      <span className="text-lg text-gray-500">{selectedMetric.unit}</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">Last updated {selectedMetric.lastUpdated}</p>
                </div>
              </div>
              
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                selectedMetric.status === 'normal' ? 'bg-blue-100 text-blue-800' :
                selectedMetric.status === 'good' ? 'bg-green-100 text-green-800' :
                selectedMetric.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {selectedMetric.status.charAt(0).toUpperCase() + selectedMetric.status.slice(1)}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Description</h4>
              <p className="text-gray-600">{selectedMetric.description}</p>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Progress Toward Target</h4>
              <ProgressIndicator
                value={selectedMetric.progress}
                color={
                  selectedMetric.status === 'good' ? 'green' :
                  selectedMetric.status === 'normal' ? 'blue' :
                  selectedMetric.status === 'warning' ? 'yellow' :
                  'red'
                }
                showLabel
              />
              <p className="text-sm text-gray-500 mt-2">
                Target: {selectedMetric.target} {selectedMetric.unit}
              </p>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Historical Data</h4>
              <HealthChart
                title={selectedMetric.title}
                data={selectedMetric.id === 'blood-pressure' ? bloodPressureData : heartRateData}
                unit={selectedMetric.unit}
                color={
                  selectedMetric.status === 'good' ? '#10B981' :
                  selectedMetric.status === 'normal' ? '#3B82F6' :
                  selectedMetric.status === 'warning' ? '#F59E0B' :
                  '#EF4444'
                }
                height={200}
              />
            </div>
            
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h4 className="font-medium text-blue-800 mb-2">Recommendations</h4>
              <ul className="space-y-2 text-sm text-blue-700">
                <li className="flex items-start space-x-2">
                  <Check className="w-4 h-4 text-blue-500 mt-0.5" />
                  <span>Continue monitoring your {selectedMetric.title.toLowerCase()} regularly</span>
                </li>
                <li className="flex items-start space-x-2">
                  <Check className="w-4 h-4 text-blue-500 mt-0.5" />
                  <span>Maintain your current medication regimen as prescribed</span>
                </li>
                <li className="flex items-start space-x-2">
                  <Check className="w-4 h-4 text-blue-500 mt-0.5" />
                  <span>Consider lifestyle factors that may affect your {selectedMetric.title.toLowerCase()}</span>
                </li>
              </ul>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};