import { SavedTuitionsProvider } from "@/components/public/saved-tuitions-provider";
import TuitionDetailsView from "@/components/public/tuition-details-view";

// PublicChrome reads usePathname(); this dynamic route must render per request.
export const instant = false;

export default async function TuitionDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <SavedTuitionsProvider>
      <TuitionDetailsView tuitionId={id} />
    </SavedTuitionsProvider>
  );
}
