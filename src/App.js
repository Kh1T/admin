import logo from './logo.svg';
import './App.css';
import ProductManager from './components/ProductManager';
import BrandManager from './components/BrandManager';
import CategoryManager from './components/CategoryManager';
import { useState } from 'react';

function App() {
  const [activeTab, setActiveTab] = useState('product'); // default to product

  const renderManager = () => {
    switch (activeTab) {
      case 'product':
        return <ProductManager />;
      case 'brand':
        return <BrandManager />;
      case 'category':
        return <CategoryManager />;
      default:
        return <ProductManager />;
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <div className="nav-tabs">
          <button
            className={activeTab === 'product' ? 'active' : ''}
            onClick={() => setActiveTab('product')}
          >
            Products
          </button>
          <button
            className={activeTab === 'brand' ? 'active' : ''}
            onClick={() => setActiveTab('brand')}
          >
            Brands
          </button>
          <button
            className={activeTab === 'category' ? 'active' : ''}
            onClick={() => setActiveTab('category')}
          >
            Categories
          </button>
        </div>
        <div className="manager-container">
          {renderManager()}
        </div>
      </header>
    </div>
  );
}

export default App;
