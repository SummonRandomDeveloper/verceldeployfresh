import { useEffect, useState, FC } from "react";

interface Process {
  pid: number;
  arrivalTime: number;
  burstTime: number;
}

interface MLFQProps {
  processes: Process[];
  timeQuantum: number; // Time quantum for Queue 1; Queue 2 and 3 will use multiples of this.
}

interface ScheduleSegment {
  pid: number;
  startTime: number;
  endTime: number;
}

interface ProcessResult extends Process {
  finishTime: number;
}

interface TimelineEntry {
  pid: number;
  queue: number; // 0 = idle; 1,2,3 = corresponding queues.
}

const MLFQ: FC<MLFQProps> = ({ processes, timeQuantum }) => {
  const [scheduleQ1, setScheduleQ1] = useState<ScheduleSegment[]>([]);
  const [scheduleQ2, setScheduleQ2] = useState<ScheduleSegment[]>([]);
  const [scheduleQ3, setScheduleQ3] = useState<ScheduleSegment[]>([]);
  const [processResults, setProcessResults] = useState<ProcessResult[]>([]);
  const [totalTime, setTotalTime] = useState<number>(0);

  useEffect(() => {
    // Define time quanta for each queue.
    const q1Quantum = timeQuantum;
    const q2Quantum = timeQuantum * 2;
    const q3Quantum = timeQuantum * 4;

    let time = 0;
    const timeline: TimelineEntry[] = [];

    // Extend each process with additional fields.
    // currentQueue indicates the current priority level (1 highest, then 2, then 3).
    const processList = processes
      .map((p) => ({
        ...p,
        remaining: p.burstTime,
        finishTime: null as number | null,
        currentQueue: 1,
      }))
      .sort((a, b) => a.arrivalTime - b.arrivalTime);

    const n = processList.length;
    let arrivalIndex = 0;

    // Define the three queues.
    const queue1: typeof processList = [];
    const queue2: typeof processList = [];
    const queue3: typeof processList = [];

    // Initially, add processes that have arrived at time 0 to Queue 1.
    while (arrivalIndex < n && processList[arrivalIndex].arrivalTime <= time) {
      queue1.push(processList[arrivalIndex]);
      arrivalIndex++;
    }

    // Simulation loop.
    while (processList.some((p) => p.remaining > 0)) {
      let currentProcess = null;
      let currentQuantum = 0;
      let currentQueueNumber = 0;

      // Always choose from the highest priority non-empty queue.
      if (queue1.length > 0) {
        currentProcess = queue1.shift()!;
        currentQuantum = q1Quantum;
        currentQueueNumber = 1;
      } else if (queue2.length > 0) {
        currentProcess = queue2.shift()!;
        currentQuantum = q2Quantum;
        currentQueueNumber = 2;
      } else if (queue3.length > 0) {
        currentProcess = queue3.shift()!;
        currentQuantum = q3Quantum;
        currentQueueNumber = 3;
      } else {
        // No process is ready; record idle time.
        timeline.push({ pid: 0, queue: 0 });
        time++;
        // Enqueue any processes arriving during idle time.
        while (
          arrivalIndex < n &&
          processList[arrivalIndex].arrivalTime <= time
        ) {
          queue1.push(processList[arrivalIndex]);
          arrivalIndex++;
        }
        continue;
      }

      // Determine how long to run the current process.
      const slice = Math.min(currentQuantum, currentProcess.remaining);
      // Record timeline entries for each time unit in this slice.
      for (let t = 0; t < slice; t++) {
        timeline.push({ pid: currentProcess.pid, queue: currentQueueNumber });
      }
      time += slice;
      currentProcess.remaining -= slice;

      // Enqueue any new arrivals (they always enter Queue 1).
      while (
        arrivalIndex < n &&
        processList[arrivalIndex].arrivalTime <= time
      ) {
        queue1.push(processList[arrivalIndex]);
        arrivalIndex++;
      }

      if (currentProcess.remaining > 0) {
        // If the process is not finished, demote it (if not already in the lowest queue).
        if (currentQueueNumber === 1) {
          currentProcess.currentQueue = 2;
          queue2.push(currentProcess);
        } else if (currentQueueNumber === 2) {
          currentProcess.currentQueue = 3;
          queue3.push(currentProcess);
        } else {
          // In Queue 3, it remains here.
          queue3.push(currentProcess);
        }
      } else {
        // Process finished.
        currentProcess.finishTime = time;
      }
    }

    // Total simulation time.
    const total = timeline.length;

    // Helper: convert timeline for a given queue level into schedule segments.
    const getSegments = (queueNum: number): ScheduleSegment[] => {
      const segments: ScheduleSegment[] = [];
      let start: number | null = null;
      let currentPid: number | null = null;
      for (let i = 0; i < total; i++) {
        if (timeline[i].queue === queueNum && timeline[i].pid !== 0) {
          if (start === null) {
            start = i;
            currentPid = timeline[i].pid;
          } else if (timeline[i].pid !== currentPid) {
            segments.push({ pid: currentPid!, startTime: start, endTime: i });
            start = i;
            currentPid = timeline[i].pid;
          }
        } else {
          if (start !== null) {
            segments.push({ pid: currentPid!, startTime: start, endTime: i });
            start = null;
            currentPid = null;
          }
        }
      }
      if (start !== null) {
        segments.push({ pid: currentPid!, startTime: start, endTime: total });
      }
      return segments;
    };

    const segmentsQ1 = getSegments(1);
    const segmentsQ2 = getSegments(2);
    const segmentsQ3 = getSegments(3);

    // Map processList into processResults.
    const results: ProcessResult[] = processList.map((p) => ({
      pid: p.pid,
      arrivalTime: p.arrivalTime,
      burstTime: p.burstTime,
      finishTime: p.finishTime as number,
    }));

    setScheduleQ1(segmentsQ1);
    setScheduleQ2(segmentsQ2);
    setScheduleQ3(segmentsQ3);
    setProcessResults(results);
    setTotalTime(total);
  }, [processes, timeQuantum]);

  const timeUnitWidth = 30; // Each time unit is 30px wide

  return (
    <div className="mt-4">
      <h4>Multi-Level Feedback Queue (MLFQ) Simulation</h4>

      {/* Queue 1 (Highest Priority) */}
      <div style={{ marginBottom: "20px" }}>
        <h5>Queue 1 (Highest Priority)</h5>
        <div
          style={{
            position: "relative",
            height: "40px",
          }}
        >
          {scheduleQ1.map((segment, index) => (
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
      </div>

      {/* Queue 2 */}
      <div style={{ marginBottom: "20px" }}>
        <h5>Queue 2</h5>
        <div
          style={{
            position: "relative",
            height: "40px",
          }}
        >
          {scheduleQ2.map((segment, index) => (
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
      </div>

      {/* Queue 3 (Lowest Priority) */}
      <div style={{ marginBottom: "20px" }}>
        <h5>Queue 3 (Lowest Priority)</h5>
        <div
          style={{
            position: "relative",
            height: "40px",
          }}
        >
          {scheduleQ3.map((segment, index) => (
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
      </div>

      {/* Time Scale */}
      <div
        style={{ position: "relative", height: "20px", marginBottom: "20px" }}
      >
        {Array.from({ length: totalTime + 1 }).map((_, index) => (
          <div
            key={index}
            style={{
              position: "absolute",
              left: index * timeUnitWidth,
              fontSize: "12px",
              top: 0,
              width: "1px",
              borderLeft: "1px solid black",
              height: "10px",
            }}
          >
            <span style={{ position: "absolute", top: "10px", left: "-4px" }}>
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
            <th>Finish Time</th>
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

export default MLFQ;
