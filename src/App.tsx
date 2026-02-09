import AppRoutes from "./routes/AppRoutes";
import "./App.css"; // optional for other global styles

function App() {
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundImage: `url("/assets/bg.jpeg")`, // ✅ use public path
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <AppRoutes />
    </div>
  );
}

export default App;
