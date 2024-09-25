// ~~~~~~~~~~~~~~~ Imports ~~~~~~~~~~~~~~~ //
import axios from "axios";
import {
  Email,
  EmailHashTable,
  EmailCompressedHashTable,
  EmailDetailsHashTable,
  AsyncStorageEmailSave
} from "../interfaces/email";
import CryptoES from "crypto-es";

// ~~~~~~~~ Own components imports ~~~~~~~ //
import {
  getMailServerCredentials,
  storeSecret,
  getSecret,
} from "./secureStorageHelper";
import { getData, storeData } from "./asyncStorageHelper";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Mailbox } from "../interfaces/email";


// ##################################################################### //
// ######################### Encrypt / Decrypt ######################### //
// ##################################################################### //
const saveAndEncryptEmails = async (
  asyncStorageEmails: AsyncStorageEmailSave,
  secretKey: string
) => {
  const encryptedData = CryptoES.AES.encrypt(
    JSON.stringify(asyncStorageEmails),
    secretKey
  ).toString();
  await storeData("mailServerEmails", encryptedData);
};

const decryptEmails = async (secretKey: string): Promise<AsyncStorageEmailSave> => {
  // Retrieve the encrypted data from AsyncStorage
  const encryptedData = await getData("mailServerEmails");



  // Check if the encrypted data exists
  if (!encryptedData) {
    return  {};
  }

  // Decrypt the data
  const decryptedData = CryptoES.AES.decrypt(
    encryptedData,
    secretKey
  ).toString(CryptoES.enc.Utf8);

  // Return the decrypted data as a JSON object
  return JSON.parse(decryptedData) || {};
};


// ##################################################################### //
// ############################### Helper ############################## //
// ##################################################################### //

const convertHashTableToEmails = (emailHashTable: EmailHashTable) => {
  return Object.keys(emailHashTable).map((key) => {
    return {
      message_id: key,
      ...emailHashTable[key],
    };
  });
};

const splitHashTables = (
  emailHashTable: EmailHashTable
): {
  emailCompressedHashTable: EmailCompressedHashTable;
  emailDetailsHashTable: EmailDetailsHashTable;
} => {
  const emailCompressedHashTable: EmailCompressedHashTable = {};
  const emailDetailsHashTable: EmailDetailsHashTable = {};

  for (const [key, value] of Object.entries(emailHashTable)) {
    emailCompressedHashTable[key] = {
      subject: value.subject,
      from_: value.from_,
      date: value.date,
      flags: value.flags,
      mailbox: value.mailbox,
    };
    emailDetailsHashTable[key] = {
      to: value.to,
      cc: value.cc,
      bcc: value.bcc,
      body: value.body,
    };
  }

  return { emailCompressedHashTable, emailDetailsHashTable };
};


// ##################################################################### //
// ####################### AsyncStorageEmailSave ####################### //
// ##################################################################### //

// Update the structure to manage email deletion and addition in mailboxes
const storeEmailsInAsyncStorage = async (
  mailbox: string,
  emails: Email[],
  secretKey: string,
  deleteEmails: boolean = false
): Promise<{ lastupdate: number; emails: EmailHashTable }> => {
  try {
    // Retrieve the encrypted mailbox data from AsyncStorage
    const existingMailboxData = await decryptEmails(secretKey);

    // Initialize the mailbox if it doesn't exist
    if (!existingMailboxData[mailbox]) {
      existingMailboxData[mailbox] = { emails: {}, timestamp: 0 };
    }

    // Create a set of the current emails' message IDs
    const newEmailIds = new Set(emails.map((email) => email.message_id));

    if (deleteEmails) {
      // Remove emails from the existing mailbox that are no longer in the new email list
      for (const messageId in existingMailboxData[mailbox].emails) {
        if (!newEmailIds.has(messageId)) {
          delete existingMailboxData[mailbox].emails[messageId]; // Remove the email
        }
      }
    }

    // Add new emails or update existing ones in the mailbox
    emails.forEach((email) => {
      const { message_id, ...rest } = email;
      existingMailboxData[mailbox].emails[message_id] = rest; // Insert new email into mailbox
    });

    // Update the timestamp for the mailbox
    existingMailboxData[mailbox].timestamp = new Date().getTime();

    // Encrypt and save the updated data
    await saveAndEncryptEmails(existingMailboxData, secretKey);
    console.debug(
      "Emails successfully stored in AsyncStorage under mailbox:",
      mailbox
    );
    return {
      lastupdate: existingMailboxData[mailbox].timestamp,
      emails: existingMailboxData[mailbox].emails,
    };
  } catch (error) {
    console.error("Error storing emails in AsyncStorage:", error);
    return { lastupdate: 0, emails: {} };
  }
};

