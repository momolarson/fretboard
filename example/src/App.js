import logo from './gtc_verylarge_circular.png';
import './App.css';
import Fretboard from './components/Fretboard';

function App() {
  return (
    <div className="App">
      
      <header className="App-header">
      <a href="https://www.guitartabcreator.com"><img src={logo} className="App-logo" alt="logo" /></a>
        <p>
        Fretboard Diagram Generator presented by <a href="https://www.guitartabcreator.com" className="App-link">Guitar Tab Creator</a>
        </p>
      </header>
      <Fretboard />
    </div>
  );
}

export default App;
