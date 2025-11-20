import type { Metadata } from "next";
import "@carbon/react/index.scss"; // Import Carbon SCSS styles
import "./globals.css";

export const metadata: Metadata = {
  title: "Threadbox",
  description: "Email management and project collaboration platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
