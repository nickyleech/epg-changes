'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Search, Download, Trash2, Calendar, Archive as ArchiveIcon } from 'lucide-react';
import { ChannelArchive, Channel } from '@/lib/types';
import { LocalStorage, generateId } from '@/lib/storage';

export default function ArchivePage() {
  const [archives, setArchives] = useState<ChannelArchive[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProvider, setFilterProvider] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [selectedArchive, setSelectedArchive] = useState<ChannelArchive | null>(null);
  const [formData, setFormData] = useState<{
    provider: ChannelArchive['provider'];
    version: string;
    channels: Channel[];
  }>({
    provider: 'Sky',
    version: '',
    channels: []
  });
  const [channelInput, setChannelInput] = useState('');

  useEffect(() => {
    setArchives(LocalStorage.getArchives());
  }, []);

  const filteredArchives = archives.filter(archive => {
    const matchesSearch = archive.version.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         archive.channels.some(channel => 
                           channel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           channel.number.includes(searchTerm)
                         );
    const matchesProvider = filterProvider === 'all' || archive.provider === filterProvider;
    return matchesSearch && matchesProvider;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newArchive: ChannelArchive = {
      id: generateId(),
      provider: formData.provider,
      version: formData.version,
      channels: formData.channels,
      createdAt: new Date().toISOString()
    };
    
    LocalStorage.addArchive(newArchive);
    setArchives(LocalStorage.getArchives());
    setShowForm(false);
    setFormData({
      provider: 'Sky',
      version: '',
      channels: []
    });
  };

  const handleAddChannel = () => {
    if (channelInput.trim()) {
      const lines = channelInput.split('\n').filter(line => line.trim());
      const newChannels: Channel[] = lines.map(line => {
        const parts = line.split(',').map(part => part.trim());
        return {
          id: generateId(),
          number: parts[0] || '',
          name: parts[1] || '',
          category: parts[2] || 'General',
          description: parts[3] || ''
        };
      });
      
      setFormData({
        ...formData,
        channels: [...formData.channels, ...newChannels]
      });
      setChannelInput('');
    }
  };

  const handleRemoveChannel = (channelId: string) => {
    setFormData({
      ...formData,
      channels: formData.channels.filter(channel => channel.id !== channelId)
    });
  };

  const handleDeleteArchive = (id: string) => {
    if (confirm('Are you sure you want to delete this archive?')) {
      LocalStorage.deleteArchive(id);
      setArchives(LocalStorage.getArchives());
    }
  };

  const handleExportArchive = (archive: ChannelArchive) => {
    const csvContent = [
      'Number,Name,Category,Description',
      ...archive.channels.map(channel => 
        `"${channel.number}","${channel.name}","${channel.category}","${channel.description || ''}"`
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${archive.provider}-${archive.version}-channels.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getProviderColor = (provider: string) => {
    switch (provider) {
      case 'Sky':
        return 'bg-blue-100 text-blue-800';
      case 'Virgin Media':
        return 'bg-red-100 text-red-800';
      case 'Freeview':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
            <h1 className="text-3xl font-bold text-gray-900">Channel Archive</h1>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Archive
            </button>
          </div>
          <p className="text-gray-600 mt-2">Manage channel listings for UK TV providers</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search archives or channels..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <select
                value={filterProvider}
                onChange={(e) => setFilterProvider(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Providers</option>
                <option value="Sky">Sky</option>
                <option value="Virgin Media">Virgin Media</option>
                <option value="Freeview">Freeview</option>
              </select>
            </div>
          </div>
        </div>

        {/* Archives Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArchives.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <ArchiveIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500">No channel archives found</p>
              <button
                onClick={() => setShowForm(true)}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create First Archive
              </button>
            </div>
          ) : (
            filteredArchives.map((archive) => (
              <div key={archive.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getProviderColor(archive.provider)}`}>
                          {archive.provider}
                        </span>
                        <span className="text-sm text-gray-500">v{archive.version}</span>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900">{archive.provider} Channels</h3>
                      <p className="text-sm text-gray-600">{archive.channels.length} channels</p>
                    </div>
                    <button
                      onClick={() => handleDeleteArchive(archive.id)}
                      className="p-1 text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(archive.createdAt).toLocaleDateString('en-GB')}
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setSelectedArchive(archive)}
                      className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => handleExportArchive(archive)}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Archive Details Modal */}
        {selectedArchive && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setSelectedArchive(null)}></div>
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      {selectedArchive.provider} Channel Archive - v{selectedArchive.version}
                    </h3>
                    <button
                      onClick={() => setSelectedArchive(null)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      ×
                    </button>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Number</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {selectedArchive.channels.map((channel) => (
                          <tr key={channel.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{channel.number}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{channel.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{channel.category}</td>
                            <td className="px-6 py-4 text-sm text-gray-500">{channel.description || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    onClick={() => handleExportArchive(selectedArchive)}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </button>
                  <button
                    onClick={() => setSelectedArchive(null)}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowForm(false)}></div>
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
                <form onSubmit={handleSubmit}>
                  <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                      Create New Channel Archive
                    </h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Provider</label>
                          <select
                            value={formData.provider}
                            onChange={(e) => setFormData({...formData, provider: e.target.value as ChannelArchive['provider']})}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="Sky">Sky</option>
                            <option value="Virgin Media">Virgin Media</option>
                            <option value="Freeview">Freeview</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Version</label>
                          <input
                            type="text"
                            required
                            value={formData.version}
                            onChange={(e) => setFormData({...formData, version: e.target.value})}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            placeholder="e.g., 2024.01"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Add Channels</label>
                        <textarea
                          rows={4}
                          value={channelInput}
                          onChange={(e) => setChannelInput(e.target.value)}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter channels (one per line):&#10;Number, Name, Category, Description&#10;Example: 101, BBC One, Entertainment, Main BBC channel"
                        />
                        <button
                          type="button"
                          onClick={handleAddChannel}
                          className="mt-2 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        >
                          Add Channels
                        </button>
                      </div>
                      {formData.channels.length > 0 && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Channels Added ({formData.channels.length})
                          </label>
                          <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-md">
                            {formData.channels.map((channel) => (
                              <div key={channel.id} className="flex items-center justify-between p-2 border-b border-gray-200 last:border-b-0">
                                <div className="flex-1">
                                  <span className="font-medium">{channel.number}</span> - {channel.name}
                                  <span className="text-sm text-gray-500 ml-2">({channel.category})</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveChannel(channel.id)}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                    <button
                      type="submit"
                      disabled={formData.channels.length === 0}
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Create Archive
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
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