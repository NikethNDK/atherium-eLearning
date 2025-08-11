import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useReactToPrint } from 'react-to-print';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { CourseAnalyticsService } from '../../services/instructorApi'
import { format } from 'date-fns';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const CourseAnalytics = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [purchaseStats, setPurchaseStats] = useState([]);
  const [studentProgress, setStudentProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState('monthly');
  const pdfRef = useRef();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [analyticsData, statsData, progressData] = await Promise.all([
          CourseAnalyticsService.getCourseAnalytics(courseId),
          CourseAnalyticsService.getPurchaseStats(courseId, period),
          CourseAnalyticsService.getStudentProgress(courseId)
        ]);
        
        setAnalytics(analyticsData);
        setPurchaseStats(statsData.stats);
        setStudentProgress(progressData);
      } catch (err) {
        setError(err.message || 'Failed to fetch analytics data');
        console.error('Error fetching analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId, period]);

  const handleGeneratePdf = useReactToPrint({
    content: () => pdfRef.current,
    documentTitle: `Course-Analytics-${courseId}-${new Date().toISOString().split('T')[0]}`,
  });

  const formatDate = (dateString, period) => {
    const date = new Date(dateString);
    if (period === 'daily') return format(date, 'MMM dd');
    if (period === 'monthly') return format(date, 'MMM yyyy');
    if (period === 'yearly') return format(date, 'yyyy');
    return dateString;
  };

  if (loading) return <div className="text-center py-8">Loading analytics...</div>;
  if (error) return <div className="text-center py-8 text-red-500">Error: {error}</div>;
  if (!analytics) return <div className="text-center py-8">No analytics data found</div>;

  return (
    <div className="container mx-auto px-4 py-8" ref={pdfRef}>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Course Analytics</h1>
        {/* <button
          onClick={handleGeneratePdf}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
        >
          Download Report
        </button> */}
      </div>

      <Tabs>
        <TabList>
          <Tab>Overview</Tab>
          <Tab>Sales</Tab>
          <Tab>Students</Tab>
        </TabList>

        <TabPanel>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard 
              title="Total Students" 
              value={analytics.total_students} 
              icon="👥" 
              color="bg-blue-100 text-blue-800"
            />
            <StatCard 
              title="Total Revenue" 
              value={`₹${analytics.total_revenue.toLocaleString()}`} 
              icon="💰" 
              color="bg-green-100 text-green-800"
            />
            <StatCard 
              title="Total Income" 
              value={`₹${analytics.total_income.toLocaleString()}`} 
              icon="💵" 
              color="bg-purple-100 text-purple-800"
            />
            <StatCard 
              title="Avg Progress" 
              value={`${analytics.average_progress}%`} 
              icon="📈" 
              color="bg-yellow-100 text-yellow-800"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">Revenue Breakdown</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Income', value: analytics.total_income },
                        { name: 'Tax', value: analytics.total_tax }
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {[analytics.total_income, analytics.total_tax].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">Student Progress Distribution</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      { range: '0-20%', students: studentProgress.filter(s => s.progress <= 20).length },
                      { range: '21-40%', students: studentProgress.filter(s => s.progress > 20 && s.progress <= 40).length },
                      { range: '41-60%', students: studentProgress.filter(s => s.progress > 40 && s.progress <= 60).length },
                      { range: '61-80%', students: studentProgress.filter(s => s.progress > 60 && s.progress <= 80).length },
                      { range: '81-100%', students: studentProgress.filter(s => s.progress > 80).length },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="students" fill="#8884d8" name="Students" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </TabPanel>

        <TabPanel>
          <div className="mb-4 flex justify-between items-center">
            <h2 className="text-xl font-semibold">Sales Data</h2>
            <select 
              value={period} 
              onChange={(e) => setPeriod(e.target.value)}
              className="border rounded px-3 py-1"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>

          <div className="bg-white p-6 rounded-lg shadow mb-8">
            <h3 className="text-lg font-semibold mb-4">Purchases Over Time</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={purchaseStats}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(date) => formatDate(date, period)} 
                  />
                  <YAxis yAxisId="left" orientation="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip 
                    formatter={(value, name) => {
                      if (name === 'Revenue') return [`₹${value.toLocaleString()}`, name];
                      return [value, name];
                    }}
                    labelFormatter={(date) => `Date: ${formatDate(date, period)}`}
                  />
                  <Legend />
                  <Line 
                    yAxisId="left" 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#8884d8" 
                    name="Purchases" 
                    activeDot={{ r: 8 }} 
                  />
                  <Line 
                    yAxisId="right" 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#82ca9d" 
                    name="Revenue (₹)" 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </TabPanel>

        <TabPanel>
          <div className="mb-4">
            <h2 className="text-xl font-semibold">Student Progress</h2>
            <p className="text-gray-600">{studentProgress.length} students enrolled</p>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {studentProgress.map((student) => (
                    <tr key={student.user_id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                            <span className="text-purple-800">
                              {student.firstname.charAt(0)}{student.lastname?.charAt(0) || ''}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {student.firstname} {student.lastname}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {student.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(new Date(student.joined_at), 'MMM dd, yyyy')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div 
                              className="bg-purple-600 h-2.5 rounded-full" 
                              style={{ width: `${student.progress}%` }}
                            ></div>
                          </div>
                          <span className="ml-2 text-sm font-medium text-gray-700">
                            {student.progress}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabPanel>
      </Tabs>
    </div>
  );
};

const StatCard = ({ title, value, icon, color }) => (
  <div className={`${color} p-6 rounded-lg shadow`}>
    <div className="flex justify-between items-center">
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="text-2xl font-bold mt-2">{value}</p>
      </div>
      <span className="text-3xl">{icon}</span>
    </div>
  </div>
);

export default CourseAnalytics;