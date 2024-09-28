// ~~~~~~~~~~~~~~~ Imports ~~~~~~~~~~~~~~~ //
import { Parser } from "htmlparser2";

// ~~~~~~~~~~ Interfaces imports ~~~~~~~~~ //
import { ModuleData } from "../../interfaces/dualisInterfaces";

export const filterPerformanceOverview = (
  html: string,
  setModuleData: React.Dispatch<React.SetStateAction<Array<ModuleData>>>,
) => {
  const extractedModules: Array<ModuleData> = [];
  let currentModule: ModuleData = {
    number: "",
    name: "",
    ects: "",
    grade: "",
    passed: false,
  };
  let currentTdIndex = 0;
  let insideClassTr = false;
  let insideAnchorTag = false;

  const parser = new Parser({
    onopentag(name, attribs) {
      if (name === "tr" && !attribs.class?.includes("subhead")) {
        currentTdIndex = 0;
        insideClassTr = true;
        currentModule = {
          number: "",
          name: "",
          ects: "",
          grade: "",
          passed: false,
        }; // Reset module
      }

      // Check if we are inside an anchor tag (either for module name or passed status)
      insideAnchorTag = name === "a" && attribs.id?.startsWith("result_id_");

      // Set module as passed if an image with title "Bestanden" is found
      if (name === "img" && attribs.title === "Bestanden") {
        currentModule.passed = true;
      }
    },
    ontext(text) {
      const cleanText = text.trim();
      if (!cleanText || !insideClassTr) return; // Skip empty text or if not inside the relevant row

      if (insideAnchorTag) {
        currentModule.name = cleanText; // Extract module name from <a> tag
      } else {
        // Handle the text based on current index within the row
        switch (currentTdIndex) {
          case 0:
            currentModule.number = cleanText; // Module number
            break;
          case 1:
            if (!currentModule.name) currentModule.name = cleanText; // Fallback for module name directly in <td>
            break;
          case 3:
            currentModule.ects = cleanText; // ECTS points
            break;
          case 4:
            currentModule.grade = cleanText; // Grade
            break;
        }
      }
    },
    onclosetag(tagname) {
      if (tagname === "td") currentTdIndex++; // Move to next <td> in the row

      if (tagname === "tr" && insideClassTr) {
        if (currentModule.name) extractedModules.push({ ...currentModule }); // Only add module if name exists
        insideClassTr = false; // Reset after processing the row
      }
    },
  });

  parser.write(html);
  parser.end();

  setModuleData(extractedModules);
};
