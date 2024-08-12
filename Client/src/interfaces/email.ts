export interface FolderListProps {
  mailboxes: Mailbox[];
  onSelectMailbox: (folderId: string) => void;
}

export interface EmailListProps {
  mailbox: string;
  onSelectEmail: (emailId: string, mailbox: string) => void; // Zwei Argumente hier definieren
}


export interface Email {
  id: string;
  subject: string;
  from_: string;
}

export interface EmailDetailsProps {
  mailbox: string;
  emailId: string;
}

export interface EmailDetail {
  id: string;
  subject: string;
  from_: string;
  body: string;
}

export interface Mailbox{
  id: string;
  name: string;
}