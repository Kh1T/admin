import logo from './logo.svg';
import './App.css';
import ProductManager from './components/ProductManager';
import BrandManager from './components/BrandManager';
import CategoryManager from './components/CategoryManager';

function App() {
  return (
    <div className="App">
      <header className="App-header">
       <ProductManager />
       <BrandManager />
       <CategoryManager />
      </header>
    </div>
  );
}

export default App;
