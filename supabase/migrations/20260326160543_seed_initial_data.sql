/*
  # Seed Initial Data
  
  1. Add sample kindergartens for testing
  2. Note: Users and profiles will be created through the application registration flow
*/

INSERT INTO kindergartens (name, location, address, phone, email, principal_name) VALUES
  ('גן ילדים מפרחים', 'קריית שמונה', 'רחוב הפרחים 15', '04-6942000', 'mifrachim@kindergarten.co.il', 'ד"ר אורית כהן'),
  ('גן ילדים שמש וזהב', 'קריית שמונה', 'רחוב השמש 8', '04-6943000', 'shemesh@kindergarten.co.il', 'מרים לוי'),
  ('גן ילדים צבעים', 'קריית שמונה', 'רחוב הצבע 22', '04-6944000', 'tzvaim@kindergarten.co.il', 'דליה רוזן'),
  ('גן ילדים ברבורים', 'קריית שמונה', 'רחוב הברווז 5', '04-6945000', 'barburim@kindergarten.co.il', 'שרה זכאי'),
  ('גן ילדים הפיה', 'קריית שמונה', 'רחוב הקסם 11', '04-6946000', 'hapia@kindergarten.co.il', 'נעמה ישראלי')
ON CONFLICT DO NOTHING;
