import { Page } from "components/shared/Page";
import { TopSellers } from "../TopSellers";
import { Button } from "components/ui";

export default function Home() {
  return (
    <Page title="Homepage">
      <div className="transition-content w-full px-(--margin-x) pt-5 lg:pt-6">
        <div className="min-w-0">
          <TopSellers />
          <Button className="mt-3" ref={{}}>Form</Button>
        </div>
      </div>
    </Page>
  );
}
