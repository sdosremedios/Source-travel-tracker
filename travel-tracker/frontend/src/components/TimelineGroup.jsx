export default function TimelineGroup({ label, children }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{
        fontSize: 12,
        fontWeight: 600,
        color: "#666",
        marginBottom: 8,
        textTransform: "uppercase",
        letterSpacing: 0.5
      }}>
        {label}
      </div>

      <div style={{
        borderLeft: "2px solid #ddd",
        paddingLeft: 12
      }}>
        {children}
      </div>
    </div>
  );
}