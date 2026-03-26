import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Sidebar } from '../components/Sidebar';
import { CheckCircle, Calendar } from 'lucide-react';

interface AvailableShift {
  id: string;
  request_date: string;
  kindergarten_id: string;
  kindergarten: { name: string; location: string };
  requester: { full_name: string };
  status: string;
}

export function SubstituteDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [shifts, setShifts] = useState<AvailableShift[]>([]);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState<string | null>(null);

  useEffect(() => {
    if (user?.role !== 'substitute_teacher') {
      navigate('/login');
      return;
    }

    loadAvailableShifts();

    const channel = supabase
      .channel('available-shifts')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'substitute_requests',
          filter: 'status=eq.pending',
        },
        () => loadAvailableShifts()
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'substitute_requests',
        },
        () => loadAvailableShifts()
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [user, navigate]);

  const loadAvailableShifts = async () => {
    try {
      const { data: availabilityData } = await supabase
        .from('availability')
        .select('available_date')
        .eq('substitute_id', user?.id)
        .eq('is_available', true);

      const availableDates = availabilityData?.map((a) => a.available_date) || [];

      const { data: preferencesData } = await supabase
        .from('kindergarten_preferences')
        .select('kindergarten_id')
        .eq('substitute_id', user?.id);

      const preferredKindergartens =
        preferencesData?.map((p) => p.kindergarten_id) || [];

      let query = supabase
        .from('substitute_requests')
        .select(
          `
          id,
          request_date,
          kindergarten_id,
          status,
          kindergartens:kindergarten_id ( name, location ),
          users:requesting_teacher_id ( full_name )
        `
        )
        .eq('status', 'pending');

      const { data: requestsData } = await query;

      const filtered =
        requestsData
          ?.filter(
            (r: any) =>
              availableDates.includes(r.request_date) &&
              preferredKindergartens.includes(r.kindergarten_id)
          )
          .map((r: any) => ({
            ...r,
            kindergarten: r.kindergartens,
            requester: r.users,
          })) || [];

      setShifts(filtered);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptShift = async (requestId: string) => {
    setAccepting(requestId);

    try {
      const { error: acceptError } = await supabase
        .from('request_acceptances')
        .insert([
          {
            request_id: requestId,
            substitute_id: user?.id,
          },
        ]);

      if (acceptError) throw acceptError;

      const { error: updateError } = await supabase
        .from('substitute_requests')
        .update({ status: 'fulfilled' })
        .eq('id', requestId);

      if (updateError) throw updateError;

      loadAvailableShifts();
    } catch (err) {
      console.error(err);
    } finally {
      setAccepting(null);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              משמרות זמינות
            </h1>
            <p className="text-gray-600 mb-8">
              למצא משמרות זמינות בגנים המועדפים עליך
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">טוען...</p>
            </div>
          ) : shifts.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">אין משמרות זמינות כרגע</p>
              <button
                onClick={() => navigate('/availability')}
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-2 rounded-lg transition"
              >
                <span>עדכן את ההגדרות שלך</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {shifts.map((shift) => (
                <div
                  key={shift.id}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900">
                        {shift.kindergarten?.name}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {shift.kindergarten?.location}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-indigo-600">
                        {new Date(shift.request_date).toLocaleDateString(
                          'he-IL'
                        )}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(shift.request_date).toLocaleDateString(
                          'he-IL',
                          { weekday: 'long' }
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <p className="text-sm text-gray-600">בקש ממורה:</p>
                    <p className="font-semibold text-gray-900 text-lg">
                      {shift.requester?.full_name}
                    </p>
                  </div>

                  <button
                    onClick={() => handleAcceptShift(shift.id)}
                    disabled={accepting === shift.id}
                    className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition"
                  >
                    <CheckCircle className="w-5 h-5" />
                    <span>
                      {accepting === shift.id ? 'מקבל...' : 'קבלת המשמרה'}
                    </span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
