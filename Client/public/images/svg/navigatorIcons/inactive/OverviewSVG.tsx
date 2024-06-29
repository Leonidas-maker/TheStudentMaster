import * as React from "react";
import Svg, { Path } from "react-native-svg";

function OverviewSVG(props: any) {
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={512}
      height={512}
      {...props}
    >
      <Path d="M7 0H4a4 4 0 00-4 4v3a4 4 0 004 4h3a4 4 0 004-4V4a4 4 0 00-4-4zm2 7a2 2 0 01-2 2H4a2 2 0 01-2-2V4a2 2 0 012-2h3a2 2 0 012 2zM20 0h-3a4 4 0 00-4 4v3a4 4 0 004 4h3a4 4 0 004-4V4a4 4 0 00-4-4zm2 7a2 2 0 01-2 2h-3a2 2 0 01-2-2V4a2 2 0 012-2h3a2 2 0 012 2zM7 13H4a4 4 0 00-4 4v3a4 4 0 004 4h3a4 4 0 004-4v-3a4 4 0 00-4-4zm2 7a2 2 0 01-2 2H4a2 2 0 01-2-2v-3a2 2 0 012-2h3a2 2 0 012 2zM20 13h-3a4 4 0 00-4 4v3a4 4 0 004 4h3a4 4 0 004-4v-3a4 4 0 00-4-4zm2 7a2 2 0 01-2 2h-3a2 2 0 01-2-2v-3a2 2 0 012-2h3a2 2 0 012 2z" />
    </Svg>
  );
}

export default OverviewSVG;
