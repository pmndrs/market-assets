import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Billboard, useTexture } from '@react-three/drei'

export const Cloud = ({
  size = 1,
  opacity = 0.5,
  speed = 0.4,
  spread = 10,
  length = 1.5,
  segments = 20,
  dir = 1,
  ...props
}) => {
  const group = useRef()
  const texture = useTexture('/cloud.png')
  const clouds = useMemo(
    () =>
      [...new Array(segments)].map((_, index) => ({
        x: spread / 2 - Math.random() * spread,
        y: spread / 2 - Math.random() * spread,
        scale:
          0.4 +
          Math.sin(((index + 1) / segments) * Math.PI) *
            ((0.2 + Math.random()) * 10) *
            size,
        density: Math.max(0.2, Math.random()),
        rotation: Math.max(0.002, 0.005 * Math.random()) * speed,
      })),
    [spread, segments, speed, size]
  )
  useFrame((state) =>
    group.current?.children.forEach((cloud, index) => {
      cloud.rotation.z += clouds[index].rotation * dir
      cloud.scale.setScalar(
        clouds[index].scale +
          (((1 + Math.sin(state.clock.getElapsedTime() / 10)) / 2) * index) / 10
      )
    })
  )
  return (
    <group {...props}>
      <group position={[0, 0, (segments / 2) * length]} ref={group}>
        {clouds.map(({ x, y, scale, density }, index) => (
          <Billboard
            key={index}
            scale={[scale, scale, scale]}
            position={[x, y, -index * length]}
            lockZ
          >
            <meshStandardMaterial
              map={texture}
              transparent
              opacity={(scale / 6) * density * opacity}
              depthTest={false}
            />
          </Billboard>
        ))}
      </group>
    </group>
  )
}
