import { NavLink } from 'react-router-dom';
import { User, Contact, DoorOpen } from 'lucide-react';

export function Sidebar() {
  const menuItems = [
    { path: '/', icon: <User size={28} />, label: 'Funcionário' },
    { path: '/cargos', icon: <Contact size={28} />, label: 'Cargo' },
    { path: '/departamentos', icon: <DoorOpen size={28} />, label: 'Departamento' },
  ];

  return (
    <aside className="w-28 bg-[#3078b4] flex flex-col items-center py-6 h-screen sticky top-0 shadow-lg shrink-0">
      <div className="text-white text-6xl font-extrabold mb-12 select-none">
        X
      </div>

      <nav className="w-full flex flex-col gap-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center w-full py-4 text-white transition-all cursor-pointer ${
                isActive 
                  ? 'bg-[#276496] border-l-4 border-white' 
                  : 'border-l-4 border-transparent hover:bg-[#2c6fa5]'
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