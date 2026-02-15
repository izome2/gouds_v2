import { useRef, useMemo, useEffect, useState, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

// ─────────────────────────────────────────────
// GLSL Shaders — reverse-engineered from Lusion.co
// The elastic / rubber-band effect is entirely in the vertex shader.
// ─────────────────────────────────────────────

const vertexShader = /* glsl */ `
uniform vec3  u_position;
uniform vec4  u_quaternion;
uniform vec3  u_scale;
uniform vec2  u_domXYFrom;
uniform vec2  u_domWHFrom;
uniform vec2  u_domXY;
uniform vec2  u_domWH;
uniform vec2  u_domPivot;
uniform vec4  u_domPadding;
uniform float u_showRatio;

varying vec2  v_uv;
varying vec2  v_domWH;
varying float v_showRatio;

vec3 qrotate(vec4 q, vec3 v) {
  return v + 2.0 * cross(q.xyz, cross(q.xyz, v) + q.w * v);
}

vec3 getBasePosition(in vec3 pos, in vec2 domWH) {
  vec3 basePos = vec3(pos.xy * domWH - u_domPivot, pos.z);
  basePos.xy += mix(-u_domPadding.xz, u_domPadding.yw, pos.xy);
  return basePos;
}

vec3 getScreenPosition(in vec3 basePos, in vec2 domXY) {
  vec3 screenPos = qrotate(u_quaternion, basePos * u_scale)
                 + vec3(u_domPivot.xy, 0.0);
  screenPos = (screenPos + vec3(domXY, 0.0) + u_position)
            * vec3(1.0, -1.0, 1.0);
  return screenPos;
}

float cubicBezier(float p0, float p1, float p2, float p3, float t) {
  float c = (p1 - p0) * 3.0;
  float b = (p2 - p1) * 3.0 - c;
  float a = p3 - p0 - c - b;
  return a*t*t*t + b*t*t + c*t + p0;
}

float easeOutBack(float t) {
  return cubicBezier(0.0, 1.3, 1.1, 1.0, t);
}

void main() {
  // Per-vertex timing weight → elastic stagger
  float placementWeight = 1.0
    - (pow(position.x * position.x, 0.75)
     + pow(1.0 - position.y, 1.5)) / 2.0;

  v_showRatio = smoothstep(
    placementWeight * 0.3,
    0.7 + placementWeight * 0.3,
    u_showRatio
  );

  vec2 domXY = mix(u_domXYFrom, u_domXY, v_showRatio);
  vec2 domWH = mix(u_domWHFrom, u_domWH, v_showRatio);

  // Horizontal wobble
  domXY.x += mix(domWH.x, 0.0,
    cos(v_showRatio * 3.1415926 * 2.0) * 0.5 + 0.5) * 0.1;

  vec3 basePos = getBasePosition(position, domWH);

  // Slight Z rotation during mid-transition
  float rot = (smoothstep(0.0, 1.0, v_showRatio) - v_showRatio) * -0.5;
  vec3 rotBasePos = qrotate(vec4(0.0, 0.0, sin(rot), cos(rot)), basePos);

  vec3 screenPos = getScreenPosition(rotBasePos, domXY);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(screenPos, 1.0);

  v_uv    = vec2(uv.x, 1.0 - uv.y);
  v_domWH = domWH;
}
`;

const fragmentShader = /* glsl */ `
precision highp float;

uniform vec3      u_color;
uniform sampler2D u_texture;
uniform float     u_globalRadius;
uniform float     u_aspectScale;
uniform vec2      u_radialCenter;

varying vec2  v_uv;
varying vec2  v_domWH;
varying float v_showRatio;

float linearStep(float edge0, float edge1, float x) {
  return clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
}

float sdRoundedBox(in vec2 p, in vec2 b, in float r) {
  vec2 q = abs(p) - b + r;
  return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r;
}

float getRoundedCornerMask(vec2 uv, vec2 size, float radius, float ratio) {
  vec2 halfSize = size * 0.5;
  float maxDist = length(halfSize);
  float minSize = min(halfSize.x, halfSize.y);
  float maxSize = max(halfSize.x, halfSize.y);
  float t       = ratio * maxDist;
  radius = mix(
    minSize * linearStep(0.0, minSize, t),
    radius,
    linearStep(maxSize, maxDist, t)
  );
  halfSize = min(halfSize, vec2(t));
  float d = sdRoundedBox((uv - 0.5) * v_domWH, halfSize, radius);
  return smoothstep(0.0, 0.0 - fwidth(d), d);
}

void main() {
  float imageAlpha = getRoundedCornerMask(v_uv, v_domWH, u_globalRadius, 1.0);

  vec2 baseUv = v_uv;
  baseUv.y = (baseUv.y - 0.5) * mix(1.0, u_aspectScale, v_showRatio) + 0.5;

  vec3 color = texture2D(u_texture, baseUv).rgb;
  
  // Subtle chocolate brown overlay (transparent)
  float gray = dot(color, vec3(0.299, 0.587, 0.114));
  vec3 chocolateBrown = vec3(
    min(gray * 1.08, 1.0),  // Red channel (subtle)
    min(gray * 0.88, 1.0),  // Green channel
    min(gray * 0.70, 1.0)   // Blue channel
  );
  // Light transparent overlay (25% chocolate, 75% original)
  vec3 tintedColor = mix(chocolateBrown, color, 0.75);

  gl_FragColor = vec4(mix(tintedColor, color, v_showRatio), imageAlpha);
}
`;

// ─────────────────────────────────────────────
// Geometry helper — PlaneGeometry with [0,1] range
// ─────────────────────────────────────────────
function createUfxGeometry(segX = 32, segY = 32) {
  const geo = new THREE.PlaneGeometry(1, 1, segX, segY);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    pos.setX(i, pos.getX(i) + 0.5);
    pos.setY(i, pos.getY(i) + 0.5);
  }
  pos.needsUpdate = true;
  return geo;
}

