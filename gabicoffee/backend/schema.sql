-- ─── Tables ───────────────────────────────────────────────────────────────────

-- Menu items
CREATE TABLE IF NOT EXISTS menu_items (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT DEFAULT '',
    price NUMERIC(10,2) NOT NULL,
    category TEXT NOT NULL,
    popular BOOLEAN DEFAULT FALSE,
    image TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders (items stored as JSONB for simplicity)
CREATE TABLE IF NOT EXISTS orders (
    id BIGSERIAL PRIMARY KEY,
    customer_name TEXT NOT NULL,
    items JSONB NOT NULL,
    total NUMERIC(10,2) NOT NULL,
    notes TEXT,
    status TEXT DEFAULT 'התקבלה',
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Contact messages
CREATE TABLE IF NOT EXISTS messages (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Site content (settings, home_content, about_content, menu_page_content, contact_content)
CREATE TABLE IF NOT EXISTS site_content (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL
);

-- ─── Seed: site_content ───────────────────────────────────────────────────────

INSERT INTO site_content (key, value) VALUES (
    'settings',
    '{
        "address": "רוטשילד 55, ראשון לציון",
        "phone": "052-5961616",
        "email": "hello@gabrielscoffee.co.il",
        "hours": [
            {"days": "ראשון, שלישי \u2013 חמישי", "hours": "09:30\u201314:30 | 16:30\u201320:00"},
            {"days": "שני", "hours": "סגור"},
            {"days": "שישי", "hours": "09:30\u201314:00"}
        ]
    }'::jsonb
) ON CONFLICT (key) DO NOTHING;

INSERT INTO site_content (key, value) VALUES (
    'home_content',
    '{
        "hero_subtitle": "כי כל כוס קפה טובה מספרת סיפור",
        "hero_description": "קפה איכותי, מאפים טריים מהתנור ואווירה חמימה שתגרום לכם לחזור שוב ושוב. ברוכים הבאים למשפחה.",
        "hero_btn_primary": "לצפייה במוצרים",
        "hero_btn_secondary": "מצאו אותנו",
        "features": [
            {"icon": "🌱", "title": "פולים מובחרים", "desc": "אנחנו מייבאים פולי קפה ספיישלטי ממיטב המטעים בעולם"},
            {"icon": "👨\u200d🍳", "title": "מאפים טריים", "desc": "כל הפסטריות נאפות אצלנו מדי בוקר עם חומרי גלם איכותיים"},
            {"icon": "🤝", "title": "אווירה חמימה", "desc": "מקום שבו כולם מרגישים בבית — עם חיוך ומוזיקה טובה"}
        ],
        "cta_title": "בואו לבקר אותנו",
        "cta_desc": "רוטשילד 55, ראשון לציון. חנייה חינם בסביבה ועגלה ידידותית."
    }'::jsonb
) ON CONFLICT (key) DO NOTHING;

INSERT INTO site_content (key, value) VALUES (
    'about_content',
    '{
        "story_title": "הסיפור שלנו",
        "story_paragraphs": [
            "גבריאלס׳ קפה נולד מתוך אהבה עמוקה לקפה. גבריאל, המייסד, התחיל את מסעו בבתי קפה קטנים ברחבי אירופה, שם גילה שקפה טוב הוא הרבה יותר ממשקה — הוא חוויה, תרבות, קהילה.",
            "בשנת 2018 פתח גבריאל את בית הקפה הראשון שלו בלב תל אביב עם חלום פשוט: ליצור מקום שבו כולם מרגישים בבית ומקבלים כוס קפה מושלמת בכל ביקור.",
            "היום, עם צוות של ברייסטות מיומנים ומאפים שנאפים מדי בוקר, אנחנו ממשיכים לשמור על אותה מסירות לאיכות ולאהבה לקהילה שלנו."
        ],
        "values": [
            {"icon": "🌱", "title": "קיימות", "desc": "אנחנו עובדים עם מגדלי קפה שמשתמשים בשיטות גידול בנות קיימא ומשלמים מחיר הוגן."},
            {"icon": "✨", "title": "איכות ללא פשרות", "desc": "מהפול ועד לכוס — כל שלב בתהליך עובר בקרת איכות קפדנית."},
            {"icon": "❤️", "title": "קהילה", "desc": "אנחנו לא רק בית קפה, אנחנו מרחב קהילתי — מארחים אירועים, תערוכות וסדנאות."}
        ],
        "team": [
            {"name": "גבריאל כהן", "role": "מייסד וברייסטה ראשי", "emoji": "👨\u200d🍳"},
            {"name": "מיה לוי", "role": "שפית הפסטריות", "emoji": "👩\u200d🍳"},
            {"name": "ניר שמואל", "role": "מנהל קפה", "emoji": "☕"}
        ]
    }'::jsonb
) ON CONFLICT (key) DO NOTHING;

