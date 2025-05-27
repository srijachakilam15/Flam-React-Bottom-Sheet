import React, { useState, useRef, useEffect } from "react";
import "./BottomSheet.css";

const SNAP_POINTS = {
  closed: window.innerHeight,      // bottom fully hidden
  half: window.innerHeight / 2,   // half open
  full: 100                      // fully open (100px from top)
};

const SPRING_CONFIG = {
  stiffness: 0.1,
  damping: 0.8
};

export default function BottomSheet() {
  const sheetRef = useRef(null);
  const animationFrame = useRef(null);
  const dragStartY = useRef(0);
  const lastTranslateY = useRef(SNAP_POINTS.closed);
  const velocity = useRef(0);

  const [targetY, setTargetY] = useState(SNAP_POINTS.closed);
  const [isDragging, setIsDragging] = useState(false);
  const [positionState, setPositionState] = useState("closed");

  // Animate the bottom sheet smoothly to targetY using spring motion
  const animate = () => {
    const sheet = sheetRef.current;
    if (!sheet) return;

    let currentY = lastTranslateY.current;
    let diff = targetY - currentY;

    let force = SPRING_CONFIG.stiffness * diff;
    velocity.current = velocity.current * SPRING_CONFIG.damping + force;
    currentY += velocity.current;

    if (Math.abs(diff) < 0.5 && Math.abs(velocity.current) < 0.5) {
      currentY = targetY;
      velocity.current = 0;
      cancelAnimationFrame(animationFrame.current);
      animationFrame.current = null;
    } else {
      animationFrame.current = requestAnimationFrame(animate);
    }

    lastTranslateY.current = currentY;
    sheet.style.transform = `translateY(${currentY}px)`;
  };

  useEffect(() => {
    if (!isDragging) {
      if (!animationFrame.current) {
        animationFrame.current = requestAnimationFrame(animate);
      }
      if (targetY === SNAP_POINTS.closed) setPositionState("closed");
      else if (targetY === SNAP_POINTS.half) setPositionState("half");
      else setPositionState("full");
    }
  }, [targetY, isDragging]);

  // Drag event handlers
  const onDragStart = (e) => {
    e.preventDefault();
    setIsDragging(true);
    velocity.current = 0;
    dragStartY.current = e.touches ? e.touches[0].clientY : e.clientY;
  };

  const onDragMove = (e) => {
    if (!isDragging) return;

    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const diff = clientY - dragStartY.current;

    let newTranslateY = lastTranslateY.current + diff;
    newTranslateY = Math.min(Math.max(newTranslateY, SNAP_POINTS.full), SNAP_POINTS.closed);

    const sheet = sheetRef.current;
    if (sheet) {
      sheet.style.transform = `translateY(${newTranslateY}px)`;
    }

    dragStartY.current = clientY;
    lastTranslateY.current = newTranslateY;
  };

  const onDragEnd = () => {
    if (!isDragging) return;

    setIsDragging(false);

    const distances = Object.entries(SNAP_POINTS).map(([key, val]) => ({
      key,
      dist: Math.abs(lastTranslateY.current - val),
      val
    }));
    distances.sort((a, b) => a.dist - b.dist);
    setTargetY(distances[0].val);
  };

  // Jump buttons handler
  const jumpTo = (pos) => {
    setTargetY(SNAP_POINTS[pos]);
  };

  // Show GIF ONLY when bottom sheet is CLOSED and NOT dragging
  const isGifVisible = positionState === "closed" && !isDragging;

  return (
    <div className="app-container">
      {/* Background elements */}
      <div className="background-shapes">
        <div className="shape circle"></div>
        <div className="shape triangle"></div>
        <div className="shape wave"></div>
      </div>

      {/* Backdrop overlay */}
      <div
        className={`backdrop ${positionState !== "closed" ? "visible" : ""}`}
        onClick={() => jumpTo("closed")}
      ></div>

      {/* The GIF on the right side */}
      <img
        src="https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExcjk1NDNkZjJ6eTJ5dXB4czFkNzhpbXd0ZHVobWh1YWkzamgwMmszbyZlcD12MV9naWZzX3NlYXJjaCZjdD1n/SpopD7IQN2gK3qN4jS/200w.webp"
        alt="Decorative gif"
        className={`fixed-right-gif ${isGifVisible ? "visible" : "hidden"}`}
        draggable={false}
      />

      {/* Main content */}
      <div className="main-content">
       
        <h3 className="subtitle"> Experience the smooth elegance of spring motion with React.</h3>
       <h3 className="subtitle"> Click buttons below to explore</h3>
      </div>

      {/* Bottom Sheet */}
      <div
        ref={sheetRef}
        className={`bottom-sheet ${positionState}`}
        style={{ transform: `translateY(${lastTranslateY.current}px)` }}
        onMouseDown={onDragStart}
        onTouchStart={onDragStart}
        onMouseMove={onDragMove}
        onTouchMove={onDragMove}
        onMouseUp={onDragEnd}
        onMouseLeave={onDragEnd}
        onTouchEnd={onDragEnd}
      >
        <div className="handle"></div>
        <div className="content">
          <h2 style={{ fontFamily:"serif",fontSize: "2.1rem", color: "#2d3748" }}>React Spring Bottom Sheet</h2>
          <p style={{fontFamily:"serif", fontWeight: "bold", fontSize: "1.2rem", color: "#4a5568" }}>
            
            Smooth spring animation between snap points without any libraries<br></br>

Drag and button controls for interactive sheet movement<br></br>

Stylish, responsive UI with animated background and GIF
          </p>
          
        </div>
      </div>

      {/* Control Buttons */}
      <div className="button-row">
        <button onClick={() => jumpTo("closed")}>Close</button>
        <button onClick={() => jumpTo("half")}>Half Open</button>
        <button onClick={() => jumpTo("full")}>Fully Open</button>
      </div>
    </div>
  );
}