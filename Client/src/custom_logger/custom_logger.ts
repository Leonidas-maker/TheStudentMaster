import { Platform } from 'react-native';
import Constants from 'expo-constants';


interface LogPayload {
  level: 'Info' | 'Warn' | 'Error';
  message: string;
  platform: string;
  device_name: string;
  timestamp: string;
}


function getExpoDevServerIp(): string | null {
  if (__DEV__) {
    const manifest = Constants.manifest || Constants.manifest2?.extra?.expoGo?.debuggerHost;
    if (manifest) {
      // Extrahiere die Host-IP-Adresse aus der Manifest-URL
      const debuggerHost = typeof manifest === 'string' ? manifest : (manifest as any).debuggerHost;
      const match = debuggerHost?.match(/^(.*):\d+$/);
      return match ? match[1] : null;
    }
  }
  return null; 
}

const LOG_SERVER_IP = getExpoDevServerIp();

// Test if server is reachable
async function testServerConnection(): Promise<boolean> {
  try {
    await fetch(`http://${LOG_SERVER_IP}:19000/ping`, {
      method: 'GET',
    });
    console._log(`[Log Info]: Server (${LOG_SERVER_IP}) is reachable`);
    return true;
  } catch (error) {
    console._warn(`[Log Error]: Server (${LOG_SERVER_IP}) is not reachable`, error);
    return false;
  }
}

// Helper-Function to send log to server
async function sendLogToServer(level: 'Info' | 'Warn' | 'Error', message: string): Promise<void> {
  if (!LOG_SERVER_IP) {
    console._warn('[Log Error]: LOG_SERVER_URL is not set');
    return;
  }

  try {
    const logPayload: LogPayload = {
      level,
      message,
      platform: Platform.OS, // PLatfrom.OS is either 'android' or 'ios'
      device_name: Constants.deviceName || 'Unknown Device', // Device name
      timestamp: new Date().toISOString(), //  Current timestamp
    };

    await fetch(`http://${LOG_SERVER_IP}:19000/logs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(logPayload),
    });
  } catch (error) {
    console._warn('[Log Error]:', error);
  }
}

// Custom Log-Functions
function customLog(...args: unknown[]): void {
  // Call native console
  console._log('[Custom Log]:', ...args);

  // Concatenate message and send to server
  const message = args.map(arg => (typeof arg === 'string' ? arg : JSON.stringify(arg))).join(' ');
  sendLogToServer('Info', message);
}

function customWarn(...args: unknown[]): void {
  // Call native console
  console._warn('[Custom Warn]:', ...args);

  // Concatenate message and send to server
  const message = args.map(arg => (typeof arg === 'string' ? arg : JSON.stringify(arg))).join(' ');
  sendLogToServer('Warn', message);
}

function customError(...args: unknown[]): void {
  // Call native console
  console._error('[Custom Error]:', ...args);

  // Concatenate message and send to server
  const message = args.map(arg => (typeof arg === 'string' ? arg : JSON.stringify(arg))).join(' ');
  sendLogToServer('Error', message);
}

// Save native console methods
console._log = console.log;
console._warn = console.warn;
console._error = console.error;

(async function initializeCustomLogger() {
  const serverReachable = await testServerConnection();
  if (serverReachable) {
    console.log = customLog;
    console.warn = customWarn;
    console.error = customError;
    await sendLogToServer('Info', 'Custom Logger initialized');
  } else {
    console.log('[Log Info]: Using native console methods as server is unavailable');
  }
})();
// Export custom log functions
export { customLog, customWarn, customError };
