import Header from "./components/Header.jsx";
import Hero from "./components/Hero.jsx";
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

// Chapter order (Spencer, 2026-11-17):
//   I    Hero — who we are, what we build and sell
//   II   How we operate + credibility bridge to .dev
//   III  Our custom-built harnesses: Rogue Agents, Perihelion Loop, Mythos OS
//   IV   Evidence: Studio Cinema + four live product showcases
//   V    Client proof: Jayson Powers & Wealth & Powers OS
//   VI   Landing pages gallery
//   VII  Ownership, engagement options, founder & the close
export default function App() {
  return (
    <MotionProvider>
      <IntakeProvider>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <Header />
        <main id="main">
          <Hero />
          <Method />
          <RogueAgentsSection />
          <PerihelionSection />
          <MythosExplorer />
          <HarnessBridge />
          <CinemaStage />
          <Forge />
          <WealthExplorer />
          <LandingGallery />
          <Ownership />
          <Capabilities />
          <Founder />
          <ClosingQuote />
          <ContactSection />
        </main>
        <Footer />
        <HarnessConcierge />
      </IntakeProvider>
    </MotionProvider>
  );
}
