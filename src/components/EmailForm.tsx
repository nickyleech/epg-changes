'use client';

import { useState, useEffect } from 'react';
import { Mail, X, Settings, Send } from 'lucide-react';
import { EPGEntry, EmailSettings } from '@/lib/types';
import { LocalStorage } from '@/lib/storage';

interface EmailFormProps {
  isOpen: boolean;
  onClose: () => void;
  entries?: EPGEntry[];
}

export default function EmailForm({ isOpen, onClose, entries = [] }: EmailFormProps) {
  const [emailSettings, setEmailSettings] = useState<EmailSettings>({
    primaryRecipient: '',
    secondaryRecipient: ''
  });
  const [showSettings, setShowSettings] = useState(false);
  const [selectedEntries, setSelectedEntries] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      setEmailSettings(LocalStorage.getEmailSettings());
      setSelectedEntries(entries.map(e => e.id));
    }
  }, [isOpen, entries]);

  const handleSaveSettings = () => {
    LocalStorage.saveEmailSettings(emailSettings);
    setShowSettings(false);
  };

  const getSelectedEntries = () => {
    return entries.filter(entry => selectedEntries.includes(entry.id));
  };

  const generateEmailSubject = () => {
    const selected = getSelectedEntries();
    if (selected.length === 0) return 'EPG Changes Update';
    if (selected.length === 1) return `EPG Change: ${selected[0].channel}`;
    return `EPG Changes Update - ${selected.length} Changes`;
  };

  const generateEmailBody = () => {
    const selected = getSelectedEntries();
    const date = new Date().toLocaleDateString('en-GB', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    let body = `EPG Changes Update - ${date}\n\n`;
    
    if (selected.length === 0) {
      body += 'No changes selected.\n\n';
    } else {
      body += `${selected.length} change${selected.length === 1 ? '' : 's'} to report:\n\n`;
      
      selected.forEach((entry, index) => {
        body += `${index + 1}. ${entry.channel} (${entry.provider})\n`;
        body += `   Type: ${entry.changeType}\n`;
        body += `   Date: ${new Date(entry.date).toLocaleDateString('en-GB')}\n`;
        body += `   Status: ${entry.status}\n`;
        body += `   Description: ${entry.description}\n\n`;
      });
    }

    body += 'Best regards,\n';
    body += 'EPG Changes Management System\n\n';
    body += '---\n';
    body += 'This email was generated automatically by the EPG Changes Management System.';

    return body;
  };

  const handleSendEmail = () => {
    const subject = generateEmailSubject();
    const body = generateEmailBody();
    
    // Create mailto links
    const createMailtoLink = (email: string) => {
      return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    };

    // Open email clients
    if (emailSettings.primaryRecipient) {
      window.open(createMailtoLink(emailSettings.primaryRecipient));
    }
    
    if (emailSettings.secondaryRecipient) {
      setTimeout(() => {
        window.open(createMailtoLink(emailSettings.secondaryRecipient));
      }, 500);
    }

    // Mark selected entries as email sent
    const selected = getSelectedEntries();
    selected.forEach(entry => {
      LocalStorage.updateEntry(entry.id, { emailSent: true });
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Mail className="h-6 w-6 text-blue-600 mr-2" />
                <h3 className="text-lg leading-6 font-medium text-gray-900">Send Email Update</h3>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <Settings className="h-5 w-5" />
                </button>
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {showSettings && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Email Settings</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Primary Recipient</label>
                    <input
                      type="email"
                      value={emailSettings.primaryRecipient}
                      onChange={(e) => setEmailSettings({...emailSettings, primaryRecipient: e.target.value})}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                      placeholder="primary@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Secondary Recipient</label>
                    <input
                      type="email"
                      value={emailSettings.secondaryRecipient}
                      onChange={(e) => setEmailSettings({...emailSettings, secondaryRecipient: e.target.value})}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                      placeholder="secondary@example.com"
                    />
                  </div>
                  <button
                    onClick={handleSaveSettings}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Save Settings
                  </button>
                </div>
              </div>
            )}

            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Recipients</h4>
              <div className="text-sm text-gray-600 space-y-1">
                {emailSettings.primaryRecipient ? (
                  <div>Primary: {emailSettings.primaryRecipient}</div>
                ) : (
                  <div className="text-yellow-600">No primary recipient configured</div>
                )}
                {emailSettings.secondaryRecipient ? (
                  <div>Secondary: {emailSettings.secondaryRecipient}</div>
                ) : (
                  <div className="text-gray-400">No secondary recipient configured</div>
                )}
              </div>
            </div>

            {entries.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Select Entries to Include</h4>
                <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-md">
                  {entries.map((entry) => (
                    <div key={entry.id} className="flex items-center p-3 border-b border-gray-200 last:border-b-0">
                      <input
                        type="checkbox"
                        checked={selectedEntries.includes(entry.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedEntries([...selectedEntries, entry.id]);
                          } else {
                            setSelectedEntries(selectedEntries.filter(id => id !== entry.id));
                          }
                        }}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <div className="ml-3 flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-900">{entry.channel}</span>
                          <span className="text-xs text-gray-500">({entry.provider})</span>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                            ${entry.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                              entry.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : 
                              'bg-yellow-100 text-yellow-800'}`}>
                            {entry.status}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">{entry.changeType}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Email Preview</h4>
              <div className="bg-gray-50 rounded-md p-3">
                <div className="text-sm">
                  <div className="font-medium mb-1">Subject: {generateEmailSubject()}</div>
                  <div className="text-xs text-gray-600 whitespace-pre-wrap max-h-32 overflow-y-auto">
                    {generateEmailBody()}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              onClick={handleSendEmail}
              disabled={!emailSettings.primaryRecipient && !emailSettings.secondaryRecipient}
              className="w-full inline-flex justify-center items-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-4 w-4 mr-2" />
              Send Email
            </button>
            <button
              onClick={onClose}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}