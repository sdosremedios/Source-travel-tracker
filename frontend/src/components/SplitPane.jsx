export default function SplitPane({ left, right }) {
  return (
    <div style={{
      display: "flex",
      height: "100vh",
      background: "#fafafa"
    }}>
      <div style={{
        width: 320,
        borderRight: "1px solid #ddd",
        overflowY: "auto",
        background: "white",
        paddingTop: 8
      }}>
        {left}
      </div>

      <div style={{
        flex: 1,
        overflowY: "auto",
        padding: 32,
        background: "#fff"
      }}>
        {right}
      </div>
    </div>
  );
}