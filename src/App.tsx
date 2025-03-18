import { useState, useRef } from "react";
import AlgorithmSelection from "./components/AlgorithmSelection";
import FIFO from "./components/FIFO";
import SJF from "./components/SJF";
import STCF from "./components/STCF";
import RR from "./components/RR";
import MLFQ from "./components/MFLQ";
import AverageEndTimeChart from "./components/AverageEndTimeChart";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import "./App.css";

interface Process {
  pid: number;
  burstTime: number;
  arrivalTime: number;
}

function App() {
  const reportRef = useRef<HTMLDivElement>(null);

  const generatePDF = async () => {
    if (reportRef.current) {
      // Use html2canvas to take a screenshot of the referenced element
      const canvas = await html2canvas(reportRef.current, {
        scale: 2, // Higher scale for better quality
        useCORS: true, // Handles cross-origin images
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4"); // Portrait, millimeters, A4 size

      // Calculate dimensions to fit the image into the PDF
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save("CPU_Scheduling_Report.pdf");
    }
  };

  // State to store the selected algorithms
  const [selectedAlgorithms, setSelectedAlgorithms] = useState<string[]>([]);

  // State to store the number of processes
  const [numProcesses, setNumProcesses] = useState<number>(5);

  // State to store the time quantum (for Round Robin)
  const [timeQuantum, setTimeQuantum] = useState<number>(4);

  // State to store all processes to apply to each selected algorithm
  const [processes, setProcesses] = useState<Process[]>([]);

  // Handler to update the selected algorithms
  const handleSelectAlgorithms = (selected: string[]) => {
    setSelectedAlgorithms(selected);
  };

  // Handler to update the number of processes
  const handleProcessChange = (num: number) => {
    setNumProcesses(num);
  };

  // Handler to update the time quantum
  const handleTimeQuantumChange = (timeQuantum: number) => {
    setTimeQuantum(timeQuantum);
  };

  // Generate random processes
  const generateProcesses = (num: number): Process[] => {
    return (
      Array.from({ length: num }, (_, i) => ({
        pid: -1,
        // Burst time between 1-10
        burstTime: Math.floor(Math.random() * 10) + 1,
        // Arrival time between 0-10
        arrivalTime: Math.floor(Math.random() * 10),
      }))
        // Sort by arrival time
        .sort((a, b) => a.arrivalTime - b.arrivalTime)
        // Reassign PID based on order;
        .map((process, index) => ({ ...process, pid: index + 1 }))
    );
  };

  // Hander for when the AlgorithmSelection Form is submitted.
  const handleFormSubmit = () => {
    const newProcesses = generateProcesses(numProcesses);
    setProcesses(newProcesses);

    console.log("Form submitted!");
    console.log("Selected Algorithms:", selectedAlgorithms);
    console.log("Number of Processes:", numProcesses);
    console.log("Time Quantum for RR:", timeQuantum);
  };

  // Predefined order of algorithms
  const algorithmOrder = ["fifo", "sjf", "stcf", "rr", "mlfq"];

  // Dummy values pull from algorithms later
  const averageEndTimes = {
    fifo: 12.5,
    sjf: 10.2,
    stcf: 11.0,
    rr: 13.7,
    mlfq: 12.1,
  };

  // Sort selected algorithms based on the predefined order (Activates automatically on rerender)
  const sortedAlgorithms = selectedAlgorithms.sort((a, b) => {
    return algorithmOrder.indexOf(a) - algorithmOrder.indexOf(b);
  });

  return (
    <div className="m-3">
      <h1>CPU Scheduling Simulation</h1>
      <AlgorithmSelection
        selectedAlgorithms={selectedAlgorithms}
        onSelectAlgorithms={handleSelectAlgorithms}
        numProcesses={numProcesses}
        onProcessChange={handleProcessChange}
        timeQuantum={timeQuantum}
        onTimeQuantumChange={handleTimeQuantumChange}
        onFormSubmit={handleFormSubmit}
      />
      <button className="btn btn-primary mt-3" onClick={generatePDF}>
        Export Report as PDF
      </button>
      <div ref={reportRef}>
        <div className="mt-4">
          <h4 className="mt-2">Number of Processes: {numProcesses}</h4>
          <h4 className="mt-2">Time Quantum for Round Robin: {timeQuantum}</h4>
        </div>
        {processes.length > 0 && (
          <div className="mt-4">
            <h4 className="mt-2">Generated Processes:</h4>
            <table className="table table-bordered mt-2">
              <thead>
                <tr>
                  <th>PID</th>
                  <th>Arrival Time</th>
                  <th>Burst Time</th>
                </tr>
              </thead>
              <tbody>
                {processes.map((process) => (
                  <tr key={process.pid}>
                    <td className="col">{process.pid}</td>
                    <td>{process.arrivalTime}</td>
                    <td>{process.burstTime}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {selectedAlgorithms.includes("fifo") && <FIFO processes={processes} />}
        {selectedAlgorithms.includes("sjf") && <SJF processes={processes} />}
        {selectedAlgorithms.includes("stcf") && <STCF processes={processes} />}
        {selectedAlgorithms.includes("rr") && (
          <RR processes={processes} timeQuantum={timeQuantum} />
        )}
        {selectedAlgorithms.includes("mlfq") && (
          <MLFQ processes={processes} timeQuantum={timeQuantum} />
        )}
        <div className="mt-4">
          <h4>Average End Times</h4>
          <AverageEndTimeChart averageEndTimes={averageEndTimes} />
        </div>
      </div>
    </div>
  );
}

export default App;
