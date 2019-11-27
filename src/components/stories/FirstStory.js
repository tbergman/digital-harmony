import React, { useRef, useEffect } from 'react'
import * as THREE from 'three'
import { useRender, extend, useThree } from 'react-three-fiber'
import { apply as applySpring } from 'react-spring/three'
import { StorySegment, ScrollingStory } from './ScrollingStory'
import { FiftyNote } from '../models/UkCurrency'
import { Nefertiti } from '../models/Nefertiti'
import { EnvironmentMap } from '../EnvironmentMap'
import { loadHDREnvironmentMap, loadEnvironmentMapUrls } from '../../util/Loaders'
import { getScrollableHeight } from '../../util/ScrollHelper'

import { withSong } from '../420/WithSong'
import { Rings } from '../sound-enabled/Rings'

import { MoireEffect } from '../MoireEffect'

import { EffectComposer } from '../../postprocessing/EffectComposer'
import { RenderPass } from '../../postprocessing/RenderPass'
import { GlitchPass } from '../../postprocessing/GlitchPass'
import { ShaderPass } from '../../postprocessing/ShaderPass'
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader'
import { DrunkPass } from '../../postprocessing/DrunkPass'
import { Video } from '../Video'
import { VideoBackground } from '../VideoBackground'
import { FloatingSphereLights } from '../sound-enabled/FloatingSphereLights.js'

import { EnvironmentMapHDR } from '../EnvironmentMapHDR'
import { BaseController } from '../controllers/Base'

import { Glassblown } from '../lib/Glassblown'
import { FloatingSpaghetti } from '../lib/FloatingSpaghetti'
import { Sprinkler } from '../lib/Sprinkler'
import { SoundEnabledBackground } from '../sound-enabled/Background'
import { TwistingWaveField } from '../sound-enabled/TwistingWaveField'
import Background from '../Background'
import events from 'events'
import Player from '../../sound-player/Player'
import { LightingLaboratory } from '../LightingLaboratory'

applySpring({ EffectComposer, RenderPass, GlitchPass, ShaderPass, DrunkPass, EnvironmentMapHDR })
extend({ EffectComposer, RenderPass, GlitchPass, ShaderPass, DrunkPass })

const Effects = React.memo(({ factor }) => {
  const { gl, scene, camera, size } = useThree()
  const composer = useRef()

  useEffect(
    () => {
      composer.current.setSize(size.width, size.height)
    },
    [size]
  )

  useRender(() => {
    composer.current.render()
  }, true)

  return (
    <effectComposer ref={composer} args={[gl]}>
      <renderPass attachArray="passes" name="passes" args={[scene, camera]} />
      <shaderPass
        attachArray="passes"
        args={[FXAAShader]}
        uniforms-resolution-value={[1 / size.width, 1 / size.height]}
      />
      <DrunkPass factor={factor} shouldRenderToScreen={true} />
    </effectComposer>
  )
})

class FirstStory extends BaseController {
  constructor() {
    super()
    const songComponents = [
      <Rings
        amplitude={2}
        name="battery"
        position={[0.5, 0, 1.5]}
        waveformResolution={16}
        rotateX={0}
        rotateY={0}
        rotateZ={Math.PI * 0.25}
        size={18}
        hue={0.7}
        scale={0.35}
      />,
      <TwistingWaveField
        position={[-4.5, 0, 0]}
        waveformResolution={128}
        size={10}
        color={new THREE.Color(0xffff00)}
        opacity={1.0}
        name="piano"
      />,
    ]
  }

  render() {
    const { top, renderer } = this.props
    const cubeTexture = loadEnvironmentMapUrls('daylight-bridge', [
      'posx.jpg',
      'negx.jpg',
      'posy.jpg',
      'negy.jpg',
      'posz.jpg',
      'negz.jpg',
    ])
    const pisaCubeTexture = loadEnvironmentMapUrls('pisa', ['px.png', 'nx.png', 'py.png', 'ny.png', 'pz.png', 'nz.png'])
    const hdrEnvMap = loadHDREnvironmentMap(
      'pisa-hdr',
      ['px.hdr', 'nx.hdr', 'py.hdr', 'ny.hdr', 'pz.hdr', 'nz.hdr'],
      renderer
    )
    const scrollMax = getScrollableHeight()
    const BackgroundComponent = (
      <Background
        color={top.interpolate(
          [0, scrollMax * 0.25, scrollMax * 0.33, scrollMax * 0.5, scrollMax],
          ['#e82968', '#e0c919', '#504006', '#e32f01', '#333333']
        )}
      />
    )

    // todo: implement mechanism for withSong that allows for cross-component
    // Player integration
    // see: https://tonejs.github.io/docs/13.8.25/Players
    return (
      <scene ref={this.sceneRef}>
        <ScrollingStory top={top} BackgroundComponent={null}>
          <StorySegment>
            <Nefertiti />
          </StorySegment>
          <StorySegment>
            <LightingLaboratory />
          </StorySegment>
          {/* <StorySegment>{this.Song}</StorySegment>*/}
          <StorySegment>
            <Glassblown />
            <Sprinkler />
          </StorySegment>
          <StorySegment>
            <MoireEffect totalTimeInSeconds={5} />
            <FiftyNote />
            <FloatingSpaghetti />
          </StorySegment>
          <StorySegment>
            <EnvironmentMapHDR
              factor={top.interpolate([0, 1000], [0, 1])}
              hdrEnvMap={hdrEnvMap}
              envMap={pisaCubeTexture}
            />
          </StorySegment>
          {/*
          <StorySegment>
            <EnvironmentMap cubeTexture={cubeTexture} />
          </StorySegment>
          */}
        </ScrollingStory>
        <Effects factor={top.interpolate([0, 150], [0.8, 0.7])} />
      </scene>
    )
  }
}

export { FirstStory }
