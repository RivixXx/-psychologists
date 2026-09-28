import { mkdirSync } from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

const folder = path.join(process.cwd(), "data");
mkdirSync(folder, { recursive: true });
const db = new DatabaseSync(path.join(folder, "mindplace.sqlite"));
db.exec(`PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;
CREATE TABLE IF NOT EXISTS psychologists (id INTEGER PRIMARY KEY, name TEXT NOT NULL, title TEXT NOT NULL, rating REAL NOT NULL, reviews INTEGER NOT NULL, experience TEXT NOT NULL, tags TEXT NOT NULL, photo TEXT NOT NULL, availability TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS requests (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, description TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'Открыто', created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, replies INTEGER NOT NULL DEFAULT 0);
CREATE TABLE IF NOT EXISTS appointments (id INTEGER PRIMARY KEY AUTOINCREMENT, psychologist_id INTEGER NOT NULL REFERENCES psychologists(id), date TEXT NOT NULL, time TEXT NOT NULL, topic TEXT NOT NULL, mode TEXT NOT NULL DEFAULT 'Онлайн', status TEXT NOT NULL DEFAULT 'Предстоит');
CREATE TABLE IF NOT EXISTS messages (id INTEGER PRIMARY KEY AUTOINCREMENT, psychologist_id INTEGER NOT NULL REFERENCES psychologists(id), body TEXT NOT NULL, mine INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, read INTEGER NOT NULL DEFAULT 0);
CREATE TABLE IF NOT EXISTS resources (id INTEGER PRIMARY KEY, title TEXT NOT NULL, category TEXT NOT NULL, read_time TEXT NOT NULL, color TEXT NOT NULL, icon TEXT NOT NULL, description TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS profile (id INTEGER PRIMARY KEY CHECK(id=1), name TEXT NOT NULL, email TEXT NOT NULL);
`);

const count = (table: string) => Number((db.prepare(`SELECT count(*) AS n FROM ${table}`).get() as { n: number }).n);
const dateFromToday = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};
if (!count("psychologists")) {
  const add = db.prepare("INSERT INTO psychologists VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
  const people: [number, string, string, number, number, string, string[], string, string][] = [
    [1,"Анна Крылова","Клинический психолог",5.0,32,"8 лет",["Тревога","Самооценка","Отношения"],"https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=240&q=85","Сегодня"],
    [2,"Игорь Лебедев","Гештальт-терапевт",4.9,27,"12 лет",["Кризисные ситуации","Поиск себя","Самооценка"],"https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=240&q=85","Завтра"],
    [3,"Мария Соколова","КПТ-терапевт",4.8,41,"6 лет",["Тревога","Депрессия","Панические атаки"],"https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=240&q=85","Сегодня"],
    [4,"Даниил Морозов","Семейный психолог",4.9,30,"10 лет",["Отношения","Семейные кризисы","Родительство"],"https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=240&q=85","Сегодня"],
    [5,"Елена Смирнова","Психоаналитик",4.7,19,"9 лет",["Потеря смысла","Апатия","Самооценка"],"https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=240&q=85","Завтра"],
  ];
  const tx = db.prepare("BEGIN"); tx.run();
  people.forEach(p => add.run(p[0],p[1],p[2],p[3],p[4],p[5],JSON.stringify(p[6]),p[7],p[8]));
  db.exec("COMMIT");
}
if (!count("requests")) {
  const add = db.prepare("INSERT INTO requests (title,description,status,replies,created_at) VALUES (?,?,?,?,?)");
  add.run("Тревога и выгорание","Постоянное чувство тревоги, сложно справляться с нагрузкой на работе…","Открыто",3,"2026-09-26 10:30:00");
  add.run("Сложности в отношениях","Конфликты с партнёром, не понимаю, как выстроить диалог","Закрыто",5,"2026-09-12 09:00:00");
}
if (!count("appointments")) {
  db.prepare("INSERT INTO appointments (psychologist_id,date,time,topic,mode) VALUES (?,?,?,?,?)").run(1,dateFromToday(1),"18:00","Тревога и самокритика","Онлайн");
  db.prepare("INSERT INTO appointments (psychologist_id,date,time,topic,mode) VALUES (?,?,?,?,?)").run(2,dateFromToday(4),"12:30","Самооценка и поиск себя","Онлайн");
}
if (!count("messages")) {
  const add = db.prepare("INSERT INTO messages (psychologist_id,body,mine,created_at,read) VALUES (?,?,?,?,?)");
  add.run(1,"Спасибо за ваше обращение. Предлагаю созвониться и обсудить ваш запрос подробнее. Когда вам будет удобно?",0,"2026-09-27 14:23:00",1);
  add.run(1,"Здравствуйте! Спасибо! Мне удобно в среду после 18:00. Это возможно?",1,"2026-09-27 14:26:00",1);
  add.run(1,"Да, среда в 18:00 подойдёт. Я отправлю вам ссылку на сессию и несколько вопросов, чтобы лучше подготовиться 🌿",0,"2026-09-27 14:28:00",0);
  add.run(2,"Хорошо, давайте перенесём на завтра. Увидимся!",0,"2026-09-26 11:00:00",1);
  add.run(3,"Здравствуйте! Готова взять вас в работу. Расскажите подробнее, что вас беспокоит.",0,"2026-09-25 11:08:00",0);
}
if (!count("resources")) {
  const add = db.prepare("INSERT INTO resources VALUES (?,?,?,?,?,?,?)");
  [[1,"Как справляться с тревогой","Статьи","5 мин","sage","✿","Практические техники, которые помогут снизить тревожность и вернуть ощущение опоры."],[2,"Практика осознанности","Упражнение","3 мин","sand","☼","Короткая практика, чтобы замедлиться и вернуться в настоящий момент."],[3,"Эмоциональные границы","Статьи","6 мин","rose","♡","Как замечать свои границы, говорить о них и бережно поддерживать себя."],[4,"Дневник настроения","Практика","4 мин","blue","☁","Простое упражнение для внимательного наблюдения за своими чувствами."]].forEach(r=>add.run(...r));
}
if (!count("profile")) db.prepare("INSERT INTO profile VALUES (1,?,?)").run("Алексей","alexey@example.com");

export function getData() {
  const psychologists = db.prepare("SELECT * FROM psychologists ORDER BY rating DESC").all().map((p: any) => ({ ...p, tags: JSON.parse(p.tags) }));
  const requests = db.prepare("SELECT * FROM requests ORDER BY created_at DESC").all();
  const appointments = db.prepare("SELECT a.*, p.name AS psychologist, p.title, p.photo FROM appointments a JOIN psychologists p ON p.id=a.psychologist_id ORDER BY a.date,a.time").all();
  const messages = db.prepare("SELECT m.*, p.name AS psychologist, p.photo FROM messages m JOIN psychologists p ON p.id=m.psychologist_id ORDER BY m.created_at").all();
  const resources = db.prepare("SELECT * FROM resources").all();
  const profile = db.prepare("SELECT * FROM profile WHERE id=1").get();
  return { psychologists, requests, appointments, messages, resources, profile };
}
export { db };
