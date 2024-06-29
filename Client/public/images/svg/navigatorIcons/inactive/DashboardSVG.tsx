import * as React from "react";
import Svg, { Path } from "react-native-svg";

function DashboardSVG(props: any) {
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={512}
      height={512}
      {...props}
    >
      <Path d="M2 11h11a2 2 0 002-2V2a2 2 0 00-2-2H2a2 2 0 00-2 2v7a2 2 0 002 2zm0-9h11v7H2zM22 0h-3a2 2 0 00-2 2v7a2 2 0 002 2h3a2 2 0 002-2V2a2 2 0 00-2-2zm0 9h-3V2h3zM5 13H2a2 2 0 00-2 2v7a2 2 0 002 2h3a2 2 0 002-2v-7a2 2 0 00-2-2zm0 9H2v-7h3zM22 13H11a2 2 0 00-2 2v7a2 2 0 002 2h11a2 2 0 002-2v-7a2 2 0 00-2-2zm0 9H11v-7h11z" />
    </Svg>
  );
}

export default DashboardSVG;
