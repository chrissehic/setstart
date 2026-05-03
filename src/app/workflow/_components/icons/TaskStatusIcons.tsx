import { TaskStatus } from "@/types";
import React from "react";

interface IconProps {
  className?: string;
}

export const CompletedTaskIcon = ({ className }: IconProps) => (
  <svg
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Full solid circle */}
    <circle
      cx="10"
      cy="10"
      r="9"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
    />
    {/* Checkmark */}
    <path
      d="M13.45 6.47L8.57 11.35L6.45 9.23L5.39 10.29L8.57 13.47L14.51 7.53L13.45 6.47Z"
      fill="currentColor"
    />
  </svg>
);

export const InProgressTaskIcon = ({ className }: IconProps) => (
  <svg
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M10.95 0V2.02C15.34 2.56 18.45 6.55 17.91 10.94C17.45 14.58 14.59 17.47 10.95 17.9V19.9C16.45 19.35 20.45 14.47 19.9 8.97C19.45 4.22 15.68 0.47 10.95 0ZM8.95 0.03C7 0.22 5.14 0.97 3.62 2.23L5.05 3.71C6.17 2.81 7.52 2.23 8.95 2.03V0.03ZM2.21 3.64C0.960443 5.15782 0.191093 7.01331 0 8.97H2C2.19 7.55 2.75 6.2 3.64 5.07L2.21 3.64ZM0.00999999 10.97C0.21 12.93 0.98 14.78 2.22 16.3L3.64 14.87C2.75684 13.7396 2.19386 12.3926 2.01 10.97H0.00999999ZM5.05 16.34L3.62 17.71C5.13497 18.9724 6.98936 19.7587 8.95 19.97V17.97C7.52737 17.7861 6.18035 17.2232 5.05 16.34ZM10.45 4.97V10.22L14.95 12.89L14.2 14.12L8.95 10.97V4.97H10.45Z"
      fill="currentColor"
    />
  </svg>
);

export const NotStartedTaskIcon = ({ className }: IconProps) => (
  <svg
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M10.95 0V2C15.34 2.54 18.45 6.53 17.91 10.92C17.6893 12.689 16.885 14.3339 15.6244 15.5944C14.3639 16.855 12.719 17.6593 10.95 17.88V19.88C16.45 19.28 20.4 14.34 19.8 8.85C19.28 4.19 15.61 0.5 10.95 0ZM8.95 0C6.99 0.18 5.14 0.95 3.62 2.2L5.05 3.74C6.17 2.84 7.52 2.26 8.95 2.06V0ZM2.21 3.67C0.955145 5.18463 0.185093 7.04181 0 9H2C2.19 7.58 2.75 6.23 3.64 5.1L2.21 3.67ZM0.00999999 11C0.21 12.96 0.98 14.81 2.22 16.33L3.64 14.9C2.75684 13.7696 2.19386 12.4226 2.01 11H0.00999999ZM5.01 16.37L3.62 17.74C5.13497 19.0024 6.98936 19.7887 8.95 20V18C7.52737 17.8161 6.18035 17.2532 5.05 16.37H5.01Z"
      fill="currentColor"
      fillOpacity={0.8}
    />
  </svg>
);

export const ArchivedTaskIcon = ({ className }: IconProps) => (
  <svg
    viewBox="0 0 18 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* top lid */}
    <rect
      x="3"
      y="4"
      width="14"
      height="3"
      rx="1"
      stroke="currentColor"
      strokeWidth="1.5"
    />

    {/* box body */}
    <rect
      x="4.5"
      y="7"
      width="11"
      height="9"
      rx="1.5"
      stroke="currentColor"
      strokeWidth="1.5"
    />

    {/* archive slot */}
    <path
      d="M8 11h4"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

/**
 * Helper function to get the appropriate task status icon component
 */
export const getTaskStatusIcon = (
  status: TaskStatus,
  className?: string
): React.ReactElement => {
  switch (status) {
    case TaskStatus.NOT_STARTED:
      return <NotStartedTaskIcon className={className} />;
    case TaskStatus.IN_PROGRESS:
      return <InProgressTaskIcon className={className} />;
    case TaskStatus.COMPLETED:
      return <CompletedTaskIcon className={className} />;
    case TaskStatus.ARCHIVED:
      return <ArchivedTaskIcon className={className} />;
    default:
      return <NotStartedTaskIcon className={className} />;
  }
};