INSERT INTO site_content (key, value) VALUES (
    'menu_page_content',
    '{
        "title": "המוצרים שלנו",
        "subtitle": "כל מה שצריך לרגע מושלם — קפה, מאפה ואוכל טוב"
    }'::jsonb
) ON CONFLICT (key) DO NOTHING;

INSERT INTO site_content (key, value) VALUES (
    'contact_content',
    '{
        "title": "צרו קשר",
        "subtitle": "נשמח לשמוע מכם",
        "info_title": "מצאו אותנו",
        "form_title": "שלחו לנו הודעה"
    }'::jsonb
) ON CONFLICT (key) DO NOTHING;

-- ─── Seed: menu_items ─────────────────────────────────────────────────────────

INSERT INTO menu_items (name, description, price, category, popular, image) VALUES
    ('אספרסו',          'שוט אספרסו כפול בעל גוף עשיר וארומה עמוקה',           12.00, 'קפה',                    TRUE,  NULL),
    ('קפוצ''ינו',        'אספרסו עם קצף חלב קטיפתי וניחוח שוקולד',              18.00, 'קפה',                    TRUE,  NULL),
    ('לאטה',            'אספרסו עם הרבה חלב מוקצף וטעם עדין',                  19.00, 'קפה',                    FALSE, NULL),
    ('אמריקנו',         'אספרסו מדולל במים חמים לטעם עדין ומרענן',             14.00, 'קפה',                    FALSE, NULL),
    ('מוקה',            'אספרסו עם שוקולד, חלב מוקצף וקרם שנטי',               22.00, 'קפה',                    TRUE,  NULL),
    ('קפה קר',          'קפה קר מוגש על קרח עם חלב שקדים',                     20.00, 'קפה',                    TRUE,  NULL),
    ('קרואסון חמאה',    'קרואסון טרי עם חמאה צרפתית, פריך ורך מבפנים',         16.00, 'ליד הקפה',               TRUE,  NULL),
    ('מאפה גבינה',      'מאפה בצק עלים עם גבינה בולגרית ועשבי תיבול',          18.00, 'ליד הקפה',               FALSE, NULL),
    ('עוגת שוקולד',     'עוגת שוקולד בלגי עשירה עם גנאש שוקולד מריר',          24.00, 'ליד הקפה',               TRUE,  NULL),
    ('מאפה שמרים',      'שמרים טריים עם קינמון, צימוקים וציפוי סוכר',           15.00, 'ליד הקפה',               FALSE, NULL),
    ('סנדוויץ'' גבריאל', 'לחם מחמצת עם גבינת ברי, עגבניה מיובשת ובזיליקום',     38.00, 'מכונות קפה וציוד נלווה', TRUE,  NULL),
    ('סלט ים תיכוני',   'ירקות עונתיים, זיתים, גבינת פטה ורוטב לימון-שום',     42.00, 'מכונות קפה וציוד נלווה', FALSE, NULL),
    ('ביצים ברנדיקט',   'ביצים עלומות על אנגלישׁ מאפין עם רוטב הולנדז',         48.00, 'מכונות קפה וציוד נלווה', TRUE,  NULL)
ON CONFLICT DO NOTHING;
