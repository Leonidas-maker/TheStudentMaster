// ====================================================== //
// ================ Interfaces defintions =============== //
// ====================================================== //
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
  detailGrade: Array<{ semester: string; name: string; exam: string; date: string; grade: string }>;
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
export { ModuleData, GpaData, EctsData, SemesterData, GradeData, GpaSemesterData };
