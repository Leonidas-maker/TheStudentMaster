import * as React from "react";
import Svg, { Path } from "react-native-svg";

function ActiveFlashcardsSVG(props: any) {
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      data-name="Layer 1"
      viewBox="0 0 24 24"
      width={512}
      height={512}
      {...props}
    >
      <Path d="M16.4 13.17a3.905 3.905 0 00-2.77-1.15H12v1.63c0 1.04.41 2.04 1.15 2.77l6.84 6.84c.85.85 2.24 1.01 3.17.25 1.07-.88 1.13-2.46.18-3.41l-6.93-6.93zM.1 6C.57 3.72 2.59 2 5 2h14c2.41 0 4.43 1.72 4.9 4H.1zM24 8v9c0 .3-.03.59-.08.87l-6.11-6.11a5.926 5.926 0 00-4.19-1.73H11c-.55 0-1 .45-1 1v2.63c0 1.57.62 3.08 1.73 4.19l4.16 4.16H5c-2.76 0-5-2.24-5-5V8h24z" />
    </Svg>
  );
}

export default ActiveFlashcardsSVG;
