import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// --- COMPONENTES GERAIS ---
import Login from './Login';
import Dashboard from './Dashboard';
import Financeiro from './components/Financeiro';
import Vendas from './Vendas';

// --- PRODUTOS (Bens) ---
import Bens from './Bens'; 
import AddBem from './AddBem';      
import EditBem from './EditBem';
import BensPorSala from './BensPorSala'; 
import BensPorUnidade from './BensPorUnidade';

// --- CADASTROS BÁSICOS ---
import Unidades from './Unidades';
import AddUnidade from './AddUnidade'; 
import LocaisPorUnidade from './LocaisPorUnidade';

import Categorias from './Categorias';
import AddCategoria from './AddCategoria';
import EditCategoria from './EditCategoria';

// --- LOCAIS DE ESTOQUE (Salas) ---
import Salas from './Salas';
import EditSala from './EditSala';

// --- GESTÃO E RELATÓRIOS ---
// AQUI ESTAVA O ERRO! Mudamos para pegar o arquivo da raiz (./Gestores)
import Gestores from './Gestores'; 
import AddGestor from './AddGestor';
import RelatorioVendas from './paginas/TelaRelatorio';
import GerenciarFornecedores from './paginas/GerenciarFornecedores';

// Proteção de Rota
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('access_token');
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Rota Inicial e Login */}
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        
        {/* --- PRODUTOS --- */}
        <Route path="/bens" element={<PrivateRoute><Bens /></PrivateRoute>} />
        <Route path="/add-bem" element={<PrivateRoute><AddBem /></PrivateRoute>} />
        <Route path="/cadastro-bem" element={<PrivateRoute><AddBem /></PrivateRoute>} />
        <Route path="/edit-bem/:id" element={<PrivateRoute><EditBem /></PrivateRoute>} />
        
        {/* --- LOJAS (UNIDADES) --- */}
        <Route path="/unidades" element={<PrivateRoute><Unidades /></PrivateRoute>} />
        <Route path="/add-unidade" element={<PrivateRoute><AddUnidade /></PrivateRoute>} />
        <Route path="/unidades/:id" element={<PrivateRoute><BensPorUnidade /></PrivateRoute>} />
        <Route path="/unidades/:id/locais" element={<PrivateRoute><LocaisPorUnidade /></PrivateRoute>} />

        {/* --- CATEGORIAS --- */}
        <Route path="/categorias" element={<PrivateRoute><Categorias /></PrivateRoute>} />
        <Route path="/add-categoria" element={<PrivateRoute><AddCategoria /></PrivateRoute>} />
        <Route path="/categorias/:id" element={<PrivateRoute><EditCategoria /></PrivateRoute>} />

        {/* --- LOCAIS DE ESTOQUE (SALAS) --- */}
        <Route path="/salas" element={<PrivateRoute><Salas /></PrivateRoute>} />
        
        <Route path="/add-sala" element={<PrivateRoute><EditSala /></PrivateRoute>} />
        
        <Route path="/salas/:id" element={<PrivateRoute><EditSala /></PrivateRoute>} />
        <Route path="/salas/:id/bens" element={<PrivateRoute><BensPorSala /></PrivateRoute>} />

        {/* --- FORNECEDORES --- */}
        <Route path="/fornecedores" element={<PrivateRoute><GerenciarFornecedores /></PrivateRoute>} />
        
        {/* --- VENDAS E FINANCEIRO --- */}
        <Route path="/vendas" element={<PrivateRoute><Vendas /></PrivateRoute>} />
        <Route path="/financeiro" element={<PrivateRoute><Financeiro /></PrivateRoute>} />
        <Route path="/relatorio-vendas" element={<PrivateRoute><RelatorioVendas /></PrivateRoute>} />

        {/* --- GESTORES --- */}
        <Route path="/gestores" element={<PrivateRoute><Gestores /></PrivateRoute>} />
        <Route path="/add-gestor" element={<PrivateRoute><AddGestor /></PrivateRoute>} />

      </Routes>
    </Router>
  );
}

export default App;