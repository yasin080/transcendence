import { Link } from 'react-router'

// TODO: replace with the team contact emails before the evaluation
const CONTACT_EMAILS = ['login1@student.42urduliz.com', 'login2@student.42urduliz.com', 'login3@student.42urduliz.com']

const linkClass = 'text-emerald-400 hover:text-emerald-300'

export default function Privacy() {
  return (
    <article className="max-w-prose space-y-6">
      <header className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
        <p className="text-sm text-slate-400">Last updated: 21 October 2026</p>
      </header>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Who we are</h2>
        <p className="text-slate-300">
          Transcendence is a multiplayer worm game built by a team of students at 42 Urduliz
          (Bizkaia, Spain) for the ft_transcendence project. It is an educational, non-commercial
          project. The team is responsible for the personal data processed here, and you can
          contact us at:
        </p>
        <ul className="list-disc space-y-1 pl-5 text-slate-300">
          {CONTACT_EMAILS.map((email) => (
            <li key={email}>
              <a href={`mailto:${email}`} className={linkClass}>{email}</a>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">What we collect</h2>
        <ul className="list-disc space-y-1 pl-5 text-slate-300">
          <li>
            <strong>Account:</strong> your username, email address and password. We never store
            the password itself, only a salted hash (bcrypt).
          </li>
          {/* Remove the token sentence if the team stops storing Google tokens */}
          <li>
            <strong>Google sign-in (optional):</strong> your Google account ID, email and name. We
            only accept Google accounts with a verified email. Google also gives us access and
            refresh tokens, which we store linked to your account.
          </li>
          <li>
            <strong>Profile (optional):</strong> a display name, a bio of up to 160 characters and
            an avatar. Uploaded avatars are cropped and re-encoded on our server, so any metadata
            in the original file (camera, location…) is discarded.
          </li>
          <li>
            <strong>Gameplay:</strong> the rooms you create or join, the matches you play, who won,
            and when each match started and ended.
          </li>
          <li>
            <strong>Friends:</strong> the friend requests you send, receive and accept.
          </li>
          <li>
            <strong>Technical:</strong> the cookies described below, and your IP address, kept for
            a short time to limit repeated login and sign-up attempts.
          </li>
        </ul>
        <p className="text-slate-300">We do not use analytics, advertising or tracking tools.</p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">How we use it</h2>
        <ul className="list-disc space-y-1 pl-5 text-slate-300">
          <li>To create your account, keep it secure and keep you logged in.</li>
          <li>To run matches in real time and show their results.</li>
          <li>To let you find other players and manage your friends.</li>
          <li>To protect the service against abuse.</li>
        </ul>
        <p className="text-slate-300">
          We process this data because it is necessary to provide the service you signed up for
          (art. 6.1.b GDPR) and to keep it secure (art. 6.1.f GDPR). We never sell your data or use
          it for advertising.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">What other players can see</h2>
        <p className="text-slate-300">
          Logged-in players can see your username, avatar, bio, join date, friends list, the names
          of the rooms you create, and your match results. Your email address and password are
          never shown to anyone, and your display name is only visible to you.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Cookies</h2>
        <p className="text-slate-300">
          We only use cookies that are strictly necessary for the site to work, so they do not
          require your consent:
        </p>
        <ul className="list-disc space-y-1 pl-5 text-slate-300">
          <li>
            <strong>Session cookie:</strong> keeps you logged in. It expires after 30 minutes of
            inactivity.
          </li>
          <li>
            <strong>XSRF-TOKEN:</strong> protects forms against cross-site request forgery.
          </li>
          <li>
            <strong>Remember-me cookie:</strong> only if you tick “Remember me”. It keeps you
            logged in on that device until you log out.
          </li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Third-party services</h2>
        <ul className="list-disc space-y-1 pl-5 text-slate-300">
          <li>
            <strong>Google Sign-In</strong>, only if you choose it. Google’s own privacy policy
            applies to your Google account.
          </li>
          <li>
            <strong>Google Fonts:</strong> your browser downloads our fonts from Google’s servers,
            so Google receives your IP address.
          </li>
        </ul>
        <p className="text-slate-300">We do not share your data with anyone else.</p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Security and retention</h2>
        <p className="text-slate-300">
          All traffic is encrypted with HTTPS and passwords are hashed. We keep your account,
          profile, friends and match data while your account exists. Since this is a student
          project, the whole database may be deleted when the project ends.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Your rights</h2>
        <p className="text-slate-300">
          Under the GDPR you can access, correct, delete or export your data, and object to or
          restrict how we use it. You can change your username, email, display name, bio, avatar
          and password at any time from your profile. For anything else, including a copy of your
          data or deleting your account, write to any of the addresses above from the email linked
          to your account and we will answer within one month. You can also file a complaint with
          the Spanish Data Protection Agency (
          <a href="https://www.aepd.es" target="_blank" rel="noreferrer" className={linkClass}>
            aepd.es
          </a>
          ).
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Minimum age</h2>
        <p className="text-slate-300">
          You must be at least 14 years old to use Transcendence, the minimum age to consent to the
          processing of personal data in Spain (art. 7 LOPDGDD). If we learn that an account
          belongs to someone younger, we will delete it.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Changes</h2>
        <p className="text-slate-300">
          If we change this policy, we will update the date at the top of this page. See also our{' '}
          <Link to="/terms" className={linkClass}>Terms of Service</Link>.
        </p>
      </section>
    </article>
  )
}
