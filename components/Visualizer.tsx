import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Grid, PerspectiveCamera, Html } from '@react-three/drei';
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
        const resolution = 32; // 降低解析度以顯現網格分佈
        const size = 2.4;
        const step = size / resolution;
        const halfSize = size / 2;

        const vertices: number[] = [];
        const indices: number[] = [];

        // 3D 體素採樣
        for (let i = 0; i < resolution - 1; i++) {
            for (let j = 0; j < resolution - 1; j++) {
                for (let k = 0; k < resolution - 1; k++) {
                    const x = -halfSize + i * step;
                    const y = -halfSize + j * step;
                    const z = -halfSize + k * step;

                    // 計算立方體 8 個頂點的值
                    const v000 = evaluateEquation(equation, x, y, z);
                    const v100 = evaluateEquation(equation, x + step, y, z);
                    const v110 = evaluateEquation(equation, x + step, y + step, z);
                    const v010 = evaluateEquation(equation, x, y + step, z);
                    const v001 = evaluateEquation(equation, x, y, z + step);
                    const v101 = evaluateEquation(equation, x + step, y, z + step);
                    const v111 = evaluateEquation(equation, x + step, y + step, z + step);
                    const v011 = evaluateEquation(equation, x, y + step, z + step);

                    const values = [v000, v100, v110, v010, v001, v101, v111, v011];

                    // 檢查是否有零點穿過這個立方體
                    const hasPositive = values.some(v => v > 0);
                    const hasNegative = values.some(v => v < 0);

                    if (hasPositive && hasNegative) {
                        // 在立方體中心附近創建頂點
                        const cx = x + step / 2;
                        const cy = y + step / 2;
                        const cz = z + step / 2;

                        // 使用線性插值找到更精確的零點位置
                        const baseIdx = vertices.length / 3;

                        // 為立方體的每條邊檢查零點穿越
                        const edges: [[number, number, number], [number, number, number], number, number][] = [
                            [[x, y, z], [x + step, y, z], v000, v100],
                            [[x + step, y, z], [x + step, y + step, z], v100, v110],
                            [[x + step, y + step, z], [x, y + step, z], v110, v010],
                            [[x, y + step, z], [x, y, z], v010, v000],
                            [[x, y, z + step], [x + step, y, z + step], v001, v101],
                            [[x + step, y, z + step], [x + step, y + step, z + step], v101, v111],
                            [[x + step, y + step, z + step], [x, y + step, z + step], v111, v011],
                            [[x, y + step, z + step], [x, y, z + step], v011, v001],
                            [[x, y, z], [x, y, z + step], v000, v001],
                            [[x + step, y, z], [x + step, y, z + step], v100, v101],
                            [[x + step, y + step, z], [x + step, y + step, z + step], v110, v111],
                            [[x, y + step, z], [x, y + step, z + step], v010, v011],
                        ];

                        const intersections: number[][] = [];
                        for (const [[x1, y1, z1], [x2, y2, z2], val1, val2] of edges) {
                            if ((val1 > 0 && val2 < 0) || (val1 < 0 && val2 > 0)) {
                                const t = Math.abs(val1) / (Math.abs(val1) + Math.abs(val2));
                                const px = x1 + t * (x2 - x1);
                                const py = y1 + t * (y2 - y1);
                                const pz = z1 + t * (z2 - z1);
                                intersections.push([px, py, pz]);
                            }
                        }

                        // 如果有足夠的交點，創建三角形
                        if (intersections.length >= 3) {
                            for (let m = 0; m < intersections.length; m++) {
                                vertices.push(...intersections[m]);
                            }

                            // 創建三角形扇形
                            for (let m = 1; m < intersections.length - 1; m++) {
                                indices.push(baseIdx, baseIdx + m, baseIdx + m + 1);
                            }
                        }
                    }
                }
            }
        }

        const geometry = new THREE.BufferGeometry();
        if (vertices.length > 0) {
            geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
            geometry.setIndex(indices);
            geometry.computeVertexNormals();
        }

        if (meshRef.current) {
            meshRef.current.geometry.dispose();
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
                opacity={0.7}
                side={THREE.DoubleSide}
                wireframe={true}
                metalness={0.1}
                roughness={0.8}
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
            <sphereGeometry args={[0.08, 32, 32]} />
            <meshStandardMaterial
                color="#ffff00"
                emissive="#ffff00"
                emissiveIntensity={0.8}
            />
            {/* 座標點文字標籤 */}
            <Html distanceFactor={10} position={[0.1, 0.1, 0.1]}>
                <div className="bg-slate-900/80 text-yellow-400 px-2 py-1 rounded text-[10px] whitespace-nowrap border border-yellow-400/30 backdrop-blur-sm pointer-events-none font-bold">
                    ({coords.x.toFixed(2)}, {coords.y.toFixed(2)}, {coords.z.toFixed(2)})
                </div>
            </Html>
        </mesh>
    );
};

