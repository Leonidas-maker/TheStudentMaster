import * as React from "react"
import Svg, { Path } from "react-native-svg"

function MealPlanSVG(props: any) {
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      data-name="Layer 1"
      viewBox="0 0 24 24"
      width={512}
      height={512}
      {...props}
    >
      <Path d="M1.333 7.238C.484 5.522-1.2 1.269 1.2.15a1.949 1.949 0 012.129.423l4.96 5.3A1 1 0 116.887 7.3L2 2.08c.119 3.777 2.343 6.6 4.841 9.439a1 1 0 01-1.39 1.446 24.522 24.522 0 01-4.118-5.727zM18.005 16.2a1.259 1.259 0 00-1.09-.4 8.055 8.055 0 01-3.458-.29.985.985 0 00-.981.254c-1.494 2.256 3.274 2.113 4.312 2.08l5.483 5.839a1 1 0 001.458-1.371zM15 14a4.99 4.99 0 003.536-1.462l5.171-5.172a1 1 0 10-1.414-1.416l-5.171 5.172a3 3 0 01-3.406.576l6.991-6.991a1 1 0 10-1.414-1.414L12.3 10.284a3 3 0 01.576-3.406l5.174-5.171A1 1 0 0016.636.293l-5.172 5.171a5.01 5.01 0 00-.635 6.293L.293 22.293a1 1 0 001.414 1.414l10.536-10.536A5 5 0 0015 14z" />
    </Svg>
  )
}

export default MealPlanSVG