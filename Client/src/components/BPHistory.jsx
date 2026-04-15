import React, { useEffect, useState } from "react";
import { bpApi } from "../api/bpApi";

const BPHistory = ({ userId }) => {
  const [history, setHistory] = useState([]);

  const loadHistory = async () => {
    try {
      const data = await bpApi.getBPHistory(userId);
      setHistory(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const formatDate = (date) => {
    return new Date(date).toLocaleString();
  };

  return (

    <div>

      <h3>Previous BP Readings</h3>

      <table border="1" cellPadding="8">

        <thead>
          <tr>
            <th>Date & Time</th>
            <th>Systolic</th>
            <th>Diastolic</th>
            <th>BP</th>
          </tr>
        </thead>

        <tbody>

          {history.map((bp) => (
            <tr key={bp.id}>
              <td>{formatDate(bp.createdAt)}</td>
              <td>{bp.systolic}</td>
              <td>{bp.diastolic}</td>
              <td>{bp.systolic}/{bp.diastolic}</td>
            </tr>
          ))}

        </tbody>

      </table>

    </div>

  );

};

export default BPHistory;