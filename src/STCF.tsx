import { useEffect, useState, FC } from "react";

interface Process {
  pid: number;
  arrivalTime: number;
  burstTime: number;
}

interface STCFProps {
  processes: Process[];
}

interface ScheduleSegment {
  pid: number;
  startTime: number;
  endTime: number;
}

interface ProcessResult extends Process {
  finishTime: number;
}

const STCF: FC<STCFProps> = ({ processes }) => {
  const [schedule, setSchedule] = useState<ScheduleSegment[]>([]);
  const [processResults, setProcessResults] = useState<ProcessResult[]>([]);
  const [totalTime, setTotalTime] = useState<number>(0);

  useEffect(() => {
    // Simulation function for STCF scheduling.
    const simulateSTCF = () => {
      let time = 0;
      const timeline: number[] = [];
      // Extend each process with a remaining time counter and finishTime.
      const processList = processes.map((p) => ({
        ...p,
        remaining: p.burstTime,
        finishTime: null as number | null,
      }));

      // Run the simulation until all processes are finished.
      while (processList.some((p) => p.remaining > 0)) {
        // Get processes that have arrived and still need CPU time.
        const available = processList.filter(
          (p) => p.arrivalTime <= time && p.remaining > 0
        );
        if (available.length === 0) {
          // No available process: record an idle time unit (represented by 0).
          timeline.push(0);
          time++;
          continue;
        }
        // Select the process with the shortest remaining burst time.
        available.sort((a, b) => a.remaining - b.remaining);
        const currentProcess = available[0];
        timeline.push(currentProcess.pid);
        currentProcess.remaining -= 1;
        if (currentProcess.remaining === 0) {
          // Record finish time when process completes.
          currentProcess.finishTime = time + 1;
        }
        time++;
      }
      return { timeline, processList };
    };

    const { timeline, processList } = simulateSTCF();

    // Convert the timeline into schedule segments (for contiguous execution blocks).
    const segments: ScheduleSegment[] = [];
    if (timeline.length > 0) {
      let start = 0;
      let currentPid = timeline[0];
      for (let t = 1; t < timeline.length; t++) {
        if (timeline[t] !== currentPid) {
          segments.push({ pid: currentPid, startTime: start, endTime: t });
          start = t;
          currentPid = timeline[t];
        }
      }
      segments.push({
        pid: currentPid,
        startTime: start,
        endTime: timeline.length,
      });
    }

    // Map processList into processResults (cast finishTime as number).
    const results: ProcessResult[] = processList.map((p) => ({
      pid: p.pid,
      arrivalTime: p.arrivalTime,
      burstTime: p.burstTime,
      finishTime: p.finishTime as number,
    }));

    setSchedule(segments);
    setProcessResults(results);
    setTotalTime(timeline.length);
  }, [processes]);

  const timeUnitWidth = 30; // Each time unit is 30px wide

  return (
    <div className="mt-4">
      <h4>STCF Simulation</h4>
      {/* Timeline Display */}
      <div style={{ position: "relative", height: "60px" }}>
        {schedule
          // Skip idle segments.
          .filter((segment) => segment.pid !== 0)
          .map((segment, index) => (
            <div
              key={index}
              style={{
                position: "absolute",
                left: segment.startTime * timeUnitWidth,
                width: (segment.endTime - segment.startTime) * timeUnitWidth,
                backgroundColor: `hsl(${segment.pid * 40}, 70%, 70%)`,
                border: "1px solid black",
                height: "40px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {`P${segment.pid}`}
            </div>
          ))}
      </div>

      {/* Time Scale */}
      <div style={{ display: "flex", position: "relative" }}>
        {Array.from({ length: totalTime + 1 }).map((_, index) => (
          <div
            key={index}
            style={{
              position: "absolute",
              left: index * timeUnitWidth,
              fontSize: "12px",
              top: "5px",
              width: "1px",
              borderLeft: "1px solid black",
              height: "10px",
            }}
          >
            <span style={{ position: "absolute", top: "15px", left: "-4px" }}>
              {index}
            </span>
          </div>
        ))}
      </div>

      {/* Process Table */}
      <table className="table mt-5">
        <thead>
          <tr>
            <th>PID</th>
            <th>Arrival Time</th>
            <th>Burst Time</th>
            <th>End Time</th>
          </tr>
        </thead>
        <tbody>
          {processResults
            .sort((a, b) => a.pid - b.pid)
            .map((process) => (
              <tr key={process.pid}>
                <td>P{process.pid}</td>
                <td>{process.arrivalTime}</td>
                <td>{process.burstTime}</td>
                <td>{process.finishTime}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};

export default STCF;
