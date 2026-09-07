import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Figtree, IBM_Plex_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { RouteGate } from "@/components/auth/route-gate";
import { SessionProvider } from "@/components/auth/session-provider";
import { QueryProvider } from "@/components/query-provider";
import { themeInitScript } from "@/lib/theme";
import "./globals.css";

const display = Bricolage_Grotesque({
  variable: "--font-display-src",
  subsets: ["latin"],
});

const body = Figtree({
  variable: "--font-body-src",
  subsets: ["latin"],
});

const data = IBM_Plex_Mono({
  variable: "--font-data-src",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: {
    default: "IoTeedom Smart Pay",
    template: "%s · IoTeedom Smart Pay",
  },
  description:
    "Pay ECG direct. Pay water to the owner, who pays Ghana Water. Meters, solar, EV — from one account.",
};

export const viewport: Viewport = {
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en-GH"
      suppressHydrationWarning
      className={`${display.variable} ${body.variable} ${data.variable} min-h-dvh`}
    >
      <body className="min-h-dvh font-sans antialiased">
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: FOUC-free theme boot before hydrate */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <QueryProvider>
          <SessionProvider>
            <RouteGate>{children}</RouteGate>
          </SessionProvider>
        </QueryProvider>
        <Toaster
          position="bottom-right"
          toastOptions={{
            classNames: {
              toast: "!bg-ink !text-on-ink !border-0 !rounded-xl !font-[inherit]",
              title: "!text-on-ink",
              description: "!text-on-ink/70",
            },
          }}
        />
      </body>
    </html>
  );
}
