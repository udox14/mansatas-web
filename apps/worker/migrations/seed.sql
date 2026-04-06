-- ============================================
-- SEED DATA — Jalankan setelah migration
-- ============================================

-- Default hero settings
INSERT OR REPLACE INTO hero_settings (id, text_mode, static_title, static_description, static_button_text, static_button_url)
VALUES (
  'default',
  'static',
  'MAN 1 Tasikmalaya',
  'Madrasah Aliyah Negeri 1 Tasikmalaya — Unggul dalam Iman, Ilmu, dan Amal',
  'Portal PPDB',
  '/ppdb'
);

-- ⚠️ Superadmin dibuat via POST /api/auth/setup (Step 3)
-- Endpoint setup hanya bisa dipanggil 1x saat belum ada user sama sekali.

-- Contoh programs
INSERT OR REPLACE INTO programs (id, title, description, icon, sort_order, is_active) VALUES
  ('prog-1', 'Program Keagamaan', 'Pendalaman ilmu agama Islam, tahfidz Al-Quran, dan pembinaan akhlak mulia.', 'BookOpen', 1, 1),
  ('prog-2', 'Program IPA', 'Penguasaan sains dan teknologi dengan laboratorium modern dan praktikum intensif.', 'FlaskConical', 2, 1),
  ('prog-3', 'Program IPS', 'Pemahaman dinamika sosial, ekonomi, dan kewirausahaan untuk masa depan.', 'Globe', 3, 1),
  ('prog-4', 'Ekstrakurikuler', 'Pramuka, PMR, Robotik, Jurnalistik, Seni Budaya, dan berbagai kegiatan pengembangan diri.', 'Trophy', 4, 1);
