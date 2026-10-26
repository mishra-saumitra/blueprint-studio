import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Blueprint Studio · Reporting architecture for SAP software",
  description: "Explore, design, and document SAP reporting architectures. An independent project by Saumitra Mishra.",
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
