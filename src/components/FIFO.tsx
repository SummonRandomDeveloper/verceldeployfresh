import { useEffect, useState, FC } from "react";

interface Process {
  pid: number;
  arrivalTime: number;
  burstTime: number;
}

interface FIFOProps {
  processes: Process[];
}

const FIFO: FC<FIFOProps> = ({ processes }) => {
  const [schedule, setSchedule] = useState<
    { pid: number; startTime: number; endTime: number }[]
  >([]);

  useEffect(() => {
    const sortedProcesses = [...processes].sort(
      (a, b) => a.arrivalTime - b.arrivalTime
    );
    let currentTime = 0;
    const newSchedule: { pid: number; startTime: number; endTime: number }[] =
      [];

    sortedProcesses.forEach((process) => {
      const startTime = Math.max(currentTime, process.arrivalTime);
      const endTime = startTime + process.burstTime;
      newSchedule.push({ pid: process.pid, startTime, endTime });
      currentTime = endTime;
    });

    setSchedule(newSchedule);
  }, [processes]);

  // Calculate the total timeline length
  const totalLength =
    schedule.length > 0 ? schedule[schedule.length - 1].endTime : 0;
  const timeUnitWidth = 30; // 20 pixels per unit of time

  return (
    <div className="mt-4">
      <h4>FIFO Simulation</h4>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          position: "relative",
          height: "60px",
        }}
      >
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
          {schedule.map((process) => (
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

export default FIFO;
