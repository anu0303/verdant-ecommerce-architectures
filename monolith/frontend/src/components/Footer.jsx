export default function Footer() {
  return (
    <footer className="mt-24 border-t border-ink/10 bg-ink text-paper/70">
      <div className="mx-auto max-w-6xl px-6 py-10 font-body text-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-display text-lg text-paper">Verdant</p>
          <p>Living goods, delivered with roots intact.</p>
        </div>
        <p className="mt-6 text-xs text-paper/40">Demo store — payments are simulated, no real charges are made.</p>
      </div>
    </footer>
  );
}
