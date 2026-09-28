# MindPlace

Личный кабинет сервиса психологической поддержки на Next.js. Локально данные хранятся в SQLite (`data/mindplace.sqlite`); на production используется Supabase Postgres.

## Локальный запуск

Требуется Node.js 22+ (для SQLite используется встроенный `node:sqlite`).

```bash
npm install
npm run dev
```

Откройте http://localhost:3000. Для сброса локальных демонстрационных данных остановите сервер и удалите `data/mindplace.sqlite`.

В кабинете работают поиск и фильтрация психологов, избранное, создание и закрытие обращений, бронирование/отмена сессий, переписка, материалы и редактирование профиля. Авторизация, реальная видеосвязь, уведомления и отправка писем пока не подключены.

## Supabase и Vercel

1. Выполните SQL из `supabase/migrations/20260928000000_initial_schema.sql` в SQL Editor проекта Supabase.
2. В Vercel добавьте `SUPABASE_URL` (`https://anhtctjybxqypkinrfsf.supabase.co`) и `SUPABASE_SERVICE_ROLE_KEY` как **секретную** переменную окружения. Не добавляйте service role key в Git, `.env.example` или клиентский код.
3. Импортируйте репозиторий в Vercel или запустите `npx vercel --prod` из авторизованного терминала.

В `.mcp.json` настроен проектный Supabase MCP для Claude Code. Для OAuth-авторизации откройте обычный терминал в папке проекта и выполните `claude /mcp`. Установка Supabase Agent Skills необязательна.
