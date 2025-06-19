"use client";

import { useEffect, useState } from "react";
import { initSocket } from "@/lib/socket"; // adjust path if needed

export default function ImportHistory() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial fetch
    fetch("/api/import-logs")
      .then((res) => res.json())
      .then((data) => {
        setLogs(data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("❌ Error fetching logs:", err.message);
        setLoading(false);
      });

    const socket = initSocket();

    socket.on("import-update", (newLog) => {
      console.log("📡 Real-time log received", newLog);
      setLogs((prev) => {
        const exists = prev.find(
          (log) =>
            log.feedUrl === newLog.feedUrl &&
            new Date(log.timestamp).getTime() ===
              new Date(newLog.timestamp).getTime()
        );

        if (exists) {
          return prev.map((log) =>
            log.feedUrl === newLog.feedUrl &&
            new Date(log.timestamp).getTime() ===
              new Date(newLog.timestamp).getTime()
              ? newLog
              : log
          );
        } else {
          return [newLog, ...prev];
        }
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const formatDate = (timestamp) => {
    const options = {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    };
    return new Date(timestamp)
      .toLocaleString("en-GB", options)
      .replace(",", "");
  };

  return (
    <div className="p-6">
      <div className="overflow-auto">
        <h2 className="text-lg font-semibold mb-4">Import History Logs</h2>

        {loading ? (
          <div className="text-center text-gray-500 py-10">⏳ Loading...</div>
        ) : (
          <table className="table-auto w-full rounded-lg overflow-scroll shadow-md border border-gray-200">
            <thead>
              <tr className="bg-gray-100 text-sm">
                <th className="p-2 text-left">fileName</th>
                <th className="p-2">importDateTime</th>
                <th className="p-2">total</th>
                <th className="p-2">new</th>
                <th className="p-2">updated</th>
                <th className="p-2">failed</th>
              </tr>
            </thead>
            <tbody>
              {logs.length > 0 ? (
                logs.map((log) => (
                  <tr
                    key={log._id || `${log.feedUrl}-${log.timestamp}`}
                    className="text-sm text-center border-b border-gray-200 hover:bg-gray-50"
                  >
                    <td className="py-1 px-2 break-all text-left">
                      {log.feedUrl}
                    </td>

                    <td className="py-1 px-2">{formatDate(log.timestamp)}</td>

                    <td
                      className={`py-1 px-2 ${
                        log.totalFetched > 0
                          ? "text-yellow-400"
                          : "text-gray-700"
                      }`}
                    >
                      {log.totalFetched || 0}
                    </td>

                    <td
                      className={`py-1 px-2 ${
                        log.newJobs > 0
                          ? "text-yellow-400"
                          : "text-gray-700"
                      }`}
                    >
                      {log.newJobs || 0}
                    </td>

                    <td
                      className={`py-1 px-2 ${
                        log.updatedJobs > 0
                          ? "text-yellow-400"
                          : "text-gray-700"
                      }`}
                    >
                      {log.updatedJobs || 0}
                    </td>

                    <td
                      className={`py-1 px-2 ${
                        log.failedCount > 0
                          ? "text-red-600"
                          : "text-gray-700"
                      }`}
                    >
                      {log.failedCount || 0}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="text-center text-gray-500 py-6"
                  >
                    No import logs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
