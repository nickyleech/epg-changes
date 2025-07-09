'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, BarChart3, TrendingUp, Calendar, Users, Activity, Download } from 'lucide-react';
import { EPGEntry } from '@/lib/types';
import { LocalStorage } from '@/lib/storage';

export default function AnalyticsPage() {
  const [entries, setEntries] = useState<EPGEntry[]>([]);
  const [dateRange, setDateRange] = useState<string>('30');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setEntries(LocalStorage.getEntries());
    setLoading(false);
  }, []);

  const filteredEntries = entries.filter(entry => {
    const entryDate = new Date(entry.createdAt);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(dateRange));
    return entryDate >= cutoffDate;
  });

  // Analytics calculations
  const totalEntries = filteredEntries.length;
  const statusCounts = {
    pending: filteredEntries.filter(e => e.status === 'Pending').length,
    inProgress: filteredEntries.filter(e => e.status === 'In Progress').length,
    completed: filteredEntries.filter(e => e.status === 'Completed').length
  };

  const providerCounts = {
    sky: filteredEntries.filter(e => e.provider === 'Sky').length,
    virginMedia: filteredEntries.filter(e => e.provider === 'Virgin Media').length,
    freeview: filteredEntries.filter(e => e.provider === 'Freeview').length,
    other: filteredEntries.filter(e => e.provider === 'Other').length
  };

  const changeTypeCounts = {
    newChannel: filteredEntries.filter(e => e.changeType === 'New Channel').length,
    channelRemoval: filteredEntries.filter(e => e.changeType === 'Channel Removal').length,
    epgUpdate: filteredEntries.filter(e => e.changeType === 'EPG Update').length,
    technicalChange: filteredEntries.filter(e => e.changeType === 'Technical Change').length
  };

  const emailStats = {
    sent: filteredEntries.filter(e => e.emailSent).length,
    pending: filteredEntries.filter(e => !e.emailSent).length
  };

  // Daily activity for the past 7 days
  const dailyActivity = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);
    
    return {
      date: dayStart.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric' }),
      count: filteredEntries.filter(e => {
        const entryDate = new Date(e.createdAt);
        return entryDate >= dayStart && entryDate < dayEnd;
      }).length
    };
  }).reverse();

  const completionRate = totalEntries > 0 ? Math.round((statusCounts.completed / totalEntries) * 100) : 0;
  const emailRate = totalEntries > 0 ? Math.round((emailStats.sent / totalEntries) * 100) : 0;

  const generateReport = () => {
    const reportData = {
      generatedAt: new Date().toLocaleDateString('en-GB'),
      dateRange: `${dateRange} days`,
      totalEntries,
      statusBreakdown: statusCounts,
      providerBreakdown: providerCounts,
      changeTypeBreakdown: changeTypeCounts,
      emailStats,
      completionRate: `${completionRate}%`,
      emailRate: `${emailRate}%`,
      dailyActivity
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `epg-analytics-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <BarChart3 className="mx-auto h-12 w-12 text-blue-600 mb-4" />
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">EPG Analytics</h1>
              <p className="text-gray-600 mt-2">Comprehensive insights into your EPG changes data</p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
                <option value="365">Last year</option>
              </select>
              <button
                onClick={generateReport}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </button>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Activity className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Total Entries</h3>
                <p className="text-3xl font-bold text-blue-600">{totalEntries}</p>
                <p className="text-sm text-gray-500">Last {dateRange} days</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Completion Rate</h3>
                <p className="text-3xl font-bold text-green-600">{completionRate}%</p>
                <p className="text-sm text-gray-500">{statusCounts.completed} of {totalEntries} completed</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Email Rate</h3>
                <p className="text-3xl font-bold text-purple-600">{emailRate}%</p>
                <p className="text-sm text-gray-500">{emailStats.sent} emails sent</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calendar className="h-8 w-8 text-orange-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Daily Average</h3>
                <p className="text-3xl font-bold text-orange-600">{Math.round(totalEntries / parseInt(dateRange))}</p>
                <p className="text-sm text-gray-500">Entries per day</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Status Distribution */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Status Distribution</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Pending</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-yellow-500 h-2 rounded-full" 
                      style={{ width: `${totalEntries > 0 ? (statusCounts.pending / totalEntries) * 100 : 0}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{statusCounts.pending}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">In Progress</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: `${totalEntries > 0 ? (statusCounts.inProgress / totalEntries) * 100 : 0}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{statusCounts.inProgress}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Completed</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${totalEntries > 0 ? (statusCounts.completed / totalEntries) * 100 : 0}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{statusCounts.completed}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Provider Distribution */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Provider Distribution</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Sky</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${totalEntries > 0 ? (providerCounts.sky / totalEntries) * 100 : 0}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{providerCounts.sky}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Virgin Media</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-red-600 h-2 rounded-full" 
                      style={{ width: `${totalEntries > 0 ? (providerCounts.virginMedia / totalEntries) * 100 : 0}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{providerCounts.virginMedia}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Freeview</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ width: `${totalEntries > 0 ? (providerCounts.freeview / totalEntries) * 100 : 0}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{providerCounts.freeview}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Other</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gray-600 h-2 rounded-full" 
                      style={{ width: `${totalEntries > 0 ? (providerCounts.other / totalEntries) * 100 : 0}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{providerCounts.other}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Change Type Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Change Type Analysis</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">New Channel</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${totalEntries > 0 ? (changeTypeCounts.newChannel / totalEntries) * 100 : 0}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{changeTypeCounts.newChannel}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Channel Removal</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-red-500 h-2 rounded-full" 
                      style={{ width: `${totalEntries > 0 ? (changeTypeCounts.channelRemoval / totalEntries) * 100 : 0}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{changeTypeCounts.channelRemoval}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">EPG Update</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: `${totalEntries > 0 ? (changeTypeCounts.epgUpdate / totalEntries) * 100 : 0}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{changeTypeCounts.epgUpdate}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Technical Change</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-500 h-2 rounded-full" 
                      style={{ width: `${totalEntries > 0 ? (changeTypeCounts.technicalChange / totalEntries) * 100 : 0}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{changeTypeCounts.technicalChange}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Daily Activity */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Daily Activity (Last 7 Days)</h3>
            <div className="space-y-3">
              {dailyActivity.map((day, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{day.date}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ width: `${Math.max(day.count, 1) * 10}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">{day.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity Summary */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Activity Summary</h3>
          </div>
          <div className="p-6">
            {totalEntries === 0 ? (
              <div className="text-center py-8">
                <BarChart3 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500">No entries found for the selected period</p>
                <Link
                  href="/entries"
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Create First Entry
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{statusCounts.pending}</div>
                  <div className="text-sm text-gray-500">Pending Actions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{emailStats.pending}</div>
                  <div className="text-sm text-gray-500">Emails Pending</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{Math.round(totalEntries / parseInt(dateRange))}</div>
                  <div className="text-sm text-gray-500">Avg. Daily Entries</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}