import SingleFlightPageClient from "@/src/components/flight/SingleFlightPage";

interface Props {
  params: { id: string } | Promise<{ id: string }>;
}

export default async function Page({ params }: Props) {
  // `params` may be a Promise in some Next.js versions/environments — await it safely
  const resolved = (await params) as { id: string };
  return <SingleFlightPageClient id={resolved.id} />;
}
