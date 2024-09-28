import { Parser } from "htmlparser2";

// ~~~~~~~~~~ Interfaces imports ~~~~~~~~~ //
import { GradeData } from "../../interfaces/dualisInterfaces";

export const filterGrade = (
    html: Array<{ name: string; html: string; }>,
    setGradeData: React.Dispatch<React.SetStateAction<GradeData[]>>
) => {
    let gradeList: GradeData[] = [];

    let number = "";
    let name = "";
    let grade = "";
    let ects = "";
    let status = "";
    let detail = "";
    let currentTrIndex = 0;
    let currentTdIndex = 0;
    let currentThIndex = 0;
    let currentThead = false;
    let validTr = false;
    let lastTr = false;
    let insideScriptTag = false;
    let scriptContent = "";      


    const parser = new Parser({
        onopentag(name, attribs) {
            if (name === "thead") {
                currentThead = true;
            }

            if (name === "tr" && attribs.class !== "tbsubhead") {
                validTr = true;
            };

            if (name === "th" && validTr && attribs.colspan === "2") {
                lastTr = true;
            };

            if (name === "script") {
                insideScriptTag = true;
                scriptContent = "";
            }
        },
        ontext(text) {
            const cleanText = text.trim();

            if (insideScriptTag) {
                scriptContent += cleanText;
                return;
            }

            if (!cleanText || !validTr || currentThead) return;

            if (validTr && !lastTr && !currentThead) {
                switch (currentTdIndex) {
                    case 0:
                        number = cleanText;
                        //console.debug("Number: ", number);
                        break;
                    case 1:
                        name = cleanText;
                        //console.debug("Name: ", name);
                        break;
                    case 2:
                        grade = cleanText;
                        //console.debug("Grade: ", grade);
                        break;
                    case 3:
                        ects = cleanText;
                        //console.debug("Ects: ", ects);
                        break;
                    case 4:
                        status = cleanText;
                        //console.debug("Status: ", status);
                        break;
                }
            }
        },
        onclosetag(tagname) {
            if (tagname === "td") {
                currentTdIndex++;
            };

            if (tagname === "th") {
                currentThIndex++;
            };

            if (tagname === "tr") {
                if (validTr && !lastTr && number && name && grade && ects) {
                    gradeList.push({
                        number,
                        name,
                        grade,
                        ects,
                        status,
                        detail
                    });

                    number = "";
                    name = "";
                    grade = "";
                    ects = "";
                    status = "";
                    detail = "";
                }

                validTr = false;
                lastTr = false;
                currentTrIndex++;
                currentTdIndex = 0;
                currentThIndex = 0;
            };

            if (tagname === "thead") {
                currentThead = false;
            };

            if (tagname === "script" && scriptContent.includes("dl_popUp")) {
                console.debug("JavaScript dl_popUp detected in script tag.");

                console.debug("Full Script Content: ", JSON.stringify(scriptContent));

                const urlMatch = scriptContent.match(/dl_popUp\s*\(\s*"([^"]+)"\s*,/);

                if (urlMatch && urlMatch[1]) {
                    detail = urlMatch[1];
                    console.debug("Extracted URL from script: ", detail);
                } else {
                    detail = "No URL found";
                    console.debug("No URL found in script content.");
                }

                insideScriptTag = false;
            }
        },
    });

    html.forEach(item => {
        parser.write(item.html);
    });
    parser.end();

    setGradeData((prevData) => [...prevData, ...gradeList]);
};