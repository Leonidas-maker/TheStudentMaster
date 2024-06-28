// ~~~~~~~~~~~~~~~ Imports ~~~~~~~~~~~~~~~ //
import React, { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import axios from 'axios';
import { load } from 'cheerio';

// ~~~~~~~~ Own components imports ~~~~~~~ //
import DefaultText from "../../components/textFields/DefaultText";
import TextFieldInput from '../../components/textInputs/TextFieldInput';
import DefaultButton from '../../components/buttons/DefaultButton';
import Heading from '../../components/textFields/Heading';

// Define the base URL for the Dualis API
const BASE_URL = 'https://dualis.dhbw.de';

// Create an axios instance with specific configuration
//? Not sure if we really need this
const axiosInstance = axios.create({
  maxRedirects: 5,
  validateStatus: function (status) {
    return status >= 200 && status < 300;
  },
});

// ====================================================== //
// ====================== Component ===================== //
// ====================================================== //
// TODO: Filter out the HTML content to display only the relevant data
//! Login is working, get all semester data is working, but the HTML content is not filtered
const Dualis: React.FC = () => {
  // State hooks for managing form inputs, HTML content, semester data, and errors
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [htmlContent, setHtmlContent] = useState('');
  const [semesterData, setSemesterData] = useState<Array<{ semester: string, data: string }>>([]);
  const [error, setError] = useState('');

  // Function to handle login
  //? The login function is working, but needs to be sourced out to a service file
  const login = async () => {
    try {
      const url = `${BASE_URL}/scripts/mgrqispi.dll`;

      // Prepare form data for the login request
      const formData = new URLSearchParams();
      formData.append('usrname', username);
      formData.append('pass', password);
      formData.append('APPNAME', 'CampusNet');
      formData.append('PRGNAME', 'LOGINCHECK');
      formData.append('ARGUMENTS', 'clino,usrname,pass,menuno,menu_type,browser,platform');
      formData.append('clino', '000000000000001');
      formData.append('menuno', '000324');
      formData.append('menu_type', 'classic');
      formData.append('browser', '');
      formData.append('platform', '');

      // Make a POST request to the login URL with form data
      const response = await axiosInstance.post(url, formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      const content = response.data;
      const status = response.status;

      // Check if login was successful
      if (status !== 200 || content.length > 500) {
        setError('Login failed. Please check your credentials.');
        return;
      }

      setError('');
      setHtmlContent(content);

      // Extract authentication arguments from the response header and fetch semester options
      const authArguments = extractAuthArguments(response.headers['refresh']);
      fetchSemesterOptions(authArguments);
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error(err);
    }
  };

  // Function to extract authentication arguments from the refresh header
  const extractAuthArguments = (refreshHeader: string) => {
    if (refreshHeader) {
      return refreshHeader.slice(84).replace('-N000000000000000', '');
    }
    return '';
  };

  // Function to fetch semester options
  const fetchSemesterOptions = async (authArguments: string) => {
    try {
      const url = `${BASE_URL}/scripts/mgrqispi.dll?APPNAME=CampusNet&PRGNAME=COURSERESULTS&ARGUMENTS=${authArguments}`;
      const response = await axiosInstance.get(url);
      const content = response.data;

      // Parse the HTML content to extract semester options
      const $ = load(content);
      const semesterOptions: Array<{ value: string, text: string }> = [];

      $('#semester option').each((index, element) => {
        const value = $(element).attr('value') ?? '';
        const text = $(element).text() ?? '';
        semesterOptions.push({ value, text });
      });

      setError('');
      // Fetch data for all semesters
      fetchAllSemesterData(authArguments, semesterOptions);
    } catch (err) {
      setError('An error occurred while fetching semester options. Please try again.');
      console.error(err);
    }
  };

  // Function to fetch data for all semesters
  const fetchAllSemesterData = async (authArguments: string, semesterOptions: Array<{ value: string, text: string }>) => {
    try {
      const allSemesterData: Array<{ semester: string, data: string }> = [];

      for (const semester of semesterOptions) {
        const url = `${BASE_URL}/scripts/mgrqispi.dll?APPNAME=CampusNet&PRGNAME=COURSERESULTS&ARGUMENTS=${authArguments}-N${semester.value}`;
        const response = await axiosInstance.get(url);
        const content = response.data;
        allSemesterData.push({ semester: semester.text, data: content });
      }

      setSemesterData(allSemesterData);
      console.log(allSemesterData);
    } catch (err) {
      setError('An error occurred while fetching semester data. Please try again.');
      console.error(err);
    }
  };

  // ====================================================== //
  // ================== Return component ================== //
  // ====================================================== //
  return (
    <ScrollView className="h-screen bg-light_primary dark:bg-dark_primary">
      <Heading text='Bei Dualis anmelden' />
      <View className='items-center'>
        <TextFieldInput
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />
        <TextFieldInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <DefaultButton text="Login" onPress={login} />
      </View>
      {error ? <Text className="text-red-500 mt-4">{error}</Text> : null}
      <View className="mt-4 p-4 border border-gray-300 rounded w-full">
        <DefaultText text={htmlContent} />
      </View>
      {semesterData.length > 0 && semesterData.map((semester, index) => (
        <View key={index} className="mt-4 p-4 border border-gray-300 rounded w-full">
          <DefaultText text={semester.semester} />
          <DefaultText text={semester.data} />
        </View>
      ))}
    </ScrollView>
  );
};

export default Dualis;