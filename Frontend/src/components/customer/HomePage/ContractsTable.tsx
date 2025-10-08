import React from "react";

const ContractsTable: React.FC = () => {
  const contracts = [
    { id: 1, title: "Software License Agreement", status: "Signed" },
    { id: 2, title: "App Development Contract", status: "Waiting for My Confirmation" },
    { id: 3, title: "Maintenance Contract", status: "Waiting for Second Party" },
    { id: 4, title: "Data Processing Agreement", status: "Not Started" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Signed":
        return "#00C851";
      case "Waiting for My Confirmation":
        return "#FFD60A";
      case "Waiting for Second Party":
        return "#0096C7";
      default:
        return "#ccc";
    }
  };

  return (
    <div
      style={{
        background: "rgba(255, 255, 255, 0.1)",
        backdropFilter: "blur(15px)",
        border: "1px solid rgba(255, 255, 255, 0.2)",
        borderRadius: "16px",
        padding: "24px",
        color: "#fff",
        boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        marginBottom: "60px",
      }}
    >
      <h2 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "16px" }}>
        📄 Your Contracts
      </h2>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ textAlign: "left", borderBottom: "1px solid rgba(255,255,255,0.2)" }}>
            <th style={{ padding: "12px 8px" }}>ID</th>
            <th style={{ padding: "12px 8px" }}>Title</th>
            <th style={{ padding: "12px 8px" }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {contracts.map((contract) => (
            <tr key={contract.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
              <td style={{ padding: "12px 8px" }}>{contract.id}</td>
              <td style={{ padding: "12px 8px" }}>{contract.title}</td>
              <td
                style={{
                  padding: "12px 8px",
                  color: getStatusColor(contract.status),
                  fontWeight: 600,
                }}
              >
                {contract.status}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ContractsTable;
