import NextAuth from "next-auth";
import Discord from "next-auth/providers/discord";

type DiscordGuild = {
  id: string;
};

async function isNetworkSchoolMember(accessToken: string): Promise<boolean> {
  const guildId = process.env.DISCORD_GUILD_ID;
  if (!guildId) {
    console.error("DISCORD_GUILD_ID is not configured");
    return false;
  }

  const response = await fetch("https://discord.com/api/users/@me/guilds", {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });

  if (!response.ok) {
    console.error("Failed to fetch Discord guilds", response.status);
    return false;
  }

  const guilds = (await response.json()) as DiscordGuild[];
  return guilds.some((guild) => guild.id === guildId);
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Discord({
      clientId: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
      authorization: {
        params: {
          scope: "identify guilds",
        },
      },
    }),
  ],
  pages: {
    signIn: "/",
    error: "/",
  },
  callbacks: {
    async signIn({ account }) {
      if (account?.provider !== "discord" || !account.access_token) {
        return false;
      }

      const member = await isNetworkSchoolMember(account.access_token);
      if (!member) {
        return "/?error=NotNSMember";
      }

      return true;
    },
    async jwt({ token, profile }) {
      if (profile && "id" in profile) {
        token.discordId = String(profile.id);
        const discordProfile = profile as {
          global_name?: string | null;
          username?: string;
          image_url?: string;
        };
        token.name =
          discordProfile.global_name || discordProfile.username || token.name;
        if (discordProfile.image_url) {
          token.picture = discordProfile.image_url;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = String(token.discordId ?? token.sub ?? "");
      }
      return session;
    },
  },
  trustHost: true,
});
