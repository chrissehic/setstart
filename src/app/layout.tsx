import "./globals.css";
import { SidebarProvider } from "@/components/ui/sidebar";
import AppProviders from "@/components/providers/AppProviders";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/sonner";
import { geist, tobias, favorit } from "./fonts";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider afterSignOutUrl={"/sign-in"}>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${geist.variable} ${tobias.variable} ${favorit.variable} antialiased`}
        >
          <AppProviders>
            <SidebarProvider>{children} </SidebarProvider>
          </AppProviders>
        </body>
      </html>
      <Toaster richColors />
    </ClerkProvider>
  );
}
