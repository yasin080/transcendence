const CONTACT_EMAILS = ['aolabarr@student.42urduliz.com', 'ivromero@student.42urduliz.com', 'beiglesi@student.42urduliz.com', 'ybahri@student.42urduliz.com']

const linkClass = 'text-fuse-400 hover:text-white'

export default function Privacy() {
  return (
    <article className="max-w-prose space-y-6">
      <header className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
        <p className="text-sm text-slate-400">Last updated: 24 October 2026</p>
      </header>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Who we are</h2>
        <p className="text-fg-secondary">
          We are a team of students at 42 Urduliz (Bizkaia, Spain), and this multiplayer worm game
          is our ft_transcendence project. It is not a public online service: it runs on a machine
          on campus so the project can be evaluated. If you have any question about your data,
          write to us:
        </p>
        <ul className="list-disc space-y-1 pl-5 text-fg-secondary">
          {CONTACT_EMAILS.map((email) => (
            <li key={email}>
              <a href={`mailto:${email}`} className={linkClass}>{email}</a>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">What we store and why</h2>
        <ul className="list-disc space-y-1 pl-5 text-fg-secondary">
          <li>
            <strong>Account:</strong> your username, email and password, to log you in. The
            password is stored as a bcrypt hash, never in plain text.
          </li>
          <li>
            <strong>Google sign-in</strong>, if you use it: your Google ID, email and name, to
            create your account without a password. We do not keep the access tokens Google
            gives us.
          </li>
          <li>
            <strong>Profile:</strong> an optional display name, a bio of up to 160 characters and an
            avatar, to show who you are. Uploaded avatars are cropped and re-encoded, which strips
            metadata such as the place where the photo was taken.
          </li>
          <li>
            <strong>Games:</strong> the rooms you create or join and the matches you play (when they
            started and ended), to run the game.
          </li>
          <li>
            <strong>Friends:</strong> the friend requests you send, receive and accept.
          </li>
          <li>
            <strong>Your IP address</strong>, kept for a short time to block repeated login and
            sign-up attempts.
          </li>
        </ul>
        <p className="text-fg-secondary">The game does not use analytics, advertising or tracking tools.</p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Who can see what</h2>
        <p className="text-fg-secondary">
          Other logged-in players can see your username, avatar, bio, join date, friends list and
          the names of the rooms you create. Your username is also shown inside the rooms you join.
          Your display name is shown on your profile. If you sign in with Google, it starts as the
          name on your Google account, and you can change it from your profile. The players in a
          match see its result. Your email and password are never shown.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Cookies and Google</h2>
        <p className="text-fg-secondary">
          We only use the cookies the login needs: a session cookie that expires after 30 minutes
          of inactivity, an XSRF-TOKEN cookie that protects forms, and, if you tick “Remember me”, a
          cookie that keeps you logged in on that device until you log out.
        </p>
        <p className="text-fg-secondary">
          Google is the only outside service: it handles sign-in if you choose it, and it serves
          our fonts, which means your browser sends your IP address to Google.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Your data</h2>
        <p className="text-fg-secondary">
          Your data stays in the database of that campus machine and is not sent anywhere else. All
          traffic uses HTTPS. You can change your username, email, display name, bio, avatar and
          password from your profile at any time. To get a copy of your data or delete your
          account, email us from the address linked to your account. The database may be deleted
          once the evaluation is over.
        </p>
      </section>
    </article>
  )
}
