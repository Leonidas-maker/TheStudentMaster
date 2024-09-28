// ~~~~~~~~~~~~~~~ Imports ~~~~~~~~~~~~~~~ //
import { Parser } from 'htmlparser2';

// ~~~~~~~~~~ Interfaces imports ~~~~~~~~~ //
import { GpaData } from '../../interfaces/dualisInterfaces';

export const filterGPA = (
    html: string,
    setGpaData: React.Dispatch<React.SetStateAction<GpaData>>
) => {
    let gpaTotal = '';
    let gpaSubject = '';
    let currentTableIndex = 0;
    let currentTrIndex = 0;
    let currentThIndex = 0;
    let insideGpaTable = false;

    const parser = new Parser({
        onopentag(name, attribs) {
            if (name === 'table' && attribs.class === 'nb list students_results') {
                insideGpaTable = true;
            }
        },
        ontext(text) {
            const cleanText = text.trim();

            if (!cleanText || !insideGpaTable) return;

            if (currentTableIndex === 1 && currentTrIndex === 0 && currentThIndex === 1) {
                gpaTotal = cleanText;
            };

            if (currentTableIndex === 1 && currentTrIndex === 1 && currentThIndex === 1) {
                gpaSubject = cleanText;
            };
        },
        onclosetag(tagname) {
            if (tagname === "tr" && insideGpaTable && currentTableIndex === 1) {
                currentThIndex = 0;
                currentTrIndex++;
            };

            if (tagname === "th" && insideGpaTable && currentTableIndex === 1) {
                currentThIndex++;
            };

            if (tagname === "table" && insideGpaTable) {
                insideGpaTable = false;
                currentTrIndex = 0;
                currentTableIndex++;
            };
        },
    });

    parser.write(html);
    parser.end();

    setGpaData({
        gpaTotal: gpaTotal,
        gpaSubject: gpaSubject
    });
};