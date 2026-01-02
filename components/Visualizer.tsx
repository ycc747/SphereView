import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Grid, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { CoordinateState, Axis } from '../types';
import { evaluateEquation } from '../services/mathSolver';

interface VisualizerProps {
    coords: CoordinateState;
    equation: string;
    onPointMove: (axis: Axis, value: number) => void;
    activeAxis: Axis | null;
}

const ImplicitSurface: React.FC<{ equation: string }> = ({ equation }) => {
    const meshRef = useRef<THREE.Mesh>(null);

    useEffect(() => {
        const resolution = 50;
        const size = 2;
        const step = size / resolution;

        const geometry = new THREE.BufferGeometry();
        const vertices: number[] = [];
        const indices: number[] = [];

        for (let i = 0; i < resolution; i++) {
            for (let j = 0; j < resolution; j++) {
                const x = -size / 2 + i * step;
                const y = -size / 2 + j * step;

                let z = 0;
                for (let k = -resolution / 2; k < resolution / 2; k++) {
                    const testZ = k * step;
                    const val = evaluateEquation(equation, x, y, testZ);
                    if (Math.abs(val) < 0.1) {
                        z = testZ;
                        break;
                    }
                }

                vertices.push(x, y, z);

                if (i < resolution - 1 && j < resolution - 1) {
                    const a = i * resolution + j;
                    const b = (i + 1) * resolution + j;
                    const c = (i + 1) * resolution + (j + 1);
                    const d = i * resolution + (j + 1);

                    indices.push(a, b, d);
                    indices.push(b, c, d);
                }
            }
        }

        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        geometry.setIndex(indices);
        geometry.computeVertexNormals();

        if (meshRef.current) {
            meshRef.current.geometry = geometry;
        }

        return () => {
            geometry.dispose();
        };
    }, [equation]);

    return (
        <mesh ref={meshRef}>
            <meshStandardMaterial
                color="#06b6d4"
                transparent
                opacity={0.6}
                side={THREE.DoubleSide}
                wireframe={false}
            />
        </mesh>
    );
};

const Point: React.FC<{ coords: CoordinateState; activeAxis: Axis | null }> = ({ coords, activeAxis }) => {
    const meshRef = useRef<THREE.Mesh>(null);

    useFrame(() => {
        if (meshRef.current) {
            meshRef.current.position.set(coords.x, coords.y, coords.z);
        }
    });

    return (
        <mesh ref={meshRef}>
            <sphereGeometry args={[0.05, 32, 32]} />
            <meshStandardMaterial
                color={activeAxis === 'x' ? '#ef4444' : activeAxis === 'y' ? '#22c55e' : activeAxis === 'z' ? '#3b82f6' : '#06b6d4'}
                emissive={activeAxis === 'x' ? '#ef4444' : activeAxis === 'y' ? '#22c55e' : activeAxis === 'z' ? '#3b82f6' : '#06b6d4'}
                emissiveIntensity={0.5}
            />
        </mesh>
    );
};

const Axes: React.FC = () => {
    return (
        <group>
            <arrowHelper args={[new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 0, 0), 1.5, 0xff0000]} />
            <arrowHelper args={[new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 0), 1.5, 0x00ff00]} />
            <arrowHelper args={[new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 0, 0), 1.5, 0x0000ff]} />
        </group>
    );
};

const Visualizer: React.FC<VisualizerProps> = ({ coords, equation, onPointMove, activeAxis }) => {
    return (
        <Canvas>
            <PerspectiveCamera makeDefault position={[3, 3, 3]} />
            <OrbitControls enableDamping dampingFactor={0.05} />

            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} />
            <pointLight position={[-10, -10, -10]} intensity={0.5} />

            <Grid
                args={[10, 10]}
                cellSize={0.5}
                cellThickness={0.5}
                cellColor="#334155"
                sectionSize={1}
                sectionThickness={1}
                sectionColor="#475569"
                fadeDistance={30}
                fadeStrength={1}
                infiniteGrid
            />

            <Axes />
            <ImplicitSurface equation={equation} />
            <Point coords={coords} activeAxis={activeAxis} />
        </Canvas>
    );
};

export default Visualizer;
