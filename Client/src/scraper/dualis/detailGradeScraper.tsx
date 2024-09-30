import { Parser } from "htmlparser2";

// ~~~~~~~~~~ Interfaces imports ~~~~~~~~~ //
import { GradeData } from "../../interfaces/dualisInterfaces";

export const filterDetailGarde = (html: string) => {
  const parser = new Parser({
    onopentag(name, attribs) {},
    ontext(text) {
      const cleanText = text.trim();

      if (!cleanText) return;
    },
    onclosetag(tagname) {},
  });

  parser.write(html);
  parser.end();
};
