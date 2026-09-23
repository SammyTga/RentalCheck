import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-4 text-stone-700 leading-7">
      <p className="text-sm text-stone-500">
        <Link href="/" className="hover:underline active:text-teal-800">
          ← Feed
        </Link>
      </p>
      <h2 className="text-2xl font-semibold text-stone-900">About</h2>
      <p>
        This site serves as a place to anonymously post any unrepaired, unsafe,
        non-functional or health-related hazards at your home while creating
        evidence value and assisting with validation of issues for unresolved
        complaints.
      </p>
      <p>
        Make sure to only log an issue on this site if you have first informed
        the landlord or property manager and the issue has gone ignored,
        unresolved, disputed or you have been harassed and threatened with
        eviction unfairly.
      </p>
      <p>
        Creating a post gives you a shareable link and public record of your
        grievance that can be shared with others including tenancy advocates or
        lawyers for helpful advice, assistance or legal proceedings.
      </p>
      <p>
        This serves to further encourage landlords to keep their tenants'
        rentals up to standard, safe, functional and compliant with New
        Zealand's Healthy Homes standards while helping to give kiwis and their
        families a warm, safe, dry home.
      </p>
      <p className="pt-1 text-xs font-medium uppercase tracking-widest text-stone-500">
        Paying it forward
      </p>
      <p>
        Future renters and even future buyers can check this public record to
        help make informed decisions about a property and its suitability for
        their family before signing any agreements or taking the time to visit
        the home. This is paying it forward and doing good for others in
        action.
      </p>
      <p>
        This is not a place for abuse or accusations against landlords or
        property managers.
      </p>
    </div>
  );
}
