import { ChangeEvent, FormEvent } from "react";

// Interface for Algorithm Selection Props
interface AlgorithmSelectionProps {
  selectedAlgorithms: string[];
  onSelectAlgorithms: (selectedAlgorithms: string[]) => void;
  numProcesses: number;
  onProcessChange: (numProcesses: number) => void;
  timeQuantum: number;
  onTimeQuantumChange: (timeQuantum: number) => void;
  onFormSubmit: () => void;
}

// Functional Component for Algorithm Selection
function AlgorithmSelection({
  selectedAlgorithms,
  onSelectAlgorithms,
  numProcesses,
  onProcessChange,
  timeQuantum,
  onTimeQuantumChange,
  onFormSubmit,
}: AlgorithmSelectionProps) {
  const handleCheckboxChange = (event: ChangeEvent<HTMLInputElement>) => {
    const algorithm = event.target.value;
    const updatedSelected = event.target.checked
      ? [...selectedAlgorithms, algorithm]
      : selectedAlgorithms.filter((algo) => algo !== algorithm);
    onSelectAlgorithms(updatedSelected);
  };

  const handleProcessChangeInput = (event: ChangeEvent<HTMLInputElement>) => {
    onProcessChange(Number(event.target.value));
  };

  const handleTimeQuantumChangeInput = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    onTimeQuantumChange(Number(event.target.value));
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onFormSubmit(); // Call the callback function on form submit
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <h3 className="mb-2">Select Algorithms</h3>
        <div className="form-check">
          <input
            type="checkbox"
            className="form-check-input"
            value="fifo"
            id="fifo"
            checked={selectedAlgorithms.includes("fifo")}
            onChange={handleCheckboxChange}
          />
          <label className="form-check-label" htmlFor="fifo">
            FIFO (First In First Out)
          </label>
        </div>
        <div className="form-check">
          <input
            type="checkbox"
            className="form-check-input"
            value="sjf"
            id="sjf"
            checked={selectedAlgorithms.includes("sjf")}
            onChange={handleCheckboxChange}
          />
          <label className="form-check-label" htmlFor="sjf">
            SJF (Shortest Job First)
          </label>
        </div>
        <div className="form-check">
          <input
            type="checkbox"
            className="form-check-input"
            value="stcf"
            id="stcf"
            checked={selectedAlgorithms.includes("stcf")}
            onChange={handleCheckboxChange}
          />
          <label className="form-check-label" htmlFor="stcf">
            STCF (Shortest Time-to-Completion First)
          </label>
        </div>
        <div className="form-check">
          <input
            type="checkbox"
            className="form-check-input"
            value="rr"
            id="rr"
            checked={selectedAlgorithms.includes("rr")}
            onChange={handleCheckboxChange}
          />
          <label className="form-check-label" htmlFor="rr">
            RR (Round Robin)
          </label>
        </div>
        <div className="form-check">
          <input
            type="checkbox"
            className="form-check-input"
            value="mlfq"
            id="mlfq"
            checked={selectedAlgorithms.includes("mlfq")}
            onChange={handleCheckboxChange}
          />
          <label className="form-check-label" htmlFor="mlfq">
            MLFQ (Multi-Level Feedback Queue)
          </label>
        </div>
      </div>

      <div className="mb-3">
        <label htmlFor="numProcesses" className="form-label">
          Number of Processes
        </label>
        <div className="col-md-2">
          <input
            type="number"
            className="form-control"
            id="numProcesses"
            value={numProcesses}
            onChange={handleProcessChangeInput}
            min="1"
            placeholder="Enter number of processes"
          />
        </div>
      </div>

      <div className="mb-3">
        <label htmlFor="timeQuantum" className="form-label">
          Time Quantum (For Round Robin)
        </label>
        <div className="col-md-2">
          <input
            type="number"
            className="form-control"
            id="timeQuantum"
            value={timeQuantum}
            onChange={handleTimeQuantumChangeInput}
            min="1"
            placeholder="Enter Time Quantum"
          />
        </div>
      </div>

      <button type="submit" className="btn btn-primary">
        Start Simulation
      </button>
    </form>
  );
}

export default AlgorithmSelection;
