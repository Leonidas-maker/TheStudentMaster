import AsyncStorage from '@react-native-async-storage/async-storage';
export interface SpecialEmailHashTables {
  [key: string]: EmailCompressedHashTable;
}

export interface EmailCompressedHashTable {
  [key: string]: Omit<EmailCompressed, 'message_id'>;
}

export interface EmailDetailsHashTable {
  [key: string]: Omit<EmailDetails, 'message_id'>;
}

export interface EmailHashTable {
  [key: string]: Omit<Email, 'message_id'>;
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

export interface Mailbox{
  id: string;
  name: string;
}

export interface GroupedEmailItem {
  title: string;
  data: EmailCompressed[];
}

export interface AsyncStorageEmailSave {
  [mailbox: string]: { emails: EmailHashTable; timestamp: number }
}

// ##################################################################### //
// ############################### Props ############################### //
// ##################################################################### //
export interface EmailListProps {
  emails:  EmailCompressedHashTable | null;
  mailbox: React.MutableRefObject<string>;
  searchQuery: string;
  isRefreshing: boolean;
  setIsRefreshing: (isRefreshing: boolean) => void;
  updateEmails: (mailbox:string, softRefresh?: boolean, hardRefresh?: boolean) => Promise<void>;
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