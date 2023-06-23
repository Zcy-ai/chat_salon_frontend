import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import Login from './componets/login';
import Register from './componets/register';
import ResetPwd from "./componets/resetPwd";
import ChatRoom from "./componets/chatRoom";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route exact path="/" element={<Login/>} />
        <Route exact path="/login" element={<Login/>} />
        <Route exact path="/register" element={<Register/>} />
        <Route exact path="/resetPwd" element={<ResetPwd/>} />
        <Route exact path="/chatroom" element={<ChatRoom/>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
