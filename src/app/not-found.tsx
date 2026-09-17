import Link from "next/link";
export default function NotFound() {
  return (
    <div className="empty-state">
      <h1>This road ends here.</h1>
      <p>That page isn’t part of this campaign.</p>
      <Link className="button primary" href="/campaigns">
        Back to campaigns
      </Link>
    </div>
  );
}
