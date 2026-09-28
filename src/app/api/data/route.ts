import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Payload = {
  action: string;
  title?: string;
  description?: string;
  psychologistId?: number;
  date?: string;
  time?: string;
  topic?: string;
  body?: string;
  name?: string;
  email?: string;
  id?: number;
  status?: string;
};

const remoteEnabled = () => Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);

async function getData() {
  if (remoteEnabled()) return (await import("@/lib/supabase-store")).getData();
  if (process.env.NODE_ENV === "production") throw new Error("Добавьте SUPABASE_URL и SUPABASE_SERVICE_ROLE_KEY в переменные окружения Vercel.");
  return (await import("@/lib/db")).getData();
}

async function create(data: Payload) {
  if (data.action === "request" && (!data.title?.trim() || !data.description?.trim())) {
    return NextResponse.json({ error: "Заполните тему и описание" }, { status: 400 });
  }
  if (data.action === "book") {
    if (!data.psychologistId || !data.date || !data.time) return NextResponse.json({ error: "Выберите психолога, дату и время" }, { status: 400 });
    const dateTime = new Date(`${data.date}T${data.time}:00`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(data.date) || !/^\d{2}:\d{2}$/.test(data.time) || !Number.isFinite(dateTime.getTime()) || dateTime.getTime() < Date.now()) {
      return NextResponse.json({ error: "Выберите дату и время в будущем" }, { status: 400 });
    }
  }
  if (data.action === "message" && (!data.body?.trim() || !data.psychologistId)) return NextResponse.json({ error: "Введите сообщение" }, { status: 400 });
  if (data.action === "profile" && !data.name?.trim()) return NextResponse.json({ error: "Введите имя" }, { status: 400 });
  if (!["request", "book", "message", "profile"].includes(data.action)) return NextResponse.json({ error: "Неизвестная операция" }, { status: 400 });

  if (remoteEnabled()) return NextResponse.json(await (await import("@/lib/supabase-store")).create(data));
  if (process.env.NODE_ENV === "production") return NextResponse.json({ error: "Supabase не настроен для production." }, { status: 503 });

  const { db, getData: getLocalData } = await import("@/lib/db");
  if (data.action === "request") db.prepare("INSERT INTO requests (title,description) VALUES (?,?)").run(data.title!.trim(), data.description!.trim());
  else if (data.action === "book") {
    const psychologist = db.prepare("SELECT id FROM psychologists WHERE id=?").get(data.psychologistId!);
    if (!psychologist) return NextResponse.json({ error: "Психолог не найден" }, { status: 404 });
    const occupied = db.prepare("SELECT id FROM appointments WHERE psychologist_id=? AND date=? AND time=? AND status='Предстоит'").get(data.psychologistId!, data.date!, data.time!);
    if (occupied) return NextResponse.json({ error: "Это время уже занято. Выберите другое." }, { status: 409 });
    db.prepare("INSERT INTO appointments (psychologist_id,date,time,topic) VALUES (?,?,?,?)").run(data.psychologistId!, data.date!, data.time!, data.topic?.trim() || "Знакомство и ваш запрос");
  } else if (data.action === "message") db.prepare("INSERT INTO messages (psychologist_id,body,mine,read) VALUES (?,?,1,1)").run(data.psychologistId!, data.body!.trim());
  else db.prepare("UPDATE profile SET name=?,email=? WHERE id=1").run(data.name!.trim(), data.email?.trim() || "");
  return NextResponse.json(getLocalData());
}

async function update(data: Payload) {
  if (data.action === "request-status" && !["Открыто", "Закрыто"].includes(data.status ?? "")) return NextResponse.json({ error: "Недопустимый статус обращения" }, { status: 400 });
  if (!["request-status", "cancel-appointment", "read-messages"].includes(data.action)) return NextResponse.json({ error: "Неизвестная операция" }, { status: 400 });
  if ((data.action === "request-status" || data.action === "cancel-appointment") && !data.id) return NextResponse.json({ error: "Не указан id записи" }, { status: 400 });
  if (data.action === "read-messages" && !data.psychologistId) return NextResponse.json({ error: "Не указан психолог" }, { status: 400 });
  if (remoteEnabled()) return NextResponse.json(await (await import("@/lib/supabase-store")).update(data));
  if (process.env.NODE_ENV === "production") return NextResponse.json({ error: "Supabase не настроен для production." }, { status: 503 });

  const { db, getData: getLocalData } = await import("@/lib/db");
  if (data.action === "request-status") db.prepare("UPDATE requests SET status=? WHERE id=?").run(data.status!, data.id!);
  else if (data.action === "cancel-appointment") db.prepare("UPDATE appointments SET status='Отменена' WHERE id=?").run(data.id!);
  else db.prepare("UPDATE messages SET read=1 WHERE psychologist_id=? AND mine=0").run(data.psychologistId!);
  return NextResponse.json(getLocalData());
}

function errorResponse(error: unknown) {
  console.error("MindPlace API error", error);
  const message = error instanceof Error ? error.message : "Не удалось сохранить изменения";
  if (message === "Психолог не найден") return NextResponse.json({ error: message }, { status: 404 });
  if (message.includes("время уже занято")) return NextResponse.json({ error: message }, { status: 409 });
  if (message.includes("SUPABASE_URL") || message.includes("Supabase не настроен")) return NextResponse.json({ error: message }, { status: 503 });
  return NextResponse.json({ error: message || "Не удалось сохранить изменения" }, { status: 500 });
}

export async function GET() {
  try { return NextResponse.json(await getData()); }
  catch (error) { return errorResponse(error); }
}

export async function POST(req: Request) {
  try { return await create(await req.json() as Payload); }
  catch (error) { return errorResponse(error); }
}

export async function PATCH(req: Request) {
  try { return await update(await req.json() as Payload); }
  catch (error) { return errorResponse(error); }
}
