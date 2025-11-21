import { SignIn } from '@clerk/nextjs'

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
        },
        layout: {
          showOptionalFields: true,
        }
      }}
    />
  )
}