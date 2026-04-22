"use client";

import { useRouter } from "next/navigation";
import { SettingsGroup, SettingsRow } from "./SettingsGroup";

export function SessionSection({ isClient }: { isClient: boolean }) {
  const router = useRouter();

  function handleSignOut() {
    // TODO: POST /auth/logout → invalidates session/JWT on server before redirecting
    document.cookie = "user-role=; path=/; max-age=0";
    router.push("/login");
  }

  return (
    <>
      <p
        className={`text-[10px] uppercase tracking-widest font-bold mb-3 px-1 ${isClient ? "text-zinc-600" : "text-zinc-400"}`}
      >
        Session
      </p>
      <SettingsGroup
        isClient={isClient}
        rows={[
          <SettingsRow
            key="signout"
            label="Sign out of Vekko"
            danger
            onClick={handleSignOut}
            isClient={isClient}
          />,
        ]}
      />
    </>
  );
}
