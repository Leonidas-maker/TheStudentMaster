import * as React from "react";
import Svg, { Path } from "react-native-svg";

function ActiveOverviewSVG(props: any) {
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      x="0px"
      y="0px"
      viewBox="0 0 512 512"
      xmlSpace="preserve"
      width={512}
      height={512}
      enableBackground="new 0 0 512 512"
      {...props}
    >
      <Path d="M85.333 0h64c47.128 0 85.333 38.205 85.333 85.333v64c0 47.128-38.205 85.333-85.333 85.333h-64C38.205 234.667 0 196.462 0 149.333v-64C0 38.205 38.205 0 85.333 0zM362.667 0h64C473.795 0 512 38.205 512 85.333v64c0 47.128-38.205 85.333-85.333 85.333h-64c-47.128 0-85.333-38.205-85.333-85.333v-64C277.333 38.205 315.538 0 362.667 0zM85.333 277.333h64c47.128 0 85.333 38.205 85.333 85.333v64c0 47.128-38.205 85.333-85.333 85.333h-64C38.205 512 0 473.795 0 426.667v-64c0-47.129 38.205-85.334 85.333-85.334zM362.667 277.333h64c47.128 0 85.333 38.205 85.333 85.333v64C512 473.795 473.795 512 426.667 512h-64c-47.128 0-85.333-38.205-85.333-85.333v-64c-.001-47.129 38.204-85.334 85.333-85.334z" />
    </Svg>
  );
}

export default ActiveOverviewSVG;
