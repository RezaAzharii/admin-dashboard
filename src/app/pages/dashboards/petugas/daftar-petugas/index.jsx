// Local Imports
import { Page } from "components/shared/Page";
import { AppointmentsTable } from "./AppointmentsTable";

// ----------------------------------------------------------------------

export default function TablePetugas() {
  return (
    <Page title="Petugas Dashboard">
      <div className="transition-content w-full px-(--margin-x) pb-8">
        <AppointmentsTable />
      </div>
    </Page>
  );
}
