import { StaticPage } from "@/components/static-page";
import { GITHUB_URL } from "@/lib/tools";

export function Privacy() {
  return (
    <StaticPage title="Privacy — Legend of Elements Wiki">
      <p>
        Legend of Elements Wiki is a free unofficial encyclopedia. This page explains what little
        data the site handles. Browsing articles does not require an account. The public API is
        readable without authentication. Administrative editing uses a password cookie on this
        domain only and is limited to trusted maintainers.
      </p>
      <p>
        Server logs and the hosting provider (Vercel) may record standard request metadata such as
        IP address, user agent, and requested path, for operations and abuse prevention. Article
        view counts increment when an article is fetched from the API. We do not sell personal data,
        run advertising pixels, or build marketing profiles.
      </p>
      <h2 className="text-xl font-serif font-semibold text-primary pt-2">Cookies and local storage</h2>
      <p>
        A signed admin session cookie named wiki_admin_session is set only after a successful
        maintainer login. Theme preference may be stored in localStorage in your browser. You can
        clear both at any time.
      </p>
      <p>
        If you believe personal data was posted inside an article, open an issue on{" "}
        <a href={GITHUB_URL} className="text-primary underline" target="_blank" rel="noopener noreferrer">
          GitHub
        </a>{" "}
        and we will edit or remove it. This policy applies to this wiki and its public API. The
        official game has its own terms.
      </p>
    </StaticPage>
  );
}
