import { createClient } from "@supabase/supabase-js";

function getClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("SUPABASE_URL и SUPABASE_SERVICE_ROLE_KEY не настроены.");
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

function fail(error: { message: string } | null) {
  if (error) throw new Error(error.message);
}

export async function getData() {
  const supabase = getClient();
  const [people, requests, sessions, messages, resources, profile] = await Promise.all([
    supabase.from("psychologists").select("*").order("rating", { ascending: false }),
    supabase.from("requests").select("*").order("created_at", { ascending: false }),
    supabase.from("appointments").select("*, psychologist:psychologists(name,title,photo)").order("date").order("time"),
    supabase.from("messages").select("*, psychologist:psychologists(name,photo)").order("created_at"),
    supabase.from("resources").select("*").order("id"),
    supabase.from("profile").select("name,email").eq("id", 1).maybeSingle(),
  ]);
  [people, requests, sessions, messages, resources, profile].forEach((result) => fail(result.error));
  return {
    psychologists: people.data ?? [],
    requests: requests.data ?? [],
    appointments: (sessions.data ?? []).map((session) => ({
      ...session,
      time: String(session.time).slice(0, 5),
      psychologist: session.psychologist?.name ?? "Психолог",
      title: session.psychologist?.title ?? "",
      photo: session.psychologist?.photo ?? "",
    })),
    messages: (messages.data ?? []).map((message) => ({
      ...message,
      psychologist: message.psychologist?.name ?? "Психолог",
      photo: message.psychologist?.photo ?? "",
    })),
    resources: resources.data ?? [],
    profile: profile.data ?? { name: "Алексей", email: "" },
  };
}

export async function create(data: { action: string; title?: string; description?: string; psychologistId?: number; date?: string; time?: string; topic?: string; body?: string; name?: string; email?: string }) {
  const supabase = getClient();
  if (data.action === "request") {
    const { error } = await supabase.from("requests").insert({ title: data.title, description: data.description });
    fail(error);
  } else if (data.action === "book") {
    const { data: psychologist, error: personError } = await supabase.from("psychologists").select("id").eq("id", data.psychologistId).maybeSingle();
    fail(personError);
    if (!psychologist) throw new Error("Психолог не найден");
    const { error } = await supabase.from("appointments").insert({ psychologist_id: data.psychologistId, date: data.date, time: data.time, topic: data.topic || "Знакомство и ваш запрос" });
    if (error?.code === "23505") throw new Error("Это время уже занято. Выберите другое.");
    fail(error);
  } else if (data.action === "message") {
    const { error } = await supabase.from("messages").insert({ psychologist_id: data.psychologistId, body: data.body, mine: true, read: true });
    fail(error);
  } else if (data.action === "profile") {
    const { error } = await supabase.from("profile").upsert({ id: 1, name: data.name, email: data.email ?? "" });
    fail(error);
  } else throw new Error("Неизвестная операция");
  return getData();
}

export async function update(data: { action: string; id?: number; status?: string; psychologistId?: number }) {
  const supabase = getClient();
  if (data.action === "request-status") {
    const { error } = await supabase.from("requests").update({ status: data.status }).eq("id", data.id);
    fail(error);
  } else if (data.action === "cancel-appointment") {
    const { error } = await supabase.from("appointments").update({ status: "Отменена" }).eq("id", data.id);
    fail(error);
  } else if (data.action === "read-messages") {
    const { error } = await supabase.from("messages").update({ read: true }).eq("psychologist_id", data.psychologistId).eq("mine", false);
    fail(error);
  } else throw new Error("Неизвестная операция");
  return getData();
}
