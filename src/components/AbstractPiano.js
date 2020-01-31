import React, { useRef, useEffect } from 'react'
import { useSpring, animated } from 'react-spring/three'
import { useRender } from 'react-three-fiber'
import * as THREE from 'three'
import { Noise } from '../util/Noise'
import clock from '../util/Clock'
import { DEG_TO_RAD } from '../util/Constants.js'
import midi from '../util/WebMidi'

Noise.seed(0.1)

const PianoKey = props => {
  const meshRef = useRef()
  const position = props.position || [0, 0, 0]
  const [width, height, depth] = props.dimensions || [1, 0.2, 0.1]
  const color = props.color || 0xefefef

  const midiKey = props.midiKey || 68

  const [spring, set] = useSpring(() => ({
    from: { rotation: [0, 0, 0], position },
    config: { mass: 20, tension: 500, friction: 200 },
  }))

  let extraData = {
    originalPosition: position,
    movementAmount: 0.5,
  }

  useEffect(
    () => {
      midi.onNotePress(note => {
        const { current: mesh } = meshRef
        const currentRotation = mesh.rotation
        const currentPosition = mesh.position

        const newPosition = [2.0, currentPosition.y, currentPosition.z + extraData.movementAmount]
        const newRotation = [currentRotation.x + 25 * Math.PI * DEG_TO_RAD, currentRotation.y, currentRotation.z]

        set({ rotation: newRotation, position: newPosition })
      }, midiKey)

      midi.onNoteRelease(note => {
        const { current: mesh } = meshRef
        const newPosition = [
          extraData.originalPosition[0],
          extraData.originalPosition[1],
          extraData.originalPosition[2],
        ]
        set({ position: newPosition })
      }, midiKey)
    },
    [spring]
  )

  return (
    <animated.mesh position={spring.position} ref={meshRef} rotation={spring.rotation} castShadow receiveShadow>
      <boxGeometry args={[width, height, depth]} attach="geometry" />
      <meshPhongMaterial color={color} attach="material" />
    </animated.mesh>
  )
}

const TripletClusters = props => {
  const groupRef = useRef()
  const midiKey = props.midiKey
  const color = props.color || 0x383838
  const position = props.position || [0, 0, 0]

  const [spring, set] = useSpring(() => ({
    from: { rotation: [0, 0, 0], position, color },
    config: { mass: 50, tension: 0, friction: 1 },
  }))

  let extraData = {
    movementAmount: 1.0,
    originalPosition: position,
    originalColor: color,
  }

  useEffect(
    () => {
      midi.onNotePress(note => {
        const { current: group } = groupRef
        const currentRotation = group.rotation
        const currentPosition = group.position

        const newPosition = [currentPosition.x, currentPosition.y - 0.3, currentPosition.z + extraData.movementAmount]
        const newRotation = [currentRotation.x, currentRotation.y + 25 * Math.PI * DEG_TO_RAD, currentRotation.z]

        const newColor = 0xfafafa

        set({ rotation: newRotation, position: newPosition, color: newColor })
      }, midiKey)

      midi.onNoteRelease(note => {
        const { current: group } = groupRef
        const currentPosition = group.position

        const newPosition = [
          extraData.originalPosition[0],
          extraData.originalPosition[1],
          extraData.originalPosition[2],
        ]
        set({ position: newPosition, color: extraData.originalColor })
      }, midiKey)
    },
    [spring]
  )

  return (
    <animated.group position={spring.position} rotation={spring.rotation} ref={groupRef}>
      <mesh position={[0.1, 0.1, 0.1]}>
        <dodecahedronGeometry args={[0.1]} attach="geometry" />
        <animated.meshPhongMaterial color={spring.color} attach="material" />
      </mesh>
      <mesh position={[-0.1, 0.1, 0.1]}>
        <dodecahedronGeometry args={[0.1]} attach="geometry" />
        <animated.meshPhongMaterial color={spring.color} attach="material" />
      </mesh>
      <mesh position={[0.1, -0.1, 0.1]}>
        <dodecahedronGeometry args={[0.1]} attach="geometry" />
        <animated.meshPhongMaterial color={spring.color} attach="material" />
      </mesh>
    </animated.group>
  )
}

const Scale = [53, 56, 57, 58, 59, 60, 62, 63, 65, 66, 67, 68, 70, 71]
const TripletClustersGroup = props => {
  const numTripletClusters = Scale.length

  const lights = []

  for (let i = 0; i < numTripletClusters; ++i) {
    const x = Math.random() * 2
    const y = THREE.Math.lerp(2, -2, i / numTripletClusters)
    const z = Math.random()
    const midiKey = Scale[i]

    lights.push(<TripletClusters position={[x, y, z]} midiKey={midiKey} key={i} />)
  }

  return <group>{lights}</group>
}

const Cm = [48, 51, 55]
const Keys = props => {
  const numKeys = 3

  const keys = []
  for (let i = 0; i < numKeys; ++i) {
    //const x = THREE.Math.lerp(-1, 1, i / numKeys)
    const x = -2
    const y = THREE.Math.lerp(2, -2, i / numKeys)
    const width = 1.75
    const height = 0.2 / (numKeys / 9)
    const depth = 0.2
    const key = (
      <PianoKey position={[x, y, 0]} key={i} dimensions={[width, height, depth]} midiKey={Cm[i]} color={0x383838} />
    )
    keys.push(key)
  }

  return <group>{keys}</group>
}

const randomLightPosition = () => {
  return {
    position: [2, Math.random() * 2, 5],
  }
}

const MovingLight = props => {
  const [spring, set] = useSpring(() => ({
    from: { position: [-3, 0, 5] },
    config: { mass: 10, tension: 500, friction: 20 },
  }))
  useEffect(() => void setInterval(() => set(i => ({ ...randomLightPosition() })), 5000), [])

  return (
    <animated.group position={spring.position}>
      <mesh scale={[0.2, 0.2, 0.2]}>
        <boxGeometry attach="geometry" />
        <meshBasicMaterial color={0xffffff} attach="material" />
      </mesh>
      <pointLight color={0xefefef} intensity={0.3} angle={0.2} penumbra={1} castShadow />
    </animated.group>
  )
}

const Background = props => {
  return (
    <mesh position={[0, 0, -1]} scale={[8, 8, 8]} receiveShadow>
      <planeGeometry attach="geometry" />
      <meshPhongMaterial color={0x383838} attach="material" opacity={0.5} side={THREE.DoubleSide} transparent />
    </mesh>
  )
}

const AbstractPiano = props => {
  return (
    <group>
      <Background />
      <MovingLight />
      {/* <CenterLine />*/}
      <Keys />
      <TripletClustersGroup />
    </group>
  )
}

export { AbstractPiano }
