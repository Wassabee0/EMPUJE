import { labelForStatus } from "@/lib/labels";

type StatusBadgeProps = {
  status: string;
};

export function StatusBadge({ status }: StatusBadgeProps) {
  return <span className={`status-badge ${status}`}>{labelForStatus(status)}</span>;
}
