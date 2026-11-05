import { Link } from 'react-router'

const linkClass = 'text-fuse-400 hover:text-white'

export default function Terms() {
  return (
    <article className="max-w-prose space-y-6">
      <header className="space-y-1">
        <h1 className="display-heading">Terms of Service</h1>
        <p className="text-sm text-fg-muted">Last updated: 21 October 2026</p>
      </header>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">What this is</h2>
        <p className="text-fg-secondary">
          This multiplayer worm game is our ft_transcendence project at 42 Urduliz (Bizkaia,
          Spain). It is free and non-commercial, and it runs on a machine on campus for the
          project’s evaluation; it is not a public online service. Stored data may be deleted once
          the evaluation is over.
        </p>
        <p className="text-fg-secondary">
          By creating an account you accept these rules and our{' '}
          <Link to="/privacy" className={linkClass}>Privacy Policy</Link>.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Your account</h2>
        <ul className="list-disc space-y-1 pl-5 text-fg-secondary">
          <li>You must be at least 14 years old.</li>
          <li>One account per person.</li>
          <li>
            Usernames are 3 to 20 characters long and can only contain letters, numbers, “_” and
            “-”.
          </li>
          <li>Keep your password private. You are responsible for the activity on your account.</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Rooms and matches</h2>
        <ul className="list-disc space-y-1 pl-5 text-fg-secondary">
          <li>
            Whoever creates a room is its host: they can add bots to fill empty seats and remove
            players. If the host leaves before the match starts, the room closes.
          </li>
          <li>
            If you leave a match or lose your connection, your worm stops until you come back, and it
            can be eliminated if you take too long.
          </li>
          <li>The game runs on the backend, not in your browser, so the backend decides who wins.</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Play fair</h2>
        <ul className="list-disc space-y-1 pl-5 text-fg-secondary">
          <li>
            No offensive, hateful or sexual usernames, bios, avatars or room names, and no pretending
            to be someone else.
          </li>
          <li>Only upload avatars you are allowed to use.</li>
          <li>Do not send unwanted friend requests or harass other players.</li>
          <li>
            Do not control your worm with scripts or external bots. To play against bots, add them
            from your room.
          </li>
          <li>Do not use second accounts or arranged matches to manipulate results.</li>
          <li>
            Do not try to access other players’ accounts or disrupt the game. If you find a bug,
            report it to us instead of exploiting it.
          </li>
        </ul>
        <p className="text-fg-secondary">
          If you break these rules, we can cancel your results or delete your account.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Credits</h2>
        <p className="text-fg-secondary">
          The game's code was created by the team, except:
        </p>
        <ul className="list-disc space-y-1 pl-5 text-fg-secondary">
          <li>
            The artwork (worms, 3D models, textures and backgrounds) and all other images, generated
            with ChatGPT (OpenAI) from the team's prompts.
          </li>
          <li>
            Some interface icons, from{' '}
            <a href="https://lucide.dev" target="_blank" rel="noreferrer" className={linkClass}>Lucide</a>{' '}
            (ISC license) and{' '}
            <a href="https://feathericons.com" target="_blank" rel="noreferrer" className={linkClass}>Feather</a>{' '}
            (MIT license).
          </li>
          <li>
            The Bungee and Space Grotesk fonts, used under the SIL Open Font License and served by
            Google Fonts.
          </li>
          <li>
            The Google logo, a trademark of Google LLC, used only on the “Sign in with Google”
            button.
          </li>
        </ul>
      </section>
    </article>
  )
}
