import { Routes, Route} from 'react-router-dom'
import Home from './pages/Home'
import Tasks from './pages/Tasks'
import Projects from './pages/Projects'
import Settings from './pages/Settings'
import Helmet from 'react-helmet'

function App() {
  return (
    <div className="app">
       <Helmet>
          <meta charSet="utf-8" />
          <meta name="google" content="notranslate" />
          <title>TaskJar</title>
      </Helmet>
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