// Function to update the body of an email by its message_id
const updateEmailBodyInAsyncStorage = async (
  mailbox: string,
  message_id: string,
  newBody: string,
  secretKey: string
): Promise<Email | null> => {
  try {
    // Retrieve the encrypted mailbox data from AsyncStorage
    const existingMailboxData = await decryptEmails(secretKey);

    // Check if the requested mailbox exists
    if (!existingMailboxData[mailbox] || !existingMailboxData[mailbox].emails) {
      console.debug(`No emails found for mailbox: ${mailbox}`);
      return null; // No emails found for the mailbox
    }

    // Check if the email with the specified message_id exists
    if (!existingMailboxData[mailbox].emails[message_id]) {
      console.debug(`No email found with message_id: ${message_id}`);
      return null; // No email found with the specified message_id
    }

    // Update the body of the email
    existingMailboxData[mailbox].emails[message_id].body = newBody;

    // Encrypt and save the updated data
    await saveAndEncryptEmails(existingMailboxData, secretKey);
    console.debug(
      `Email body successfully updated for message_id: ${message_id}`
    );
    return {
      message_id: message_id,
      ...existingMailboxData[mailbox].emails[message_id],
    };
  } catch (error) {
    console.error("Error updating email body in AsyncStorage:", error);
    return null;
  }
};

const updateEmailFlagsInAsyncStorage = async (mailbox: string, message_ids: string[], flags: string[], secretKey: string) => {
  try {
    // Retrieve the encrypted mailbox data from AsyncStorage
    const existingMailboxData = await decryptEmails(secretKey);

    // Check if the requested mailbox exists
    if (!existingMailboxData[mailbox] || !existingMailboxData[mailbox].emails) {
      console.debug(`No emails found for mailbox: ${mailbox}`);
      return; // No emails found for the mailbox
    }

    // Update the flags of the specified emails
    message_ids.forEach((message_id) => {
      if (existingMailboxData[mailbox].emails[message_id]) {
        existingMailboxData[mailbox].emails[message_id].flags = flags;
      }
    });

    // Encrypt and save the updated data
    await saveAndEncryptEmails(existingMailboxData, secretKey);

  } catch (error) {
    console.error("Error updating email flags in AsyncStorage:", error);
    return null;
  }
}

// ##################################################################### //
// ################################ Main ############################### //
// ##################################################################### //

/**
 * Fetches all emails with the specified tags
 * @param username - The username of the email account
 * @param password - The password of the email account
 * @param mailServerDomain - The domain of the mail server
 * @param mailServerPort - The port of the mail server
 * @param tags - The tags to filter the emails by
 * @returns - A hash table of emails with the specified tags
 */
const fetchEmailListByTags = async (
  username: string,
  password: string,
  mailServerDomain: string,
  mailServerPort: string,
  tags: string[],
  retrieveSinceDate?: string
): Promise<Email[]> => {
  //TODO change to correct URL
  const response = await axios.post(
    "http://192.168.178.43:8000/email/get-tagged-email-list",
    {
      username: username,
      password: password,
      imap_server: mailServerDomain,
      imap_port: mailServerPort,
    },
    {
      params: { tags: tags }, // Assuming tags is an array of strings
      paramsSerializer: (params: { [key: string]: string[] }) => {
        return Object.keys(params)
          .map((key) => {
            return params[key]
              .map(
                (tag: string) =>
                  `${encodeURIComponent(key)}=${encodeURIComponent(tag)}`
              )
              .join("&");
          })
          .join("&");
      },
    }
  );
  return response.data;
};

