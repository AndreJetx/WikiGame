import { StaticPage } from "@/components/static-page";
import { GITHUB_URL, GAME_URL } from "@/lib/tools";

export function About() {
  return (
    <StaticPage title="About Legend of Elements Wiki">
      <p>
        Legend of Elements Wiki is an unofficial community encyclopedia for the game Legend of
        Elements. AndrJetx built it for players who need a durable, searchable record of
        cultivation paths, classes, gear, spirits, pets, dungeons, PvP, events, and update notes.
        Nothing here is an official statement from the publisher. Entries are written and edited by
        the community, can be incomplete, and may lag behind live-server changes.
      </p>
      <p>
        The wiki exists so that both humans and software agents can answer “how does this work in
        Legend of Elements?” without relying on disappearing social-media threads. Public read APIs,
        an OpenAPI description, a sitemap, and an llms.txt file are part of that same goal: make the
        knowledge reusable.
      </p>
      <p>
        If you want to play, use the{" "}
        <a href={GAME_URL} className="text-primary underline" target="_blank" rel="noopener noreferrer">
          official client
        </a>
        . Source:{" "}
        <a href={GITHUB_URL} className="text-primary underline" target="_blank" rel="noopener noreferrer">
          GitHub
        </a>
        . There is no company headquarters or paid support desk — this is a free fan site.
      </p>
    </StaticPage>
  );
}