// ─────────────────────────────────────────────
// Video texture hook
// ─────────────────────────────────────────────
function useVideoTexture(src) {
  const [texture, setTexture] = useState(null);
  const videoRef = useRef(null);

  useEffect(() => {
    const video = document.createElement("video");
    video.src = src;
    video.crossOrigin = "anonymous";
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    video.setAttribute("playsinline", "");
    video.preload = "auto";
    video.load();

    const tex = new THREE.VideoTexture(video);
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.colorSpace = THREE.SRGBColorSpace;

    videoRef.current = video;
    setTexture(tex);

    // Auto-play when ready
    const tryPlay = () => {
      video.play().catch(() => {});
    };
    video.addEventListener("canplaythrough", tryPlay, { once: true });

    return () => {
      video.pause();
      video.removeAttribute("src");
      video.load();
      tex.dispose();
    };
  }, [src]);

  return { texture, video: videoRef };
}

// ─────────────────────────────────────────────
// Layout calculator
// thumbRowY  = Y of the thumbnail row (title area)
// finalDestY = Y where the video should land (the empty space below)
// ─────────────────────────────────────────────
function computeLayout(w, h, thumbRowY = 0, finalDestY = 0) {
  // Thumbnail — 30% bigger & shifted right toward centre
  const thumbW = Math.min(620, w * 0.42);
  const thumbH = thumbW * (9 / 16);
  const thumbX = w * 0.32 - thumbW / 2;  // shifted right
  const thumbY = thumbRowY;

  // Final — 20% bigger: ~96% viewport width capped at 1344px
  const finalW = Math.min(1344, w * 0.96);
  const finalH = finalW * (9 / 16);
  const finalX = (w - finalW) / 2;
  const finalY = finalDestY;

  return { thumbX, thumbY, thumbW, thumbH, finalX, finalY, finalW, finalH };
}

