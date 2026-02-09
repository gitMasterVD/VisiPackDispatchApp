// import { BrowserRouter, Routes, Route } from "react-router-dom";

// import Login from "../pages/Login";
// import DispatchList from "../pages/DispatchList";
// import AddDispatch from "../pages/AddDispatch";


// const AppRoutes: React.FC = () => {
//   return (
//   <BrowserRouter>
//   <Routes>
//     <Route path="/" element={<Login />} />
//     <Route path="/dispatches" element={<DispatchList />} />
//     <Route path="/add-dispatch" element={<AddDispatch />} />
//   </Routes>
// </BrowserRouter>


//   );
// };

// export default AppRoutes;
import { Routes, Route } from "react-router-dom";

import Login from "../pages/Login";
import DispatchList from "../pages/DispatchList";
import AddDispatch from "../pages/AddDispatch";

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/dispatches" element={<DispatchList />} />
      <Route path="/add-dispatch" element={<AddDispatch />} />
    </Routes>
  );
};

export default AppRoutes;
