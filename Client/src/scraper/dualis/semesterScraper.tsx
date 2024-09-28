// ~~~~~~~~~~~~~~~ Imports ~~~~~~~~~~~~~~~ //
import { Parser } from 'htmlparser2';

// ~~~~~~~~~~ Interfaces imports ~~~~~~~~~ //
import { SemesterData } from '../../interfaces/dualisInterfaces';

export const filterSemester = (
    html: string,
    setSemesterData: React.Dispatch<React.SetStateAction<SemesterData>>,
  ) => {
    let semester: Array<{ name: string, value: string }> = [];
    let insideSelect = false;
    let currentValue = "";

    const parser = new Parser({
        onopentag(name, attribs) {
            if (name === "select" && attribs.name === "semester" && attribs.id === "semester") {
                insideSelect = true;
            }

            if (insideSelect && name === "option" && attribs.value) {
                currentValue = attribs.value;
            }
        },
        ontext(text) {
            const cleanText = text.trim();

            if (!cleanText || !insideSelect) return;

            if (currentValue) {
                semester.push({ name: cleanText, value: currentValue });
                currentValue = "";
            }
        },
        onclosetag(tagname) {
            if (tagname === "select" && insideSelect) {
                insideSelect = false;
            }
        },
    });

    parser.write(html);
    parser.end();

    setSemesterData({
        semester: semester
    });
};
