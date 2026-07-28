import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
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
  icons: {
    icon: "/brand/vinylhub-mark.png",
    apple: "/brand/vinylhub-mark.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script
          id="remove-darkreader-hydration-mutations"
          dangerouslySetInnerHTML={{
            __html: `
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

                const cleanTree = (root) => {
                  cleanNode(root);

                  if (root instanceof Element) {
                    root.querySelectorAll("*").forEach(cleanNode);
                  }
                };

                cleanTree(document.documentElement);

                const observer = new MutationObserver((mutations) => {
                  for (const mutation of mutations) {
                    if (mutation.type === "attributes") {
                      cleanNode(mutation.target);
                      continue;
                    }

                    mutation.addedNodes.forEach((node) => {
                      if (node instanceof Element) {
                        cleanTree(node);
                      }
                    });
                  }
                });

                observer.observe(document.documentElement, {
                  attributes: true,
                  attributeFilter: darkReaderAttributes,
                  subtree: true,
                  childList: true,
                });

                const stopObserving = () => observer.disconnect();
                window.addEventListener("load", () => {
                  window.setTimeout(stopObserving, 4000);
                }, { once: true });
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-background font-sans text-foreground antialiased`}
        suppressHydrationWarning
      >
        {clerkPublishableKey ? (
          <ClerkProvider publishableKey={clerkPublishableKey}>
            <QueryProvider>
              {children}
              <Toaster theme="dark" />
            </QueryProvider>
          </ClerkProvider>
        ) : (
          <QueryProvider>
            {children}
            <Toaster theme="dark" />
          </QueryProvider>
        )}
      </body>
    </html>
  );
}
