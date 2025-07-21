import { Page } from "components/shared/Page";
import TablePetugas from "./daftar-petugas";

export default function Petugas() {
  return (
    <Page title="Petugas">
      <div className="transition-content w-full px-(--margin-x) pt-5 lg:pt-6">
        <div className="min-w-0">
          <TablePetugas />
        </div>
      </div>
    </Page>
  );
}
