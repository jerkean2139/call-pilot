import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  Users, 
  Brain, 
  Star, 
  FileText, 
  Download,
  RefreshCw,
  Settings,
  Filter,
  ChevronDown,
  Calendar,
  CheckCircle
} from 'lucide-react';

// Sample data for reports
const sampleData = {
  overallMetrics: {
    assessmentsCompleted: 127,
    averageScore: 74,
    candidatesHired: 38,
    completionRate: 84
  },
  traitBreakdown: [
    { trait: 'Critical Thinking', score: 78 },
    { trait: 'Independence', score: 82 },
    { trait: 'Passion', score: 68 },
    { trait: 'Role Clarity', score: 72 }
  ],
  roleFitScores: [
    { role: 'Sales Representative', score: 87 },
    { role: 'Customer Support', score: 82 },
    { role: 'Marketing Specialist', score: 76 },
    { role: 'Product Manager', score: 63 },
    { role: 'Software Developer', score: 58 }
  ],
  monthlyAssessments: [
    { month: 'Jan', count: 24 },
    { month: 'Feb', count: 31 },
    { month: 'Mar', count: 28 },
    { month: 'Apr', count: 35 },
    { month: 'May', count: 42 },
    { month: 'Jun', count: 38 }
  ],
  recentCandidates: [
    { name: 'Emma Thompson', position: 'Marketing Manager', score: 89, date: '2023-06-12' },
    { name: 'Michael Chen', position: 'Sales Rep', score: 76, date: '2023-06-10' },
    { name: 'Sarah Johnson', position: 'Product Designer', score: 92, date: '2023-06-08' },
    { name: 'David Miller', position: 'Customer Support', score: 68, date: '2023-06-05' },
    { name: 'Jessica Lee', position: 'Software Developer', score: 81, date: '2023-06-02' }
  ]
};

