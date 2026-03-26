# מערכת מחליפים בגנים - Kindergarten Substitute Teacher Management System

## סקירה כללית

מערכת דיגיטלית מלאה לניהול מציאת מחליפים בגנים. המערכת מאפשרת למורות בגן להגיש בקשות למחליפים, ולמחליפים לעדכן את זמינותם ולקבל משמרות.

## תכונות עיקריות

### עבור מורות בגן:
- ✅ הירשמות והתחברות בטוחה
- ✅ יצירת בקשות חדשות למחליפים (בחירת גן ותאריך)
- ✅ ניהול בקשות וצפייה בסטטוס
- ✅ קבלת פרטי המחליף שקיבל את המשמרה
- ✅ התראות בזמן אמת על קבלת משמרות

### עבור מחליפים:
- ✅ הירשמות והתחברות בטוחה
- ✅ הגדרת ימי זמינות
- ✅ בחירת גנים מועדפים
- ✅ צפייה במשמרות זמינות המתאימות להעדפות
- ✅ קבלת משמרה בלחיצה אחת
- ✅ קבלת פרטי המורה שביקשה את המחליף

### מערכת התאמה אוטומטית:
- ✅ חיפוש אוטומטי של מחליפים זמינים
- ✅ סינון לפי אזור גיאוגרפי וגנים מועדפים
- ✅ שליחת התראות למחליפים מתאימים (Email + Voice Call placeholders)
- ✅ עדכון סטטוס מיידי

## סטאק טכנולוגי

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Real-time**: Supabase Realtime Subscriptions
- **Icons**: Lucide React
- **Routing**: React Router v6
- **Build Tool**: Vite
- **RTL Support**: Complete Hebrew RTL implementation

## מבנה הפרויקט

```
src/
├── components/         # UI components
│   └── Sidebar.tsx    # Navigation sidebar
├── contexts/           # React contexts
│   └── AuthContext.tsx # Authentication context
├── lib/                # Utilities and configuration
│   ├── auth.ts        # Authentication functions
│   └── supabase.ts    # Supabase client setup
├── pages/              # Page components
│   ├── LandingPage.tsx
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   ├── DashboardRouter.tsx
│   ├── TeacherDashboard.tsx      # My Requests for teachers
│   ├── NewRequestPage.tsx        # Create new request
│   ├── SubstituteDashboard.tsx   # Available Shifts
│   └── AvailabilityPage.tsx      # Availability settings
├── services/           # Business logic
│   └── matchingService.ts # Matching algorithm
└── index.css           # Global styles with RTL support

supabase/
└── functions/
    └── send-notifications/  # Edge Function for notifications
```

## ב"מ בטחון (RLS - Row Level Security)

כל הטבלאות מוגנות עם RLS policies:
- ✅ Users can only see their own profile
- ✅ Teachers can only see their own requests
- ✅ Substitutes can only see available shifts matching their preferences
- ✅ All data access is scoped to the authenticated user

## סכימת הדאטהבייס

### טבלאות ראשיות:

**users**: מידע משתמשים
- id, supabase_id, email, full_name, phone, role (kindergarten_teacher/substitute_teacher)

**kindergartens**: רשימת הגנים
- id, name, location, address, phone, email, principal_name

**substitute_profiles**: פרטים נוספים על מחליפים
- id, user_id, bio, experience_years, certifications, hourly_rate

**availability**: ימי זמינות של מחליפים
- id, substitute_id, available_date, is_available

**kindergarten_preferences**: גנים מועדפים למחליפים
- id, substitute_id, kindergarten_id

**substitute_requests**: בקשות למחליפים
- id, requesting_teacher_id, kindergarten_id, request_date, status, notes

**request_matches**: התאמות בין בקשות ומחליפים
- id, request_id, substitute_id, notified_at, notification_method

**request_acceptances**: קבלת בקשות
- id, request_id, substitute_id, accepted_at

## איך להתחיל

### הרשמה:

1. **עבור מורה בגן**:
   - בחרו "מורה בגן" בעת ההרשמה
   - הכניסו את פרטיכם
   - יהיה לכם גישה לדף הבקשות שלכם

2. **עבור מחליף**:
   - בחרו "מחליף" בעת ההרשמה
   - הכניסו את פרטיכם
   - גש לדף "הגדרות הזמינות" כדי להגדיר ימים וגנים

### זרימת עבודה למורה:

1. כניסה לדף הבקשות
2. לחצו "בקשה חדשה"
3. בחרו גן ותאריך
4. המערכת תחפש מחליפים מתאימים ותשלח להם התראות
5. כשמישהו יקבל את הבקשה, תקבלו את פרטיו

### זרימת עבודה למחליף:

1. כניסה לדף הגדרות
2. בחרו גנים מועדפים
3. הוסיפו ימים שאתם זמינים
4. גש לדף "משמרות זמינות" כדי לראות בקשות חדשות
5. לחצו "קבלת המשמרה" כדי לקבל את העבודה
6. תקבלו את פרטי המורה

## API וסוגי התראות

### Edge Functions:

**send-notifications**: שליחת התראות למחליפים
- Endpoint: `/functions/v1/send-notifications`
- Method: POST
- Types: email, voice_call
- Payload:
  ```json
  {
    "type": "email" | "voice_call",
    "to": "email@example.com",
    "substitute_name": "שם המחליף",
    "kindergarten_name": "שם הגן",
    "request_date": "2024-12-25"
  }
  ```

### Real-time Updates:

המערכת משתמשת ב-Supabase Realtime לעדכונים בזמן אמת:
- ✅ הדפים מתעדכנים כשיש בקשות חדשות
- ✅ סטטוס בקשות מתעדכן מיידית
- ✅ משמרות חדשות מופיעות בדף המחליף כמו שהן נוצרות

## עיצוב ממשק

- **RTL Complete**: הממשק מעוצב כולו באנגלית
- **Desktop-First**: אופטימיזציה למסכים גדולים
- **Modern Design**: ממשק מודרני עם צבעים רכים (אינדיגו, ירוק, אדום)
- **Responsive**: תומך גם במסכים קטנים
- **Accessibility**: WCAG compliant

## צבעים וטיפוגרפיה

- **Font**: Rubik (Hebrew font from Google Fonts)
- **Primary Color**: Indigo (#4F46E5)
- **Secondary Colors**: Green (success), Red (error), Gray (neutral)
- **Typography**: 3 weights max (Regular, Medium, Bold)
- **Spacing**: 8px system

## משימות עתידיות (Optional Enhancements)

- [ ] SMS notifications
- [ ] Calendar integration
- [ ] Ratings and reviews
- [ ] Recurring requests
- [ ] Payment integration
- [ ] Admin dashboard
- [ ] Analytics and reporting
- [ ] Mobile app

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run linter
npm run lint

# Type checking
npm run typecheck
```

## הערות חשובות

1. **אימות**: המערכת משתמשת ב-Supabase Auth עם email/password
2. **RLS**: כל הטבלאות מוגנות עם Row Level Security
3. **Real-time**: תמיד בחברים לכל העדכונים באמצעות Supabase channels
4. **Notifications**: כרגע בעזרת placeholders - עדכנו אל Twilio/SendGrid לפי הצורך

## תוכן זה חוקי

המערכת מעוצבת בהתאם לצרכי גנים ישראליים עם תמיכה מלאה לעברית וRTL.
