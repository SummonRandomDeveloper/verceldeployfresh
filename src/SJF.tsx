import { useEffect, useState, FC } from "react";

interface Process {
  pid: number;
  arrivalTime: number;
  burstTime: number;
}

interface SJFProps {
  processes: Process[];
}

const SJF: FC<SJFProps> = ({ processes }) => {
  const [schedule, setSchedule] = useState<
    { pid: number; startTime: number; endTime: number }[]
  >([]);

  useEffect(() => {
    // Sort by arrival time initially
    const sortedProcesses = [...processes].sort(
      (a, b) => a.arrivalTime - b.arrivalTime
    );

    let currentTime = 0;
    // Remaining processes to schedule
    const remainingProcesses = [...sortedProcesses];
    const newSchedule: { pid: number; startTime: number; endTime: number }[] =
      [];

    while (remainingProcesses.length > 0) {
      // Get the processes that have arrived up to the current time
      const readyProcesses = remainingProcesses.filter(
        (process) => process.arrivalTime <= currentTime
      );

      if (readyProcesses.length > 0) {
        // Sort the ready processes by burst time (shortest first)
        readyProcesses.sort((a, b) => a.burstTime - b.burstTime);

        // Select the shortest job to execute
        const nextProcess = readyProcesses[0];
        const startTime = Math.max(currentTime, nextProcess.arrivalTime);
        const endTime = startTime + nextProcess.burstTime;

        // Schedule this process
        newSchedule.push({ pid: nextProcess.pid, startTime, endTime });
        currentTime = endTime;

        // Remove the selected process from the remaining processes
        const processIndex = remainingProcesses.findIndex(
          (process) => process.pid === nextProcess.pid
        );
        remainingProcesses.splice(processIndex, 1);
      } else {
        // If no processes are ready, advance time to the next process arrival
        currentTime = Math.min(...remainingProcesses.map((p) => p.arrivalTime));
      }
    }

    setSchedule(newSchedule);
  }, [processes]);

  // Start by saying the biggest end time is 0
  let biggestEndTime = 0;

  // Now, let's go through each process and see if it ends later than the current biggest
  for (let i = 0; i < schedule.length; i++) {
    const process = schedule[i]; // This is the current process we're looking at
    const processEndTime = process.endTime; // This is when the current process ends

    // Compare this process's end time to the biggest end time we've found so far
    if (processEndTime > biggestEndTime) {
      // If it's bigger, make this the new biggest end time
      biggestEndTime = processEndTime;
    }
  }

  // At the end, biggestEndTime will be the longest time from all processes
  const totalLength = biggestEndTime;

  const timeUnitWidth = 30; // 20 pixels per unit of time

  return (
    <div className="mt-4">
      <h4>SJF Simulation</h4>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          position: "relative",
          height: "60px",
        }}
      >
        {/* Time blocks for each process */}
        {schedule.map((process) => (
          <div
            key={process.pid}
            style={{
              width: (process.endTime - process.startTime) * timeUnitWidth,
              backgroundColor: `hsl(${process.pid * 40}, 70%, 70%)`,
              border: "1px solid black",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              position: "absolute",
              left: process.startTime * timeUnitWidth,
              height: "40px",
            }}
          >
            P{process.pid}
          </div>
        ))}
      </div>

      {/* Time Scale */}
      <div style={{ display: "flex", position: "relative" }}>
        {Array.from({ length: Math.ceil(totalLength) + 1 }).map((_, index) => {
          const timeValue = index;
          return (
            <div
              key={timeValue}
              style={{
                position: "absolute",
                left: timeValue * timeUnitWidth,
                fontSize: "12px",
                top: "5px",
                width: "1px",
                borderLeft: "1px solid black",
                height: "10px",
              }}
            >
              <span style={{ position: "absolute", top: "15px", left: "-4px" }}>
                {timeValue}
              </span>
            </div>
          );
        })}
      </div>

      {/* Chart of PID, Start Time, Burst Time, End Time */}
      <table className="table mt-5">
        <thead>
          <tr>
            <th>PID</th>
            <th>Start Time</th>
            <th>Burst Time</th>
            <th>End Time</th>
          </tr>
        </thead>
        <tbody>
          {/* Sort the schedule by PID */}
          {schedule
            .sort((a, b) => a.pid - b.pid)
            .map((process) => (
              <tr key={process.pid}>
                <td>P{process.pid}</td>
                <td>{process.startTime}</td>
                <td>{process.endTime - process.startTime}</td>
                <td>{process.endTime}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};

export default SJF;
