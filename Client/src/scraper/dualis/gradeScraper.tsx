import { Parser } from "htmlparser2";

// ~~~~~~~~~~ Interfaces imports ~~~~~~~~~ //
import { GradeData, GpaSemesterData } from "../../interfaces/dualisInterfaces";

export const filterGrade = (
  html: Array<{ name: string; html: string }>,
  setGradeData: React.Dispatch<React.SetStateAction<GradeData[]>>,
  setGpaSemesterData: React.Dispatch<React.SetStateAction<GpaSemesterData[]>>,
) => {
  let gradeList: GradeData[] = [];
  let gpaSemesterList: GpaSemesterData[] = [];

  let number = "";
  let name = "";
  let grade = "";
  let ects = "";
  let passed = false;
  let detail = "";
  let insideTboday = false;
  let lastTr = false;
  let currentTdIndex = 0;
  let currentThIndex = 0;
  let insideScriptTag = false;
  let scriptContent = "";
  let currentSemester = "";

  const parser = new Parser({
    onopentag(name, attribs) {
      if (name === "tbody") {
        insideTboday = true;
      }

      if (name === "th" && insideTboday && attribs.colspan === "2") {
        lastTr = true;
      }

      if (name === "script") {
        insideScriptTag = true;
        scriptContent = "";
      }
    },
    ontext(text) {
      const cleanText = text.trim();

      if (!cleanText || !insideTboday) return;

      if (insideScriptTag) {
        scriptContent += cleanText;
        return;
      }

      if (!lastTr) {
        switch (currentTdIndex) {
          case 0:
            number = cleanText;
            break;
          case 1:
            name = cleanText;
            break;
          case 2:
            grade = cleanText;
            break;
          case 3:
            ects = cleanText;
            break;
          case 4:
            if (cleanText === "bestanden") {
              passed = true;
            }
            break;
          case 5:
            detail = cleanText;
            break;
        }
      }

      if (lastTr) {
        switch (currentThIndex) {
          case 0:
            name = cleanText;
            break;
          case 1:
            grade = cleanText;
            break;
          case 2:
            ects = cleanText;
            break;
        }
      }
    },
    onclosetag(tagname) {
      if (tagname === "tbody") {
        insideTboday = false;
        currentTdIndex = 0;
        currentThIndex = 0;
      }

      if (tagname === "td" && insideTboday) {
        currentTdIndex++;
      }

      if (tagname === "th" && insideTboday && lastTr) {
        currentThIndex++;
      }

      if (tagname === "tr" && insideTboday && !lastTr) {
        lastTr = false;
        currentTdIndex = 0;
        gradeList.push({
          number: number,
          name: name,
          grade: grade,
          ects: ects,
          status: passed,
          detail: detail,
          semester: currentSemester,
          detailGrade: [],
        });

        number = "";
        name = "";
        grade = "";
        ects = "";
        status = "";
        detail = "";
      }

      if (tagname === "tr" && insideTboday && lastTr) {
        lastTr = false;
        gpaSemesterList.push({
          semester: currentSemester,
          name: name,
          grade: grade,
          ects: ects.split(",")[0],
        });

        name = "";
        grade = "";
        ects = "";
      }

      if (tagname === "tr" && lastTr) {
        currentTdIndex = 0;
        lastTr = false;
      }

      if (tagname === "script") {
        if (scriptContent.includes("dl_popUp")) {
          // Extract the script content for the detail URL
          const urlMatch = scriptContent.match(/dl_popUp\s*\(\s*"([^"]+)"\s*,/);
          detail = urlMatch && urlMatch[1] ? urlMatch[1] : "No URL found";
        }
        insideScriptTag = false;
      }
    },
  });

  html.forEach((item) => {
    currentSemester = item.name;

    parser.write(item.html);
  });
  parser.end();

  setGradeData((prevData) => [...prevData, ...gradeList]);
  setGpaSemesterData((prevData) => [...prevData, ...gpaSemesterList]);
};
