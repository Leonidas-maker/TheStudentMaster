import * as React from "react";
import Svg, { Path } from "react-native-svg";

function ActiveMealPlanSVG(props: any) {
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      data-name="Layer 1"
      viewBox="0 0 24 24"
      width={512}
      height={512}
      {...props}
    >
      <Path d="M13 12.414L1.447 23.978.034 22.564 11.586 11l-.706-.707a3.005 3.005 0 010-4.243l6.065-6.072 1.413 1.414-6.065 6.072a1 1 0 000 1.415l.707.707 6.773-6.78 1.413 1.415L14.412 11l.706.707a1 1 0 001.414 0L22.6 5.635l1.41 1.415-6.065 6.071a3 3 0 01-4.239 0zM6.143 13.62l2.689-2.692a4.94 4.94 0 01-.328-4.9L3.336.572A1.948 1.948 0 00.01 1.95a10.985 10.985 0 001.333 5.288 23.638 23.638 0 004.8 6.382zM15.825 16a4.956 4.956 0 01-2.754-.828l-1.7 1.7a11.311 11.311 0 005.415.972l5.748 6.109 1.456-1.37-6.535-6.878a4.981 4.981 0 01-1.63.295z" />
    </Svg>
  );
}

export default ActiveMealPlanSVG;
