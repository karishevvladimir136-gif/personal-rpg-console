import { LocalizedText } from "@/components/language-context";
import Link from "next/link";
export default function NotFound() {
  return (
    <div className="empty-state">
      <h1>
        <LocalizedText message="This road ends here." />
      </h1>
      <p>
        <LocalizedText message="That page isn’t part of this campaign." />
      </p>
      <Link className="button primary" href="/campaigns">
        <LocalizedText message="Back to campaigns" />
      </Link>
    </div>
  );
}
