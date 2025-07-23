// Import Dependencies
import { createColumnHelper } from "@tanstack/react-table";

// Local Imports
import {
  SelectCell,
  SelectHeader,
} from "components/shared/table/SelectCheckbox";
import { EmailCell, NameCell} from "./rows";
import { RowActions } from "./RowActions";

// ----------------------------------------------------------------------

const columnHelper = createColumnHelper();

export const columns = [
  columnHelper.display({
    id: "select",
    header: SelectHeader,
    cell: SelectCell,
  }),
  columnHelper.accessor((row) => row.name, {
    id: "name",
    header: "name",
    cell: NameCell,
  }),
  columnHelper.accessor((row) => row.email, {
    id: "email",
    header: "email",
    cell: EmailCell,
  }),
  //   columnHelper.accessor((row) => row.status, {
  //     id: "status",
  //     header: "status",
  //     cell: StatusCell,
  //   }),
  columnHelper.display({
    id: "actions",
    header: "",
    cell: RowActions,
  }),
];
