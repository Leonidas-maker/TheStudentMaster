// ~~~~~~~~~~~~~~~ Imports ~~~~~~~~~~~~~~~ //
import axios from "axios";
import {
  Email,
  EmailHashTable,
  EmailCompressedHashTable,
  EmailDetailsHashTable,
  AsyncStorageEmailSave,
  AsyncStorageVirtualMailbox,
  AsyncStorageMailbox,
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
// ############################## Helpers ############################## //
// ##################################################################### //
const isTimePassed = (timestamp: number, seconds: number) => {
  const currentTime = new Date().getTime();
  const difference = currentTime - timestamp;
  const minutes = difference / 60000;
  return minutes > seconds / 60;
};

// ##################################################################### //
// ############################### Inits ############################### //
// ##################################################################### //

/**
 * Initializes the virtual mailboxes for unread and important emails
 * @returns - The initialized virtual mailboxes
 */
const initVirtualMailboxes = (): AsyncStorageVirtualMailbox => {
  return {
    unread: { lastUpdate: 0, messageIds: new Set<string>() },
    important: { lastUpdate: 0, messageIds: new Set<string>() },
  };
};

// ##################################################################### //
// ######################### Encrypt / Decrypt ######################### //
// ##################################################################### //

/**
 * Encrypts and saves the email data in AsyncStorage
 * @param asyncStorageEmails - The email data to save
 * @param secretKey - The secret key to encrypt the data
 */
const encryptAndSaveEmails = async (
  asyncStorageEmails: AsyncStorageEmailSave,
  secretKey: string,
) => {
  const emailsToSave = {
    ...asyncStorageEmails,
    virtualMailboxes: {
      unread: {
        ...asyncStorageEmails.virtualMailboxes.unread,
        messageIds: Array.from(
          asyncStorageEmails.virtualMailboxes.unread.messageIds,
        ),
      },
      important: {
        ...asyncStorageEmails.virtualMailboxes.important,
        messageIds: Array.from(
          asyncStorageEmails.virtualMailboxes.important.messageIds,
        ),
      },
    },
  };

  const encryptedData = CryptoES.AES.encrypt(
    JSON.stringify(emailsToSave),
    secretKey,
  ).toString();
  await storeData("mailServerEmails", encryptedData);
};

/**
 * Decrypts the email data from AsyncStorage
 * @param secretKey  - The secret key to decrypt the data
 * @returns - The decrypted email data
 */
const decryptEmails = async (
  secretKey: string,
): Promise<AsyncStorageEmailSave> => {
  // Retrieve the encrypted data from AsyncStorage
  const encryptedData = await getData("mailServerEmails");

  // Check if the encrypted data exists
  if (!encryptedData) {
    return {
      mailboxes: {},
      virtualMailboxes: initVirtualMailboxes(),
    };
  }

  // Decrypt the data
  const decryptedData = CryptoES.AES.decrypt(encryptedData, secretKey).toString(
    CryptoES.enc.Utf8,
  );

  // Parse the decrypted data
  let parsedData = JSON.parse(decryptedData);
  // If data is valid convert virtual mailboxes to Set
  if (parsedData && parsedData.virtualMailboxes) {
    if (Array.isArray(parsedData.virtualMailboxes.unread.messageIds)) {
      parsedData.virtualMailboxes.unread.messageIds = new Set(
        parsedData.virtualMailboxes.unread.messageIds,
      );
    } else {
      console.error("unread.messageIds is not an array");
    }
    if (Array.isArray(parsedData.virtualMailboxes.important.messageIds)) {
      parsedData.virtualMailboxes.important.messageIds = new Set(
        parsedData.virtualMailboxes.important.messageIds,
      );
    } else {
      console.error("important.messageIds is not an array");
    }
    return parsedData;
  } else {
    return { mailboxes: {}, virtualMailboxes: initVirtualMailboxes() };
  }
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
  emailHashTable: EmailHashTable,
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

/**
 * Adds or removes an email from the virtual mailboxes based on its flags
 * @param email - The email to update the virtual mailboxes for
 * @param virtualMailboxes - The virtual mailboxes to update
 * @returns - The updated virtual mailboxes
 */
const updateVirtualMailbox = (
  email: Email,
  virtualMailboxes: AsyncStorageVirtualMailbox,
): AsyncStorageVirtualMailbox => {
  // Update unreadEmails based on "\\Seen" flag
  if (email.flags.includes("\\Seen")) {
    virtualMailboxes.unread.messageIds.delete(email.message_id);
  } else {
    virtualMailboxes.unread.messageIds.add(email.message_id);
  }

  // Update importantEmails based on "\\Flagged" flag
  if (!email.flags.includes("\\Flagged")) {
    virtualMailboxes.important.messageIds.delete(email.message_id);
  } else {
    virtualMailboxes.important.messageIds.add(email.message_id);
  }

  return virtualMailboxes;
};

/**
 * Updates the virtual mailboxes for a specific email based on its flags
 * @param messageId - The message ID of the email to check
 * @param flags - The flags of the email
 * @param virtualMailboxes - The virtual mailboxes to update
 * @returns - The updated virtual mailboxes
 */
const updateVirtualMailboxByMessageId = (
  messageId: string,
  flags: string[],
  virtualMailboxes: AsyncStorageVirtualMailbox,
): AsyncStorageVirtualMailbox => {
  if (flags.includes("\\Seen")) {
    virtualMailboxes.unread.messageIds.delete(messageId);
  } else {
    virtualMailboxes.unread.messageIds.add(messageId);
  }

  if (!flags.includes("\\Flagged")) {
    virtualMailboxes.important.messageIds.delete(messageId);
  } else {
    virtualMailboxes.important.messageIds.add(messageId);
  }
  return virtualMailboxes;
};

/**
 * Retrieves emails by their message IDs from the mailboxes
 * @param messageIds - The message IDs to retrieve emails for
 * @param mailboxes  - The mailboxes to retrieve the emails from
 * @returns - A hash table of emails with the specified message IDs
 */
const retrieveEmailsbyMessageIds = (
  messageIds: Set<string>,
  mailboxes: { [mailbox: string]: AsyncStorageMailbox },
): EmailHashTable => {
  const emails: EmailHashTable = {};

  for (const messageId of messageIds) {
    // Iterate over the message IDs
    for (const mailbox in mailboxes) {
      if (mailboxes[mailbox].emails[messageId]) {
        emails[messageId] = mailboxes[mailbox].emails[messageId];
        break; // Break the loop if the email was found
      }
    }
  }

  return emails;
};

// ##################################################################### //
// ####################### AsyncStorageEmailSave ####################### //
// ##################################################################### //

/**
 * Stores emails in AsyncStorage based on the mailbox and updates the virtual mailboxes
 * @param mailbox - The mailbox to store the emails in
 * @param emails - The emails to store
 * @param existingMailboxData - The existing mailbox data from AsyncStorage
 * @param secretKey - The secret key to encrypt the emails
 * @param deleteEmails - Whether to delete emails not in the new list
 * @returns - The last update timestamp and the emails stored in the mailbox
 */
const storeEmailsInAsyncStorage = async (
  mailbox: string,
  emails: Email[],
  existingMailboxData: AsyncStorageEmailSave,
  secretKey: string,
  deleteEmails: boolean = false,
): Promise<{ lastupdate: number; emails: EmailHashTable }> => {
  try {
    // Init the mailbox if it doesn't exist
    if (!existingMailboxData.mailboxes[mailbox]) {
      existingMailboxData.mailboxes[mailbox] = { emails: {}, lastupdate: 0 };
    }

    // Init the virtual mailboxes if they don't exist
    if (!existingMailboxData.virtualMailboxes) {
      existingMailboxData.virtualMailboxes = initVirtualMailboxes();
    }

    // Create a set of the new/ current emails' message IDs (depending on deleteEmails)
    const newEmailIds = new Set(emails.map((email) => email.message_id));

    // Remove emails from the existing mailbox that are no longer in the new email list
    if (deleteEmails) {
      for (const messageId in existingMailboxData.mailboxes[mailbox].emails) {
        if (!newEmailIds.has(messageId)) {
          delete existingMailboxData.mailboxes[mailbox].emails[messageId]; // Remove the email
        }
      }
    }

    // Add new emails or update existing ones in the mailbox
    emails.forEach((email) => {
      const { message_id, ...rest } = email;
      // Insert or update the email in the mailbox and virtual mailboxes
      existingMailboxData.mailboxes[mailbox].emails[message_id] = {
        ...existingMailboxData.mailboxes[mailbox].emails[message_id],
        ...rest,
      };
      existingMailboxData.virtualMailboxes = updateVirtualMailbox(
        email,
        existingMailboxData.virtualMailboxes,
      );
    });

    // Update the timestamp for the mailbox
    existingMailboxData.mailboxes[mailbox].lastupdate = new Date().getTime();

    // Encrypt and save the updated data
    await encryptAndSaveEmails(existingMailboxData, secretKey);
    console.debug(
      "Emails successfully stored in AsyncStorage under mailbox:",
      mailbox,
    );

    return {
      lastupdate: existingMailboxData.mailboxes[mailbox].lastupdate,
      emails: existingMailboxData.mailboxes[mailbox].emails,
    };
  } catch (error) {
    console.error("Error storing emails in AsyncStorage:", error);
    return { lastupdate: 0, emails: {} };
  }
};

/**
 * Stores emails retrieved by tags in AsyncStorage.
 * @param virtualMailbox - The virtual mailbox to retrieve all emails from (needed for retrieval)
 * @param emails - The emails to store - dont need to be all emails from the specified virtual mailbox
 * @param existingMailboxData - The existing mailbox data from AsyncStorage
 * @param secretKey - The secret key to encrypt the emails
 * @returns - The virtual mailboxes with the updated emails
 */
const storeTaggedEmailsInAsyncStorage = async (
  virtualMailbox: string,
  emails: Email[],
  existingMailboxData: AsyncStorageEmailSave,
  secretKey: string,
): Promise<{ lastupdate: number; emails: EmailHashTable }> => {
  try {
    if (
      virtualMailbox !== "unreadEmails" &&
      virtualMailbox !== "importantEmails"
    ) {
      console.error("Invalid virtual mailbox:", virtualMailbox);
      return { lastupdate: 0, emails: {} };
    }

    // Init the virtual mailboxes if they don't exist
    if (!existingMailboxData.virtualMailboxes) {
      existingMailboxData.virtualMailboxes = initVirtualMailboxes();
    }
    if (virtualMailbox === "unreadEmails") {
      existingMailboxData.virtualMailboxes.unread.messageIds =
        new Set<string>();
    } else if (virtualMailbox === "importantEmails") {
      existingMailboxData.virtualMailboxes.important.messageIds =
        new Set<string>();
    }

    // Update the emails in the mailbox and add them to the virtual mailboxes
    emails.forEach((email) => {
      if (!email.mailbox) {
        return;
      }

      // Initialize the mailbox if it doesn't exist
      if (!existingMailboxData.mailboxes[email.mailbox]) {
        existingMailboxData.mailboxes[email.mailbox] = {
          emails: {},
          lastupdate: 0,
        };
      }

      // Add or update the email in the mailbox
      existingMailboxData.mailboxes[email.mailbox].emails[email.message_id] = {
        ...existingMailboxData.mailboxes[email.mailbox].emails[
          email.message_id
        ],
        ...email,
      };

      // Update the virtual mailboxes
      existingMailboxData.virtualMailboxes = updateVirtualMailbox(
        email,
        existingMailboxData.virtualMailboxes,
      );
    });

    let retrievedEmails: EmailHashTable = {};

    if (virtualMailbox === "unreadEmails") {
      // Update the timestamp for the virtual mailbox
      existingMailboxData.virtualMailboxes.unread.lastUpdate =
        new Date().getTime();

      // Get the emails for the unread mailbox
      retrievedEmails = retrieveEmailsbyMessageIds(
        existingMailboxData.virtualMailboxes.unread.messageIds,
        existingMailboxData.mailboxes,
      );
    } else if (virtualMailbox === "importantEmails") {
      // Update the timestamp for the virtual mailbox
      existingMailboxData.virtualMailboxes.important.lastUpdate =
        new Date().getTime();

      // Get the emails for the important mailbox
      retrievedEmails = retrieveEmailsbyMessageIds(
        existingMailboxData.virtualMailboxes.important.messageIds,
        existingMailboxData.mailboxes,
      );
    } else {
      console.error("Invalid virtual mailbox:", virtualMailbox);
      return { lastupdate: 0, emails: {} };
    }

    // Encrypt and save the updated data
    await encryptAndSaveEmails(existingMailboxData, secretKey);
    console.debug(
      "Emails successfully stored in AsyncStorage under virtual mailboxes",
    );

    return {
      lastupdate: new Date().getTime(),
      emails: retrievedEmails,
    };
  } catch (error) {
    console.error("Error storing emails in AsyncStorage:", error);
    return { lastupdate: 0, emails: {} };
  }
};

/**
 * Updates the body of an email in the mailbox and saves the changes in AsyncStorage
 * @param mailbox - The mailbox to update the email in
 * @param messageId - The message ID of the email to update
 * @param newBody - The new body of the email
 * @param secretKey - The secret key to encrypt the emails
 * @returns - The updated email
 */
const updateEmailBodyInAsyncStorage = async (
  mailbox: string,
  messageId: string,
  newBody: string,
  secretKey: string,
): Promise<Email | null> => {
  try {
    // Retrieve the encrypted mailbox data from AsyncStorage
    const existingMailboxData = await decryptEmails(secretKey);

    // Check if the requested mailbox exists
    if (!existingMailboxData.mailboxes[mailbox]) {
      console.debug(`No emails found for mailbox: ${mailbox}`);
      return null; // No emails found for the mailbox
    }

    // Check if the email with the specified message_id exists
    if (!existingMailboxData.mailboxes[mailbox].emails[messageId]) {
      console.debug(`No email found with messageId: ${messageId}`);
      return null; // No email found with the specified message_id
    }

    // Update the body of the email
    existingMailboxData.mailboxes[mailbox].emails[messageId].body = newBody;

    // Encrypt and save the updated data
    await encryptAndSaveEmails(existingMailboxData, secretKey);

    console.debug(
      `Email body successfully updated for messageId: ${messageId} - mailbox: ${mailbox}`,
    );

    return {
      message_id: messageId,
      ...existingMailboxData.mailboxes[mailbox].emails[messageId],
    };
  } catch (error) {
    console.error("Error updating email body in AsyncStorage:", error);
    return null;
  }
};

/**
 * Updates the flags of the specified emails in the mailbox and saves the changes in AsyncStorage
 * @param mailbox - The mailbox to update the flags in
 * @param messageIds - The message IDs of the emails to update
 * @param flags - The flags to set for the emails
 * @param secretKey - The secret key to encrypt the emails
 * @returns - A promise resolving to the updated flags
 */
const updateEmailFlagsInAsyncStorage = async (
  mailbox: string,
  messageIds: string[],
  flags: string[],
  secretKey: string,
) => {
  try {
    // Retrieve the encrypted mailbox data from AsyncStorage
    const existingMailboxData = await decryptEmails(secretKey);

    // Check if the requested mailbox exists
    if (!existingMailboxData.mailboxes[mailbox]) {
      console.debug(`No emails found for mailbox: ${mailbox}`);
      return; // No emails found for the mailbox
    }

    // Update the flags of the specified emails
    messageIds.forEach((messageId) => {
      if (existingMailboxData.mailboxes[mailbox].emails[messageId]) {
        existingMailboxData.mailboxes[mailbox].emails[messageId].flags = flags;
        existingMailboxData.virtualMailboxes = updateVirtualMailboxByMessageId(
          messageId,
          flags,
          existingMailboxData.virtualMailboxes,
        );
      }
    });

    // Encrypt and save the updated data
    await encryptAndSaveEmails(existingMailboxData, secretKey);

    console.debug(
      `Email flags successfully updated for messageIds: ${messageIds} - mailbox: ${mailbox}`,
    );
  } catch (error) {
    console.error("Error updating email flags in AsyncStorage:", error);
  }
};

// ##################################################################### //
// ############################### Fetch ############################### //
// ##################################################################### //
/**
 * Fetches the email folders from the mail server
 * @param username - The username of the email account
 * @param password - The password of the email account
 * @param mailServerDomain - The domain of the mail server
 * @param mailServerPort - The port of the mail server
 * @returns - The list of email folders and the timestamp of the fetch
 */
const fetchEmailFolders = async (
  username: string,
  password: string,
  mailServerDomain: string,
  mailServerPort: string,
): Promise<{ folders: Mailbox[]; timestamp: number }> => {
  //TODO change to correct URL
  const response = await axios.post(
    "http://192.168.178.43:8000/email/get-folders",
    {
      username: username,
      password: password,
      imap_server: mailServerDomain,
      imap_port: mailServerPort,
    },
  );
  const data = {
    folders: response.data.folders,
    timestamp: new Date().getTime(),
  };
  return data;
};

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
  retrieveSinceDate?: string,
): Promise<Email[]> => {
  //TODO change to correct URL and use retrieveSinceDate
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
                  `${encodeURIComponent(key)}=${encodeURIComponent(tag)}`,
              )
              .join("&");
          })
          .join("&");
      },
    },
  );
  return response.data;
};

