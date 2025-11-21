import { SignUp } from '@clerk/nextjs'

export default function Page() {
  return (
    <SignUp 
      appearance={{
        elements: {
          headerTitle: {
            fontSize: "1.5rem",
            fontWeight: "600",
            fontFamily: "var(--font-favorit)",
          },
          headerSubtitle: {
            fontSize: "0.875rem",
            fontFamily: "var(--font-favorit)",
          },
        },
        layout: {
          showOptionalFields: true,
        }
      }}
    />
  )
}