import React from 'react'
import { animated } from 'react-spring/three'

class StorySegment extends React.Component {
  render() {
    return <animated.group position-y={this.props.factor}>{this.props.children}</animated.group>
  }
}

class ScrollingStory extends React.Component {
  constructor(props) {
    super(props)
    this.sceneRef = React.createRef()
  }

  render() {
    const { top, children: childrenOrChild } = this.props

    const children = Array.isArray(childrenOrChild) ? childrenOrChild : [childrenOrChild]

    // magic number.
    // from top to bottom of my screen (MacBook Pro (15-inch, 2018)),
    // on chrome,
    // the y axis spans 6 units in both directions.
    const screenCoordinatesYInterval = 6.0
    const segments = children.map((child, i) => {
      const startPositionScreenCoordinates = i * screenCoordinatesYInterval
      return React.cloneElement(
        child,
        Object.assign({}, child.props, {
          factor: top.interpolate(top => {
            /*
            const positionInPercent = top / totalAvailableHeight
            const indexInPercent = (i + 1) / numChildren
            */
            const newY = startPositionScreenCoordinates - (-1 + top / 50.0)
            return newY * -1
          }),
          key: i,
        })
      )
    })
    return segments
  }
}
export { StorySegment, ScrollingStory }