/**
 * Fetches the list of emails for the specified mailbox
 * @param username - The username of the email account
 * @param password - The password of the email account
 * @param mailServerDomain - The domain of the mail server
 * @param mailServerPort - The port of the mail server
 * @param mailbox - The mailbox to fetch emails from
 * @param retrieveSinceDate - The date to retrieve emails since
 * @returns - The list of emails for the specified mailbox
 */
const fetchEmailListByMailbox = async (
  username: string,
  password: string,
  mailServerDomain: string,
  mailServerPort: string,
  mailbox: string,
  retrieveSinceDate?: string,
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

// ##################################################################### //
// ############################## Getters ############################## //
// ##################################################################### //

/**
 * Gets the list of email folders from the AsyncStorage or fetches them from the mail server
 * @returns - The list of email folders
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
    const saveData = await fetchEmailFolders(
      username,
      password,
      mailServerDomain,
      mailServerPort,
    );
    storeData("mailServerFolders", JSON.stringify(saveData));
    return saveData.folders;
  } catch (error) {
    console.error("Error fetching folders:", error);
    return [];
  }
};

/**
 * Retrieves a list of emails from either AsyncStorage or the mail server based on the provided mailbox and refresh options.
 * @param mailbox - The mailbox from which emails should be retrieved (e.g., "virtual-unseen", "virtual-starred", or regular mailbox names).
 * @param readStatus - The read status of the emails to filter (used with virtual mailboxes like unseen).
 * @param softRefresh - Whether to perform a soft refresh (check if emails are updated within the last hour).
 * @param hardRefresh - Whether to perform a hard refresh (force retrieval from the server).
 * @returns A promise resolving to an object containing the last update timestamp and a hash table of emails.
 */
const getEmailList = async (
  mailbox: string,
  readStatus: string,
  softRefresh: boolean = false,
  hardRefresh: boolean = true,
  onlyLocal: boolean = false,
): Promise<{ lastupdate: number; emails: EmailHashTable }> => {
  console.debug("Fetching emails");
  // Retrieve user credentials and initialize variables for the process
  const { username, password } = await getMailServerCredentials();
  let retrieveSinceDate = null;
  let decryptedData = null;

  if (!username || !password) {
    return { lastupdate: 0, emails: {} };
  }

  // Decrypt emails from AsyncStorage if credentials are available
  decryptedData = await decryptEmails(password);

  if (decryptedData) {
    // Handle virtual mailboxes first
    switch (mailbox.toLowerCase()) {
      case "virtual-starred":
        if (
          onlyLocal ||
          (!softRefresh &&
            !hardRefresh &&
            isTimePassed(
              decryptedData.virtualMailboxes.important.lastUpdate,
              5,
            ))
        ) {
          // Return important emails from virtual mailbox if no refresh is requested
          return {
            emails: await retrieveEmailsbyMessageIds(
              decryptedData.virtualMailboxes.important.messageIds,
              decryptedData.mailboxes,
            ),
            lastupdate: decryptedData.virtualMailboxes.important.lastUpdate,
          };
        }
        break;

      case "virtual-unseen":
        if (
          onlyLocal ||
          (!softRefresh &&
            !hardRefresh &&
            isTimePassed(decryptedData.virtualMailboxes.unread.lastUpdate, 5))
        ) {
          // Return unread emails from virtual mailbox if no refresh is requested
          return {
            emails: await retrieveEmailsbyMessageIds(
              decryptedData.virtualMailboxes.unread.messageIds,
              decryptedData.mailboxes,
            ),
            lastupdate: decryptedData.virtualMailboxes.unread.lastUpdate,
          };
        }
        break;

      default:
        if (!decryptedData.mailboxes[mailbox]) break;

        // Return cached emails if within 5 minutes (avoiding unnecessary fetches)
        if (
          onlyLocal ||
          (!softRefresh &&
            !hardRefresh &&
            isTimePassed(decryptedData.mailboxes[mailbox].lastupdate, 5 * 60))
        ) {
          return {
            lastupdate: decryptedData.mailboxes[mailbox].lastupdate,
            emails: decryptedData.mailboxes[mailbox]?.emails || {},
          };
        }

        // Check if soft refresh can avoid a hard server request
        if (
          !hardRefresh &&
          softRefresh &&
          isTimePassed(decryptedData.mailboxes[mailbox].lastupdate, 15 * 60)
        ) {
          retrieveSinceDate = new Date(
            decryptedData.mailboxes[mailbox].lastupdate,
          ).toISOString();
          console.debug("Retrieving emails since:", retrieveSinceDate);
        }
        break;
    }
  }

  // Proceed to retrieve emails from mail server if no cache was used
  const mailServerDomain = await getData("mailServerDomain");
  const mailServerPort = await getData("mailServerPort");

  // Exit early if mail server details are missing
  if (!mailServerDomain || !mailServerPort) {
    return { lastupdate: 0, emails: {} };
  }

  try {
    let emails;
    switch (mailbox.toLowerCase()) {
      case "virtual-starred":
        // Fetch flagged (important) emails from the server
        emails = await fetchEmailListByTags(
          username,
          password,
          mailServerDomain,
          mailServerPort,
          ["FLAGGED"],
          retrieveSinceDate || undefined,
        );

        return await storeTaggedEmailsInAsyncStorage(
          "importantEmails",
          emails,
          decryptedData,
          password,
        );
      case "virtual-unseen":
        // Fetch unseen (unread) emails from the server
        emails = await fetchEmailListByTags(
          username,
          password,
          mailServerDomain,
          mailServerPort,
          ["UNSEEN"],
          retrieveSinceDate || undefined,
        );
        return await storeTaggedEmailsInAsyncStorage(
          "unreadEmails",
          emails,
          decryptedData,
          password,
        );
      default:
        // Fetch emails from the specified mailbox
        emails = await fetchEmailListByMailbox(
          username,
          password,
          mailServerDomain,
          mailServerPort,
          mailbox,
          retrieveSinceDate || undefined,
        );

        // Store emails in AsyncStorage with full or partial update depending on the refresh
        return await storeEmailsInAsyncStorage(
          mailbox,
          emails,
          decryptedData,
          password,
          !retrieveSinceDate,
        );
    }
  } catch (error) {
    console.error("Error fetching emails:", error);

    // Fallback to cached emails in case of an error while fetching
    if (decryptedData) {
      switch (mailbox.toLowerCase()) {
        case "virtual-starred":
          return {
            emails: await retrieveEmailsbyMessageIds(
              decryptedData.virtualMailboxes.important.messageIds,
              decryptedData.mailboxes,
            ),
            lastupdate: decryptedData.virtualMailboxes.important.lastUpdate,
          };
        case "virtual-unseen":
          return {
            emails: await retrieveEmailsbyMessageIds(
              decryptedData.virtualMailboxes.unread.messageIds,
              decryptedData.mailboxes,
            ),
            lastupdate: decryptedData.virtualMailboxes.unread.lastUpdate,
          };
        default:
          return {
            lastupdate: decryptedData.mailboxes[mailbox].lastupdate || 0,
            emails: decryptedData.mailboxes[mailbox]?.emails || {},
          };
      }
    }
    return { lastupdate: 0, emails: {} };
  }
};

/**
 * Fetches the email details for a given message ID
 * @param messageId - The message ID of the email to fetch
 * @param mailbox - The mailbox the email belongs to
 * @returns - The email details
 */
const getEmailDetails = async (
  messageId: string,
  mailbox: string,
): Promise<Email | null> => {
  const { username, password } = await getMailServerCredentials();

  const mailServerDomain = await getData("mailServerDomain");
  const mailServerPort = await getData("mailServerPort");

  if (!username || !password || !mailServerDomain || !mailServerPort) {
    return null;
  }
  try {
    //TODO change to correct URL
    const response = await axios.post(
      "http://192.168.178.43:8000/email/get-email",
      {
        username: username,
        password: password,
        imap_server: mailServerDomain,
        imap_port: mailServerPort,
        message_id: messageId,
        mailbox: mailbox,
      },
    );

    return await updateEmailBodyInAsyncStorage(
      mailbox,
      messageId,
      response.data.body,
      password,
    );
  } catch (error) {
    console.error("Error fetching email details:", error);
    return null;
  }
};

// ##################################################################### //
// ############################## Updater ############################## //
// ##################################################################### //

/**
 * Updates the flags of the specified emails in the mailbox and optionally on the mail server
 * @param mailbox - The mailbox to update the flags in
 * @param message_ids - The message IDs of the emails to update
 * @param flags - The flags to set for the emails
 * @param only_local - Whether to only update the flags in AsyncStorage
 * @returns - A promise resolving to the updated flags
 */
const updateEmailFlags = async (
  mailbox: string,
  message_ids: string[],
  flags: string[],
  serverFlags: string[] = [],
  alreadyServerSeen: boolean = false,
) => {
  const { username, password } = await getMailServerCredentials();
  const mailServerDomain = await getData("mailServerDomain");
  const mailServerPort = await getData("mailServerPort");

  console.debug("Updating email flags:", mailbox, message_ids, flags);

  if (!username || !password || !mailServerDomain || !mailServerPort) {
    return;
  }

  try {
    await updateEmailFlagsInAsyncStorage(mailbox, message_ids, flags, password);

    if (serverFlags.length > 0) {
      if (alreadyServerSeen) {
        // Remove the "\\Seen" flag from the server flags
        const index = serverFlags.indexOf("+\\Seen");
        if (index > -1) {
          serverFlags[index] = serverFlags[serverFlags.length - 1];
          serverFlags.pop();
        }
      }
      if (serverFlags.length === 0) {
        return;
      }

      const response = await axios.post(
        "http://192.168.178.43:8000/email/set-flags",
        {
          username: username,
          password: password,
          imap_server: mailServerDomain,
          imap_port: mailServerPort,
          message_ids: message_ids,
          mailbox: mailbox,
          flags: serverFlags,
        },
      );

      if (response.status !== 200) {
        console.error("Error updating email flags:", response.data);
      }
    }
  } catch (error) {
    console.error("Error updating email flags:", error);
  }
};

export {
  splitHashTables,
  getEmailFolders,
  getEmailList,
  getEmailDetails,
  updateEmailFlags,
};
