// ~~~~~~~~~~~~~~~ Imports ~~~~~~~~~~~~~~~ //
import { Parser } from "htmlparser2";

// ~~~~~~~~~~ Interfaces imports ~~~~~~~~~ //
import { EctsData } from "../../interfaces/dualisInterfaces";

export const filterECTS = (
  html: string,
) => {
  let ectsTotal = "";
  let ectsSum = "";
  let currentTdIndex = 0;
  let level00Index = 0;
  let insideEctsTable = false;

  const parser = new Parser({
    onopentag(name, attribs) {
      if (name === "td" && attribs.class === "level00") {
        insideEctsTable = true;
      }
    },
    ontext(text) {
      const cleanText = text.trim();

      if (!cleanText || !insideEctsTable) return;

      if (insideEctsTable && currentTdIndex === 2 && level00Index === 2) {
        const extractedNumber = cleanText.split(",")[0];
        ectsSum = extractedNumber;
      }

      if (insideEctsTable && currentTdIndex === 0 && level00Index === 5) {
        const extractedNumber = cleanText.match(/(\d+)/)?.[0];
        if (extractedNumber) ectsTotal = extractedNumber;
      }
    },
    onclosetag(tagname) {
      // Maybe not so efficient, but it works (resets index after every tr and not after specific tr)
      if (tagname === "tr") {
        currentTdIndex = 0;
      }

      if (tagname === "td" && insideEctsTable && currentTdIndex === 3) {
        level00Index++;
        currentTdIndex = 0;
        insideEctsTable = false;
      } else if (tagname === "td" && insideEctsTable) {
        level00Index++;
        currentTdIndex++;
        insideEctsTable = false;
      }
    },
  });

  parser.write(html);
  parser.end();
  return { ectsTotal, ectsSum };
};
