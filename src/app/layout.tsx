// import type { Metadata, Viewport } from "next";
// import { Geist, Geist_Mono } from "next/font/google";
// import "./globals.css";
// import QueryProvider from "@/providers/query-provider";
// import ReduxProvider from "@/providers/redux-provider";
// import { Toaster } from "@/components/ui/sonner";
// import { GlobalContextProvider } from "@/context/GlobalContext";

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

// export const metadata: Metadata = {
//   title: {
//     default: "PrioBank | Secure & Modern Banking Solution",
//     template: "%s | PrioBank",
//   },
//   description:
//     "PrioBank provides advanced financial management, loan processing, and banking operations with a premium digital experience.",
//   keywords: [
//     "PrioBank",
//     "Priority Solutions",
//     "Online Banking",
//     "Banking Software",
//     "Finance Management",
//     "Loan Entry",
//     "Microfinance Software",
//   ],
//   authors: [{ name: "Priority Solution", url: "https://prioritysolutions.in" }],
//   creator: "Priority Solution",
//   publisher: "Priority Solution",
//   robots: {
//     index: true,
//     follow: true,
//     nocache: true,
//     googleBot: {
//       index: true,
//       follow: true,
//       noimageindex: false,
//       "max-video-preview": -1,
//       "max-image-preview": "large",
//       "max-snippet": -1,
//     },
//   },
//   formatDetection: {
//     email: false,
//     address: false,
//     telephone: false,
//   },
//   openGraph: {
//     title: "PrioBank | Secure & Modern Banking Solution",
//     description:
//       "Manage your banking operations with ease and security using PrioBank.",
//     url: "https://priobank.com",
//     siteName: "PrioBank",
//     locale: "en_US",
//     type: "website",
//   },
//   twitter: {
//     card: "summary_large_image",
//     title: "PrioBank | Secure & Modern Banking Solution",
//     description: "The ultimate banking solution for modern enterprises.",
//   },
//   icons: {
//     icon: "/favicon.ico",
//   },
// };

// export const viewport: Viewport = {
//   themeColor: "#00264D",
//   width: "device-width",
//   initialScale: 1,
// };

// export default function RootLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) {
//   return (
//     <html lang="en">
//       <body
//         className={`${geistSans.variable} ${geistMono.variable} antialiased`}
//       >
//         <ReduxProvider>
//           <QueryProvider>
//             <GlobalContextProvider>{children}</GlobalContextProvider>
//           </QueryProvider>
//         </ReduxProvider>
//         <Toaster position="top-right" richColors />
//       </body>
//     </html>
//   );
// }

import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/providers/query-provider";
import ReduxProvider from "@/providers/redux-provider";
import { Toaster } from "@/components/ui/sonner";
import { GlobalContextProvider } from "@/context/GlobalContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "PrioSuite LTE",
    template: "%s | PrioSuite LTE",
  },
  description:
    "PrioSuite LTE provides advanced financial management, loan processing, and banking operations with a premium digital experience.",
  keywords: [
    "PrioSuite LTE",
    "Priority Solutions",
    "Online Banking",
    "Banking Software",
    "Finance Management",
    "Loan Entry",
    "Microfinance Software",
  ],
  authors: [{ name: "Priority Solution", url: "https://prioritysolutions.in" }],
  creator: "Priority Solution",
  publisher: "Priority Solution",
  robots: {
    index: true,
    follow: true,
    nocache: true,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "PrioSuite LTE",
    description:
      "Manage your banking operations with ease and security using PrioSuite LTE.",
    url: "https://priobank.com",
    siteName: "PrioSuite LTE",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PrioSuite LTE",
    description: "The ultimate banking solution for modern enterprises.",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: "#00264D",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // h-full + overflow-hidden on html/body: this is the document root,
    // so it's the last line of defense against any page-level scrollbar.
    // Any actual scrolling in the app must happen inside a contained
    // element (e.g. DashboardLayout's <main>), never on the document itself.
    <html lang="en" className="h-full overflow-hidden">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-full overflow-hidden`}
      >
        <ReduxProvider>
          <QueryProvider>
            <GlobalContextProvider>{children}</GlobalContextProvider>
          </QueryProvider>
        </ReduxProvider>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
