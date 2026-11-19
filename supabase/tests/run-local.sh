#!/usr/bin/env bash
# يطبق جميع migrations + seed + اختبارات RLS على قاعدة PostgreSQL محلية مؤقتة.
# الاستخدام: pnpm db:test   (يتطلب psql ومستخدم postgres محلي)
set -euo pipefail
cd "$(dirname "$0")/../.."
DB="mimar_test_$$"
PSQL=(psql -v ON_ERROR_STOP=1 -q -X)
if [ -n "${PGTEST_SUDO:-}" ]; then PSQL=(sudo -u postgres "${PSQL[@]}"); fi
"${PSQL[@]}" -d postgres -c "create database $DB" >/dev/null
trap '"${PSQL[@]}" -d postgres -c "drop database if exists $DB" >/dev/null' EXIT
"${PSQL[@]}" -d "$DB" -f supabase/tests/supabase-stub.sql
for f in supabase/migrations/*.sql; do
  echo "→ $f"
  "${PSQL[@]}" -d "$DB" -f "$f"
done
echo "→ supabase/seed.sql"
"${PSQL[@]}" -d "$DB" -f supabase/seed.sql
echo "→ supabase/tests/rls.test.sql"
"${PSQL[@]}" -d "$DB" -f supabase/tests/rls.test.sql
echo "✓ كل اختبارات قاعدة البيانات نجحت"
