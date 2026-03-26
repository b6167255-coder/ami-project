import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Sidebar } from '../components/Sidebar';
import { Plus, Clock, CheckCircle, XCircle } from 'lucide-react';

interface Request {
  id: string;
  request_date: string;
  kindergarten_id: string;
  status: 'pending' | 'fulfilled' | 'cancelled';
  kindergarten: { name: string };
  acceptance?: { substitute_id: string; accepted_at: string };
  teacher?: { full_name: string; phone: string };
}

export function TeacherDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    loadRequests();

    const channel = supabase
      .channel('teacher-requests')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'substitute_requests',
          filter: `requesting_teacher_id=eq.${user.id}`,
        },
        () => loadRequests()
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [user, navigate]);

  const loadRequests = async () => {
    try {
      const { data: requestsData } = await supabase
        .from('substitute_requests')
        .select(
          `
          id,
          request_date,
          kindergarten_id,
          status,
          kindergartens:kindergarten_id ( name ),
          request_acceptances (
            substitute_id,
            accepted_at,
            users:substitute_id ( full_name, phone, email )
          ),
          users:requesting_teacher_id ( full_name, phone )
        `
        )
        .eq('requesting_teacher_id', user?.id)
        .order('request_date', { ascending: false });

      setRequests(
        requestsData?.map((r: any) => ({
          ...r,
          kindergarten: r.kindergartens,
          acceptance: r.request_acceptances?.[0],
          teacher: r.users,
        })) || []
      );
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-50 text-yellow-800';
      case 'fulfilled':
        return 'bg-green-50 text-green-800';
      case 'cancelled':
        return 'bg-red-50 text-red-800';
      default:
        return 'bg-gray-50 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'ממתין';
      case 'fulfilled':
        return 'בוצע';
      case 'cancelled':
        return 'בוטל';
      default:
        return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'fulfilled':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">
                הבקשות שלי
              </h1>
              <p className="text-gray-600 mt-2">
                נהל בקשות למחליפים
              </p>
            </div>
            <button
              onClick={() => navigate('/new-request')}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-lg transition"
            >
              <Plus className="w-5 h-5" />
              <span>בקשה חדשה</span>
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">טוען...</p>
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg">
              <p className="text-gray-600 mb-4">אין לך בקשות עדיין</p>
              <button
                onClick={() => navigate('/new-request')}
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-2 rounded-lg transition"
              >
                <Plus className="w-4 h-4" />
                <span>צור בקשה חדשה</span>
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">
                      תאריך
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">
                      גן
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">
                      סטטוס
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">
                      מחליף
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">
                      פעולות
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((request) => (
                    <tr
                      key={request.id}
                      className="border-b border-gray-200 hover:bg-gray-50 transition"
                    >
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-900">
                          {new Date(request.request_date).toLocaleDateString(
                            'he-IL'
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-900">
                          {request.kindergarten?.name}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div
                          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                            request.status
                          )}`}
                        >
                          {getStatusIcon(request.status)}
                          <span>{getStatusLabel(request.status)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {request.acceptance?.users ? (
                          <div className="text-sm">
                            <p className="font-medium text-gray-900">
                              {request.acceptance.users.full_name}
                            </p>
                            <p className="text-gray-600">
                              {request.acceptance.users.phone}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {request.acceptance.users.email}
                            </p>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">
                            לא הוגדר
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() =>
                            navigate(`/request-details/${request.id}`)
                          }
                          className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                        >
                          פרטים
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
