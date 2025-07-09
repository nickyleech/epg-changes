'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Search, Edit, Trash2, Mail, Clock, CheckCircle, AlertCircle, Upload, Download } from 'lucide-react';
import { EPGEntry } from '@/lib/types';
import { LocalStorage, generateId } from '@/lib/storage';

export default function EntriesPage() {
  const [entries, setEntries] = useState<EPGEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterProvider, setFilterProvider] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [editingEntry, setEditingEntry] = useState<EPGEntry | null>(null);
  const [bulkImportText, setBulkImportText] = useState('');
  const [formData, setFormData] = useState<{
    channel: string;
    provider: EPGEntry['provider'];
    changeType: EPGEntry['changeType'];
    description: string;
    date: string;
    status: EPGEntry['status'];
  }>({
    channel: '',
    provider: 'Sky',
    changeType: 'New Channel',
    description: '',
    date: new Date().toISOString().split('T')[0],
    status: 'Pending'
  });

  useEffect(() => {
    setEntries(LocalStorage.getEntries());
  }, []);

  useEffect(() => {
    console.log('showForm state changed:', showForm);
  }, [showForm]);

  const filteredEntries = entries.filter(entry => {
    const matchesSearch = entry.channel.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || entry.status === filterStatus;
    const matchesProvider = filterProvider === 'all' || entry.provider === filterProvider;
    return matchesSearch && matchesStatus && matchesProvider;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date().toISOString();
    
    if (editingEntry) {
      const updatedEntry = {
        ...editingEntry,
        ...formData,
        updatedAt: now
      };
      LocalStorage.updateEntry(editingEntry.id, updatedEntry);
      setEntries(LocalStorage.getEntries());
      setEditingEntry(null);
    } else {
      const newEntry: EPGEntry = {
        id: generateId(),
        ...formData,
        createdAt: now,
        updatedAt: now,
        emailSent: false
      };
      LocalStorage.addEntry(newEntry);
      setEntries(LocalStorage.getEntries());
    }
    
    setShowForm(false);
    setFormData({
      channel: '',
      provider: 'Sky',
      changeType: 'New Channel',
      description: '',
      date: new Date().toISOString().split('T')[0],
      status: 'Pending'
    });
  };

  const handleEdit = (entry: EPGEntry) => {
    setEditingEntry(entry);
    setFormData({
      channel: entry.channel,
      provider: entry.provider,
      changeType: entry.changeType,
      description: entry.description,
      date: entry.date,
      status: entry.status
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this entry?')) {
      LocalStorage.deleteEntry(id);
      setEntries(LocalStorage.getEntries());
    }
  };

  const handleStatusUpdate = (id: string, newStatus: EPGEntry['status']) => {
    LocalStorage.updateEntry(id, { status: newStatus });
    setEntries(LocalStorage.getEntries());
  };

  const handleBulkImport = () => {
    if (!bulkImportText.trim()) return;
    
    const lines = bulkImportText.split('\n').filter(line => line.trim());
    const now = new Date().toISOString();
    const newEntries: EPGEntry[] = [];
    
    lines.forEach(line => {
      const parts = line.split(',').map(part => part.trim());
      if (parts.length >= 2) {
        // Parse different formats based on the pattern
        const channel = parts[0];
        const description = parts[1];
        let provider: EPGEntry['provider'] = 'Sky';
        let changeType: EPGEntry['changeType'] = 'EPG Update';
        
        // Detect provider from channel name or description
        if (channel.toLowerCase().includes('virgin') || description.toLowerCase().includes('virgin')) {
          provider = 'Virgin Media';
        } else if (channel.toLowerCase().includes('freeview') || description.toLowerCase().includes('freeview')) {
          provider = 'Freeview';
        }
        
        // Detect change type from description
        if (description.toLowerCase().includes('new channel') || description.toLowerCase().includes('launch')) {
          changeType = 'New Channel';
        } else if (description.toLowerCase().includes('removal') || description.toLowerCase().includes('close')) {
          changeType = 'Channel Removal';
        } else if (description.toLowerCase().includes('technical') || description.toLowerCase().includes('frequency')) {
          changeType = 'Technical Change';
        }
        
        const newEntry: EPGEntry = {
          id: generateId(),
          channel: channel,
          provider: provider,
          changeType: changeType,
          description: description,
          date: new Date().toISOString().split('T')[0],
          status: 'Pending',
          createdAt: now,
          updatedAt: now,
          emailSent: false
        };
        
        newEntries.push(newEntry);
      }
    });
    
    // Add all entries to storage
    newEntries.forEach(entry => {
      LocalStorage.addEntry(entry);
    });
    
    setEntries(LocalStorage.getEntries());
    setShowBulkImport(false);
    setBulkImportText('');
  };

  const handleExportEntries = () => {
    const csvContent = [
      'Channel,Description,Provider,Change Type,Date,Status,Created',
      ...entries.map(entry => 
        `"${entry.channel}","${entry.description}","${entry.provider}","${entry.changeType}","${entry.date}","${entry.status}","${new Date(entry.createdAt).toLocaleDateString('en-GB')}"`
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `epg-entries-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStatusIcon = (status: EPGEntry['status']) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'In Progress':
        return <Clock className="h-4 w-4 text-blue-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: EPGEntry['status']) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">EPG Entries</h1>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowBulkImport(true)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <Upload className="h-4 w-4 mr-2" />
                Bulk Import
              </button>
              <button
                onClick={handleExportEntries}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </button>
              <button
                onClick={() => {
                  alert('Button clicked!');
                  console.log('New Entry button clicked');
                  setShowForm(true);
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Entry
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search entries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
              <select
                value={filterProvider}
                onChange={(e) => setFilterProvider(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Providers</option>
                <option value="Sky">Sky</option>
                <option value="Virgin Media">Virgin Media</option>
                <option value="Freeview">Freeview</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* Entries List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              {filteredEntries.length} {filteredEntries.length === 1 ? 'Entry' : 'Entries'}
            </h2>
          </div>
          <div className="overflow-hidden">
            {filteredEntries.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No entries found matching your criteria</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredEntries.map((entry) => (
                  <div key={entry.id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          {getStatusIcon(entry.status)}
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(entry.status)}`}>
                            {entry.status}
                          </span>
                          <span className="text-sm text-gray-500">{entry.provider}</span>
                          <span className="text-sm text-gray-500">•</span>
                          <span className="text-sm text-gray-500">{entry.changeType}</span>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-1">{entry.channel}</h3>
                        <p className="text-gray-600 mb-2">{entry.description}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>Date: {new Date(entry.date).toLocaleDateString('en-GB')}</span>
                          <span>Created: {new Date(entry.createdAt).toLocaleDateString('en-GB')}</span>
                          {entry.emailSent && (
                            <span className="inline-flex items-center text-green-600">
                              <Mail className="h-3 w-3 mr-1" />
                              Email sent
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <select
                          value={entry.status}
                          onChange={(e) => handleStatusUpdate(entry.id, e.target.value as EPGEntry['status'])}
                          className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="Pending">Pending</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                        </select>
                        <button
                          onClick={() => handleEdit(entry)}
                          className="p-2 text-gray-400 hover:text-gray-600"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(entry.id)}
                          className="p-2 text-gray-400 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Bulk Import Modal */}
        {showBulkImport && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowBulkImport(false)}></div>
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    Bulk Import EPG Entries
                  </h3>
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">
                      Enter entries in CSV format (one per line). Format: Channel Name, Description
                    </p>
                    <p className="text-xs text-gray-500 mb-4">
                      Examples:<br/>
                      • BBC One HD, Programme schedule update<br/>
                      • Sky Sports Main Event, New channel launch<br/>
                      • Virgin Media Sport, Channel removal notice
                    </p>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Paste Entry Data</label>
                      <textarea
                        rows={12}
                        value={bulkImportText}
                        onChange={(e) => setBulkImportText(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                        placeholder="Channel Name 1, Description 1
Channel Name 2, Description 2
Channel Name 3, Description 3"
                      />
                    </div>
                    <div className="text-sm text-gray-500">
                      <p>• Provider and change type will be automatically detected</p>
                      <p>• All entries will be set to &quot;Pending&quot; status</p>
                      <p>• Date will be set to today&apos;s date</p>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    onClick={handleBulkImport}
                    disabled={!bulkImportText.trim()}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Import Entries
                  </button>
                  <button
                    onClick={() => setShowBulkImport(false)}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 z-[9999] overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={() => setShowForm(false)}></div>
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full z-[10000]">
                <form onSubmit={handleSubmit}>
                  <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                      {editingEntry ? 'Edit Entry' : 'New EPG Entry'}
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Channel</label>
                        <input
                          type="text"
                          required
                          value={formData.channel}
                          onChange={(e) => setFormData({...formData, channel: e.target.value})}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Provider</label>
                        <select
                          value={formData.provider}
                          onChange={(e) => setFormData({...formData, provider: e.target.value as EPGEntry['provider']})}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="Sky">Sky</option>
                          <option value="Virgin Media">Virgin Media</option>
                          <option value="Freeview">Freeview</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Change Type</label>
                        <select
                          value={formData.changeType}
                          onChange={(e) => setFormData({...formData, changeType: e.target.value as EPGEntry['changeType']})}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="New Channel">New Channel</option>
                          <option value="Channel Removal">Channel Removal</option>
                          <option value="EPG Update">EPG Update</option>
                          <option value="Technical Change">Technical Change</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Date</label>
                        <input
                          type="date"
                          required
                          value={formData.date}
                          onChange={(e) => setFormData({...formData, date: e.target.value})}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Status</label>
                        <select
                          value={formData.status}
                          onChange={(e) => setFormData({...formData, status: e.target.value as EPGEntry['status']})}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="Pending">Pending</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea
                          required
                          rows={3}
                          value={formData.description}
                          onChange={(e) => setFormData({...formData, description: e.target.value})}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                    <button
                      type="submit"
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                    >
                      {editingEntry ? 'Update' : 'Create'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowForm(false);
                        setEditingEntry(null);
                        setFormData({
                          channel: '',
                          provider: 'Sky',
                          changeType: 'New Channel',
                          description: '',
                          date: new Date().toISOString().split('T')[0],
                          status: 'Pending'
                        });
                      }}
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}