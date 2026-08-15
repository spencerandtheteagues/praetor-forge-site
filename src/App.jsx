import React, { useEffect } from 'react';
import pageHtml from './page.html?raw';

export default function App() {
  useEffect(() => {
    const reduce =
      window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const els = document.querySelectorAll('.reveal');
    if (reduce || !('IntersectionObserver' in window)) {
      els.forEach((e) => e.classList.add('in'));
    } else {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((en) => {
            if (en.isIntersecting) {
              en.target.classList.add('in');
              io.unobserve(en.target);
            }
          });
        },
        { threshold: 0.14 },
      );
      els.forEach((e) => io.observe(e));
    }

    let timer;
    if (!reduce) {
      const sig = document.getElementById('sigma');
      if (sig) {
        const vals = ['4.7\u03c3', '4.9\u03c3', '5.0\u03c3', '5.1\u03c3', '5.0\u03c3'];
        let i = 0;
        timer = setInterval(() => {
          i = (i + 1) % vals.length;
          sig.textContent = vals[i];
        }, 2200);
      }
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, []);

  return <div dangerouslySetInnerHTML={{ __html: pageHtml }} />;
}
