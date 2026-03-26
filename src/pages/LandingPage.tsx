import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Users, Calendar, Bell, CheckCircle2 } from 'lucide-react';

export function LandingPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <p className="text-gray-600">טוען...</p>
      </div>
    );
  }

  if (user) {
    navigate('/dashboard');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="px-6 py-12 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
            מערכת מחליפים בגנים
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 mb-8">
            מצא מחליפים באופן מהיר וקל
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => navigate('/login')}
              className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition text-lg"
            >
              כניסה
            </button>
            <button
              onClick={() => navigate('/register')}
              className="px-8 py-4 bg-white hover:bg-gray-100 text-indigo-600 font-bold rounded-lg transition text-lg border-2 border-indigo-600"
            >
              הרשמה
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <FeatureCard
            icon={<Users className="w-12 h-12" />}
            title="שתי תפקידים"
            description="מורה בגן או מחליף - בחר את התפקיד המתאים לך"
          />
          <FeatureCard
            icon={<Calendar className="w-12 h-12" />}
            title="ניהול זמינות"
            description="הגדר את ימי הזמינות שלך ובחר גנים מועדפים"
          />
          <FeatureCard
            icon={<Bell className="w-12 h-12" />}
            title="התראות מיידיות"
            description="קבל התראות על בקשות מחליפים חדשות"
          />
          <FeatureCard
            icon={<CheckCircle2 className="w-12 h-12" />}
            title="קבלה מיידית"
            description="קבל משמרה בלחיצה אחת וקבל מידע המחליף"
          />
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            איך זה עובד?
          </h2>

          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-bold text-indigo-600 mb-4">
                עבור מורות בגן
              </h3>
              <ol className="space-y-4">
                <StepItem
                  number="1"
                  title="הירשמו"
                  description="צרו חשבון כמורה בגן"
                />
                <StepItem
                  number="2"
                  title="בקשה חדשה"
                  description="בחרו גן ותאריך בו אתם צריכים מחליף"
                />
                <StepItem
                  number="3"
                  title="התראות"
                  description="מחליפים מתאימים מקבלים התראה"
                />
                <StepItem
                  number="4"
                  title="קבלת אישור"
                  description="קבלו את פרטי המחליף כשמישהו קיבל"
                />
              </ol>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-indigo-600 mb-4">
                עבור מחליפים
              </h3>
              <ol className="space-y-4">
                <StepItem
                  number="1"
                  title="הירשמו"
                  description="צרו חשבון כמחליף"
                />
                <StepItem
                  number="2"
                  title="הגדרות"
                  description="בחרו גנים ותאריכים שבהם אתם זמינים"
                />
                <StepItem
                  number="3"
                  title="משמרות זמינות"
                  description="ראו משמרות שתואמות את ההעדפות שלכם"
                />
                <StepItem
                  number="4"
                  title="קבלת משמרה"
                  description="קבלו משמרה וקבלו את פרטי המורה"
                />
              </ol>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-4xl font-bold text-indigo-600 mb-2">
              מהיר
            </div>
            <p className="text-gray-700">
              מצא מחליף תוך דקות
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-4xl font-bold text-indigo-600 mb-2">
              קל
            </div>
            <p className="text-gray-700">
              ממשק פשוט וידידותי
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-4xl font-bold text-indigo-600 mb-2">
              אמין
            </div>
            <p className="text-gray-700">
              מערכת מאובטחת ומוהימנה
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 text-center">
      <div className="flex justify-center mb-4 text-indigo-600">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

interface StepItemProps {
  number: string;
  title: string;
  description: string;
}

function StepItem({ number, title, description }: StepItemProps) {
  return (
    <li className="flex gap-4">
      <div className="flex-shrink-0 w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
        <span className="font-bold text-indigo-600">{number}</span>
      </div>
      <div>
        <h4 className="font-bold text-gray-900 text-lg">{title}</h4>
        <p className="text-gray-600">{description}</p>
      </div>
    </li>
  );
}
