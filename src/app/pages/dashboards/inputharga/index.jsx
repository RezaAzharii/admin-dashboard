import { Page } from "components/shared/Page";
import HargaBapokTable from "./tableBapok";

export default function inputharga() {
  return (
    <Page title="Input Harga">
      
            {/* import <tableBapok/> masukkan di sini  */}
            <HargaBapokTable/>
          
    </Page>
  );
}
