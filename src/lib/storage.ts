import { EPGEntry, Link, ChannelArchive, EmailSettings } from './types';

const STORAGE_KEYS = {
  ENTRIES: 'epg-entries',
  LINKS: 'epg-links',
  ARCHIVES: 'epg-archives',
  EMAIL_SETTINGS: 'epg-email-settings'
} as const;

export class LocalStorage {
  private static isClient = typeof window !== 'undefined';

  static getEntries(): EPGEntry[] {
    if (!this.isClient) return [];
    const stored = localStorage.getItem(STORAGE_KEYS.ENTRIES);
    return stored ? JSON.parse(stored) : [];
  }

  static saveEntries(entries: EPGEntry[]): void {
    if (!this.isClient) return;
    localStorage.setItem(STORAGE_KEYS.ENTRIES, JSON.stringify(entries));
  }

  static addEntry(entry: EPGEntry): void {
    const entries = this.getEntries();
    entries.push(entry);
    this.saveEntries(entries);
  }

  static updateEntry(id: string, updates: Partial<EPGEntry>): void {
    const entries = this.getEntries();
    const index = entries.findIndex(entry => entry.id === id);
    if (index !== -1) {
      entries[index] = { ...entries[index], ...updates, updatedAt: new Date().toISOString() };
      this.saveEntries(entries);
    }
  }

  static deleteEntry(id: string): void {
    const entries = this.getEntries();
    const filtered = entries.filter(entry => entry.id !== id);
    this.saveEntries(filtered);
  }

  static getLinks(): Link[] {
    if (!this.isClient) return [];
    const stored = localStorage.getItem(STORAGE_KEYS.LINKS);
    return stored ? JSON.parse(stored) : [];
  }

  static saveLinks(links: Link[]): void {
    if (!this.isClient) return;
    localStorage.setItem(STORAGE_KEYS.LINKS, JSON.stringify(links));
  }

  static addLink(link: Link): void {
    const links = this.getLinks();
    links.push(link);
    this.saveLinks(links);
  }

  static deleteLink(id: string): void {
    const links = this.getLinks();
    const filtered = links.filter(link => link.id !== id);
    this.saveLinks(filtered);
  }

  static getArchives(): ChannelArchive[] {
    if (!this.isClient) return [];
    const stored = localStorage.getItem(STORAGE_KEYS.ARCHIVES);
    return stored ? JSON.parse(stored) : [];
  }

  static saveArchives(archives: ChannelArchive[]): void {
    if (!this.isClient) return;
    localStorage.setItem(STORAGE_KEYS.ARCHIVES, JSON.stringify(archives));
  }

  static addArchive(archive: ChannelArchive): void {
    const archives = this.getArchives();
    archives.push(archive);
    this.saveArchives(archives);
  }

  static deleteArchive(id: string): void {
    const archives = this.getArchives();
    const filtered = archives.filter(archive => archive.id !== id);
    this.saveArchives(filtered);
  }

  static getEmailSettings(): EmailSettings {
    if (!this.isClient) return { primaryRecipient: '', secondaryRecipient: '' };
    const stored = localStorage.getItem(STORAGE_KEYS.EMAIL_SETTINGS);
    return stored ? JSON.parse(stored) : { primaryRecipient: '', secondaryRecipient: '' };
  }

  static saveEmailSettings(settings: EmailSettings): void {
    if (!this.isClient) return;
    localStorage.setItem(STORAGE_KEYS.EMAIL_SETTINGS, JSON.stringify(settings));
  }
}

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};