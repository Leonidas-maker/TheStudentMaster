import { RouteProp } from "@react-navigation/native";

// ====================================================== //
// ================ Interfaces defintions =============== //
// ====================================================== //
interface DualisRouteParams {
  moduleData: ModuleData[];
  gpaData: GpaData;
  ectsData: EctsData;
  semesterData: SemesterData;
  gradeData: GradeData[];
  gpaSemesterData: GpaSemesterData[];
}

interface ModuleData {
  number: string;
  name: string;
  ects: string;
  grade: string;
  passed: boolean;
}

interface GpaData {
  gpaTotal: string;
  gpaSubject: string;
}

interface EctsData {
  ectsTotal: string;
  ectsSum: string;
}

interface SemesterData {
  semester: Array<{ name: string; value: string }>;
}

interface GradeData {
  number: string;
  name: string;
  grade: string;
  ects: string;
  status: string;
  detail: string;
  semester: string;
  detailGrade: Array<{
    semester: string;
    exam: string;
    date: string;
    grade: string;
  }>;
}

interface GpaSemesterData {
  semester: string;
  name: string;
  grade: string;
  ects: string;
}

// ====================================================== //
// ================== Interfaces export ================= //
// ====================================================== //
export {
  DualisRouteParams,
  ModuleData,
  GpaData,
  EctsData,
  SemesterData,
  GradeData,
  GpaSemesterData,
};
