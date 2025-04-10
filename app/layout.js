import { Geist, Geist_Mono } from "next/font/google";
import Header from './components/Header';
import Footer from './components/Footer';
import './globals.css';
import React from 'react';
import { Inter } from "next/font/google";
import { ToastContainer } from "react-toastify";
export const metadata = {
  title: "One for all",
  description: "Generated by One for all",
};
const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Header />
        <main>{children}</main>
        <ToastContainer autoClose={3000} />
        <Footer />
      </body>
    </html>
  );
}
