import { NavLink } from 'react-router-dom';
import { User, Contact, DoorOpen } from 'lucide-react';
import logoX from '../../assets/logo-x.png';

export function Sidebar() {
  const menuItems = [
    { path: '/', icon: <User size={28} />, label: 'Funcionário' },
    { path: '/cargos', icon: <Contact size={28} />, label: 'Cargo' },
    { path: '/departamentos', icon: <DoorOpen size={28} />, label: 'Departamento' },
  ];

  return (
    <aside className="w-28 bg-azul-base flex flex-col items-center py-6 h-screen sticky top-0 shadow-lg shrink-0">
      <div className="mb-10 flex items-center justify-center select-none">
        <div className="w-16 h-16 bg-fundo rounded-xl flex items-center justify-center p-1.5 shadow-sm">
          <img
            src={logoX}
            alt="Logo"
            className="w-full h-full object-contain"
          />
        </div>
      </div>

      <nav className="w-full flex flex-col gap-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center w-full py-4 text-white transition-all cursor-pointer ${
                isActive 
                  ? 'bg-azul-hover border-l-4 border-white' 
                  : 'border-l-4 border-transparent hover:bg-azul-hover'
              }`
            }
          >
            {item.icon}
            <span className="text-[11px] mt-2 font-medium tracking-wide uppercase">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
