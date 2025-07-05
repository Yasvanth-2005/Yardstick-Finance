import "./globals.css";
import { Inter } from "next/font/google";
import ErrorBoundary from "../components/ErrorBoundary";
import { DataProvider } from "./contexts/DataContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Personal Finance Visualizer",
  description: "Track and visualize your personal finances",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ErrorBoundary>
          <DataProvider>{children}</DataProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