// Dashboard widget component
interface WidgetProps {
  title: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

const Widget = ({ title, children, icon, className = '' }: WidgetProps) => {
  return (
    <div className={`bg-white rounded-xl shadow-sm overflow-hidden ${className}`}>
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          {icon}
          <h3 className="font-bold text-gray-800">{title}</h3>
        </div>
        <div className="flex items-center gap-2">
          <button className="text-gray-400 hover:text-gray-600">
            <RefreshCw size={16} />
          </button>
          <button className="text-gray-400 hover:text-gray-600">
            <Settings size={16} />
          </button>
        </div>
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};

// Bar chart component
const BarChart = ({ data, valueKey, labelKey, color = '#FF0000' }: any) => {
  const maxValue = Math.max(...data.map((item: any) => item[valueKey]));
  
  return (
    <div className="w-full">
      <div className="space-y-4">
        {data.map((item: any, index: number) => (
          <div key={index}>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium text-gray-600">{item[labelKey]}</span>
              <span className="text-sm font-medium text-gray-900">{item[valueKey]}</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3">
              <div 
                className="h-3 rounded-full" 
                style={{ 
                  width: `${(item[valueKey] / maxValue) * 100}%`,
                  backgroundColor: color
                }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Circular progress component
const CircularProgress = ({ value, maxValue = 100, size = 120, strokeWidth = 8, color = '#FF0000' }: any) => {
  const percentage = (value / maxValue) * 100;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const dash = (percentage * circumference) / 100;
  
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="#E5E7EB"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={circumference - dash}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center flex-col">
        <span className="text-2xl font-bold text-gray-800">{value}</span>
        <span className="text-xs text-gray-500">out of {maxValue}</span>
      </div>
    </div>
  );
};

// DataTable component
const DataTable = ({ data, columns }: any) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            {columns.map((column: any, index: number) => (
              <th 
                key={index}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((row: any, rowIndex: number) => (
            <tr key={rowIndex}>
              {columns.map((column: any, colIndex: number) => (
                <td 
                  key={colIndex}
                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                >
                  {column.renderCell ? column.renderCell(row) : row[column.accessor]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export function ReportsPage() {
  const [dateRange, setDateRange] = useState('Last 30 days');
  
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Assessment Reports & Analytics</h1>
          <p className="text-gray-600 mt-2">
            Comprehensive insights into your talent assessment data
          </p>
        </div>
        
        {/* Filters and controls */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-4 py-2 flex items-center gap-2">
              <Calendar size={16} className="text-gray-500" />
              <select 
                className="bg-transparent text-gray-700 text-sm font-medium focus:outline-none"
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
              >
                <option>Last 7 days</option>
                <option>Last 30 days</option>
                <option>Last 90 days</option>
                <option>This year</option>
                <option>Custom range</option>
              </select>
              <ChevronDown size={16} className="text-gray-500" />
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-4 py-2 flex items-center gap-2">
              <Filter size={16} className="text-gray-500" />
              <select 
                className="bg-transparent text-gray-700 text-sm font-medium focus:outline-none"
              >
                <option>All Departments</option>
                <option>Marketing</option>
                <option>Sales</option>
                <option>Engineering</option>
                <option>Customer Support</option>
              </select>
              <ChevronDown size={16} className="text-gray-500" />
            </div>
          </div>
          
          <button className="bg-[#FF0000] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#FF0000]/90 transition-colors flex items-center gap-2">
            <Download size={16} />
            Export Report
          </button>
        </div>
        
        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <Widget 
              title="Assessments" 
              icon={<FileText size={18} className="text-[#FF0000]" />}
              className="h-full"
            >
              <div className="flex flex-col items-center justify-center">
                <div className="text-5xl font-bold text-gray-900 mb-2">
                  {sampleData.overallMetrics.assessmentsCompleted}
                </div>
                <p className="text-gray-500 text-sm text-center">
                  Total assessments completed
                </p>
                <div className="mt-4 text-xs text-[#FF0000] font-medium">
                  ↑ 15% from previous period
                </div>
              </div>
            </Widget>
          </motion.div>
          
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            transition={{ delay: 0.1 }}
          >
            <Widget 
              title="Average Score" 
              icon={<Star size={18} className="text-[#FF0000]" />}
              className="h-full"
            >
              <div className="flex flex-col items-center justify-center">
                <CircularProgress value={sampleData.overallMetrics.averageScore} />
                <div className="mt-4 text-xs text-[#FF0000] font-medium">
                  ↑ 3% from previous period
                </div>
              </div>
            </Widget>
          </motion.div>
          
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            transition={{ delay: 0.2 }}
          >
            <Widget 
              title="Candidates Hired" 
              icon={<Users size={18} className="text-[#FF0000]" />}
              className="h-full"
            >
              <div className="flex flex-col items-center justify-center">
                <div className="text-5xl font-bold text-gray-900 mb-2">
                  {sampleData.overallMetrics.candidatesHired}
                </div>
                <p className="text-gray-500 text-sm text-center">
                  Candidates successfully hired
                </p>
                <div className="mt-4 text-xs text-[#FF0000] font-medium">
                  ↑ 8% from previous period
                </div>
              </div>
            </Widget>
          </motion.div>
          
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            transition={{ delay: 0.3 }}
          >
            <Widget 
              title="Completion Rate" 
              icon={<CheckCircle size={18} className="text-[#FF0000]" />}
              className="h-full"
            >
              <div className="flex flex-col items-center justify-center">
                <CircularProgress value={sampleData.overallMetrics.completionRate} />
                <div className="mt-4 text-xs text-green-600 font-medium">
                  ↑ 5% from previous period
                </div>
              </div>
            </Widget>
          </motion.div>
        </div>
        
        {/* Core Traits Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            transition={{ delay: 0.1 }}
          >
            <Widget 
              title="Core Traits Analysis" 
              icon={<Brain size={18} className="text-[#FF0000]" />}
            >
              <BarChart 
                data={sampleData.traitBreakdown} 
                valueKey="score" 
                labelKey="trait" 
              />
              <div className="mt-4 text-sm text-gray-500">
                Average core trait scores across all assessments
              </div>
            </Widget>
          </motion.div>
          
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            transition={{ delay: 0.2 }}
          >
            <Widget 
              title="Monthly Assessments" 
              icon={<BarChart3 size={18} className="text-[#FF0000]" />}
            >
              <div className="h-64 relative flex items-center justify-center">
                <div className="text-center">
                  <div className="p-6 bg-gray-50 rounded-lg inline-block">
                    <BarChart3 size={32} className="text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">Monthly assessment chart</p>
                  </div>
                </div>
              </div>
              <div className="mt-4 text-sm text-gray-500">
                Total assessments completed per month
              </div>
            </Widget>
          </motion.div>
        </div>
        
        {/* Role Fit Analysis */}
        <motion.div 
          className="mb-8"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          transition={{ delay: 0.3 }}
        >
          <Widget 
            title="Role Fit Analysis" 
            icon={<Users size={18} className="text-[#FF0000]" />}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <BarChart 
                  data={sampleData.roleFitScores} 
                  valueKey="score" 
                  labelKey="role" 
                />
              </div>
              <div className="flex flex-col gap-4">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <div className="text-sm font-medium text-gray-500 mb-1">Highest Match</div>
                  <div className="text-xl font-bold text-gray-900">Sales Representative</div>
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 h-2 rounded-full">
                      <div 
                        className="bg-[#FF0000] h-2 rounded-full" 
                        style={{ width: '87%' }}
                      ></div>
                    </div>
                    <div className="text-right text-sm font-medium mt-1">87%</div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <div className="text-sm font-medium text-gray-500 mb-1">Key Strengths for This Role</div>
                  <ul className="mt-2 space-y-2">
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#FF0000]"></div>
                      <span className="text-sm">Critical Thinking (High)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#FF0000]"></div>
                      <span className="text-sm">Independence (Very High)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#FF0000]"></div>
                      <span className="text-sm">Passion (Moderate)</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </Widget>
        </motion.div>
        
        {/* Recent Candidates Table */}
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          transition={{ delay: 0.4 }}
        >
          <Widget 
            title="Recent Candidates" 
            icon={<Users size={18} className="text-[#FF0000]" />}
          >
            <DataTable 
              data={sampleData.recentCandidates}
              columns={[
                { header: 'Name', accessor: 'name' },
                { header: 'Position', accessor: 'position' },
                { 
                  header: 'Score', 
                  accessor: 'score',
                  renderCell: (row: any) => (
                    <div className="flex items-center gap-2">
                      <div className="w-full bg-gray-200 h-2 rounded-full" style={{ width: '60px' }}>
                        <div 
                          className={`h-2 rounded-full ${
                            row.score >= 80 ? 'bg-green-500' : 
                            row.score >= 70 ? 'bg-yellow-500' : 
                            'bg-red-500'
                          }`}
                          style={{ width: `${row.score}%` }}
                        ></div>
                      </div>
                      <span>{row.score}</span>
                    </div>
                  )
                },
                { 
                  header: 'Assessment Date', 
                  accessor: 'date',
                  renderCell: (row: any) => {
                    const date = new Date(row.date);
                    return date.toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric', 
                      year: 'numeric' 
                    });
                  }
                },
                {
                  header: 'Actions',
                  accessor: '',
                  renderCell: () => (
                    <div className="flex gap-2">
                      <button className="text-gray-500 hover:text-[#FF0000]">
                        <FileText size={16} />
                      </button>
                      <button className="text-gray-500 hover:text-[#FF0000]">
                        <Download size={16} />
                      </button>
                    </div>
                  )
                }
              ]}
            />
            <div className="mt-4 flex justify-between items-center">
              <div className="text-sm text-gray-500">
                Showing 5 of 127 candidates
              </div>
              <div className="flex items-center gap-2">
                <button className="px-3 py-1 border border-gray-200 rounded hover:bg-gray-50 text-sm">
                  Previous
                </button>
                <button className="px-3 py-1 bg-[#FF0000] text-white rounded text-sm hover:bg-[#FF0000]/90">
                  Next
                </button>
              </div>
            </div>
          </Widget>
        </motion.div>
      </div>
    </div>
  );
}