const fetchEmailListByMailbox = async (
  username: string,
  password: string,
  mailServerDomain: string,
  mailServerPort: string,
  mailbox: string,
  retrieveSinceDate?: string
): Promise<Email[]> => {
  //TODO change to correct URL
  let requestUrl =
    "http://192.168.178.43:8000/email/get-email-list?read_status=all";
  if (retrieveSinceDate) {
    requestUrl += `&since_date=${encodeURIComponent(retrieveSinceDate)}`;
  }
  const response = await axios.post(requestUrl, {
    username: username,
    password: password,
    imap_server: mailServerDomain,
    imap_port: mailServerPort,
    mailbox: mailbox,
  });

  return response.data;
};

/**
 * Fetches the email folders from the mail server
 * @returns The list of email folders
 */
const getEmailFolders = async () => {
  const availableFolders = await getData("mailServerFolders");

  if (availableFolders) {
    const parsedFolders = JSON.parse(availableFolders);
    const timestamp = parsedFolders.timestamp;
    const currentTime = new Date().getTime();
    const difference = currentTime - timestamp;
    const minutes = difference / 60000;
    if (minutes < 5) {
      return parsedFolders.folders;
    }
  }

  const { username, password } = await getMailServerCredentials();
  const mailServerDomain = await getData("mailServerDomain");
  const mailServerPort = await getData("mailServerPort");

  if (!username || !password || !mailServerDomain || !mailServerPort) {
    return [];
  }
  try {
    //TODO change to correct URL
    const response = await axios.post(
      "http://192.168.178.43:8000/email/get-folders",
      {
        username: username,
        password: password,
        imap_server: mailServerDomain,
        imap_port: mailServerPort,
      }
    );
    const saveData = {
      folders: response.data.folders,
      timestamp: new Date().getTime(),
    };
    storeData("mailServerFolders", JSON.stringify(saveData));

    return response.data.folders;
  } catch (error) {
    console.error("Error fetching folders:", error);
    return [];
  }
};

/**
 * Fetches the list of emails for the specified mailbox
 * @param mailbox - The mailbox to fetch emails from
 * @param readStatus - The read status of the emails to fetch
 * @param softRefresh - Only retrieve emails since the last update
 * @param hardRefresh - Retrieve all emails from the server
 * @returns
 */
