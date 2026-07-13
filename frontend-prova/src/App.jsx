import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';

// Telas de Funcionários
import Funcionarios from './pages/Funcionarios/index.jsx';
import NovoFuncionario from './pages/Funcionarios/Novo.jsx';
import EditarFuncionario from './pages/Funcionarios/Editar.jsx';

// Telas de Cargos
import Cargos from './pages/Cargos/index.jsx';
import NovoCargo from './pages/Cargos/Novo.jsx';
import EditarCargo from './pages/Cargos/Editar.jsx';

// Telas de Departamentos
import Departamentos from './pages/Departamentos/index.jsx';
import NovoDepartamento from './pages/Departamentos/Novo.jsx';
import EditarDepartamento from './pages/Departamentos/Editar.jsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          {/* Rota inicial / Funcionários */}
          <Route index element={<Funcionarios />} />
          <Route path="funcionarios/novo" element={<NovoFuncionario />} />
          <Route path="funcionarios/editar/:id" element={<EditarFuncionario />} />
          
          {/* Rotas de Cargos */}
          <Route path="cargos" element={<Cargos />} />
          <Route path="cargos/novo" element={<NovoCargo />} />
          <Route path="cargos/editar/:id" element={<EditarCargo />} />
          
          {/* Rotas de Departamentos */}
          <Route path="departamentos" element={<Departamentos />} />
          <Route path="departamentos/novo" element={<NovoDepartamento />} /> 
          <Route path="departamentos/editar/:id" element={<EditarDepartamento />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;