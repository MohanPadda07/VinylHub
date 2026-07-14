import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import { QueryProvider } from "@/components/providers/query-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

export const metadata: Metadata = {
  title: "VinylHub",
  description:
    "A social music platform for vinyl collecting, discovery, community debates, and AI recommendations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <Script id="remove-darkreader-hydration-mutations" strategy="beforeInteractive">
        {`
          (() => {
            const darkReaderAttributes = [
              "data-darkreader-mode",
              "data-darkreader-scheme",
              "data-darkreader-proxy-injected",
              "data-darkreader-inline-stroke",
              "data-darkreader-inline-fill",
              "data-darkreader-inline-bgcolor",
              "data-darkreader-inline-color",
              "data-darkreader-inline-border"
            ];

            const cleanNode = (node) => {
              if (!(node instanceof Element)) return;

              for (const attribute of darkReaderAttributes) {
                node.removeAttribute(attribute);
              }

              if (node.getAttribute("style")?.includes("--darkreader")) {
                for (const property of Array.from(node.style)) {
                  if (property.startsWith("--darkreader")) {
                    node.style.removeProperty(property);
                  }
                }

                if (!node.getAttribute("style")) {
                  node.removeAttribute("style");
                }
              }
            };

            cleanNode(document.documentElement);
            document.querySelectorAll("[data-darkreader-mode], [data-darkreader-scheme], [data-darkreader-proxy-injected], [data-darkreader-inline-stroke], [data-darkreader-inline-fill], [data-darkreader-inline-bgcolor], [data-darkreader-inline-color], [data-darkreader-inline-border], [style*='--darkreader']").forEach(cleanNode);
          })();
        `}
      </Script>
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-background font-sans text-foreground antialiased`}
        suppressHydrationWarning
      >
        {clerkPublishableKey ? (
          <ClerkProvider publishableKey={clerkPublishableKey}>
            <QueryProvider>{children}</QueryProvider>
          </ClerkProvider>
        ) : (
          <QueryProvider>{children}</QueryProvider>
        )}
      </body>
    </html>
  );
}
