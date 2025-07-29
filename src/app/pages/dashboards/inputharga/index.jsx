import { Page } from "components/shared/Page";
import HargaBapokTable from "./tableBapok";

export default function inputharga() {
  return (
    <Page title="inputharga">
      <div className="transtition-content w-full px-(--margin-x) pt-5 lg:pt-6">
        <div className="main-w-0">
          <h2 className="dark:text-dark-50 truncate text-sm font-medium tracking-wide text-gray-800">
            {/* import <tableBapok/> masukkan di sini  */}
            <HargaBapokTable/>
          </h2>
        </div>
      </div>
    </Page>
  );
}
