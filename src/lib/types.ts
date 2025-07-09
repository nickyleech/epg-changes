export interface EPGEntry {
  id: string;
  date: string;
  channel: string;
  provider: 'Sky' | 'Virgin Media' | 'Freeview' | 'Other';
  changeType: 'New Channel' | 'Channel Removal' | 'EPG Update' | 'Technical Change';
  description: string;
  status: 'Pending' | 'In Progress' | 'Completed';
  createdAt: string;
  updatedAt: string;
  emailSent: boolean;
}

export interface Link {
  id: string;
  title: string;
  url: string;
  category: string;
  description?: string;
  createdAt: string;
}

export interface Channel {
  id: string;
  name: string;
  number: string;
  category: string;
  description?: string;
}

export interface ChannelArchive {
  id: string;
  provider: 'Sky' | 'Virgin Media' | 'Freeview';
  channels: Channel[];
  version: string;
  createdAt: string;
}

export interface EmailSettings {
  primaryRecipient: string;
  secondaryRecipient: string;
}