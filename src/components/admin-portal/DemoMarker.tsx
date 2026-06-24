// The one net-new visual in the Admin Portal Demo Shell (FFM §3): a "Demo ·
// mock data" pill built ENTIRELY from the existing `--warning` token — no new
// brand colors. Lives in CONTENT next to a page title, NEVER in the navbar
// (the navbar is fixed chrome). Mirrors the mockup's `.demo-pill`.
const DemoMarker = () => {
  return (
    <span className="inline-flex items-center border border-warning/40 bg-warning/10 px-2 py-0.5 text-[11px] font-semibold tracking-wide text-warning">
      Demo · mock data
    </span>
  );
};

export default DemoMarker;
