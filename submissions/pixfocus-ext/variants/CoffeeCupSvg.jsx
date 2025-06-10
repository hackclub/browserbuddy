import React, { useEffect, useRef, useState } from "react";

const CoffeeCupSvg = ({ progress = 0 }) => {
  const [fillProgress, setFillProgress] = useState(1);
  const animationRef = useRef(null);

  useEffect(() => {
    // Cancel any existing animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    const startTime = performance.now();
    const duration = 1000; // 1 second animation
    const startValue = fillProgress;
    const endValue = progress;

    // Animation function using requestAnimationFrame
    const animate = (currentTime) => {
      const elapsedTime = currentTime - startTime;
      const progress = Math.min(elapsedTime / duration, 1);

      // Easing function for smooth animation
      const easeProgress = 1 - Math.pow(1 - progress, 3); // Cubic ease out

      // Calculate current value
      const currentValue = startValue + (endValue - startValue) * easeProgress;

      setFillProgress(currentValue);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [progress]);

  // the fill Pattern for the coffee cup from svg converter
  const fillPath =
    "M36 73h12M32 72h20M30 71h24M28 70h28M26 69h32M24 68h36M22 67h40M21 66h42M20 65h44M19 64h46M18 63h48M18 62h48M17 61h50M17 60h50M16 59h52M16 58h52M16 57h52M15 56h54M15 55h54M14 54h56M14 53h56M14 52h56M14 51h56M13 50h58M13 49h58M13 48h58M13 47h58M13 46h58M13 45h58M13 44h58M13 43h58M13 42h58M12 41h60M12 40h60M12 39h60M12 38h60M12 37h60M12 36h60M12 35h60M12 34h60M12 33h60M12 32h60M12 31h60M13 30h59M13 29h59M13 28h58M14 27h57M14 26h56M15 25h54M16 24h52M18 23h48";

  // Generate the visible path based on fill progress
  const visiblePath = React.useMemo(() => {
    const lines = fillPath.split("M");
    const totalLines = lines.length;
    const linesToShow = Math.floor(totalLines * (1 - fillProgress));

    return lines
      .slice(0, linesToShow)
      .map((line, index) => (index === 0 ? line : "M" + line))
      .join("");
  }, [fillProgress]);

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 -0.5 96 96"
      style={{ width: 300, height: 300 }}
    >
      <path
        stroke="#745359"
        d="M13 15h58M11 16h2M71 16h2M10 17h1M73 17h1M9 18h1M74 18h12M8 19h1M86 19h1M7 20h1M87 20h1M7 21h1M78 21h5M88 21h1M6 22h1M77 22h1M83 22h1M89 22h1M6 23h1M77 23h1M84 23h1M90 23h1M5 24h1M78 24h1M85 24h1M90 24h1M5 25h1M78 25h1M85 25h1M90 25h1M5 26h1M78 26h1M86 26h1M91 26h1M5 27h1M78 27h1M86 27h1M91 27h1M5 28h1M78 28h1M86 28h1M91 28h1M5 29h1M78 29h1M86 29h1M91 29h1M5 30h1M78 30h1M86 30h1M91 30h1M5 31h1M78 31h1M86 31h1M91 31h1M5 32h1M78 32h1M86 32h1M90 32h1M5 33h1M78 33h1M86 33h1M90 33h1M5 34h1M78 34h1M86 34h1M90 34h1M5 35h1M78 35h1M85 35h1M89 35h1M5 36h1M78 36h1M85 36h1M89 36h1M5 37h1M78 37h1M85 37h1M89 37h1M5 38h1M78 38h1M85 38h1M88 38h1M5 39h1M78 39h1M84 39h1M88 39h1M5 40h1M78 40h1M84 40h1M88 40h1M5 41h1M78 41h1M84 41h1M87 41h1M6 42h1M77 42h1M83 42h1M87 42h1M6 43h1M77 43h1M83 43h1M86 43h1M6 44h1M77 44h1M82 44h1M86 44h1M6 45h1M77 45h1M82 45h1M85 45h1M6 46h1M77 46h1M81 46h1M84 46h1M6 47h1M77 47h1M80 47h1M84 47h1M6 48h1M77 48h1M79 48h1M83 48h1M6 49h1M77 49h2M82 49h1M6 50h1M81 50h1M6 51h1M80 51h1M7 52h1M79 52h1M7 53h1M78 53h1M7 54h1M77 54h1M7 55h1M76 55h1M8 56h1M75 56h1M8 57h1M75 57h1M8 58h1M75 58h1M8 59h1M75 59h1M9 60h1M74 60h1M9 61h1M74 61h1M9 62h1M74 62h1M10 63h1M73 63h1M10 64h1M73 64h1M11 65h1M72 65h1M12 66h1M71 66h1M12 67h1M71 67h1M13 68h1M70 68h1M14 69h1M69 69h1M15 70h1M68 70h1M16 71h1M67 71h1M17 72h1M66 72h1M18 73h1M65 73h1M19 74h2M63 74h2M21 75h2M61 75h2M23 76h2M59 76h2M25 77h2M57 77h2M27 78h3M54 78h3M30 79h5M49 79h5M35 80h14"
      />
      <path
        stroke="#dadec7"
        d="M13 16h50M11 17h22M36 17h13M52 17h9M10 18h22M37 18h11M53 18h6M9 19h23M37 19h11M53 19h4M8 20h24M37 20h11M53 20h2M8 21h25M36 21h13M52 21h1M7 22h45M7 23h11M6 24h10M6 25h9M6 26h8M6 27h8M6 28h7M6 29h7M6 30h7M6 31h6M6 32h6M6 33h6M6 34h6M6 35h6M6 36h6M6 37h6M6 38h6M6 39h6M6 40h6M6 41h6M7 42h6M7 43h6M7 44h6M7 45h6M7 46h6M7 47h6M7 48h6M7 49h6M7 50h6M7 51h7M8 52h6M8 53h6M8 54h6M8 55h7M9 56h6M9 57h7M9 58h7M9 59h7M10 60h7M10 61h7M10 62h8M11 63h7M11 64h8M12 65h8M13 66h8M13 67h8M14 68h5M15 69h2"
      />
      <path
        stroke="#c6c9b3"
        d="M63 16h8M61 17h12M59 18h15M57 19h29M55 20h32M53 21h25M83 21h5M52 22h25M84 22h5M66 23h11M85 23h5M68 24h10M86 24h4M69 25h9M86 25h4M70 26h8M87 26h4M71 27h7M87 27h4M71 28h7M87 28h4M72 29h6M87 29h4M72 30h6M87 30h4M72 31h6M87 31h4M72 32h6M87 32h3M72 33h6M87 33h3M72 34h6M87 34h3M72 35h6M86 35h3M72 36h6M86 36h3M72 37h6M86 37h3M72 38h6M86 38h2M72 39h6M85 39h3M72 40h6M85 40h3M72 41h6M85 41h2M71 42h6M84 42h3M71 43h6M84 43h2M71 44h6M83 44h3M71 45h6M83 45h2M71 46h6M82 46h2M71 47h6M81 47h3M71 48h6M80 48h3M71 49h6M79 49h3M71 50h10M70 51h10M70 52h9M70 53h8M70 54h7M69 55h7M69 56h6M68 57h7M68 58h7M68 59h7M67 60h7M67 61h7M66 62h8M66 63h7M65 64h8M64 65h8M63 66h8M21 67h1M62 67h9M19 68h5M60 68h10M17 69h9M58 69h11M16 70h12M56 70h12M17 71h13M54 71h13M18 72h14M52 72h14M19 73h17M48 73h17M21 74h9M32 74h20M54 74h9M23 75h6M33 75h6M40 75h5M46 75h5M55 75h6M25 76h4M33 76h6M40 76h5M46 76h5M55 76h4M27 77h3M32 77h7M40 77h5M46 77h6M54 77h3M30 78h10M45 78h9M35 79h14"
      />
      <path
        stroke="#2b2229"
        d="M33 17h3M49 17h3M32 18h1M36 18h1M48 18h1M52 18h1M32 19h1M36 19h1M48 19h1M52 19h1M32 20h1M36 20h1M48 20h1M52 20h1M33 21h3M49 21h3"
      />
      <path stroke="#c6d8cc" d="M33 18h1M49 18h1M33 19h1M49 19h1" />
      <path stroke="#34373a" d="M34 18h1M50 18h1M34 19h1M50 19h1" />
      <path
        stroke="#332129"
        d="M35 18h1M51 18h1M33 20h1M49 20h1M39 75h1M45 75h1M39 76h1M45 76h1M39 77h1M45 77h1M40 78h5"
      />
      <path stroke="#594c5a" d="M35 19h1M51 19h1" />
      <path stroke="#23212b" d="M34 20h1M50 20h1" />
      <path stroke="#675561" d="M35 20h1M51 20h1" />

      <path
        stroke="#ff6c7a"
        d="M30 74h2M52 74h2M29 75h4M51 75h4M29 76h4M51 76h4M30 77h2M52 77h2"
      />

      {/* fill */}
      <path stroke="#745359" d={visiblePath} />
    </svg>
  );
};

export default CoffeeCupSvg;
