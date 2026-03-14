import Link from "next/link";
import { sendMessage } from "@/app/actions/records";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getAssignedProviderId, requireProfile } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

type MessagesPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function getParam(
  params: Record<string, string | string[] | undefined>,
  key: string,
): string | null {
  const value = params[key];
  if (!value) {
    return null;
  }
  return Array.isArray(value) ? value[0] : value;
}

export default async function MessagesPage({ searchParams }: MessagesPageProps) {
  const profile = await requireProfile();
  const supabase = await createServerSupabaseClient();
  const params = await searchParams;
  const error = getParam(params, "error");

  let threadId = getParam(params, "thread");
  let threadLabel = "Care Thread";
  let patientHasAssignedProvider = true;
  let providerThreads: Array<{
    id: string;
    updated_at: string;
    patient: { full_name?: string } | null;
  }> = [];
  let messages: Array<{
    id: string;
    sender_id: string;
    body: string;
    sent_at: string;
  }> = [];

  if (profile.role === "patient") {
    patientHasAssignedProvider = Boolean(await getAssignedProviderId(profile.id));
    const threadResult = await supabase
      .from("message_threads")
      .select("id")
      .eq("patient_id", profile.id)
      .maybeSingle();

    threadId = threadResult.data?.id ? String(threadResult.data.id) : null;
  } else {
    const threadResult = await supabase
      .from("message_threads")
      .select("id,updated_at, patient:profiles!message_threads_patient_id_fkey(full_name)")
      .eq("provider_id", profile.id)
      .order("updated_at", { ascending: false })
      .limit(20);

    providerThreads =
      (threadResult.data as Array<{
        id: string;
        updated_at: string;
        patient: { full_name?: string } | null;
      }>) ?? [];

    if (!threadId && providerThreads.length > 0) {
      threadId = String(providerThreads[0].id);
    }

    const selected = providerThreads.find(
      (thread) => String(thread.id) === threadId,
    );
    if (selected) {
      threadLabel = `Patient: ${String(
        (selected.patient as { full_name?: string } | null)?.full_name ?? "Unknown",
      )}`;
    }
  }

  if (threadId) {
    const messagesResult = await supabase
      .from("messages")
      .select("*")
      .eq("thread_id", threadId)
      .order("sent_at", { ascending: true });
    messages = (messagesResult.data as typeof messages) ?? [];
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <header>
        <p className="text-xs uppercase tracking-[0.16em] text-[var(--color-muted)]">
          Secure Messaging
        </p>
        <h1 className="mt-1 text-3xl font-bold">
          {profile.role === "provider" ? "Care team inbox" : "Care team chat"}
        </h1>
      </header>

      {profile.role === "provider" ? (
        <Card>
          <h2 className="text-lg font-semibold">Open threads</h2>
          {providerThreads.length > 0 ? (
            <ul className="mt-3 space-y-2">
              {providerThreads.map((thread) => {
                const isSelected = thread.id === threadId;
                return (
                  <li key={thread.id}>
                    <Link
                      href={`/messages?thread=${thread.id}`}
                      className={`block rounded-lg px-3 py-2 text-sm ${
                        isSelected
                          ? "bg-[var(--color-accent)] text-white"
                          : "bg-[var(--color-panel-alt)] text-[var(--color-text)]"
                      }`}
                    >
                      {String(thread.patient?.full_name ?? "Unknown patient")}
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-[var(--color-muted)]">
              No active message threads yet.
            </p>
          )}
          <Link
            href="/provider/patients"
            className="mt-3 inline-flex text-sm font-semibold text-[var(--color-accent-strong)]"
          >
            Open patient list
          </Link>
        </Card>
      ) : null}

      <Card>
        <h2 className="text-xl font-semibold">{threadLabel}</h2>
        {error ? (
          <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            {error}
          </div>
        ) : null}
        <div className="mt-4 max-h-[420px] space-y-3 overflow-y-auto rounded-xl bg-[var(--color-panel-alt)] p-4">
          {messages.map((message) => {
            const isSelf = message.sender_id === profile.id;
            return (
              <article
                key={message.id}
                className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${
                  isSelf
                    ? "ml-auto bg-[var(--color-accent)] text-white"
                    : "bg-white text-[var(--color-text)]"
                }`}
              >
                <p>{message.body}</p>
                <p className="mt-1 text-[11px] opacity-80">{formatDateTime(message.sent_at)}</p>
              </article>
            );
          })}
          {messages.length === 0 ? (
            <p className="text-sm text-[var(--color-muted)]">
              No messages yet. Send one to start the thread.
            </p>
          ) : null}
        </div>

        {profile.role === "patient" && !patientHasAssignedProvider ? (
          <div className="mt-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel-alt)] px-4 py-4 text-sm text-[var(--color-muted)]">
            Messaging will be available once a provider is assigned to your account.
          </div>
        ) : (
          <form action={sendMessage} className="mt-4 space-y-3">
            <input type="hidden" name="thread_id" value={threadId ?? ""} />
            <div>
              <label htmlFor="body">Message</label>
              <textarea
                id="body"
                name="body"
                rows={3}
                placeholder="Share update, concern, or question."
                required
              />
            </div>
            <Button type="submit">Send message</Button>
          </form>
        )}
      </Card>
    </div>
  );
}
