import "./globals.css";
import { SidebarProvider } from "@/components/ui/sidebar";
import AppProviders from "@/components/providers/AppProviders";
import ClerkProviderWrapper from "@/components/providers/ClerkProviderWrapper";
import { Toaster } from "@/components/ui/sonner";
import { geist, tobias, favorit } from "./fonts";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geist.variable} ${tobias.variable} ${favorit.variable} antialiased`}
      >
        <AppProviders>
          <ClerkProviderWrapper>
            <SidebarProvider>{children} </SidebarProvider>
          </ClerkProviderWrapper>
        </AppProviders>
        <Toaster richColors />
      </body>
    </html>
  );
}
