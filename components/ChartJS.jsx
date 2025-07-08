// Lightweight Chart.js wrapper for React
import { useRef, useEffect } from "react";
import Chart from "chart.js/auto";

export default function ChartJS({ type, data, options, height = 300 }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.destroy();
    }
    if (canvasRef.current) {
      chartRef.current = new Chart(canvasRef.current, {
        type,
        data,
        options,
      });
    }
    return () => {
      if (chartRef.current) chartRef.current.destroy();
    };
  }, [type, data, options]);

  return <canvas ref={canvasRef} height={height} />;
}
