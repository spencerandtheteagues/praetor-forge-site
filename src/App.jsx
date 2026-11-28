import Header from "./components/Header.jsx";
import Hero from "./components/Hero.jsx";
import { Buyer, HowItWorks } from "./components/Buyer.jsx";
import Method from "./components/Method.jsx";
import { HarnessBridge, RogueAgentsSection } from "./components/Harnesses.jsx";
import PerihelionSection from "./components/PerihelionSection.jsx";
import MythosExplorer from "./components/MythosExplorer.jsx";
import CinemaStage from "./components/CinemaStage.jsx";
import Forge from "./components/Forge.jsx";
import WealthExplorer from "./components/WealthExplorer.jsx";
import LandingGallery from "./components/LandingGallery.jsx";
import ContactSection from "./components/ContactSection.jsx";
import HarnessConcierge from "./components/HarnessConcierge.jsx";
import { Capabilities, ClosingQuote, Footer, Founder, Ownership } from "./components/Chapters.jsx";
import { IntakeProvider, MotionProvider } from "./lib/providers.jsx";

function isContactPath(pathname) {
  return (pathname || "/").replace(/\/+$/, "") === "/contact";
}

// Buyer sections come first. Engineering sections stay on the page, lower down.
export default function App({ page = "auto" }) {
  const contact =
    page === "contact" ||
    (page === "auto" && typeof window !== "undefined" && isContactPath(window.location.pathname));
  return (
    <MotionProvider>
      <IntakeProvider>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <Header contact={contact} />
        <main id="main">
          {contact ? (
            <ContactSection heading="h1" />
          ) : (
            <>
              <Hero />
              <Buyer />
              <HowItWorks />
              <Capabilities />
              <CinemaStage />
              <Forge />
              <Method />
              <RogueAgentsSection />
              <PerihelionSection />
              <MythosExplorer />
              <HarnessBridge />
              <WealthExplorer />
              <LandingGallery />
              <Ownership />
              <Founder />
              <ClosingQuote />
            </>
          )}
        </main>
        <Footer contact={contact} />
        <HarnessConcierge />
      </IntakeProvider>
    </MotionProvider>
  );
}
