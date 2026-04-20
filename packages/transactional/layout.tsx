import { Html, Head, Body, Font, Tailwind, pixelBasedPreset, Container } from "react-email";
import * as React from "react";

export default function Layout({ className, children }: { className?: string; children: React.ReactNode }) {
 return (
  <Html>
   <Tailwind config={{ presets: [pixelBasedPreset], darkMode: 'class' }}>
    <Head>
     {/* <Font
     fontFamily="Figtree"
     fallbackFontFamily={'sans-serif'}
     webFont={{
      url: "https://fonts.gstatic.com/s/figtree/v9/_Xms-HUzqDCFdgfMm4q9DbZs.woff2",
      format: "woff2",
     }}
     fontWeight={400}
     fontStyle="normal"
    /> */}
     <style>
      {`
     @import url('https://fonts.googleapis.com/css2?family=Figtree:ital,wght@0,300..900;1,300..900&display=swap');
     * {
      font - family: 'Figtree', sans-serif;
     }
     `}
     </style>
    </Head>
    <Body style={{ fontFamily: "'Figtree', sans-serif" }} className={`p-10 ${className || ''}`}>
     <Container
      style={{
       maxWidth: "600px",
      }}
     >
      <header className="text-2xl font-bold flex my-10">DocDuck</header>
      {children}
     </Container>
    </Body>
   </Tailwind>
  </Html>
 );
}