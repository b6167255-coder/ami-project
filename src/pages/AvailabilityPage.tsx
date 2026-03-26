import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Sidebar } from '../components/Sidebar';
import { Check, X, ArrowRight } from 'lucide-react';

interface Kindergarten {
  id: string;
  name: string;
  location: string;
}

interface AvailabilityData {
  dateString: string;
  isAvailable: boolean;
}

export function AvailabilityPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [kindergartens, setKindergartens] = useState<Kindergarten[]>([]);
  const [selectedKindergartens, setSelectedKindergartens] = useState<Set<string>>(
    new Set()
  );
  const [availability, setAvailability] = useState<Map<string, boolean>>(
    new Map()
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user?.role !== 'substitute_teacher') {
      navigate('/login');
      return;
    }

    loadData();
  }, [user, navigate]);

  const loadData = async () => {
    try {
      const { data: kindData } = await supabase
        .from('kindergartens')
        .select('id, name, location')
        .order('name');

      setKindergartens(kindData || []);

      const { data: prefData } = await supabase
        .from('kindergarten_preferences')
        .select('kindergarten_id')
        .eq('substitute_id', user?.id);

      const selected = new Set(prefData?.map((p) => p.kindergarten_id) || []);
      setSelectedKindergartens(selected);

      const { data: availData } = await supabase
        .from('availability')
        .select('available_date, is_available')
        .eq('substitute_id', user?.id);

      const avail = new Map<string, boolean>();
      availData?.forEach((a) => {
        avail.set(a.available_date, a.is_available);
      });

      setAvailability(avail);
    } finally {
      setLoading(false);
    }
  };

  const toggleKindergarten = (id: string) => {
    const updated = new Set(selectedKindergartens);
    if (updated.has(id)) {
      updated.delete(id);
    } else {
      updated.add(id);
    }
    setSelectedKindergartens(updated);
  };

  const toggleAvailability = (dateString: string) => {
    const updated = new Map(availability);
    const current = updated.get(dateString) ?? false;
    updated.set(dateString, !current);
    setAvailability(updated);
  };

  const addAvailableDate = (dateString: string) => {
    const updated = new Map(availability);
    updated.set(dateString, true);
    setAvailability(updated);
  };

  const removeAvailableDate = (dateString: string) => {
    const updated = new Map(availability);
    updated.delete(dateString);
    setAvailability(updated);
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      const { data: existingPrefs } = await supabase
        .from('kindergarten_preferences')
        .select('kindergarten_id')
        .eq('substitute_id', user?.id);

      const existingSet = new Set(existingPrefs?.map((p) => p.kindergarten_id) || []);

      const toAdd = Array.from(selectedKindergartens).filter(
        (id) => !existingSet.has(id)
      );
      const toRemove = Array.from(existingSet).filter(
        (id) => !selectedKindergartens.has(id)
      );

      if (toAdd.length > 0) {
        await supabase.from('kindergarten_preferences').insert(
          toAdd.map((id) => ({
            substitute_id: user?.id,
            kindergarten_id: id,
          }))
        );
      }

      if (toRemove.length > 0) {
        for (const id of toRemove) {
          await supabase
            .from('kindergarten_preferences')
            .delete()
            .eq('substitute_id', user?.id)
            .eq('kindergarten_id', id);
        }
      }

      const { data: existingAvail } = await supabase
        .from('availability')
        .select('available_date, is_available')
        .eq('substitute_id', user?.id);

      const existingAvailMap = new Map<string, boolean>();
      existingAvail?.forEach((a) => {
        existingAvailMap.set(a.available_date, a.is_available);
      });

      const toInsert: any[] = [];
      const toUpdate: any[] = [];

      availability.forEach((isAvail, dateString) => {
        if (existingAvailMap.has(dateString)) {
          if (existingAvailMap.get(dateString) !== isAvail) {
            toUpdate.push({ dateString, isAvail });
          }
        } else {
          toInsert.push({ dateString, isAvail });
        }
      });

      if (toInsert.length > 0) {
        await supabase.from('availability').insert(
          toInsert.map((item) => ({
            substitute_id: user?.id,
            available_date: item.dateString,
            is_available: item.isAvail,
          }))
        );
      }

      for (const item of toUpdate) {
        await supabase
          .from('availability')
          .update({ is_available: item.isAvail })
          .eq('substitute_id', user?.id)
          .eq('available_date', item.dateString);
      }

      navigate('/available-shifts');
    } finally {
      setSaving(false);
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
              onClick={() => navigate('/available-shifts')}
              className="text-indigo-600 hover:text-indigo-800"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
            <h1 className="text-4xl font-bold text-gray-900">
              הגדרות הזמינות שלי
            </h1>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">טוען...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  בחר גנים
                </h2>
                <div className="space-y-3">
                  {kindergartens.map((k) => (
                    <label key={k.id} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedKindergartens.has(k.id)}
                        onChange={() => toggleKindergarten(k.id)}
                        className="w-5 h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                      />
                      <div className="flex-1 text-right">
                        <div className="font-medium text-gray-900">{k.name}</div>
                        <div className="text-sm text-gray-600">{k.location}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  הוסף תאריכי זמינות
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      בחר תאריך
                    </label>
                    <input
                      type="date"
                      min={today}
                      onChange={(e) => {
                        if (e.target.value) {
                          addAvailableDate(e.target.value);
                          e.target.value = '';
                        }
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="mt-6">
                    <h3 className="font-semibold text-gray-900 mb-3">
                      תאריכים זמינים
                    </h3>
                    {availability.size === 0 ? (
                      <p className="text-gray-600 text-sm">אין תאריכים עדיין</p>
                    ) : (
                      <div className="space-y-2">
                        {Array.from(availability.entries()).map(
                          ([dateString]) => (
                            <div
                              key={dateString}
                              className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
                            >
                              <button
                                onClick={() => removeAvailableDate(dateString)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <X className="w-4 h-4" />
                              </button>
                              <span className="text-sm font-medium text-gray-900">
                                {new Date(dateString).toLocaleDateString('he-IL')}
                              </span>
                              <Check className="w-4 h-4 text-green-600" />
                            </div>
                          )
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {!loading && (
            <div className="flex gap-3 mt-8">
              <button
                onClick={() => navigate('/available-shifts')}
                className="flex-1 max-w-md px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition"
              >
                ביטול
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 max-w-md px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition"
              >
                {saving ? 'שומר...' : 'שמור שינויים'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
