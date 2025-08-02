import localFont from 'next/font/local'
import { Geist } from "next/font/google";

// Font files can be colocated inside of `app`
export const tobias = localFont({
  src: '../../public/fonts/tobias.woff2',
  variable: "--font-tobias",
  display: 'swap',
})

export const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
});


export const generalSans = localFont({
  src: '../../public/fonts/general_sans/GeneralSans-Variable.woff2',
  variable: "--font-general-sans",
  display: "swap",
});
