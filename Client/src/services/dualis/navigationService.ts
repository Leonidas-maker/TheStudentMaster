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

const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

// Create an axios instance with specific configuration
const axiosInstance = axios.create({
  maxRedirects: 5,
  baseURL: "https://dualis.dhbw.de", // Define the base URL for the Dualis API
  validateStatus: function (status) {
    return status >= 200 && status < 300;
  },
});

export const navigateToPerformanceOverview = async (
  authArguments: string,
  setProgress: (progress: number) => void,
  setError: (msg: string) => void,
  setLoad: (load: string) => void,
): Promise<{
  moduleData: ModuleData[];
  gpaData: GpaData;
  ectsData: EctsData;
}> => {
  setProgress(0.25);
  setLoad("Leistungsübersicht");
  try {
    const performanceUrl = `/scripts/mgrqispi.dll?APPNAME=CampusNet&PRGNAME=STUDENT_RESULT&ARGUMENTS=${authArguments},-N000310,-N0,-N000000000000000,-N000000000000000,-N000000000000000,-N0,-N000000000000000`;
    const response = await axiosInstance.get(performanceUrl);
    const content = response.data;

    // Set the filtered module data directly
    const moduleData = filterPerformanceOverview(content);
    setProgress(0.26);

    // Set the filtered GPA data directly
    const gpaData = filterGPA(content);
    setProgress(0.28);

    // Set the filtered ECTS data directly
    const ectsData = filterECTS(content);
    setProgress(0.3);

    return { moduleData, gpaData, ectsData };
  } catch (err) {
    setError(
      "An error occurred while navigating to the performance overview. Please try again.",
    );
    console.error(err);

    return {
      moduleData: [],
      gpaData: { gpaTotal: "", gpaSubject: "" },
      ectsData: { ectsTotal: "", ectsSum: "" },
    };
  }
};

export const navigateToExamResults = async (
  authArguments: string,
  setProgress: (progress: number) => void,
  setError: (msg: string) => void,
  setLoad: (load: string) => void,
): Promise<SemesterData> => {
  setProgress(0.35);
  setLoad("Semester");
  try {
    const examResultsUrl = `/scripts/mgrqispi.dll?APPNAME=CampusNet&PRGNAME=COURSERESULTS&ARGUMENTS=${authArguments},-N000307`;
    const response = await axiosInstance.get(examResultsUrl);
    const content = response.data;

    // Directly filter and update the semesterData state
    const semesterData = filterSemester(content);

    setProgress(0.4);
    return semesterData;
  } catch (err) {
    setError(
      "An error occurred while navigating to the exam results. Please try again.",
    );
    console.error(err);
    return { semester: [] };
  }
};

export const navigateThroughSemesters = async (
  authArguments: string,
  semesterArray: Array<{ name: string; value: string }>,
  setProgress: (progress: number) => void,
  setError: (msg: string) => void,
  setLoad: (load: string) => void,
): Promise<{ gradeData: GradeData[]; gpaSemesterData: GpaSemesterData[] }> => {
  setProgress(0.45);
  setLoad("Semester Daten");
  try {
    let allSemesterData: Array<{ name: string; html: string }> = [];

    // Mapping each semester request into an array of promises
    const promises = semesterArray.map(async (sem, i) => {
      await sleep((i / 2) * 10);

      const semesterUrl = `/scripts/mgrqispi.dll?APPNAME=CampusNet&PRGNAME=COURSERESULTS&ARGUMENTS=${authArguments},-N${sem.value},-N000307`;
      const response = await axiosInstance.get(semesterUrl);
      const content = response.data;

      // Add the fetched data to the array (using the index to avoid push during async)
      allSemesterData[i] = { name: sem.name, html: content };

      // Safely updating progress
      const progressUpdate = 0.45 + (0.25 * (i + 1)) / semesterArray.length;
      setProgress(progressUpdate);
    });

    // Wait for all promises to resolve
    await Promise.all(promises);

    const { gradeData, gpaSemesterData } = await filterGrade(allSemesterData);

    return { gradeData, gpaSemesterData };
  } catch (err) {
    setError(
      "An error occurred while navigating through the semesters. Please try again.",
    );
    console.error(err);
    return { gradeData: [], gpaSemesterData: [] };
  }
};

export const navigateThroughGradeDetails = async (
  gradeData: GradeData[],
  setProgress: (progress: number) => void,
  setError: (msg: string) => void,
  setLoad: (load: string) => void,
): Promise<GradeData[]> => {
  setProgress(0.75);
  setLoad("Semester Details");
  try {
    let updatedGradeData = [...gradeData];
    const promises = updatedGradeData.map(async (grade, i) => {
      await sleep((i / 2) * 10);

      const detailUrl = `${grade.detail}`;
      const response = await axiosInstance.get(detailUrl);
      const content = response.data;

      const detailGradeData = filterDetailGrade(content, grade);
      updatedGradeData[i] = detailGradeData;

      // Updating progress safely within the Promise
      const progressUpdate = 0.75 + (0.25 * (i + 1)) / updatedGradeData.length;
      setProgress(progressUpdate);
      return detailGradeData;
    });

    // Waiting for all promises to resolve
    const resolvedData = await Promise.all(promises);

    setProgress(1);
    return resolvedData;
  } catch (err) {
    setError(
      "An error occurred while navigating through the grade details. Please try again.",
    );
    console.error(err);
    return [];
  }
};
