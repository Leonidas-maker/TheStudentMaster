import axios from "axios";
import { filterPerformanceOverview } from "../../scraper/dualis/performanceOverviewScraper";
import { filterGPA } from "../../scraper/dualis/gpaScraper";
import { filterECTS } from "../../scraper/dualis/ectsScraper";
import { filterSemester } from "../../scraper/dualis/semesterScraper";
import { filterGrade } from "../../scraper/dualis/gradeScraper";
import { filterDetailGrade } from "../../scraper/dualis/detailGradeScraper";
import {
  ModuleData,
  GpaData,
  EctsData,
  SemesterData,
  GradeData,
  GpaSemesterData,
} from "../../interfaces/dualisInterfaces";

// Define the base URL for the Dualis API
const BASE_URL = "https://dualis.dhbw.de";

// Create an axios instance with specific configuration
const axiosInstance = axios.create({
  maxRedirects: 5,
  validateStatus: function (status) {
    return status >= 200 && status < 300;
  },
});

export const navigateToPerformanceOverview = async (
  authArguments: string,
  setHtmlContent: (html: string) => void,
  setModuleData: React.Dispatch<React.SetStateAction<ModuleData[]>>,
  setGpaData: React.Dispatch<React.SetStateAction<GpaData>>,
  setEctsData: React.Dispatch<React.SetStateAction<EctsData>>,
  setProgress: (progress: number) => void,
  setError: (msg: string) => void
) => {
  setProgress(0.25);
  try {
    const performanceUrl = `${BASE_URL}/scripts/mgrqispi.dll?APPNAME=CampusNet&PRGNAME=STUDENT_RESULT&ARGUMENTS=${authArguments},-N000310,-N0,-N000000000000000,-N000000000000000,-N000000000000000,-N0,-N000000000000000`;
    const response = await axiosInstance.get(performanceUrl);
    const content = response.data;

    setHtmlContent(content);
    setModuleData(prevModules => {
      filterPerformanceOverview(content, modules => modules);
      return prevModules;
    });
    setProgress(0.26);
    setGpaData(prevGpa => {
      filterGPA(content, gpa => gpa);
      return prevGpa;
    });
    setProgress(0.28);
    setEctsData(prevEcts => {
      filterECTS(content, ects => ects);
      return prevEcts;
    });
    setProgress(0.3);
  } catch (err) {
    setError("An error occurred while navigating to the performance overview. Please try again.");
    console.error(err);
  }
};

export const navigateToExamResults = async (
  authArguments: string,
  setHtmlContent: (html: string) => void,
  setSemesterData: React.Dispatch<React.SetStateAction<SemesterData>>,
  setProgress: (progress: number) => void,
  setError: (msg: string) => void
) => {
  setProgress(0.35);
  try {
    const examResultsUrl = `${BASE_URL}/scripts/mgrqispi.dll?APPNAME=CampusNet&PRGNAME=COURSERESULTS&ARGUMENTS=${authArguments},-N000307`;
    const response = await axiosInstance.get(examResultsUrl);
    const content = response.data;

    setHtmlContent(content);
    setSemesterData(prevSemester => {
      filterSemester(content, semester => semester);
      return prevSemester;
    });
    setProgress(0.4);
  } catch (err) {
    setError("An error occurred while navigating to the exam results. Please try again.");
    console.error(err);
  }
};

export const navigateThroughSemesters = async (
    authArguments: string,
    semesterArray: Array<{ name: string; value: string }>,
    setHtmlContent: (html: string) => void,
    setGradeData: React.Dispatch<React.SetStateAction<GradeData[]>>,
    setGpaSemesterData: React.Dispatch<React.SetStateAction<GpaSemesterData[]>>, // This was missing
    setProgress: (progress: number) => void,
    setError: (msg: string) => void
  ) => {
    setProgress(0.45);
    try {
      let allSemesterData: Array<{ name: string; html: string }> = [];
  
      for (const sem of semesterArray) {
        const semesterUrl = `${BASE_URL}/scripts/mgrqispi.dll?APPNAME=CampusNet&PRGNAME=COURSERESULTS&ARGUMENTS=${authArguments},-N${sem.value},-N000307`;
        const response = await axiosInstance.get(semesterUrl);
        const content = response.data;
  
        allSemesterData.push({ name: sem.name, html: content });
  
        const progressUpdate =
          0.45 + (0.25 * (semesterArray.indexOf(sem) + 1)) / semesterArray.length;
        setProgress(progressUpdate);
      }
  
      // Pass both setGradeData and setGpaSemesterData to filterGrade
      filterGrade(allSemesterData, setGradeData, setGpaSemesterData);
  
      setHtmlContent(JSON.stringify(allSemesterData));
    } catch (err) {
      setError("An error occurred while navigating through the semesters. Please try again.");
      console.error(err);
    }
  };  

  export const navigateThroughGradeDetails = async (
    gradeData: GradeData[],
    setHtmlContent: (html: string) => void,
    setGradeData: React.Dispatch<React.SetStateAction<GradeData[]>>,
    setProgress: (progress: number) => void,
    setError: (msg: string) => void,
    setLoading: (loading: boolean) => void
  ) => {
    setProgress(0.75);
    try {
      let updatedGradeData = [...gradeData];
  
      for (let i = 0; i < updatedGradeData.length; i++) {
        const grade = updatedGradeData[i];
  
        const detailUrl = `${BASE_URL}${grade.detail}`;
        const response = await axiosInstance.get(detailUrl);
        const content = response.data;
  
        const detailGradeData = filterDetailGrade(content, grade);
        updatedGradeData[i] = detailGradeData;
  
        const progressUpdate = 0.75 + (0.25 * (i + 1)) / updatedGradeData.length;
        setProgress(progressUpdate);
      }
  
      setGradeData(prevGradeData => updatedGradeData);
      setHtmlContent(JSON.stringify(updatedGradeData, null, 2));
      setProgress(1);
    } catch (err) {
      setError("An error occurred while navigating through the grade details. Please try again.");
      console.error(err);
    }
    setLoading(false);
  };