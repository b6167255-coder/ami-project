import { LogOut, Home, Settings, Plus, CheckSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { signOut } from '../lib/auth';
import { useAuth } from '../contexts/AuthContext';

export function Sidebar() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const isSubstitute = user?.role === 'substitute_teacher';

  return (
    <div className="w-64 bg-white border-l border-gray-200 h-screen flex flex-col shadow-lg">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-indigo-600">מערכת מחליפים</h1>
        <p className="text-sm text-gray-600 mt-2">{user?.full_name}</p>
      </div>

      <nav className="flex-1 p-6 space-y-2">
        <NavItem
          icon={<Home className="w-5 h-5" />}
          label="דף הבית"
          onClick={() => navigate('/dashboard')}
        />

        {isSubstitute ? (
          <>
            <NavItem
              icon={<CheckSquare className="w-5 h-5" />}
              label="משמרות זמינות"
              onClick={() => navigate('/available-shifts')}
            />
            <NavItem
              icon={<Settings className="w-5 h-5" />}
              label="הגדרות זמינות"
              onClick={() => navigate('/availability')}
            />
          </>
        ) : (
          <>
            <NavItem
              icon={<Plus className="w-5 h-5" />}
              label="בקשה חדשה"
              onClick={() => navigate('/new-request')}
            />
            <NavItem
              icon={<CheckSquare className="w-5 h-5" />}
              label="בקשות שלי"
              onClick={() => navigate('/my-requests')}
            />
          </>
        )}
      </nav>

      <div className="p-6 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-end gap-3 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
        >
          <span>התנתקות</span>
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

function NavItem({ icon, label, onClick }: NavItemProps) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-end gap-3 px-4 py-3 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition"
    >
      <span>{label}</span>
      {icon}
    </button>
  );
}
