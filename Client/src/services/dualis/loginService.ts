import axios from "axios";

// Define the base URL for the Dualis API
const BASE_URL = "https://dualis.dhbw.de";

// Create an axios instance with specific configuration
const axiosInstance = axios.create({
  maxRedirects: 5,
  validateStatus: function (status) {
    return status >= 200 && status < 300;
  },
});

// Extract auth arguments from the refresh header
export const extractAuthArguments = (refreshHeader: string) => {
  if (refreshHeader) {
    return refreshHeader.slice(84).replace("-N000000000000000", "");
  }
  return "";
};

export const loginDualis = async (
  username: string,
  password: string,
  saveCredentials: () => void,
  setError: (msg: string) => void,
  setAuthArguments: (authArgs: string) => void,
  saveLogin: boolean,
) => {
  try {
    const url = `${BASE_URL}/scripts/mgrqispi.dll`;

    const formData = new URLSearchParams();
    formData.append("usrname", username);
    formData.append("pass", password);
    formData.append("APPNAME", "CampusNet");
    formData.append("PRGNAME", "LOGINCHECK");
    formData.append(
      "ARGUMENTS",
      "clino,usrname,pass,menuno,menu_type,browser,platform",
    );
    formData.append("clino", "000000000000001");
    formData.append("menuno", "000324");
    formData.append("menu_type", "classic");
    formData.append("browser", "");
    formData.append("platform", "");

    const response = await axiosInstance.post(url, formData, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    const content = response.data;
    const status = response.status;

    if (status !== 200 || content.length > 500) {
      setError("Login failed. Please check your credentials.");
      return;
    }

    // Extract auth arguments and save them
    const authArgs = extractAuthArguments(response.headers["refresh"]);
    setAuthArguments(authArgs);

    // Save credentials after successful login
    if (saveLogin) {
      await saveCredentials();
    }
  } catch (err) {
    setError("An error occurred. Please try again.");
    console.error(err);
  }
};
