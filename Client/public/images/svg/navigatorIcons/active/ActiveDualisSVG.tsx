import * as React from "react"
import Svg, { Path } from "react-native-svg"

function ActiveDualisSVG(props: any) {
  return (
    <Svg
      height={512}
      viewBox="0 0 24 24"
      width={512}
      xmlns="http://www.w3.org/2000/svg"
      data-name="Layer 1"
      {...props}
    >
      <Path d="M24 8.48V20a1 1 0 01-2 0v-8.248l-7.4 3.536a5 5 0 01-2.577.694 5.272 5.272 0 01-2.7-.739l-7.38-3.513a3.691 3.691 0 01-.084-6.455c.027-.016.056-.031.084-.045L9.4 1.672a5.226 5.226 0 015.282.045l7.375 3.513A3.767 3.767 0 0124 8.48zm-11.978 9.5a7.26 7.26 0 01-3.645-.972L4 14.919v2.7a5.007 5.007 0 003.519 4.778A15.557 15.557 0 0012 23a15.557 15.557 0 004.481-.607A5.007 5.007 0 0020 17.615v-2.691l-4.459 2.13a6.983 6.983 0 01-3.519.928z" />
    </Svg>
  )
}

export default ActiveDualisSVG