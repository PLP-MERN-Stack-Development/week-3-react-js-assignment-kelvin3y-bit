// main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>
);

// App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import TaskManager from './pages/TaskManager';
import ApiData from './pages/ApiData';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<TaskManager />} />
        <Route path="/api" element={<ApiData />} />
      </Routes>
    </Layout>
  );
}

// context/ThemeContext.jsx
import React, { createContext, useContext, useState } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');
  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <div className={theme}>{children}</div>
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);

// hooks/useLocalStorage.js
import { useState, useEffect } from 'react';

export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(storedValue));
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}

// components/ui/Button.jsx
import React from 'react';

const styles = {
  primary: 'bg-blue-500 text-white hover:bg-blue-600',
  secondary: 'bg-gray-500 text-white hover:bg-gray-600',
  danger: 'bg-red-500 text-white hover:bg-red-600',
};

export default function Button({ children, variant = 'primary', ...props }) {
  return (
    <button
      {...props}
      className={`px-4 py-2 rounded ${styles[variant]} ${props.className}`}
    >
      {children}
    </button>
  );
}

// components/ui/Card.jsx
export default function Card({ children }) {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded shadow-md">
      {children}
    </div>
  );
}

// components/Navbar.jsx
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

export default function Navbar() {
  const { toggleTheme } = useTheme();
  return (
    <nav className="flex justify-between items-center p-4 bg-gray-100 dark:bg-gray-900">
      <div className="flex gap-4">
        <Link to="/">Tasks</Link>
        <Link to="/api">API</Link>
      </div>
      <button onClick={toggleTheme}>Toggle Theme</button>
    </nav>
  );
}

// components/Footer.jsx
export default function Footer() {
  return (
    <footer className="p-4 bg-gray-100 dark:bg-gray-900 text-center text-sm">
      &copy; {new Date().getFullYear()} Your App. All rights reserved.
    </footer>
  );
}

// components/Layout.jsx
import Navbar from './Navbar';
import Footer from './Footer';

export default function Layout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto p-4">{children}</main>
      <Footer />
    </div>
  );
}

// pages/TaskManager.jsx
import React, { useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

export default function TaskManager() {
  const [tasks, setTasks] = useLocalStorage('tasks', []);
  const [text, setText] = useState('');
  const [filter, setFilter] = useState('All');

  const addTask = () => {
    if (text.trim()) {
      setTasks([...tasks, { id: Date.now(), text, completed: false }]);
      setText('');
    }
  };

  const toggleTask = (id) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const filteredTasks = tasks.filter(t =>
    filter === 'All' ? true : filter === 'Active' ? !t.completed : t.completed
  );

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="border p-2 w-full"
          placeholder="Enter task"
        />
        <Button onClick={addTask}>Add</Button>
      </div>
      <div className="flex gap-2">
        {['All', 'Active', 'Completed'].map(f => (
          <Button
            key={f}
            variant={filter === f ? 'primary' : 'secondary'}
            onClick={() => setFilter(f)}
          >
            {f}
          </Button>
        ))}
      </div>
      {filteredTasks.map(task => (
        <Card key={task.id}>
          <div className="flex justify-between items-center">
            <span className={task.completed ? 'line-through' : ''}>{task.text}</span>
            <div className="space-x-2">
              <Button onClick={() => toggleTask(task.id)} variant="secondary">
                {task.completed ? 'Undo' : 'Complete'}
              </Button>
              <Button onClick={() => deleteTask(task.id)} variant="danger">
                Delete
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

// pages/ApiData.jsx
import React, { useEffect, useState } from 'react';
import Card from '../components/ui/Card';

export default function ApiData() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    fetch('https://jsonplaceholder.typicode.com/posts')
      .then(res => res.json())
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  const filtered = data.filter(item =>
    item.title.toLowerCase().includes(query.toLowerCase())
  );

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error loading data.</p>;

  return (
    <div className="space-y-4">
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="border p-2 w-full"
        placeholder="Search posts"
      />
      {filtered.map(post => (
        <Card key={post.id}>
          <h2 className="font-bold">{post.title}</h2>
          <p>{post.body}</p>
        </Card>
      ))}
    </div>
  );
}
