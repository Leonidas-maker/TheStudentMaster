import { Parser } from "htmlparser2";

// ~~~~~~~~~~ Interfaces imports ~~~~~~~~~ //
import { GradeData } from "../../interfaces/dualisInterfaces";

export const filterDetailGrade = (html: string, gradeData: GradeData) => {
  let semester = "";
  let exam = "";
  let date = "";
  let grade = "";
  let insideTable = false;
  let currentTableIndex = 0;
  let validTd = false;
  let currentTdIndex = 0;

  const parser = new Parser({
    onopentag(name, attribs) {
      if (name === "table" && currentTableIndex === 0) {
        insideTable = true;
      }

      if (name === "td" && attribs.class === "tbdata") {
        validTd = true;
      }
    },
    ontext(text) {
      const cleanText = text.trim();

      if (!cleanText || !insideTable || !validTd) return;

      switch (currentTdIndex) {
        case 0:
          semester = cleanText;
          break;
        case 1:
          exam = cleanText;
          break;
        case 2:
          date = cleanText;
          break;
        case 3:
          grade = cleanText;
          break;
      }
    },
    onclosetag(tagname) {
      if (tagname === "td") {
        validTd = false;
        currentTdIndex++;
      }

      if (tagname === "tr" && insideTable) {
        // Only push data if all fields are not empty
        if (semester || exam || date || grade) {
          gradeData.detailGrade.push({
            semester: semester || "",
            exam: exam || "",
            date: date || "",
            grade: grade || "",
          });
        }

        // Reset variables for the next entry
        semester = "";
        exam = "";
        date = "";
        grade = "";
        currentTdIndex = 0;
      }

      if (tagname === "table" && insideTable) {
        insideTable = false;
        currentTableIndex++;
      }
    },
  });

  parser.write(html);
  parser.end();

  return gradeData;
};
