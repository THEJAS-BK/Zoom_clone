import AllRoutes from "./routes/AllRoutes";
import { BrowserRouter } from "react-router-dom";
import ServerWakeGate from "./components/ServerWakeGate";

function App() {
  return (
    <BrowserRouter>
      <ServerWakeGate>
        <AllRoutes />
      </ServerWakeGate>
    </BrowserRouter>
  );
}

export default App;