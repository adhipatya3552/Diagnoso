import React, { useEffect, useRef, useState } from 'react';
import { Calendar, ChevronDown, Download, Filter, ZoomIn, ZoomOut } from 'lucide-react';

interface DataPoint {
  date: string;
  value: number;
  annotation?: string;
}

interface HealthChartProps {
  title: string;
  data: DataPoint[];
  unit?: string;
  color?: string;
  normalRange?: { min: number; max: number };
  timeRanges?: { label: string; days: number }[];
  height?: number;
  showControls?: boolean;
  showDownload?: boolean;
  className?: string;
}

export const HealthChart: React.FC<HealthChartProps> = ({
  title,
  data,
  unit = '',
  color = '#3B82F6',
  normalRange,
  timeRanges = [
    { label: '7D', days: 7 },
    { label: '30D', days: 30 },
    { label: '90D', days: 90 },
    { label: '1Y', days: 365 },
    { label: 'All', days: 0 }
  ],
  height = 300,
  showControls = true,
  showDownload = true,
  className = ''
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedRange, setSelectedRange] = useState(timeRanges[0]);
  const [filteredData, setFilteredData] = useState<DataPoint[]>([]);
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; dataPoint: DataPoint } | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showRangeDropdown, setShowRangeDropdown] = useState(false);
  
  // Filter data based on selected time range
  useEffect(() => {
    if (selectedRange.days === 0) {
      setFilteredData(data);
      return;
    }
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - selectedRange.days);
    
    const filtered = data.filter(point => {
      const pointDate = new Date(point.date);
      return pointDate >= cutoffDate;
    });
    
    setFilteredData(filtered);
  }, [data, selectedRange]);
  
  // Draw chart when data or zoom changes
  useEffect(() => {
    if (!canvasRef.current || filteredData.length === 0) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions
    canvas.width = canvas.offsetWidth * 2; // For high DPI displays
    canvas.height = canvas.offsetHeight * 2;
    ctx.scale(2, 2); // Scale for high DPI
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set dimensions
    const width = canvas.offsetWidth;
    const chartHeight = canvas.offsetHeight - 40; // Leave space for x-axis labels
    
    // Find min and max values
    let minValue = Math.min(...filteredData.map(d => d.value));
    let maxValue = Math.max(...filteredData.map(d => d.value));
    
    // Add padding to min and max
    const valuePadding = (maxValue - minValue) * 0.1;
    minValue = Math.max(0, minValue - valuePadding);
    maxValue = maxValue + valuePadding;
    
    // Include normal range in min/max if provided
    if (normalRange) {
      minValue = Math.min(minValue, normalRange.min);
      maxValue = Math.max(maxValue, normalRange.max);
    }
    
    // Draw normal range if provided
    if (normalRange) {
      const normalMinY = chartHeight - ((normalRange.min - minValue) / (maxValue - minValue)) * chartHeight;
      const normalMaxY = chartHeight - ((normalRange.max - minValue) / (maxValue - minValue)) * chartHeight;
      const rangeHeight = normalMinY - normalMaxY;
      
      ctx.fillStyle = 'rgba(74, 222, 128, 0.1)'; // Light green
      ctx.fillRect(0, normalMaxY, width, rangeHeight);
      
      // Draw normal range lines
      ctx.strokeStyle = 'rgba(74, 222, 128, 0.5)';
      ctx.setLineDash([5, 5]);
      
      // Min line
      ctx.beginPath();
      ctx.moveTo(0, normalMinY);
      ctx.lineTo(width, normalMinY);
      ctx.stroke();
      
      // Max line
      ctx.beginPath();
      ctx.moveTo(0, normalMaxY);
      ctx.lineTo(width, normalMaxY);
      ctx.stroke();
      
      ctx.setLineDash([]);
    }
    
    // Draw grid lines
    const gridLineCount = 5;
    ctx.strokeStyle = 'rgba(229, 231, 235, 0.8)'; // Light gray
    ctx.lineWidth = 1;
    
    for (let i = 0; i <= gridLineCount; i++) {
      const y = (i / gridLineCount) * chartHeight;
      
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
      
      // Add y-axis labels
      const value = maxValue - ((maxValue - minValue) * (i / gridLineCount));
      ctx.fillStyle = '#6B7280'; // Gray-500
      ctx.font = '10px Inter, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`${value.toFixed(1)}${unit}`, 5, y - 5);
    }
    
    // Draw data points and line
    if (filteredData.length > 0) {
      const pointRadius = 4;
      const pointSpacing = width / (filteredData.length - 1 || 1);
      
      // Draw line connecting points
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      
      filteredData.forEach((point, index) => {
        const x = index * pointSpacing;
        const y = chartHeight - ((point.value - minValue) / (maxValue - minValue)) * chartHeight;
        
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      
      ctx.stroke();
      
      // Draw area under the line
      ctx.beginPath();
      ctx.moveTo(0, chartHeight);
      
      filteredData.forEach((point, index) => {
        const x = index * pointSpacing;
        const y = chartHeight - ((point.value - minValue) / (maxValue - minValue)) * chartHeight;
        ctx.lineTo(x, y);
      });
      
      ctx.lineTo((filteredData.length - 1) * pointSpacing, chartHeight);
      ctx.closePath();
      ctx.fillStyle = `${color}20`; // 20% opacity
      ctx.fill();
      
      // Draw points
      filteredData.forEach((point, index) => {
        const x = index * pointSpacing;
        const y = chartHeight - ((point.value - minValue) / (maxValue - minValue)) * chartHeight;
        
        // Draw point
        ctx.beginPath();
        ctx.arc(x, y, pointRadius, 0, Math.PI * 2);
        ctx.fillStyle = 'white';
        ctx.fill();
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Draw x-axis labels (dates) for first, last, and some points in between
        if (index === 0 || index === filteredData.length - 1 || index % Math.ceil(filteredData.length / 5) === 0) {
          const date = new Date(point.date);
          const dateLabel = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
          
          ctx.fillStyle = '#6B7280'; // Gray-500
          ctx.font = '10px Inter, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(dateLabel, x, chartHeight + 20);
        }
        
        // Store point coordinates for hover detection
        const canvasRect = canvas.getBoundingClientRect();
        const pointCoords = {
          x: x * (canvasRect.width / canvas.width),
          y: y * (canvasRect.height / canvas.height),
          dataPoint: point
        };
      });
    }
  }, [filteredData, normalRange, color, unit, zoomLevel]);
  
  // Handle mouse move for tooltips
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || filteredData.length === 0) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Find closest point
    const pointSpacing = rect.width / (filteredData.length - 1 || 1);
    const pointIndex = Math.round(x / pointSpacing);
    
    if (pointIndex >= 0 && pointIndex < filteredData.length) {
      const dataPoint = filteredData[pointIndex];
      const chartHeight = canvas.offsetHeight - 40;
      const minValue = Math.min(...filteredData.map(d => d.value));
      const maxValue = Math.max(...filteredData.map(d => d.value));
      const pointY = chartHeight - ((dataPoint.value - minValue) / (maxValue - minValue)) * chartHeight;
      
      setHoveredPoint({
        x: pointIndex * pointSpacing,
        y: pointY,
        dataPoint
      });
    } else {
      setHoveredPoint(null);
    }
  };
  
  const handleMouseLeave = () => {
    setHoveredPoint(null);
  };
  
  const handleDownload = () => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = `${title.replace(/\s+/g, '-').toLowerCase()}-chart.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };
  
  return (
    <div className={`bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          {filteredData.length > 0 && (
            <p className="text-sm text-gray-500">
              {new Date(filteredData[0].date).toLocaleDateString()} - {new Date(filteredData[filteredData.length - 1].date).toLocaleDateString()}
            </p>
          )}
        </div>
        
        {showControls && (
          <div className="flex items-center space-x-2">
            {/* Time Range Selector */}
            <div className="relative">
              <button
                onClick={() => setShowRangeDropdown(!showRangeDropdown)}
                className="flex items-center space-x-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm transition-colors"
              >
                <Calendar className="w-4 h-4 text-gray-600" />
                <span>{selectedRange.label}</span>
                <ChevronDown className="w-4 h-4 text-gray-600" />
              </button>
              
              {showRangeDropdown && (
                <div className="absolute right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 animate-fade-in">
                  {timeRanges.map((range) => (
                    <button
                      key={range.label}
                      onClick={() => {
                        setSelectedRange(range);
                        setShowRangeDropdown(false);
                      }}
                      className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                        selectedRange.label === range.label ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'
                      }`}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* Zoom Controls */}
            <button
              onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.1))}
              className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4 text-gray-600" />
            </button>
            
            <button
              onClick={() => setZoomLevel(Math.min(2, zoomLevel + 0.1))}
              className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4 text-gray-600" />
            </button>
            
            {/* Download Button */}
            {showDownload && (
              <button
                onClick={handleDownload}
                className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                title="Download Chart"
              >
                <Download className="w-4 h-4 text-gray-600" />
              </button>
            )}
          </div>
        )}
      </div>
      
      <div className="relative" style={{ height: `${height}px` }}>
        <canvas
          ref={canvasRef}
          className="w-full h-full"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        />
        
        {/* Tooltip */}
        {hoveredPoint && (
          <div
            className="absolute bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-10 pointer-events-none transform -translate-x-1/2 -translate-y-full"
            style={{
              left: `${hoveredPoint.x}px`,
              top: `${hoveredPoint.y - 10}px`
            }}
          >
            <p className="font-medium text-gray-800">
              {hoveredPoint.dataPoint.value} {unit}
            </p>
            <p className="text-xs text-gray-500">
              {new Date(hoveredPoint.dataPoint.date).toLocaleDateString()}
            </p>
            {hoveredPoint.dataPoint.annotation && (
              <p className="text-xs text-blue-600 mt-1">
                {hoveredPoint.dataPoint.annotation}
              </p>
            )}
          </div>
        )}
        
        {/* No Data Message */}
        {filteredData.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-gray-500">No data available for selected time range</p>
          </div>
        )}
      </div>
    </div>
  );
};