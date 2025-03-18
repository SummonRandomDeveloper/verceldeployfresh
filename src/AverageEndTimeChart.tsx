import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register Chart.js modules.
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface AverageEndTimeChartProps {
  // This object maps algorithm names (e.g., 'fifo', 'sjf', etc.) to their average finish time.
  averageEndTimes: { [algorithm: string]: number };
}

const AverageEndTimeChart: React.FC<AverageEndTimeChartProps> = ({
  averageEndTimes,
}) => {
  // Create an array of algorithm names to use as labels on the x-axis.
  const labels = Object.keys(averageEndTimes);

  // Build the data object for the chart.
  const data = {
    labels,
    datasets: [
      {
        label: "Average End Time",
        data: labels.map((label) => averageEndTimes[label]),
        backgroundColor: labels.map(
          (_, index) => `hsl(${index * 60}, 70%, 70%)`
        ),
      },
    ],
  };

  // Chart options for responsiveness and title.
  const options = {
    responsive: true,
    plugins: {
      legend: { position: "top" as const },
      title: {
        display: true,
        text: "Average End Time for Each Scheduling Algorithm",
      },
    },
  };

  return <Bar data={data} options={options} />;
};

export default AverageEndTimeChart;