// ─────────────────────────────────────────────
// The elastic mesh (inner R3F component)
// ─────────────────────────────────────────────
function ElasticVideoMesh({ showRatio, driftRatio, videoSrc, thumbRowY, finalDestY }) {
  const meshRef = useRef();
  const { size } = useThree();
  const { texture } = useVideoTexture(videoSrc);

  const geometry = useMemo(() => createUfxGeometry(32, 32), []);

  const layout = useMemo(
    () => computeLayout(size.width, size.height, thumbRowY, finalDestY),
    [size.width, size.height, thumbRowY, finalDestY]
  );

  // Total Y travel from thumb to final
  const totalYTravel = layout.finalY - layout.thumbY;

  // Internal drift target ref for smooth lerp
  const driftRef = useRef(0);

  const uniforms = useMemo(
    () => ({
      u_position:     { value: new THREE.Vector3(0, 0, 0) },
      u_quaternion:   { value: new THREE.Vector4(0, 0, 0, 1) },
      u_scale:        { value: new THREE.Vector3(1, 1, 1) },
      u_domXYFrom:    { value: new THREE.Vector2(layout.thumbX, layout.thumbY) },
      u_domWHFrom:    { value: new THREE.Vector2(layout.thumbW, layout.thumbH) },
      u_domXY:        { value: new THREE.Vector2(layout.finalX, layout.finalY) },
      u_domWH:        { value: new THREE.Vector2(layout.finalW, layout.finalH) },
      u_domPivot:     { value: new THREE.Vector2(layout.finalW / 2, layout.finalH / 2) },
      u_domPadding:   { value: new THREE.Vector4(0, 0, 0, 0) },
      u_showRatio:    { value: 0 },
      u_texture:      { value: null },
      u_color:        { value: new THREE.Color(0x4a2d1f) }, // chocolate-800 tint
      u_globalRadius: { value: 16.0 },
      u_aspectScale:  { value: 1.0 },
      u_radialCenter: { value: new THREE.Vector2(0.5, 0.5) },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // Update texture when loaded
  useEffect(() => {
    if (texture && meshRef.current) {
      meshRef.current.material.uniforms.u_texture.value = texture;
    }
  }, [texture]);

  // Update layout on resize
  useEffect(() => {
    if (!meshRef.current) return;
    const u = meshRef.current.material.uniforms;
    u.u_domXYFrom.value.set(layout.thumbX, layout.thumbY);
    u.u_domWHFrom.value.set(layout.thumbW, layout.thumbH);
    u.u_domXY.value.set(layout.finalX, layout.finalY);
    u.u_domWH.value.set(layout.finalW, layout.finalH);
    u.u_domPivot.value.set(layout.finalW / 2, layout.finalH / 2);
  }, [layout]);

  // Animate showRatio + drift with smooth lerp
  // Uses lerp factor ≤ 0.03 so the video always lags behind the scroll, never leads
  useFrame(() => {
    if (!meshRef.current) return;
    const u = meshRef.current.material.uniforms;
    u.u_showRatio.value += (showRatio - u.u_showRatio.value) * 0.03;

    // Smooth drift: slide thumb Y down by 20% of total travel
    driftRef.current += (driftRatio - driftRef.current) * 0.03;
    const driftY = driftRef.current * totalYTravel * 0.20;
    u.u_domXYFrom.value.set(layout.thumbX, layout.thumbY + driftY);
  });

  return (
    <mesh ref={meshRef} geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthTest={false}
        depthWrite={false}
        side={THREE.DoubleSide}
        extensions={{ derivatives: true }}
      />
    </mesh>
  );
}

// ─────────────────────────────────────────────
// Camera setup (pixel-coordinate ortho)
// ─────────────────────────────────────────────
function OrthoCamera() {
  const { camera, size } = useThree();

  useEffect(() => {
    camera.left = 0;
    camera.right = size.width;
    camera.top = 0;
    camera.bottom = -size.height;
    camera.near = -1000;
    camera.far = 1000;
    camera.position.set(0, 0, 1);
    camera.updateProjectionMatrix();
  }, [camera, size]);

  return null;
}

// ─────────────────────────────────────────────
// "Play Reel" overlay — per-char slide reveal + play button
// Sits ON TOP of the video. Only visible when animation completes.
// ─────────────────────────────────────────────
const CHAR_STAGGER_MS = 40;
const TEXT_BASE_DELAY = 450; // text starts well after the button appears first

function CharRevealWord({ word, visible, startIndex }) {
  return (
    <span style={{ display: 'inline-block' }}>
      {word.split('').map((ch, i) => {
        const idx = startIndex + i;
        const delay = TEXT_BASE_DELAY + idx * CHAR_STAGGER_MS;
        return (
          <span
            key={idx}
            style={{
              display: 'inline-block',
              overflow: 'hidden',
              verticalAlign: 'top',
              lineHeight: 1.1,
              height: '1.1em',
            }}
          >
            <span
              style={{
                display: 'inline-flex',
                flexDirection: 'column',
                transition: `transform 0.55s cubic-bezier(0.76, 0, 0.24, 1) ${delay}ms,
                           opacity 0.3s ease ${delay}ms`,
                transform: visible
                  ? 'translate3d(0, -50%, 0)'
                  : 'translate3d(0, 0%, 0)',
                opacity: visible ? 1 : 0,
              }}
            >
              <span style={{ display: 'block' }}>{ch}</span>
              <span style={{ display: 'block' }}>{ch}</span>
            </span>
          </span>
        );
      })}
    </span>
  );
}

function PlayButton({ visible, onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <span
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 'clamp(90px, 11vw, 160px)',
        height: 'clamp(62px, 7.5vw, 110px)',
        borderRadius: 'clamp(22px, 3vw, 48px)',
        backgroundColor: '#f5f2ed',
        verticalAlign: 'middle',
        marginLeft: '0.3em',
        marginRight: '0.3em',
        transition: `transform 0.5s cubic-bezier(0.76, 0, 0.24, 1) 0ms,
                     opacity 0.4s ease 0ms`,
        transform: visible ? 'scale(1)' : 'scale(0.3)',
        opacity: visible ? 1 : 0,
        cursor: 'pointer',
        flexShrink: 0,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Hover fill — slides up from bottom */}
      <span
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: '100%',
          backgroundColor: '#e6e1d7',
          borderRadius: 'inherit',
          transform: hovered ? 'translateY(0%)' : 'translateY(100%)',
          transition: 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)',
          pointerEvents: 'none',
        }}
      />
      {/* Play triangle */}
      <svg
        viewBox="0 0 24 24"
        fill="none"
        style={{ width: '40%', height: '40%', position: 'relative', zIndex: 1 }}
      >
        <path d="M8 5.14v13.72a1 1 0 0 0 1.5.86l11.2-6.86a1 1 0 0 0 0-1.72L9.5 4.28a1 1 0 0 0-1.5.86z" fill="#4a2d1f" />
      </svg>
    </span>
  );
}

