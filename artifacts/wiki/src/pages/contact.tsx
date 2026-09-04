import { StaticPage } from "@/components/static-page";
import { GITHUB_URL, GAME_URL } from "@/lib/tools";

export function Contact() {
  return (
    <StaticPage title="Contact Legend of Elements Wiki">
      <p>
        Legend of Elements Wiki is a community-run fan wiki. There is no official publisher
        helpdesk, telephone number, or mailing address for this site. For questions about articles,
        missing pages, or the public API, open a GitHub issue on{" "}
        <a href={GITHUB_URL} className="text-primary underline" target="_blank" rel="noopener noreferrer">
          {GITHUB_URL.replace("https://", "")}
        </a>
        .
      </p>
      <p>
        Use GitHub when you want to report a factual error, request a category, flag broken API
        behavior, or discuss the agent-facing files (OpenAPI, llms.txt, MCP). Do not send account
        recovery, payment, or in-game support requests here — those belong with the game operator at{" "}
        <a href={GAME_URL} className="text-primary underline" target="_blank" rel="noopener noreferrer">
          {GAME_URL}
        </a>
        .
      </p>
      <p>
        This contact page exists so players and agents can verify that the wiki is a real, maintained
        community project and know where to write. We do not collect inbound email on this domain
        and we do not operate a CRM. Response times depend on volunteer availability.
      </p>
    </StaticPage>
  );
}
