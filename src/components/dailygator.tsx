
const images = [
  "pictures/gators/gator0001.webp"
];

export default function DailyGator() {
  const today = new Date();
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) /
      86400000
  );

  return (
    <div style={{ textAlign: "center", width: "100%" }}>
      <h1>Today's Gator</h1>
      <img
        src={images[0]}
        style={{
          maxWidth: "90%",
          maxHeight: "80vh",
          borderRadius: "12px",
          display: "block",
          margin: "0 auto"
        }}
      />
    </div>
  );
}