function PlayReelOverlay({ visible, onPlay }) {
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 20,
        pointerEvents: visible ? 'auto' : 'none',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          whiteSpace: 'nowrap',
          userSelect: 'none',
          fontFamily: "'Playfair Display', serif",
          fontWeight: 700,
          fontSize: 'clamp(3.5rem, 8vw, 9rem)',
          color: '#f5f2ed',
          letterSpacing: '-0.01em',
          textTransform: 'uppercase',
        }}
      >
        <span style={{ marginTop: '0.15em' }}>
          <CharRevealWord word="Play" visible={visible} startIndex={0} />
        </span>
        <PlayButton visible={visible} onClick={onPlay} />
        <span style={{ marginTop: '0.15em' }}>
          <CharRevealWord word="Reel" visible={visible} startIndex={4} />
        </span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Fullscreen Video Player with spring-physics custom cursor
// ─────────────────────────────────────────────
function FullscreenVideoPlayer({ src, onClose }) {
  const overlayRef = useRef(null);
  const cursorRef  = useRef(null);
  const [visible, setVisible] = useState(false);

  // Spring physics state
  const mouse    = useRef({ x: 0, y: 0 });
  const pos      = useRef({ x: 0, y: 0 });
  const vel      = useRef({ x: 0, y: 0 });
  const prevMouse = useRef({ x: 0, y: 0 });
  const rotation = useRef(0);
  const rotVel   = useRef(0);
  const cursorScale = useRef(1);
  const rafId    = useRef(null);

  // Fade in on mount
  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  // Track mouse
  useEffect(() => {
    const handleMove = (e) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
    };
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  // Spring animation loop
  useEffect(() => {
    const SPRING   = 0.035;
    const DAMPING  = 0.82;
    const ROT_SPRING  = 0.07;
    const ROT_DAMPING = 0.65;
    const ROT_SCALE   = 0.6;

    const BASE_SIZE = 110;
    const SIZE_BOOST = 0.012; // how much speed grows the circle
    const SIZE_SPRING = 0.06;

    const animate = () => {
      // Position spring — slow & silky
      const dx = mouse.current.x - pos.current.x;
      const dy = mouse.current.y - pos.current.y;
      vel.current.x += dx * SPRING;
      vel.current.y += dy * SPRING;
      vel.current.x *= DAMPING;
      vel.current.y *= DAMPING;
      pos.current.x += vel.current.x;
      pos.current.y += vel.current.y;

      // Rotation spring — sensitive & swinging
      const mouseDx = mouse.current.x - prevMouse.current.x;
      const targetRot = mouseDx * ROT_SCALE;
      rotVel.current += (targetRot - rotation.current) * ROT_SPRING;
      rotVel.current *= ROT_DAMPING;
      rotation.current += rotVel.current;
      rotation.current = Math.max(-55, Math.min(55, rotation.current));

      // Dynamic size — grows with speed
      const speed = Math.sqrt(vel.current.x ** 2 + vel.current.y ** 2);
      const targetScale = 1 + Math.min(speed * SIZE_BOOST, 0.35);
      cursorScale.current += (targetScale - cursorScale.current) * SIZE_SPRING;

      prevMouse.current.x = mouse.current.x;
      prevMouse.current.y = mouse.current.y;

      if (cursorRef.current) {
        const s = cursorScale.current;
        cursorRef.current.style.transform =
          `translate(${pos.current.x}px, ${pos.current.y}px) translate(-50%, -50%) rotate(${rotation.current}deg) scale(${s})`;
      }

      rafId.current = requestAnimationFrame(animate);
    };
    rafId.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId.current);
  }, []);

  const handleClose = useCallback(() => {
    setVisible(false);
    setTimeout(onClose, 500);
  }, [onClose]);

  return (
    <div
      ref={overlayRef}
      onClick={handleClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: '#000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'none',
        transition: 'opacity 0.5s ease',
        opacity: visible ? 1 : 0,
      }}
    >
      {/* Video — fills entire viewport */}
      <video
        src={src}
        autoPlay
        loop
        playsInline
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          cursor: 'none',
          transition: 'opacity 0.5s ease',
          opacity: visible ? 1 : 0,
        }}
      />

      {/* Custom cursor — cream circle with thin X */}
      <div
        ref={cursorRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: 110,
          height: 110,
          borderRadius: '50%',
          backgroundColor: '#f5f2ed',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
          zIndex: 10000,
          willChange: 'transform',
          boxShadow: '0 4px 24px rgba(0,0,0,0.25)',
        }}
      >
        {/* Thin X icon */}
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
          <line x1="6" y1="6" x2="18" y2="18" stroke="#4a2d1f" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="18" y1="6" x2="6" y2="18" stroke="#4a2d1f" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Main exported component
