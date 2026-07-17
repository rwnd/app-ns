type AuthStatusBannerProps = {
  error?: string;
};

function messageForError(error?: string): { title: string; body: string } | null {
  if (!error) return null;

  if (error === "NotNSMember" || error === "AccessDenied") {
    return {
      title: "Login failed",
      body: "You should be a member of the NS Discord to be able to use this app.",
    };
  }

  if (error === "SessionRequired") {
    return {
      title: "Login required",
      body: "Sign in with Discord to continue. You must be a member of the NS Discord.",
    };
  }

  if (error === "OAuthAccountNotLinked" || error === "OAuthCallback") {
    return {
      title: "Login failed",
      body: "Discord authentication did not complete. Please try again. You should be a member of the NS Discord to be able to use this app.",
    };
  }

  return {
    title: "Login failed",
    body: "Something went wrong during Discord login. You should be a member of the NS Discord to be able to use this app.",
  };
}

export function AuthStatusBanner({ error }: AuthStatusBannerProps) {
  const message = messageForError(error);
  if (!message) return null;

  return (
    <div
      role="alert"
      className="mx-auto w-full max-w-xl rounded-md border border-red-200 bg-red-50 px-5 py-4 text-left text-red-900 animate-[fade-in_0.35s_ease-out]"
    >
      <p className="text-sm font-bold tracking-wide">{message.title}</p>
      <p className="mt-1 text-sm leading-relaxed text-red-800">{message.body}</p>
    </div>
  );
}
