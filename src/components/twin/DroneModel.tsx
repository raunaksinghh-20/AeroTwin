/* ────────────────────────────────────────────────────────
   AEROTWIN — DRONE MODEL (3D)
   Procedural 3D digital twin matching the dual-rotor
   hydrogen hybrid drone schematic:
   - Hydrogen Cylinder (H2 tank)
   - P1 / P2 Pressure Sensor Nodes & Regulator Line
   - Hydrogen Fuel Cell Stack
   - Hybrid Battery Pack
   - Main PCB / Power Distribution Board
   - Left & Right Main Motors & Propellers (clean, unshrouded)
   - Tail Rear Thruster Assembly & Propeller
   ──────────────────────────────────────────────────────── */

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Html } from "@react-three/drei";
import { createPropellerGeometry, createRotorBlurDiscGeometry } from "./createPropellerGeometry";

import type { ResolvedTheme } from "../../hooks/useResolvedTheme";

interface DroneModelProps {
  roll: number;   // degrees
  pitch: number;  // degrees
  yaw: number;    // degrees
  connected: boolean;
  theme: ResolvedTheme;
  batteryPercent: number;   // 0–100
  h2TankPercent: number;    // 0–100
}

export default function DroneModel({ roll, pitch, yaw, connected, theme, batteryPercent, h2TankPercent }: DroneModelProps) {
  const groupRef = useRef<THREE.Group>(null!);
  const leftPropRef = useRef<THREE.Group>(null!);
  const rightPropRef = useRef<THREE.Group>(null!);
  const rearPropRef = useRef<THREE.Group>(null!);
  const h2FillRef = useRef<THREE.Mesh>(null!);
  const batteryFillRef = useRef<THREE.Mesh>(null!);

  const isDark = theme === "dark";

  // Propeller geometry — generated once.
  const mainPropGeo = useMemo(() => createPropellerGeometry(0.00866), []);
  const rearPropGeo = useMemo(() => createPropellerGeometry(0.0055), []);

  // Motion blur disc geometry
  const mainBlurGeo = useMemo(() => createRotorBlurDiscGeometry(0.00866), []);
  const rearBlurGeo = useMemo(() => createRotorBlurDiscGeometry(0.0055), []);

  // Smoothed orientation values
  const smoothed = useRef({ roll: 0, pitch: 0, yaw: 0 });

  // Shared Three.js materials for synchronous motion blur across all rotors
  const mainPropMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: isDark ? "#4FD8E0" : "#0F8E96",
    roughness: 0.2,
    metalness: 0.3,
    transparent: true,
    opacity: 0.85,
  }), [isDark]);

  const rearPropMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: isDark ? "#F5A623" : "#B5730A",
    roughness: 0.3,
    metalness: 0.4,
    transparent: true,
    opacity: 0.85,
  }), [isDark]);

  const mainBlurMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: isDark ? "#4FD8E0" : "#0F8E96",
    roughness: 0.1,
    metalness: 0.1,
    transparent: true,
    opacity: 0,
    side: THREE.DoubleSide,
    depthWrite: false,
  }), [isDark]);

  const rearBlurMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: isDark ? "#F5A623" : "#B5730A",
    roughness: 0.1,
    metalness: 0.1,
    transparent: true,
    opacity: 0,
    side: THREE.DoubleSide,
    depthWrite: false,
  }), [isDark]);

  // Smoothed fill-level refs for animated transitions
  const smoothedBattery = useRef(batteryPercent);
  const smoothedH2 = useRef(h2TankPercent);

  // Fill materials as shared Three.js instances for per-frame mutation
  const h2FillMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#60A5FA",
    transparent: true,
    opacity: 0.72,
    emissive: new THREE.Color("#3B82F6"),
    emissiveIntensity: 0.6,
  }), []);

  const batteryFillMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#4ADE80",
    transparent: true,
    opacity: 0.72,
    emissive: new THREE.Color("#22C55E"),
    emissiveIntensity: 0.5,
  }), []);

  useFrame((_state, delta) => {
    if (!groupRef.current) return;

    const lerpFactor = 1 - Math.pow(0.05, delta);

    // Convert degrees → radians
    const targetRoll = THREE.MathUtils.degToRad(roll);
    const targetPitch = THREE.MathUtils.degToRad(pitch);
    const targetYaw = THREE.MathUtils.degToRad(yaw);

    smoothed.current.roll = THREE.MathUtils.lerp(smoothed.current.roll, targetRoll, lerpFactor);
    smoothed.current.pitch = THREE.MathUtils.lerp(smoothed.current.pitch, targetPitch, lerpFactor);
    smoothed.current.yaw = THREE.MathUtils.lerp(smoothed.current.yaw, targetYaw, lerpFactor);

    // Apply rotation: pitch → X, yaw → Y, roll → Z
    groupRef.current.rotation.set(
      smoothed.current.pitch,
      smoothed.current.yaw,
      smoothed.current.roll,
    );

    // Spin propellers when connected (set spinSpeed = 0 to stop all propellers)
    let spinSpeed = 0;
    if (connected) {
      spinSpeed = 50 * delta;
      if (leftPropRef.current) leftPropRef.current.rotation.y += spinSpeed;
      if (rightPropRef.current) rightPropRef.current.rotation.y -= spinSpeed;
      if (rearPropRef.current) rearPropRef.current.rotation.z += spinSpeed;
    }

    // Motion blur dynamic blending based on spin speed
    const normSpeed = Math.min(1, Math.abs(spinSpeed) / 0.3); // 0 when static, 1 when fast
    const targetBladeOpacity = 0.85 - normSpeed * 0.70; // 0.85 (sharp) -> 0.15 (ghosted)
    const targetBlurOpacity = normSpeed * 0.10;        // 0.0 (invisible) -> 0.10 (subtle spinning disc blur)

    mainPropMat.opacity = targetBladeOpacity;
    rearPropMat.opacity = targetBladeOpacity;
    mainBlurMat.opacity = targetBlurOpacity;
    rearBlurMat.opacity = targetBlurOpacity;

    // Smooth fill-level transitions
    smoothedBattery.current = THREE.MathUtils.lerp(smoothedBattery.current, batteryPercent, lerpFactor);
    smoothedH2.current = THREE.MathUtils.lerp(smoothedH2.current, h2TankPercent, lerpFactor);

    // ── H2 Tank fill: scale + reposition to anchor at bottom ──
    // The H2 cylinder is rotated [PI/2, 0, 0], so local Y = world -Z.
    // The cylinder's full local height = 1.3. We scale Y by fill fraction.
    const h2Frac = Math.max(0.001, smoothedH2.current / 100);
    if (h2FillRef.current) {
      h2FillRef.current.scale.set(1, h2Frac, 1);
      // Shift along parent Z (which is the cylinder's longitudinal axis) to keep bottom anchored.
      // Reset position.y to 0 since rotation aligns local height with parent Z.
      h2FillRef.current.position.y = 0;
      h2FillRef.current.position.z = -0.65 + h2Frac * 0.65;
    }

    // ── Battery fill: scale + reposition to anchor at front ──
    // Battery box full local depth = 0.96. We scale Z by fill fraction.
    const batFrac = Math.max(0.001, smoothedBattery.current / 100);
    if (batteryFillRef.current) {
      batteryFillRef.current.scale.set(1, 1, batFrac);
      // Reset position.y to 0 since we no longer scale vertically.
      batteryFillRef.current.position.y = 0;
      // Full half-depth = 0.48. Anchor at front: -0.48 + batFrac * 0.48
      batteryFillRef.current.position.z = -0.48 + batFrac * 0.48;
    }

    // Battery fill color: green > 30%, yellow 15-30%, red < 15%
    const bp = smoothedBattery.current;
    if (bp > 30) {
      batteryFillMat.color.set("#4ADE80");
      batteryFillMat.emissive.set("#22C55E");
    } else if (bp > 15) {
      batteryFillMat.color.set("#FBBF24");
      batteryFillMat.emissive.set("#D97706");
    } else {
      batteryFillMat.color.set("#EF4444");
      batteryFillMat.emissive.set("#DC2626");
    }
  });

  // Procedural fuselage profile (teardrop cross-section for LatheGeometry)
  // Made wider/fatter so internal components have breathing room
  const fuselageGeo = useMemo(() => {
    const pts: THREE.Vector2[] = [];
    // Teardrop profile: x = radius, y = longitudinal axis
    // Front nose → widest section → tapered rear — FATTENED radii
    const profile = [
      [0.0, -2.6],    // sharp nose tip
      [0.28, -2.4],   // nose rounding (wider)
      [0.56, -2.0],   // nose widening (wider)
      [0.82, -1.3],   // forward fuselage (wider)
      [0.96, -0.5],   // approaching max width (wider)
      [1.0, 0.0],     // max width zone (wider)
      [0.98, 0.4],    // aft of max width
      [0.90, 0.9],    // tapering aft
      [0.76, 1.4],    // rear body
      [0.56, 1.9],    // rear taper
      [0.34, 2.2],    // tail cone start
      [0.16, 2.45],   // tail cone
      [0.08, 2.55],   // near tail tip
      [0.0, 2.6],     // tail tip
    ];
    const curve = new THREE.CatmullRomCurve3(
      profile.map(([r, y]) => new THREE.Vector3(r, y, 0)),
      false, 'catmullrom', 0.5
    );
    const samples = curve.getPoints(80);
    for (const p of samples) {
      pts.push(new THREE.Vector2(p.x, p.y));
    }
    const geo = new THREE.LatheGeometry(pts, 64);
    // Fatter body: less vertical squeeze for more interior room
    geo.scale(1.0, 1.0, 0.58);
    // Rotate so longitudinal axis = Z (Three.js forward)
    geo.rotateX(Math.PI / 2);
    geo.computeVertexNormals();
    return geo;
  }, []);

  // --- Theme Materials ---

  const armMat = (
    <meshStandardMaterial
      color={isDark ? "#1e2630" : "#a8b0ba"}
      roughness={0.5}
      metalness={0.6}
    />
  );

  const motorMat = (
    <meshStandardMaterial
      color={isDark ? "#2a3442" : "#788492"}
      roughness={0.3}
      metalness={0.8}
    />
  );

  // Subsystem component materials
  const fuelCellMat = (
    <meshStandardMaterial
      color="#EE5253"
      roughness={0.35}
      metalness={0.5}
    />
  );

  const pcbMat = (
    <meshStandardMaterial
      color="#059669"
      roughness={0.4}
      metalness={0.6}
    />
  );



  return (
    <group ref={groupRef}>

      {/* ── Outer Fuselage Shell (Smooth Translucent Teardrop Body) ── */}
      <mesh geometry={fuselageGeo}>
        <meshPhysicalMaterial
          color={isDark ? "#0a1628" : "#cdd5e0"}
          roughness={0.05}
          metalness={0.1}
          transparent
          opacity={0.28}
          transmission={0.82}
          thickness={1.2}
          ior={1.45}
          clearcoat={1}
          clearcoatRoughness={0.04}
          envMapIntensity={1.5}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      {/* Inner glow shell for depth / edge lighting */}
      <mesh geometry={fuselageGeo} scale={[0.96, 0.96, 0.96]}>
        <meshStandardMaterial
          color={isDark ? "#4FD8E0" : "#0F8E96"}
          transparent
          opacity={0.04}
          emissive={isDark ? "#4FD8E0" : "#0F8E96"}
          emissiveIntensity={0.35}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>


      {/* ── 1. HYDROGEN CYLINDER (H2 Tank - Top Center Forward) ── */}
      <group position={[0, 0, -1.5]} rotation={[0, Math.PI, 0]}>
        {/* Tank Outer Shell — transparent so fill is visible */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.30, 0.30, 1.3, 24]} />
          <meshStandardMaterial
            color="#3B82F6"
            roughness={0.25}
            metalness={0.75}
            transparent
            opacity={0.18}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
        {/* H2 Fill Level — full-height inner cylinder, scaled in useFrame */}
        <mesh ref={h2FillRef} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.26, 0.26, 1.3, 24]} />
          <primitive object={h2FillMat} attach="material" />
        </mesh>

        {/* Rear End Cap / Valve Port */}
        <mesh position={[0, 0, 0.65]} rotation={[-Math.PI / 2, 0, 0]}>
          <sphereGeometry args={[0.30, 24, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
          <meshStandardMaterial
            color="#3B82F6"
            roughness={0.25}
            metalness={0.75}
            transparent
            opacity={0.18}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>

        {/* Live Percentage Text Overlay */}
        <Html center>
          <div style={{
            fontFamily: "Inter, system-ui, sans-serif",
            fontSize: "11px",
            fontWeight: 800,
            color: "#ffffff",
            background: "rgba(30, 64, 175, 0.85)", // dark blue semi-transparent
            padding: "3px 6px",
            borderRadius: "4px",
            boxShadow: "0 2px 6px rgba(0, 0, 0, 0.4)",
            border: "1px solid rgba(255, 255, 255, 0.25)",
            pointerEvents: "none",
            userSelect: "none",
            whiteSpace: "nowrap",
          }}>
            {`${Math.round(h2TankPercent)}%`}
          </div>
        </Html>
      </group>


      {/* ── 2. PRESSURE VALVES & CONDUIT (P1 and P2) ─────── */}
      {/* Gas Feed Tube (H2 Cylinder -> P1 -> Regulator -> P2 -> Fuel Cell) */}
      {/* <mesh position={[0, 0.20, -0.30]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.035, 0.035, 0.7, 12]} />
        {lineMat}
      </mesh> */}

      {/* P1 Pressure Sensor Node */}
      {/* <group position={[0, 0.20, -0.50]}>
        <mesh>
          <boxGeometry args={[0.14, 0.14, 0.14]} />
          {valveMat}
        </mesh>
      </group> */}

      {/* Solenoid Valve / Regulator Module */}
      {/* <mesh position={[0, 0.20, -0.30]}>
        <boxGeometry args={[0.18, 0.16, 0.12]} />
        {valveMat}
      </mesh> */}

      {/* P2 Pressure Sensor Node */}
      {/* <group position={[0, 0.20, -0.10]}>
        <mesh>
          <boxGeometry args={[0.14, 0.14, 0.14]} />
          {valveMat}
        </mesh>
      </group> */}


      {/* ── 3. FUEL CELL STACK (Mid-Left Fuselage) ───────── */}
      <group position={[-0.35, 0.06, -0.2]}>
        <mesh>
          <boxGeometry args={[0.44, 0.36, 0.80]} />
          {fuelCellMat}
        </mesh>
        {/* Cooling Fins / Stack Slats */}
        {[-0.25, 0, 0.25].map((zOffset, i) => (
          <mesh key={i} position={[0, 0.19, zOffset]}>
            <boxGeometry args={[0.40, 0.03, 0.14]} />
            {armMat}
          </mesh>
        ))}
      </group>


      {/* ── 4. BATTERY PACK (Mid-Right Fuselage) ──────────── */}
      <group position={[0.38, 0.06, -0.05]}>
        {/* Battery Outer Casing — transparent so fill is visible */}
        <mesh>
          <boxGeometry args={[0.42, 0.34, 1.0]} />
          <meshStandardMaterial
            color="#22C55E"
            roughness={0.3}
            metalness={0.4}
            transparent
            opacity={0.15}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
        {/* Battery Fill Level — full-height inner box, scaled in useFrame */}
        <mesh ref={batteryFillRef}>
          <boxGeometry args={[0.38, 0.30, 0.96]} />
          <primitive object={batteryFillMat} attach="material" />
        </mesh>

        {/* Live Percentage Text Overlay */}
        <Html center>
          <div style={{
            fontFamily: "Inter, system-ui, sans-serif",
            fontSize: "11px",
            fontWeight: 800,
            color: "#ffffff",
            background: batteryPercent > 30 ? "rgba(22, 101, 52, 0.85)" : batteryPercent > 15 ? "rgba(180, 83, 9, 0.85)" : "rgba(153, 27, 27, 0.85)", // green, orange, red matching level
            padding: "3px 6px",
            borderRadius: "4px",
            boxShadow: "0 2px 6px rgba(0, 0, 0, 0.4)",
            border: "1px solid rgba(255, 255, 255, 0.25)",
            pointerEvents: "none",
            userSelect: "none",
            whiteSpace: "nowrap",
          }}>
            {`${Math.round(batteryPercent)}%`}
          </div>
        </Html>
        {/* Terminal Blocks */}
        {/* <mesh position={[0.12, 0.19, -0.38]}>
          <boxGeometry args={[0.09, 0.07, 0.09]} />
          {lineMat}
        </mesh>
        <mesh position={[-0.12, 0.19, -0.38]}>
          <boxGeometry args={[0.09, 0.07, 0.09]} />
          {lineMat}
        </mesh> */}
      </group>


      {/* ── 5. MAIN PCB / POWER DISTRIBUTION BOARD (Lower Center) ── */}
      <group position={[0, -0.16, 0.9]}>
        <mesh>
          <boxGeometry args={[0.78, 0.09, 0.65]} />
          {pcbMat}
        </mesh>
        {/* Microcontroller Chips */}
        <mesh position={[0, 0.06, 0]}>
          <boxGeometry args={[0.24, 0.05, 0.24]} />
          {motorMat}
        </mesh>
      </group>


      {/* ── 6. LEFT MOTOR & PROPELLER (Port Wing) ─────────── */}
      <group position={[-2, 0, -0.15]}>
        {/* Wing Spar / Arm */}
        <mesh position={[0.6, 0, 0]}>
          <boxGeometry args={[1.2, 0.1, 0.2]} />
          {armMat}
        </mesh>

        {/* Left Motor Unit */}
        <group position={[0, 0, 0]}>
          <mesh position={[0, 0.12, 0]}>
            <cylinderGeometry args={[0.22, 0.24, 0.3, 20]} />
            {motorMat}
          </mesh>

          {/* Left Propeller (Lofted Airfoil Blades + Motion Blur Disc) */}
          <group ref={leftPropRef} position={[0, 0.35, 0]}>
            <mesh geometry={mainPropGeo} material={mainPropMat} />
            {/* Motion Blur Disc */}
            <mesh geometry={mainBlurGeo} material={mainBlurMat} rotation={[Math.PI / 2, 0, 0]} />
          </group>
        </group>
      </group>


      {/* ── 7. RIGHT MOTOR & PROPELLER (Starboard Wing) ────── */}
      <group position={[2, 0, -0.15]}>
        {/* Wing Spar / Arm */}
        <mesh position={[-0.6, 0, 0]}>
          <boxGeometry args={[1.2, 0.1, 0.2]} />
          {armMat}
        </mesh>

        {/* Right Motor Unit */}
        <group position={[0, 0, 0]}>
          <mesh position={[0, 0.12, 0]}>
            <cylinderGeometry args={[0.22, 0.24, 0.3, 20]} />
            {motorMat}
          </mesh>

          {/* Right Propeller (Lofted Airfoil Blades + Motion Blur Disc) */}
          <group ref={rightPropRef} position={[0, 0.35, 0]}>
            <mesh geometry={mainPropGeo} material={mainPropMat} />
            {/* Motion Blur Disc */}
            <mesh geometry={mainBlurGeo} material={mainBlurMat} rotation={[Math.PI / 2, 0, 0]} />
          </group>
        </group>
      </group>


      {/* ── 8. REAR TAIL BOOM & THRUSTER ASSEMBLY ──────────── */}
      <group position={[0, 0, 2]}>
        {/* Tail Boom */}
        <mesh position={[0, 0, 0.4]}>
          <boxGeometry args={[0.16, 0.14, 0.9]} />
          {armMat}
        </mesh>

        {/* Vertical Stabilizer Fin */}
        <mesh position={[0, 0.25, 0.6]}>
          <boxGeometry args={[0.05, 0.38, 0.45]} />
          {armMat}
        </mesh>

        {/* Rear Thruster Unit (Mounted at back tip of tail boom) */}
        <group position={[0, 0, 1]}>
          {/* Motor Housing (Horizontal cylinder facing rearward) */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.18, 0.2, 0.25, 16]} />
            {motorMat}
          </mesh>

          {/* Rear Propeller (Vertical Spinner at Tail Tip + Motion Blur Disc) */}
          <group ref={rearPropRef} position={[0, 0, 0.2]}>
            <mesh geometry={rearPropGeo} material={rearPropMat} rotation={[Math.PI / 2, 0, 0]} />
            {/* Motion Blur Disc */}
            <mesh geometry={rearBlurGeo} material={rearBlurMat} />
          </group>
        </group>
      </group>

    </group>
  );
}