const Axes: React.FC = () => {
    return (
        <group>
            {/* X Axis */}
            <group>
                <arrowHelper args={[new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 0, 0), 1.5, 0xff0000]} />
                <arrowHelper args={[new THREE.Vector3(-1, 0, 0), new THREE.Vector3(0, 0, 0), 1.5, 0x440000]} />
                <Html position={[1.6, 0, 0]}>
                    <div className="text-red-500 font-black text-sm select-none pointer-events-none italic">X</div>
                </Html>
            </group>

            {/* Y Axis */}
            <group>
                <arrowHelper args={[new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 0), 1.5, 0x00ff00]} />
                <arrowHelper args={[new THREE.Vector3(0, -1, 0), new THREE.Vector3(0, 0, 0), 1.5, 0x004400]} />
                <Html position={[0, 1.6, 0]}>
                    <div className="text-green-500 font-black text-sm select-none pointer-events-none italic">Y</div>
                </Html>
            </group>

            {/* Z Axis */}
            <group>
                <arrowHelper args={[new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 0, 0), 1.5, 0x0000ff]} />
                <arrowHelper args={[new THREE.Vector3(0, 0, -1), new THREE.Vector3(0, 0, 0), 1.5, 0x000044]} />
                <Html position={[0, 0, 1.6]}>
                    <div className="text-blue-500 font-black text-sm select-none pointer-events-none italic">Z</div>
                </Html>
            </group>
        </group>
    );
};

const Equator: React.FC = () => {
    const points = [];
    for (let i = 0; i <= 64; i++) {
        const angle = (i / 64) * Math.PI * 2;
        points.push(new THREE.Vector3(Math.cos(angle), Math.sin(angle), 0));
    }
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    return (
        <lineLoop geometry={geometry}>
            <lineBasicMaterial color="#00eeee" linewidth={2} />
        </lineLoop>
    );
};

const Poles: React.FC = () => {
    return (
        <group>
            {/* North Pole */}
            <mesh position={[0, 0, 1]}>
                <sphereGeometry args={[0.03, 16, 16]} />
                <meshStandardMaterial color="white" emissive="white" emissiveIntensity={0.5} />
                <Html position={[0, 0, 0.05]}>
                    <div className="text-[9px] text-white font-bold whitespace-nowrap opacity-70">North Pole</div>
                </Html>
            </mesh>
            {/* South Pole */}
            <mesh position={[0, 0, -1]}>
                <sphereGeometry args={[0.03, 16, 16]} />
                <meshStandardMaterial color="white" emissive="white" emissiveIntensity={0.5} />
                <Html position={[0, 0, -0.05]}>
                    <div className="text-[9px] text-white font-bold whitespace-nowrap opacity-70">South Pole</div>
                </Html>
            </mesh>
        </group>
    );
};

const Instructions: React.FC = () => {
    return (
        <Html fullscreen style={{ pointerEvents: 'none' }}>
            <div className="absolute bottom-6 left-6 flex flex-col gap-1 p-4 rounded-xl bg-slate-950/40 border border-white/5 backdrop-blur-sm">
                <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Quick Instructions</div>
                <div className="text-[11px] text-slate-400">• <span className="text-slate-200">Drag</span> to rotate view</div>
                <div className="text-[11px] text-slate-400">• <span className="text-slate-200">Scroll</span> to zoom in/out</div>
                <div className="text-[11px] text-slate-400">• <span className="text-slate-200">Sliders</span> to move control point</div>
            </div>
        </Html>
    );
};

const Legend: React.FC = () => {
    return (
        <Html fullscreen style={{ pointerEvents: 'none' }}>
            <div className="absolute top-6 right-6 flex flex-col gap-2 p-4 rounded-2xl bg-slate-950/60 border border-white/10 backdrop-blur-md shadow-2xl pointer-events-auto">
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">3D Legend</div>
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                    <span className="text-[11px] font-bold text-slate-300">X Axis</span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                    <span className="text-[11px] font-bold text-slate-300">Y Axis</span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                    <span className="text-[11px] font-bold text-slate-300">Z Axis</span>
                </div>
                <div className="mt-1 pt-2 border-t border-white/5 flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.8)]" />
                    <span className="text-[11px] font-bold text-yellow-400">Control Point</span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-2 h-1 bg-[#00eeee]" />
                    <span className="text-[11px] font-bold text-[#00eeee]/80">Equator</span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-white shadow-[0_0_8px_white]" />
                    <span className="text-[11px] font-bold text-white/80">Poles</span>
                </div>
            </div>
        </Html>
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
            <Legend />
            <Instructions />
            <Equator />
            <Poles />
            <ImplicitSurface equation={equation} />
            <Point coords={coords} activeAxis={activeAxis} />
        </Canvas>
    );
};

export default Visualizer;
