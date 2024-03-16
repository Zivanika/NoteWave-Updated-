import './App.css';
import{
  BrowserRouter as Router,
  Routes,
  Route
} from "react-router-dom"
import Navbar from './components/Navbar'
// import {Home} from './components/Home'
// import {About} from './components/About'
import Abouts from './components/Abouts';
import Homes from './components/Homes';
import NoteState from './context/notes/NoteState'
import Alert from './components/Alert';
function App() {
  return (
    <>
    <NoteState>
    <Router>
    <Navbar/>
    <Alert message="Welcome to NoteWave😊"/>
    <div className="container">
    <Routes>
    <Route exact path="/about" element={<Abouts/>}/>
    <Route exact path="/" element={<Homes/>}/>
    </Routes>
    </div>
    </Router>
    

  {/* <h1>This is Notewave</h1> */}
  </NoteState>
    </>
  );
}

export default App;
