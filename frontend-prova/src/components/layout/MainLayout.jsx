import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

export function MainLayout() {
  return (
    <div className="flex min-h-screen bg-fundo-2 font-sans">
      <Sidebar />
      <main className="flex-1 p-10 h-screen overflow-y-auto">
        {/* O Outlet é onde o React Router vai injetar a página de Funcionários ou Cargos */}
        <Outlet /> 
      </main>
    </div>
  );
}