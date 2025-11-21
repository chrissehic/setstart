"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { useTheme } from "next-themes";
import type { BaseTheme } from "@clerk/types";

export default function ClerkProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { resolvedTheme } = useTheme();

  return (
    <ClerkProvider
      afterSignOutUrl="/sign-in"
      appearance={{
        theme: resolvedTheme as BaseTheme | BaseTheme[] | undefined,
        variables: {
          colorBackground: "var(--accent-background)",
          colorText: "var(--foreground)",
          colorNeutral: "var(--muted)",
          colorPrimary: "var(--primary)",
          colorDanger: "var(--destructive)",
          borderRadius: "var(--radius)",
        },
        elements: {
          rootBox: {
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontFamily: "var(--font-favorit)",
            backgroundColor: "var(--muted-background)",
          },
          card: {
            backgroundColor: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            boxShadow: "none",
            padding: "2rem",
            paddingTop: "4rem",
          },
          cardBox: {
            backgroundColor: "var(--card)",
            border: "1px solid var(--border)",
          },
          headerTitle: {
            display: "block",
            fontFamily: "var(--font-favorit)",
            color: "var(--foreground)",
            fontWeight: "600",
            fontSize: "1.5rem",
            marginBottom: "0.5rem",
          },
          headerSubtitle: {
            display: "block",
            fontFamily: "var(--font-favorit)",
            color: "var(--muted-foreground)",
            fontSize: "0.875rem",
          },
          socialButtons: {
            fontFamily: "var(--font-favorit)",
            backgroundColor: "var(--secondary)",
            border: "1px solid var(--border)",
            color: "var(--foreground)",
            borderRadius: "var(--radius)",
          },
          socialButtonsBlockButton: {
            fontFamily: "var(--font-favorit)",
            backgroundColor: "var(--secondary)",
            border: "1px solid var(--border)",
            color: "var(--foreground)",
            borderRadius: "var(--radius)",
            height: "2.5rem",
            fontSize: "0.875rem",
            fontWeight: "500",
            padding: "0.5rem 0.75rem",
          },
          formButtonPrimary: {
            fontFamily: "var(--font-favorit)",
            backgroundColor: "var(--primary)",
            color: "var(--primary-foreground)",
            borderRadius: "var(--radius)",
            fontSize: "0.875rem",
            fontWeight: "500",
            height: "2.5rem",
            padding: "0.5rem 1rem",
          },
          formFieldInput: {
            fontFamily: "var(--font-favorit)",
            backgroundColor: "var(--input)",
            border: "1px solid var(--border)",
            color: "var(--foreground)",
            borderRadius: "var(--radius)",
            height: "2.5rem",
            padding: "0.5rem 0.75rem",
            fontSize: "0.875rem",
          },
          formFieldLabel: {
            fontFamily: "var(--font-favorit)",
            color: "var(--foreground)",
            fontSize: "0.875rem",
            fontWeight: "500",
            marginBottom: "0.5rem",
          },
          formButtonText: {
            fontFamily: "var(--font-favorit)",
            fontSize: "0.875rem",
            fontWeight: "500",
          },
          formFieldInputShowPasswordButton: {
            fontFamily: "var(--font-favorit)",
            color: "var(--muted-foreground)",
          },
          formFieldAction: {
            fontFamily: "var(--font-favorit)",
            fontSize: "0.875rem",
          },
          identityPreviewEditButton: {
            fontFamily: "var(--font-favorit)",
            fontSize: "0.875rem",
            fontWeight: "500",
          },
          otpBox: {
            gap: "0.5rem",
          },
          otpInput: {
            fontFamily: "var(--font-favorit)",
            backgroundColor: "var(--input)",
            border: "1px solid var(--border)",
            color: "var(--foreground)",
            borderRadius: "var(--radius)",
            height: "3rem",
            width: "3rem",
            fontSize: "1.25rem",
            fontWeight: "600",
          },
          otpInputError: {
            borderColor: "var(--destructive)",
          },
          otpCodeFieldInputs: {
            gap: "0.5rem",
          },
          otpCodeFieldInput: {
            fontFamily: "var(--font-favorit)",
            backgroundColor: "var(--muted)",
            border: "1px solid var(--input) !important",
            color: "var(--foreground)",
            borderRadius: "var(--radius)",
            fontSize: "1.25rem",
            fontWeight: "600",
          },
          formResendCodeLink: {
            fontFamily: "var(--font-favorit)",
            color: "var(--muted-foreground)",
            fontSize: "0.875rem",
          },
          footer: {
            display: "none",
          },
        },
      }}
    >
      {children}
    </ClerkProvider>
  );
}
