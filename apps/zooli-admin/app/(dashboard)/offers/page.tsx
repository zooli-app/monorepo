import { PageHeader, SectionCard } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/ui";

export default function OffersPage() {
  return (
    <div className="space-y-5">
      <PageHeader title="Offers & Coupons" description="Discount codes for customers" />
      <SectionCard>
        <EmptyState
          title="Coupons aren't set up yet"
          text="The platform doesn't have a coupons feature in its database or app yet, so there is nothing to list. When it's built, your coupons will appear here."
        />
      </SectionCard>
    </div>
  );
}
