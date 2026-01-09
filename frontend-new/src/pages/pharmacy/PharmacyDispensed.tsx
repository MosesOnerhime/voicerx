import PrescriptionTable from "../../components/PrescriptionTable";

export default function DispensedPage() {
  return <PrescriptionTable statusFilter="dispensed" title="Dispensed History" />;
}