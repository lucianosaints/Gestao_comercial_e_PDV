import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  FaHome, FaCashRegister, FaChartLine, FaBox, FaWarehouse,
  FaStore, FaLayerGroup, FaUserTie, FaSignOutAlt, FaBars,
  FaTruck, FaCalculator
} from 'react-icons/fa';

function Sidebar({ isCollapsed, toggleCollapse }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobile, setIsMobile] = React.useState(window.innerWidth < 1024);

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // --- LÓGICA DE CARGOS (A Novidade) ---
  const cargo = localStorage.getItem('user_role') || 'vendedor';
  const isGerente = cargo === 'gerente';
  const isVendedor = cargo === 'vendedor' || cargo === 'gerente';
  const isEstoque = cargo === 'estoque' || cargo === 'gerente';
  // -------------------------------------

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_role'); // Limpa cargo
    localStorage.removeItem('user_name'); // Limpa nome
    navigate('/login');
  };

  // --- SEUS ESTILOS ORIGINAIS ---
  const styles = {
    container: {
      width: isCollapsed ? (isMobile ? '0px' : '80px') : '260px',
      backgroundColor: '#0f172a',
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      height: '100vh',
      transition: 'width 0.3s ease',
      zIndex: 1000,
      left: 0,
      top: 0,
      overflowX: 'hidden', // Importante para não mostrar scroll quando fechar
      boxShadow: isMobile && !isCollapsed ? '5px 0 15px rgba(0,0,0,0.3)' : 'none'
    },
    header: {
      height: '60px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 20px',
      backgroundColor: 'rgba(0,0,0,0.2)',
      borderBottom: '1px solid rgba(255,255,255,0.1)'
    },
    menuList: {
      listStyle: 'none',
      padding: 0,
      margin: 0,
      flex: 1,
      overflowY: 'auto'
    },
    menuSection: {
      fontSize: '11px',
      textTransform: 'uppercase',
      color: '#94a3b8',
      margin: '20px 20px 5px',
      fontWeight: 'bold',
      display: isCollapsed ? 'none' : 'block'
    },
    item: (isActive) => ({
      display: 'flex',
      alignItems: 'center',
      padding: '12px 20px',
      cursor: 'pointer',
      color: isActive ? '#10b981' : '#e2e8f0',
      backgroundColor: isActive ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
      borderLeft: isActive ? '3px solid #10b981' : '3px solid transparent',
      justifyContent: isCollapsed ? 'center' : 'flex-start',
      textDecoration: 'none'
    }),
    text: {
      marginLeft: '15px',
      display: isCollapsed ? 'none' : 'block',
      fontWeight: '500'
    },
    footer: {
      padding: '20px',
      borderTop: '1px solid rgba(255,255,255,0.1)'
    },
    logoutBtn: {
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'transparent',
      border: '1px solid #ef4444',
      color: '#ef4444',
      padding: '10px',
      borderRadius: '6px',
      cursor: 'pointer',
      fontWeight: 'bold'
    }
  };

  // --- LISTA DE MENUS FILTRADA POR CARGO ---
  const menuItems = [
    // Todo mundo vê o Painel
    { title: 'Painel Principal', icon: <FaHome size={20} />, path: '/dashboard' },

    // Vendedor e Gerente vêem vendas
    ...(isVendedor ? [
      { title: 'Frente de Caixa (PDV)', icon: <FaCashRegister size={20} />, path: '/vendas' },
      { title: 'Relatório Vendas', icon: <FaChartLine size={20} />, path: '/relatorio-vendas' },
    ] : []),

    // SÓ GERENTE vê Financeiro
    ...(isGerente ? [
      { title: 'Financeiro (Saídas)', icon: <FaCalculator size={20} />, path: '/financeiro' },
    ] : []),

    // Seções de Gestão
    { section: 'GESTÃO' },

    // Todos vêem Produtos
    { title: 'Produtos', icon: <FaBox size={20} />, path: '/bens' },

    // Estoque e Gerente vêem Fornecedores e Locais
    ...(isEstoque ? [
      { title: 'Fornecedores', icon: <FaTruck size={20} />, path: '/fornecedores' },
      { title: 'Locais de Estoque', icon: <FaWarehouse size={20} />, path: '/salas' },
    ] : []),

    // SÓ GERENTE vê Configurações
    ...(isGerente ? [
      { section: 'CONFIGURAÇÕES' },
      { title: 'Lojas / Filiais', icon: <FaStore size={20} />, path: '/unidades' },
      { title: 'Departamentos', icon: <FaLayerGroup size={20} />, path: '/categorias' },
      { title: 'Gestores', icon: <FaUserTie size={20} />, path: '/gestores' },
    ] : []),

    // Lista de Clientes (Visível para Vendedor e Gerente)
    ...(isVendedor ? [
      { title: 'Clientes', icon: <FaUserTie size={20} />, path: '/clientes' }
    ] : [])
  ];

  return (
    <div style={styles.container}>

      <div style={styles.header}>
        {!isCollapsed && (
          <span style={{ fontSize: '20px', fontWeight: 'bold' }}>
            Sakura<span style={{ color: '#10b981' }}>System</span>
          </span>
        )}
        <button onClick={toggleCollapse} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '20px' }}>
          <FaBars />
        </button>
      </div>

      <ul style={styles.menuList}>
        {menuItems.map((item, index) => {
          if (item.section) {
            return <li key={index} style={styles.menuSection}>{item.section}</li>;
          }

          const isActive = location.pathname === item.path;

          return (
            <li
              key={index}
              onClick={() => navigate(item.path)}
              style={styles.item(isActive)}
            >
              <span style={{ display: 'flex', alignItems: 'center' }}>{item.icon}</span>
              <span style={styles.text}>{item.title}</span>
            </li>
          );
        })}
      </ul>

      <div style={styles.footer}>
        <button onClick={handleLogout} style={styles.logoutBtn}>
          <FaSignOutAlt />
          {!isCollapsed && <span style={{ marginLeft: '10px' }}>Sair do Sistema</span>}
        </button>
      </div>

    </div>
  );
}

export default Sidebar;