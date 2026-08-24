/**
 * The page's ambient colour: three soft blooms and a faded dot grid.
 *
 * Static by design — there is no pointer tracking and no custom cursor, so the
 * visitor keeps their normal system cursor and nothing follows it around.
 */
export default function AmbientBackground() {
  return (
    <>
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div
          className="absolute -left-36 -top-48 h-[620px] w-[620px] rounded-full blur-[70px]"
          style={{
            opacity: 'var(--blob-opacity)',
            background: 'radial-gradient(circle, var(--glow-1), transparent 68%)',
          }}
        />
        <div
          className="absolute -right-48 top-[38%] h-[560px] w-[560px] rounded-full blur-[70px]"
          style={{
            opacity: 'var(--blob-opacity)',
            background: 'radial-gradient(circle, var(--glow-2), transparent 68%)',
          }}
        />
        <div
          className="absolute -bottom-44 left-[22%] h-[520px] w-[520px] rounded-full blur-[70px]"
          style={{
            opacity: 'var(--blob-opacity)',
            background: 'radial-gradient(circle, var(--glow-3), transparent 68%)',
          }}
        />
      </div>

      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, var(--dot-grid) 1px, transparent 0)',
          backgroundSize: '26px 26px',
          WebkitMaskImage: 'radial-gradient(ellipse 92% 62% at 50% 32%, #000 32%, transparent 78%)',
          maskImage: 'radial-gradient(ellipse 92% 62% at 50% 32%, #000 32%, transparent 78%)',
        }}
      />
    </>
  );
}
