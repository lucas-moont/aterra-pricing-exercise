import { getQuote } from "@/lib/store";
import PricingScreen from "@/components/PricingScreen";

export const dynamic = "force-dynamic";

export default function Page() {
  const quote = getQuote();
  return <PricingScreen initial={quote} />;
}
