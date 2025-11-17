-- Update category icons from emojis to Lucide icon names
UPDATE categories SET icon = 'heart' WHERE slug = 'pregnancy';
UPDATE categories SET icon = 'baby' WHERE slug = 'birth-stories';
UPDATE categories SET icon = 'baby' WHERE slug = 'newborn-care';
UPDATE categories SET icon = 'moon' WHERE slug = 'sleep-routines';
UPDATE categories SET icon = 'utensils' WHERE slug = 'feeding-nutrition';
UPDATE categories SET icon = 'trending-up' WHERE slug = 'development-milestones';
UPDATE categories SET icon = 'heart-pulse' WHERE slug = 'health-medical';
UPDATE categories SET icon = 'users' WHERE slug = 'parenting-lifestyle';
UPDATE categories SET icon = 'shopping-bag' WHERE slug = 'products-reviews';
UPDATE categories SET icon = 'heart' WHERE slug = 'support-community';

-- Update badge icons from emojis to Lucide icon names
UPDATE badges SET icon = 'baby' WHERE name = 'New Mom';
UPDATE badges SET icon = 'users' WHERE name = 'Helpful Helper';
UPDATE badges SET icon = 'star' WHERE name = 'Super Mom';
UPDATE badges SET icon = 'moon' WHERE name = 'Sleep Expert';
UPDATE badges SET icon = 'apple' WHERE name = 'Nutrition Guru';
