import { useEffect, useState, FC } from "react";

interface Process {
  pid: number;
  arrivalTime: number;
  burstTime: number;
}

interface RRProps {
  processes: Process[];
  timeQuantum: number;
}

interface ScheduleSegment {
  pid: number;
  startTime: number;
  endTime: number;
}

interface ProcessResult extends Process {
  finishTime: number;
}

const RR: FC<RRProps> = ({ processes, timeQuantum }) => {
  const [schedule, setSchedule] = useState<ScheduleSegment[]>([]);
  const [processResults, setProcessResults] = useState<ProcessResult[]>([]);
  const [totalTime, setTotalTime] = useState<number>(0);

  useEffect(() => {
    // Simulation function for Round Robin scheduling.
    const simulateRR = () => {
      let time = 0;
      const timeline: number[] = [];
      // Create a copy of processes with additional fields.
      // Note: We're not modifying the original Process interface.
      const processList = processes
        .map((p) => ({
          ...p,
          remaining: p.burstTime,
          finishTime: null as number | null,
        }))
        // Sort processes by arrival time.
        .sort((a, b) => a.arrivalTime - b.arrivalTime);

      const n = processList.length;
      const readyQueue: typeof processList = [];
      let i = 0; // Index for new arrivals.

      // Continue simulation until all processes are finished.
      while (processList.some((p) => p.remaining > 0)) {
        // Enqueue any processes that have arrived by current time.
        while (i < n && processList[i].arrivalTime <= time) {
          readyQueue.push(processList[i]);
          i++;
        }
        // If no process is ready, record an idle time unit.
        if (readyQueue.length === 0) {
          timeline.push(0);
          time++;
          continue;
        }
        // Dequeue the first process in the ready queue.
        const current = readyQueue.shift()!;
        // Determine the time slice to run (minimum of timeQuantum and remaining burst).
        const slice = Math.min(timeQuantum, current.remaining);
        // For each time unit of the slice, record the process ID.
        for (let t = 0; t < slice; t++) {
          timeline.push(current.pid);
        }
        time += slice;
        current.remaining -= slice;
        // Enqueue any new processes that have arrived during this slice.
        while (i < n && processList[i].arrivalTime <= time) {
          readyQueue.push(processList[i]);
          i++;
        }
        // If the process is not finished, requeue it.
        if (current.remaining > 0) {
          readyQueue.push(current);
        } else {
          // Record finish time.
          current.finishTime = time;
        }
      }

      return { timeline, processList };
    };

    const { timeline, processList } = simulateRR();

    // Convert the timeline into contiguous schedule segments.
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

    // Map the processList into processResults.
    const results: ProcessResult[] = processList.map((p) => ({
      pid: p.pid,
      arrivalTime: p.arrivalTime,
      burstTime: p.burstTime,
      finishTime: p.finishTime as number,
    }));

    setSchedule(segments);
    setProcessResults(results);
    setTotalTime(timeline.length);
  }, [processes, timeQuantum]);

  const timeUnitWidth = 30; // Each time unit is 30px wide

  return (
    <div className="mt-4">
      <h4>Round Robin (RR) Simulation</h4>
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

export default RR;
