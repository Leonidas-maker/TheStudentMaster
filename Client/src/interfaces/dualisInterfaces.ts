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

// ====================================================== //
// ================== Interfaces export ================= //
// ====================================================== //
export { ModuleData, GpaData, EctsData, SemesterData };
