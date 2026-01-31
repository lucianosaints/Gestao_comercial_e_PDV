import React, { useState } from 'react';
// MUDANÇA AQUI: Adicionei dois pontos (..) para voltar uma pasta e achar o Sidebar
import Sidebar from '../Sidebar';
import '../Dashboard.css';

function TelaGestores() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(window.innerWidth < 768);
  const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);

  return (
    <div className={`dashboard-container ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <Sidebar isCollapsed={isSidebarCollapsed} toggleCollapse={toggleSidebar} />
      <main className={`content ${isSidebarCollapsed ? 'content-expanded' : ''}`}>
        <div className="page-header">
            <h1>Gestores</h1>
            <p>Gerenciamento de usuários e permissões.</p>
        </div>
        
        <div className="panel" style={{padding:'50px', textAlign:'center', background:'white', borderRadius:'12px'}}>
            <h2>🚧 Em Construção</h2>
            <p style={{color:'#666'}}>Esta funcionalidade estará disponível em breve.</p>
        </div>
      </main>
    </div>
  );
}

export default TelaGestores;