const getEmailList = async (
  mailbox: string,
  readStatus: string,
  softRefresh: boolean = false,
  hardRefresh: boolean = true
): Promise<{ lastupdate: number; emails: EmailHashTable }> => {
  const { username, password } = await getMailServerCredentials();
  let retrieveSinceDate = null;
  let availableEmails = null;

  // Check if the emails are available in AsyncStorage
  availableEmails = await getData("mailServerEmails");
  if (availableEmails && password) {
    const decryptedData = CryptoES.AES.decrypt(
      availableEmails,
      password
    ).toString(CryptoES.enc.Utf8);
    const parsedEmails = JSON.parse(decryptedData)[mailbox] || {
      emails: [],
      timestamp: 0,
    };

    const timestamp = parsedEmails.timestamp;
    const currentTime = new Date().getTime();
    const difference = currentTime - timestamp;
    const minutes = difference / 60000;
    if (!softRefresh && !hardRefresh && minutes < 5) {
      return {
        lastupdate: parsedEmails.timestamp,
        emails: parsedEmails.emails,
      };
    } else if (minutes < 60 && (!hardRefresh || softRefresh)) {
      retrieveSinceDate = new Date(timestamp).toISOString();
      console.debug("Retrieving emails since:", retrieveSinceDate);
    }
  }

  // Retrieve emails from the mail server
  const mailServerDomain = await getData("mailServerDomain");
  const mailServerPort = await getData("mailServerPort");

  if (!username || !password || !mailServerDomain || !mailServerPort) {
    return { lastupdate: 0, emails: {} };
  }
  try {
    let emails;
    switch (mailbox.toLowerCase()) {
      case "starred":
        emails = await fetchEmailListByTags(
          username,
          password,
          mailServerDomain,
          mailServerPort,
          ["FLAGGED"],
          retrieveSinceDate || undefined
        );
        break;
      case "unseen":
        emails = await fetchEmailListByTags(
          username,
          password,
          mailServerDomain,
          mailServerPort,
          ["UNSEEN"],
          retrieveSinceDate || undefined
        );
        break;
      default:
        emails = await fetchEmailListByMailbox(
          username,
          password,
          mailServerDomain,
          mailServerPort,
          mailbox,
          retrieveSinceDate || undefined
        );
        break;
    }

    if (!retrieveSinceDate) {
      return await storeEmailsInAsyncStorage(mailbox, emails, password, true);
    } else {
      return await storeEmailsInAsyncStorage(mailbox, emails, password);
    }
  } catch (error) {
    console.error("Error fetching emails:", error);
    if (availableEmails) {
      const decryptedData = CryptoES.AES.decrypt(
        availableEmails,
        password
      ).toString(CryptoES.enc.Utf8);
      const parsedEmails = JSON.parse(decryptedData)[mailbox] || {
        emails: [],
        timestamp: 0,
      };
      return {
        lastupdate: parsedEmails.timestamp,
        emails: parsedEmails.emails,
      };
    }
    return { lastupdate: 0, emails: {} };
  }
};

/**
 * Fetches the email details for a given message ID
 * @param messageId
 * @param mailbox
 * @returns
 */
const getEmailDetails = async (
  messageId: string,
  mailbox: string
): Promise<Email | null> => {
  const { username, password } = await getMailServerCredentials();
  const mailServerDomain = await getData("mailServerDomain");
  const mailServerPort = await getData("mailServerPort");

  if (!username || !password || !mailServerDomain || !mailServerPort) {
    return null;
  }
  try {
    //TODO change to correct URL
    console.debug(messageId);

    const response = await axios.post(
      "http://192.168.178.43:8000/email/get-email",
      {
        username: username,
        password: password,
        imap_server: mailServerDomain,
        imap_port: mailServerPort,
        message_id: messageId,
        mailbox: mailbox,
      }
    );
    return await updateEmailBodyInAsyncStorage(
      mailbox,
      messageId,
      response.data.body,
      password
    );
  } catch (error) {
    console.error("Error fetching email details:", error);
    return null;
  }
};

const updateEmailFlags = async (
  mailbox: string,
  message_ids: string[],
  flags: string[]
) => {
  const { username, password } = await getMailServerCredentials();
  const mailServerDomain = await getData("mailServerDomain");
  const mailServerPort = await getData("mailServerPort");

  console.debug("Updating email flags:", mailbox, message_ids, flags);

  if (!username || !password || !mailServerDomain || !mailServerPort) {
    return;
  }

  try {
    const response = await axios.post("http://192.168.178.43:8000/email/set-flags", {
      username: username,
      password: password,
      imap_server: mailServerDomain,
      imap_port: mailServerPort,
      message_ids: message_ids,
      mailbox: mailbox,
      flags: flags,
    });

    if (response.status !== 200) {
      console.error("Error updating email flags:", response.data);
    }

    await updateEmailFlagsInAsyncStorage(mailbox, message_ids, flags, password);
  } catch (error) {
    console.error("Error updating email flags:", error);
  }
};

export { getEmailFolders, getEmailList, getEmailDetails, splitHashTables, updateEmailFlags };
