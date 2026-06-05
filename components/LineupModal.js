"use client";
import { useRef, useEffect } from "react";
import { animate } from "animejs";
import { X } from "lucide-react";
import LineupDetail from "./LineupDetail";

export default function LineupModal(props) {
  const boxRef = useRef(null);
  useEffect(() => {
    if (boxRef.current) animate(boxRef.current, { opacity: [0, 1], translateY: [14, 0], duration: 300, ease: "out(3)" });
  }, []);
  return (
    <div className="ub-overlay" onClick={props.onClose}>
      <div className="ub-modal" ref={boxRef} onClick={(e) => e.stopPropagation()}>
        <button className="ub-close" onClick={props.onClose}><X size={18} /></button>
        <LineupDetail {...props} />
      </div>
    </div>
  );
}
