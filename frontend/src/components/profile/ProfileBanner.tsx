
export default function ProfileBanner() {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-line bg-surface">
      <div className="absolute inset-0 bg-[url(/assets/journey.png)] bg-cover bg-center" />
      <div className="absolute inset-0 bg-linear-180 from-void/45 to-void/70 sm:bg-linear-95 sm:from-void/85 sm:via-void/40 sm:via-40% sm:to-transparent" />

      <div className="relative px-5 py-6.5 text-center sm:px-7 sm:text-left">
        <h2 className="display-heading">Every battle makes you stronger</h2>
        <p className="mt-2 text-body-muted">Your next victory awaits on the other side</p>
      </div>
    </div>
  )
}