// Normal scrolling — title + thumbnail row at top,
// empty landing zone below for the video to drop into.
// ─────────────────────────────────────────────
const THUMB_ROW_HEIGHT = 380; // height of the title + thumbnail row
const LANDING_HEIGHT   = 760; // big landing zone for larger final video

const KitchenToScreen = () => {
  const sectionRef     = useRef(null);
  const thumbRowRef    = useRef(null);
  const landingRef     = useRef(null);
  const [showRatio, setShowRatio] = useState(0);
  const [driftRatio, setDriftRatio] = useState(0);
  const [thumbRowY, setThumbRowY] = useState(0);
  const [finalDestY, setFinalDestY] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Measure positions relative to the Canvas (which covers the whole section)
  useEffect(() => {
    const measure = () => {
      if (!sectionRef.current || !thumbRowRef.current || !landingRef.current) return;
      const sTop = sectionRef.current.getBoundingClientRect().top;
      const trTop = thumbRowRef.current.getBoundingClientRect().top;
      const ldTop = landingRef.current.getBoundingClientRect().top;

      // Thumb starts vertically centred inside the thumb row
      const thumbW = Math.min(620, window.innerWidth * 0.42);
      const thumbH = thumbW * (9 / 16);
      const thumbStartY = trTop - sTop + (THUMB_ROW_HEIGHT - thumbH) / 2;
      setThumbRowY(thumbStartY);

      // Final dest = only a short drop below the thumb start (not far down)
      // Just enough to feel like movement, but stays near centre
      const finalVideoH = Math.min(1344, window.innerWidth * 0.96) * (9 / 16);
      const shortDrop = (thumbH + finalVideoH) * 0.22; // 22% of combined heights
      setFinalDestY(thumbStartY + shortDrop);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // Scroll-driven: first 10% of progress = drift only, rest = elastic
  // Auto-scroll: once elastic > 2%, auto-complete in user's direction.
  // Uses wheel event (not scroll) to detect user intent — avoids conflict with scrollBy.
  const autoScrollRaf = useRef(null);
  const autoScrollDir = useRef(0);
  const isAutoScrolling = useRef(false);

  useEffect(() => {
    const DRIFT_PHASE = 0.1;
    const speed = 2.5;

    const getMeasurements = () => {
      if (!thumbRowRef.current) return null;
      const rect = thumbRowRef.current.getBoundingClientRect();
      const windowH = window.innerHeight;
      const midScreen = windowH / 2;
      const elCentre = rect.top + rect.height / 2;
      const travelDistance = windowH * 0.45;
      const rawProgress = Math.max(0, Math.min(1, (midScreen - elCentre) / travelDistance));
      const elasticRatio = rawProgress > DRIFT_PHASE
        ? (rawProgress - DRIFT_PHASE) / (1 - DRIFT_PHASE) : 0;
      return { midScreen, travelDistance, rawProgress, elasticRatio };
    };

    const stopAutoScroll = () => {
      if (autoScrollRaf.current) {
        cancelAnimationFrame(autoScrollRaf.current);
        autoScrollRaf.current = null;
      }
      isAutoScrolling.current = false;
      autoScrollDir.current = 0;
    };

    const startAutoScroll = (dir) => {
      stopAutoScroll();
      autoScrollDir.current = dir;
      isAutoScrolling.current = true;

      const tick = () => {
        window.scrollBy(0, dir * speed);

        const m = getMeasurements();
        if (!m) { stopAutoScroll(); return; }

        // Update state
        if (m.rawProgress <= DRIFT_PHASE) {
          setDriftRatio(m.rawProgress / DRIFT_PHASE);
          setShowRatio(0);
        } else {
          setDriftRatio(1);
          setShowRatio(m.elasticRatio);
        }

        // Done?
        if ((dir > 0 && m.elasticRatio >= 0.98) || (dir < 0 && m.elasticRatio <= 0.01)) {
          stopAutoScroll();
          return;
        }
        autoScrollRaf.current = requestAnimationFrame(tick);
      };
      autoScrollRaf.current = requestAnimationFrame(tick);
    };

    // Wheel = user's actual intent. Use this to detect direction + trigger/reverse auto-scroll.
    const handleWheel = (e) => {
      const userDir = e.deltaY > 0 ? 1 : -1;
      const m = getMeasurements();
      if (!m) return;

      // If auto-scrolling in the OPPOSITE direction, reverse immediately
      if (isAutoScrolling.current && autoScrollDir.current !== userDir) {
        startAutoScroll(userDir);
        return;
      }

      // If not auto-scrolling and in elastic zone (>2%), start auto-scroll
      if (!isAutoScrolling.current && m.elasticRatio > 0.02 && m.elasticRatio < 0.98) {
        startAutoScroll(userDir);
      }
    };

    // Scroll event = just update state (fires from both user scroll and scrollBy)
    const handleScroll = () => {
      if (isAutoScrolling.current) return; // auto-scroll tick handles state updates
      const m = getMeasurements();
      if (!m) return;

      if (m.rawProgress <= DRIFT_PHASE) {
        setDriftRatio(m.rawProgress / DRIFT_PHASE);
        setShowRatio(0);
      } else {
        setDriftRatio(1);
        setShowRatio(m.elasticRatio);
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: true });
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("scroll", handleScroll);
      stopAutoScroll();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative bg-gradient-to-b from-white via-cream-50 to-cream-100 overflow-hidden"
    >
      {/* Decorative blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 -left-24 w-72 h-72 bg-chocolate-100/30 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-24 w-64 h-64 bg-cream-300/40 rounded-full blur-3xl" />
      </div>

      {/* ── ROW 1: Thumbnail (left) + Title (right) ── */}
      <div
        ref={thumbRowRef}
        className="relative z-10 flex items-start"
        style={{ height: THUMB_ROW_HEIGHT, paddingTop: 40 }}
      >
        {/* LEFT ~55% — empty: the WebGL canvas draws the thumbnail here */}
        <div style={{ width: '55%' }} />

        {/* RIGHT ~45% — section title, aligned to thumb top */}
        <div
          style={{
            width: '45%',
            paddingRight: '4%',
            paddingTop: 12,
            transition: 'transform 0.4s ease-out',
            transform: `translateY(${-driftRatio * 30}px)`,
          }}
        >
          <h2 className="font-display font-bold leading-[1.05] tracking-tight">
            <span className="block text-chocolate-800" style={{ fontSize: 'clamp(2.4rem, 5vw, 5rem)' }}>
              Kitchen
            </span>
            <span className="block text-gradient-chocolate" style={{ fontSize: 'clamp(2.4rem, 5vw, 5rem)' }}>
              To Your Screen
            </span>
          </h2>
          <p
            className="mt-4 text-chocolate-600/70 text-base font-sans max-w-sm"
            style={{
              transition: 'opacity 0.5s ease',
              opacity: showRatio > 0 ? 0 : 1,
            }}
          >
            Watch our cookies come to life — from oven to your doorstep
          </p>
        </div>
      </div>

      {/* ── ROW 2: Empty landing zone where the video drops into ── */}
      <div
        ref={landingRef}
        className="relative"
        style={{ height: LANDING_HEIGHT, marginBottom: 80 }}
      />

      {/* ── WebGL Canvas — covers the full section (both rows) ── */}
      <div className="absolute inset-0" style={{ zIndex: 5, pointerEvents: 'none' }}>
        {typeof window !== "undefined" && (
          <Canvas
            orthographic
            dpr={[1, 2]}
            gl={{
              antialias: true,
              alpha: true,
              powerPreference: "high-performance",
            }}
            style={{ background: "transparent", pointerEvents: 'none' }}
          >
            <OrthoCamera />
            <ElasticVideoMesh
              showRatio={showRatio}
              driftRatio={driftRatio}
              videoSrc="/videos/reel-demo.mp4"
              thumbRowY={thumbRowY}
              finalDestY={finalDestY}
            />
          </Canvas>
        )}
      </div>

      {/* ── "Play Reel" overlay — ON TOP of the video, z-index above canvas ── */}
      <PlayReelOverlay
        visible={showRatio >= 0.95}
        onPlay={() => setIsPlaying(true)}
      />

      {/* ── Fullscreen video player ── */}
      {isPlaying && (
        <FullscreenVideoPlayer
          src="/videos/reel-demo.mp4"
          onClose={() => setIsPlaying(false)}
        />
      )}
    </section>
  );
};

export default KitchenToScreen;
