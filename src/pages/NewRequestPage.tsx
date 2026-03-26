import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Sidebar } from '../components/Sidebar';
import { ArrowRight } from 'lucide-react';
import { createRequestAndNotify } from '../services/matchingService';

interface Kindergarten {
  id: string;
  name: string;
  location: string;
}

export function NewRequestPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [kindergartens, setKindergartens] = useState<Kindergarten[]>([]);
  const [selectedKindergarten, setSelectedKindergarten] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.role !== 'kindergarten_teacher') {
      navigate('/dashboard');
      return;
    }

    loadKindergartens();
  }, [user, navigate]);

  const loadKindergartens = async () => {
    const { data } = await supabase
      .from('kindergartens')
      .select('id, name, location')
      .order('name');

    setKindergartens(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data: requestData, error: createError } = await supabase
        .from('substitute_requests')
        .insert([
          {
            requesting_teacher_id: user?.id,
            kindergarten_id: selectedKindergarten,
            request_date: selectedDate,
            status: 'pending',
            notes,
          },
        ])
        .select()
        .single();

      if (createError) throw createError;

      if (requestData) {
        await createRequestAndNotify(
          requestData.id,
          selectedDate,
          selectedKindergarten
        );
      }

      navigate('/my-requests');
    } catch (err: any) {
      setError(err.message || 'שגיאה בהוצאת הבקשה');
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="flex items-center gap-2 mb-8">
            <button
              onClick={() => navigate('/my-requests')}
              className="text-indigo-600 hover:text-indigo-800"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
            <h1 className="text-4xl font-bold text-gray-900">
              בקשה חדשה למחליף
            </h1>
          </div>

          <div className="bg-white rounded-lg shadow p-8 max-w-2xl">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  בחר גן
                </label>
                <select
                  value={selectedKindergarten}
                  onChange={(e) => setSelectedKindergarten(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-right"
                  required
                >
                  <option value="">-- בחר גן --</option>
                  {kindergartens.map((k) => (
                    <option key={k.id} value={k.id}>
                      {k.name} ({k.location})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  תאריך הבקשה
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={today}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  הערות (אופציונלי)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="הוסף הערות חשובות..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  rows={4}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => navigate('/my-requests')}
                  className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition"
                >
                  ביטול
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition"
                >
                  {loading ? 'שולח בקשה...' : 'שלח בקשה'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
