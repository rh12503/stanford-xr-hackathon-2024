"use client";

import React, { RefObject, useEffect, useMemo, useRef, useState } from "react";
import { Color, Mesh, UniformsLib, UniformsUtils } from "three";

import { Vector3, useFrame, useThree } from "@react-three/fiber";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import { Stats, OrbitControls, Text3D, Stars } from "@react-three/drei";

const pink = new Color(172 / 60, 17 / 60, 255 / 60);
const blue = new Color(0 / 60, 206 / 60, 225 / 60);

const vertexShader = `
  #include <fog_pars_vertex>
    varying float vY;
    uniform float time;

    void main() {
        vY = position.y;
        #include <begin_vertex>
        #include <project_vertex>
        #include <fog_vertex>
    }
      `;

const fragmentShader = `
  #include <fog_pars_fragment>
    varying float vY;
    uniform float time;

    void main() {
        float n  = 0.5+0.5*(sin(vY * 2.0 + time)); 

        vec3 color = mix(vec3(0., 3.43333333333, 3.75),vec3(2.86666666667, 0.28333333333, 4.25), n);

        gl_FragColor = vec4(color, 1.0);

        #include <fog_fragment>
    }`;

function GradientCylinder({
  position,
  key,
  time,
  length,
}: {
  position?: Vector3;
  key: number;
  time: number;
  length: number;
}) {
  const mesh = useRef<Mesh>(null);

  const uniforms = useMemo(
    () =>
      UniformsUtils.merge([
        {
          time: { value: 0 },
        },
        UniformsLib["fog"],
      ]),
    []
  );

  useEffect(() => {
    // @ts-ignore
    mesh.current.material.uniforms.time.value = time;
  }, [time]);

  return (
    <mesh
      position={position}
      rotation={[0, 0, Math.PI / 2]}
      key={key}
      ref={mesh}
    >
      <cylinderGeometry args={[0.002, 0.002, length, 6]} />
      <shaderMaterial
        uniforms={uniforms}
        fragmentShader={fragmentShader}
        vertexShader={vertexShader}
        toneMapped={false}
        fog
        needsUpdate
      />
    </mesh>
  );
}

function mix(v1: Color, v2: Color, t: number): Color {
  return new Color(
    v2.r * (1 - t) + v1.r * t,
    v2.g * (1 - t) + v1.g * t,
    v2.b * (1 - t) + v1.b * t
  );
}

export default function CanvasContent({
  canvasRef,
  offset,
}: {
  canvasRef?: RefObject<HTMLCanvasElement | null>;
  offset: number;
}) {
  const [time, setTime] = useState(0);
  const [prevTime, setPrevTime] = useState(-1);
  useFrame((state, delta) => {
    if (prevTime === -1) {
      setPrevTime(performance.now());
    } else {
      setTime(time + (performance.now() - prevTime) * 0.0025);
      setPrevTime(performance.now());
    }
  });

  const aspect =
    (canvasRef?.current?.width ?? 2) / (canvasRef?.current?.height ?? 1);

  const numColumns = Math.ceil(aspect * 3.2) * 2;

  const camera = useThree((state) => state.camera);
  useFrame(() => {
    camera.position.z = offset * offset * 10;
  });

  return (
    <>
      {offset < 1 ? (
        <>
          <fogExp2
            attach="fog"
            color="black"
            density={
              (0.9 - time > 0.35 ? 0.9 - time : 0.35) + offset * offset * 2
            }
          />
          <group rotation={[0, 0, (-Math.PI / 4) * 0]}>
            {Array.from({ length: 4 }, (item, index) => (
              <mesh position={[(index - 2) / 1 + 0.5, 1.1, -1.7]} key={index}>
                <pointLight
                  color={mix(
                    pink,
                    blue,
                    0.5 + 0.5 * Math.sin((index - 1.5) * 4 + time)
                  )}
                  intensity={0.65}
                />
              </mesh>
            ))}
            {Array.from({ length: 4 }, (item, index) => (
              <mesh position={[(index - 2) / 1 + 0.5, -0.4, -1.7]} key={index}>
                <pointLight
                  color={mix(
                    pink,
                    blue,
                    0.5 + 0.5 * Math.sin((index - 1.5) * 4 + time)
                  )}
                  intensity={0.65}
                />
              </mesh>
            ))}
            {Array.from({ length: 5 }, (item, index) => (
              <GradientCylinder
                position={[
                  0,
                  1.3,
                  0.1 - index - 2 + Math.round(camera.position.z),
                ]}
                key={index}
                time={time}
                length={6 * aspect}
              />
            ))}
            {Array.from({ length: 5 }, (item, index) => (
              <GradientCylinder
                position={[
                  0,
                  -0.9,
                  0.1 - index - 2 + Math.round(camera.position.z),
                ]}
                key={index}
                time={time}
                length={6 * aspect}
              />
            ))}
            {Array.from({ length: numColumns }, (item, index) => (
              <mesh
                position={[
                  (index - numColumns / 2) / 1 + 0.5,
                  1.3,
                  -4 + camera.position.z,
                ]}
                rotation={[Math.PI / 2, 0, 0]}
                key={index}
              >
                <cylinderGeometry args={[0.008, 0.008, 8, 6]} />
                <meshBasicMaterial
                  color={mix(
                    blue,
                    pink,
                    0.5 +
                      0.5 * Math.sin((index - numColumns / 2 + 0.5) * 4 + time)
                  )}
                  toneMapped={false}
                />
              </mesh>
            ))}
            {Array.from({ length: numColumns }, (item, index) => (
              <mesh
                position={[
                  index - numColumns / 2 + 0.5,
                  -0.9,
                  -4 + camera.position.z,
                ]}
                rotation={[Math.PI / 2, 0, 0]}
                key={index}
              >
                <cylinderGeometry args={[0.008, 0.008, 8, 6]} />
                <meshBasicMaterial
                  color={mix(
                    blue,
                    pink,
                    0.5 +
                      0.5 * Math.sin((index - numColumns / 2 + 0.5) * 4 + time)
                  )}
                  toneMapped={false}
                />
              </mesh>
            ))}
          </group>
          <Text3D
            font="/fonts/Orbitron_Regular.json"
            position={[
              aspect > 1.4 ? -1.42 : -0.5,
              aspect > 1.4 ? 0.25 : 0.43,
              -2.9,
            ]}
            size={aspect > 1.4 ? 0.22 : 0.15}
            bevelEnabled
            curveSegments={8}
            bevelThickness={0.01}
            bevelSize={0.01}
            bevelOffset={0}
            bevelSegments={8}
            height={0.02}
          >
            Immerse {aspect < 1.4 && "\n "}the Bay
            <meshPhongMaterial
              color={"white"}
              shininess={100}
              specular={"white"}
            />
          </Text3D>
          <EffectComposer enableNormalPass={false}>
            <Bloom
              intensity={2.5}
              luminanceThreshold={0}
              kernelSize={3}
              resolutionScale={0}
              mipmapBlur
              levels={3}
              radius={0.5}
            />
          </EffectComposer>
          {/*<OrbitControls enableRotate enablePan />*/}
          {/*<Stats />*/}
        </>
      ) : (
        <></>
      )}
    </>
  );
}
