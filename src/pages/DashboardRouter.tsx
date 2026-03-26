import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { TeacherDashboard } from './TeacherDashboard';
import { SubstituteDashboard } from './SubstituteDashboard';

export function DashboardRouter() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">טוען...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return user.role === 'substitute_teacher' ? (
    <SubstituteDashboard />
  ) : (
    <TeacherDashboard />
  );
}
