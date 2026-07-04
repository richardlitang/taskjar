import { Routes, Route} from 'react-router-dom'
import Home from './pages/Home'
import Tasks from './pages/Tasks'
import Projects from './pages/Projects'
import Settings from './pages/Settings'

function App() {
  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<Home />}/>  
        <Route path="/tasks" element={<Tasks />}/>
        <Route path="/projects" element={<Projects />}/>
        <Route path="/settings" element={<Settings />}/>
      </Routes>
    </div>
  );
} 

export default App;
