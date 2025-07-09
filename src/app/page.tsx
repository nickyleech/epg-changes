'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Tv, FileText, Link as LinkIcon, Archive, Settings, Mail, Plus } from 'lucide-react';
import { EPGEntry, Link as LinkType } from '@/lib/types';
import { LocalStorage } from '@/lib/storage';
import EmailForm from '@/components/EmailForm';

export default function Home() {
  const [entries, setEntries] = useState<EPGEntry[]>([]);
  const [links, setLinks] = useState<LinkType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEmailForm, setShowEmailForm] = useState(false);

  useEffect(() => {
    setEntries(LocalStorage.getEntries());
    setLinks(LocalStorage.getLinks());
    setLoading(false);
  }, []);

  const pendingEntries = entries.filter(entry => entry.status === 'Pending');
  const inProgressEntries = entries.filter(entry => entry.status === 'In Progress');
  const completedEntries = entries.filter(entry => entry.status === 'Completed');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Tv className="mx-auto h-12 w-12 text-blue-600 mb-4" />
          <p className="text-gray-600">Loading EPG Changes System...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Tv className="h-8 w-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">EPG Changes Management</h1>
            </div>
            <div className="text-sm text-gray-500">
              {new Date().toLocaleDateString('en-GB', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </div>
          <p className="text-gray-600 mt-2">Professional Electronic Programme Guide changes for British TV providers</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FileText className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Pending</h3>
                <p className="text-2xl font-semibold text-yellow-600">{pendingEntries.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Settings className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">In Progress</h3>
                <p className="text-2xl font-semibold text-blue-600">{inProgressEntries.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FileText className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Completed</h3>
                <p className="text-2xl font-semibold text-green-600">{completedEntries.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <LinkIcon className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Links</h3>
                <p className="text-2xl font-semibold text-purple-600">{links.length}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Recent EPG Changes</h2>
                  <Link
                    href="/entries"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    New Entry
                  </Link>
                </div>
              </div>
              <div className="p-6">
                {entries.length === 0 ? (
                  <div className="text-center py-8">
                    <Tv className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-500">No EPG changes recorded yet</p>
                    <Link
                      href="/entries"
                      className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                      Create First Entry
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {entries.slice(0, 5).map((entry) => (
                      <div key={entry.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                              ${entry.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                                entry.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : 
                                'bg-yellow-100 text-yellow-800'}`}>
                              {entry.status}
                            </span>
                            <span className="text-sm text-gray-500">{entry.provider}</span>
                          </div>
                          <h3 className="text-sm font-medium text-gray-900 mt-1">{entry.channel}</h3>
                          <p className="text-sm text-gray-600">{entry.changeType}</p>
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(entry.date).toLocaleDateString('en-GB')}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
              </div>
              <div className="p-6 space-y-4">
                <Link
                  href="/entries"
                  className="flex items-center p-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
                >
                  <FileText className="h-5 w-5 mr-3 text-gray-400" />
                  Manage Entries
                </Link>
                <Link
                  href="/links"
                  className="flex items-center p-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
                >
                  <LinkIcon className="h-5 w-5 mr-3 text-gray-400" />
                  EPG Links
                </Link>
                <Link
                  href="/archive"
                  className="flex items-center p-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
                >
                  <Archive className="h-5 w-5 mr-3 text-gray-400" />
                  Channel Archive
                </Link>
                <button 
                  onClick={() => setShowEmailForm(true)}
                  className="flex items-center p-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg w-full"
                >
                  <Mail className="h-5 w-5 mr-3 text-gray-400" />
                  Send Email Update
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Useful Links</h2>
              </div>
              <div className="p-6">
                {links.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-gray-500 text-sm">No links added yet</p>
                    <Link
                      href="/links"
                      className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Add your first link
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {links.slice(0, 3).map((link) => (
                      <div key={link.id}>
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          {link.title}
                        </a>
                        <p className="text-xs text-gray-500 mt-1">{link.category}</p>
                      </div>
                    ))}
                    {links.length > 3 && (
                      <Link
                        href="/links"
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        View all {links.length} links →
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <EmailForm
        isOpen={showEmailForm}
        onClose={() => setShowEmailForm(false)}
        entries={entries}
      />
    </div>
  );
}
