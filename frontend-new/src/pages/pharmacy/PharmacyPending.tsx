import PrescriptionTable from "../../components/PrescriptionTable";

export default function PendingPage() {
  return <PrescriptionTable statusFilter="pending" title="Pending Prescriptions" />;
}