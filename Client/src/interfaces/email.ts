import AsyncStorage from "@react-native-async-storage/async-storage";
import { set } from 'lodash';
export interface SpecialEmailHashTables {
  [key: string]: EmailCompressedHashTable;
}

export interface EmailCompressedHashTable {
  [key: string]: Omit<EmailCompressed, "message_id">;
}

export interface EmailDetailsHashTable {
  [key: string]: Omit<EmailDetails, "message_id">;
}

export interface EmailHashTable {
  [key: string]: Omit<Email, "message_id">;
}
export interface EmailListGroup {
  today: EmailCompressed[];
  yesterday: EmailCompressed[];
  older: EmailCompressed[];
}
export interface EmailAddress {
  name?: string;
  email: string;
}

export interface EmailCompressed {
  message_id: string;
  subject: string;
  from_: EmailAddress;
  date: string;
  flags: string[];
  mailbox?: string;
}

export interface EmailDetails {
  to: EmailAddress[];
  cc?: EmailAddress[];
  bcc?: EmailAddress[];
  body?: string;
}
export interface Email extends EmailCompressed, EmailDetails {}

export interface Mailbox {
  id: string;
  name: string;
}

export interface GroupedEmailItem {
  title: string;
  data: EmailCompressed[];
}

export interface ChangedEmail {
  flags: string[];
  //mailbox: string;
  message_id: string;
}
// ##################################################################### //
// ############################ AsyncStorage ########################### //
// ##################################################################### //

export interface AsyncStorageEmail {
  subject: string;
  from_: EmailAddress;
  date: string;
  flags: string[];
  to: EmailAddress[];
  cc?: EmailAddress[];
  bcc?: EmailAddress[];
  body?: string;
}

export interface AsyncStorageEmailHashTable {
  [messageId: string]: AsyncStorageEmail;
}

export interface AsyncStorageMailbox {
  emails: AsyncStorageEmailHashTable;
  lastupdate: number;
}

export interface AsyncStorageVirtualMailboxItem {
  messageIds: Set<string>;
  lastUpdate: number;
}

export interface AsyncStorageVirtualMailbox {
  unread: AsyncStorageVirtualMailboxItem;
  important: AsyncStorageVirtualMailboxItem;
}

export interface AsyncStorageEmailSave {
  mailboxes: { [mailbox: string]: AsyncStorageMailbox };
  virtualMailboxes: AsyncStorageVirtualMailbox;
}

// ##################################################################### //
// ############################### Props ############################### //
// ##################################################################### //
export interface EmailListProps {
  emails: EmailCompressedHashTable | null;
  mailbox: React.MutableRefObject<string>;
  searchQuery: string;
  isRefreshing: boolean;
  setIsRefreshing: (isRefreshing: boolean) => void;
  updateEmails: (
    mailbox: string,
    softRefresh?: boolean,
    hardRefresh?: boolean
  ) => Promise<void>;
  onSelectEmail: (messageId: string, mailbox: string) => void;
}

export interface EmailItemProps {
  mailbox: string;
  email: EmailCompressed;
  onSelectEmail: (messageId: string, mailbox: string) => void;
}
export interface EmailDetailsProps {
  mailbox: string;
  messageId: string;
}
