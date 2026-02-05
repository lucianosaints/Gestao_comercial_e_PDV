import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// --- COMPONENTES GERAIS ---
import Login from './Login';
import Dashboard from './Dashboard';
import Financeiro from './components/Financeiro';
import Vendas from './Vendas';
import PDV from './paginas/PDV'; // <--- NOVO


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
import Gestores from './Gestores';
import AddGestor from './AddGestor';
import RelatorioVendas from './paginas/TelaRelatorio';
import GerenciarFornecedores from './paginas/GerenciarFornecedores';
import DashboardFinanceiro from './paginas/DashboardFinanceiro'; // <--- NOVO IMPORT
import ImportarNota from './paginas/ImportarNota'; // <--- NOVO IMPORT
import Clientes from './Clientes';

// Proteção de Rota
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('access_token');
  return token ? children : <Navigate to="/login" />;
};

const RestrictedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('access_token');
  const userRole = localStorage.getItem('user_role') || 'vendedor';

  if (!token) return <Navigate to="/login" />;

  // Se o cargo atual não está na lista permitida, redireciona
  if (!allowedRoles.includes(userRole)) {
    // Se for vendedor tentando acessar coisa restrita, joga pro PDV
    if (userRole === 'vendedor') return <Navigate to="/pdv" />;
    return <Navigate to="/dashboard" />;
  }
  return children;
};

const HomeRedirect = () => {
  const token = localStorage.getItem('access_token');
  const userRole = localStorage.getItem('user_role') || 'vendedor';
  if (!token) return <Navigate to="/login" />;

  // Vendedor vai direto pro PDV
  if (userRole === 'vendedor') return <Navigate to="/pdv" />;
  return <Navigate to="/dashboard" />;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Rota Inicial e Login */}
        <Route path="/login" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<HomeRedirect />} />
        <Route path="/dashboard" element={<RestrictedRoute allowedRoles={['gerente']}><Dashboard /></RestrictedRoute>} />

        {/* --- PRODUTOS --- */}
        {/* --- PRODUTOS (Gerente e Estoque) --- */}
        <Route path="/bens" element={<RestrictedRoute allowedRoles={['gerente', 'estoque']}><Bens /></RestrictedRoute>} />
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
        {/* --- FORNECEDORES (Gerente e Estoque) --- */}
        <Route path="/fornecedores" element={<RestrictedRoute allowedRoles={['gerente', 'estoque']}><GerenciarFornecedores /></RestrictedRoute>} />

// --- VENDAS E FINANCEIRO ---
        <Route path="/vendas" element={<PrivateRoute><Vendas /></PrivateRoute>} />
        <Route path="/pdv" element={<PrivateRoute><PDV /></PrivateRoute>} /> {/* NOVA ROTA PDV */}
        <Route path="/despesas" element={<PrivateRoute><Financeiro /></PrivateRoute>} />
        <Route path="/pdv" element={<PrivateRoute><PDV /></PrivateRoute>} /> {/* PDV é livre para autênticados */}
        <Route path="/despesas" element={<RestrictedRoute allowedRoles={['gerente']}><Financeiro /></RestrictedRoute>} />
        <Route path="/dashboard-financeiro" element={<RestrictedRoute allowedRoles={['gerente']}><DashboardFinanceiro /></RestrictedRoute>} /> {/* Nova Rota */}
        <Route path="/relatorio-vendas" element={<PrivateRoute><RelatorioVendas /></PrivateRoute>} />
        <Route path="/importar-nota" element={<RestrictedRoute allowedRoles={['gerente']}><ImportarNota /></RestrictedRoute>} /> {/* NOVA ROTA IMPORT */}

        {/* --- CLIENTES --- */}
        <Route path="/clientes" element={<PrivateRoute><Clientes /></PrivateRoute>} />

        {/* --- GESTORES --- */}
        <Route path="/gestores" element={<PrivateRoute><Gestores /></PrivateRoute>} />
        <Route path="/add-gestor" element={<PrivateRoute><AddGestor /></PrivateRoute>} />

      </Routes>
    </Router>
  );
}

export default App;