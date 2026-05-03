import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <SignIn
      appearance={{
        elements: {
          headerTitle: {
            fontSize: "1.25rem",
            fontWeight: "400",
            fontFamily: "var(--font-favorit)",
          },
          headerSubtitle: {
            fontSize: "0.875rem",
            fontFamily: "var(--font-favorit)",
          },
          formButtonPrimary: {
            fontFamily: "var(--font-favorit)",
            // backgroundColor: "hsl(var(--primary))",
            isolation: "auto",
            color: "hsl(var(--primary-foreground))",
            borderRadius: "9999px",
            fontSize: "0.875rem",
            fontWeight: "500",
            height: "2.25rem",
            padding: "0.5rem 1rem",
            boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
            transition: "all 0.2s",
            border: "none",
            marginBottom: "0rem",
          },
          buttonArrowIcon: {
            display: "none",
          },
          formFieldInput: {
            fontFamily: "var(--font-favorit)",
            border: "1px solid hsl(var(--input))",
            borderRadius: "0.375rem",
            color: "hsl(var(--foreground))",
            height: "2.25rem",
            padding: "0 0.75rem",
            fontSize: "0.875rem",
            boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
            transition: "all 0.2s",
          },
          formFieldLabel: {
            fontFamily: "var(--font-favorit)",
            color: "hsl(var(--foreground))",
            fontSize: "0.875rem",
            fontWeight: "500",
            marginBottom: "0rem",
          },
          socialButtonsBlockButton: {
            fontFamily: "var(--font-favorit)",
            backgroundColor: "hsl(var(--secondary))",
            border: "1px solid hsl(var(--border))",
            color: "hsl(var(--foreground))",
            borderRadius: "9999px",
            height: "2.25rem",
            fontSize: "0.875rem",
            fontWeight: "500",
            padding: "0.5rem 0.75rem",
            boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
            transition: "all 0.2s",
          },
        },
        layout: {
          showOptionalFields: true,
        },
      }}
    />
  );
}
