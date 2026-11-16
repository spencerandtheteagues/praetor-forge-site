import Header from "./components/Header.jsx";
import Hero from "./components/Hero.jsx";
import CinemaStage from "./components/CinemaStage.jsx";
import Forge from "./components/Forge.jsx";
import Method from "./components/Method.jsx";
import MythosExplorer from "./components/MythosExplorer.jsx";
import WealthExplorer from "./components/WealthExplorer.jsx";
import ContactSection from "./components/ContactSection.jsx";
import { Capabilities, Footer, Founder, Ownership } from "./components/Chapters.jsx";
import { IntakeProvider, MotionProvider } from "./lib/providers.jsx";

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
          <CinemaStage />
          <Forge />
          <Method />
          <MythosExplorer />
          <WealthExplorer />
          <Ownership />
          <Capabilities />
          <Founder />
          <ContactSection />
        </main>
        <Footer />
      </IntakeProvider>
    </MotionProvider>
  );
}
