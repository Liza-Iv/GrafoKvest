-- ============================================
-- ГРАФОКВЕСТ — СХЕМА БАЗЫ ДАННЫХ (v2)
-- ============================================

-- 1. ПОЛЬЗОВАТЕЛИ
CREATE TABLE IF NOT EXISTS users (
    id            BIGSERIAL PRIMARY KEY,
    full_name     VARCHAR(255) NOT NULL,
    email         VARCHAR(255) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role          VARCHAR(50) NOT NULL CHECK (role IN ('parent', 'specialist')),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- 2. ДЕТИ
CREATE TABLE IF NOT EXISTS children (
    id         BIGSERIAL PRIMARY KEY,
    name       VARCHAR(255) NOT NULL,
    age        INTEGER CHECK (age >= 1 AND age <= 12),
    user_id    BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_children_user_id ON children(user_id);

-- 3. ЗАДАНИЯ
CREATE TABLE IF NOT EXISTS tasks (
    id              BIGSERIAL PRIMARY KEY,
    title           VARCHAR(255) NOT NULL,
    short_text      TEXT NOT NULL,
    full_text       TEXT NOT NULL,
    image           VARCHAR(500),
    picto           VARCHAR(500),
    difficulty      SMALLINT NOT NULL DEFAULT 1 CHECK (difficulty BETWEEN 1 AND 3),
    time_minutes    INTEGER NOT NULL DEFAULT 5,
    materials       TEXT,
    hint            TEXT,
    develops        TEXT,
    character_image VARCHAR(500),
    order_index     INTEGER DEFAULT 0,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_tasks_difficulty ON tasks(difficulty);
CREATE INDEX IF NOT EXISTS idx_tasks_order ON tasks(order_index);

-- 4. ПРОГРЕСС
CREATE TABLE IF NOT EXISTS progress (
    id           BIGSERIAL PRIMARY KEY,
    user_id      BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    child_id     BIGINT NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    task_id      BIGINT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    completed_at DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (child_id, task_id, completed_at)
);
CREATE INDEX IF NOT EXISTS idx_progress_child_date ON progress(child_id, completed_at);
CREATE INDEX IF NOT EXISTS idx_progress_user_id ON progress(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_task_id ON progress(task_id);

-- 5. ЧЛЕНЫ СЕМЬИ
CREATE TABLE IF NOT EXISTS family_members (
    id         BIGSERIAL PRIMARY KEY,
    user_id    BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name       VARCHAR(255) NOT NULL,
    role       VARCHAR(50) NOT NULL CHECK (role IN ('father', 'mother', 'grandma', 'grandpa')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_family_user_id ON family_members(user_id);

-- 6. НАСТРОЙКИ
CREATE TABLE IF NOT EXISTS settings (
    id              BIGSERIAL PRIMARY KEY,
    child_id        BIGINT NOT NULL UNIQUE REFERENCES children(id) ON DELETE CASCADE,
    voice_enabled   BOOLEAN NOT NULL DEFAULT TRUE,
    sound_enabled   BOOLEAN NOT NULL DEFAULT TRUE,
    speech_rate     VARCHAR(20) NOT NULL DEFAULT 'normal',
    icon_style      VARCHAR(20) NOT NULL DEFAULT 'regular',
    big_font        BOOLEAN NOT NULL DEFAULT FALSE,
    color_theme     VARCHAR(20) NOT NULL DEFAULT 'standard',
    hints_enabled   BOOLEAN NOT NULL DEFAULT TRUE,
    timer_enabled   BOOLEAN NOT NULL DEFAULT FALSE,
    timer_duration  INTEGER NOT NULL DEFAULT 5,
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. ЖУРНАЛ ДЕЙСТВИЙ
CREATE TABLE IF NOT EXISTS activity_log (
    id          BIGSERIAL PRIMARY KEY,
    user_id     BIGINT REFERENCES users(id) ON DELETE SET NULL,
    action      VARCHAR(100) NOT NULL,
    details     TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_activity_user_id ON activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_created ON activity_log(created_at);