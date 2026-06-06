import React, { useState, useEffect } from 'react';
import { MessageSquare } from 'lucide-react';
import { audioManager } from '../utils/audioManager';

function FloatingWhatsapp() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility, { passive: true });
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const handleClick = () => {
    audioManager.playClick();
  };

  const handleMouseEnter = () => {
    audioManager.playHover();
  };

  return (
    <a
      href="https://wa.me/201019080277?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%D9%8B%20%D9%81%D8%B1%D9%8A%D9%82%20%D9%88%D8%AC%D8%AF%D8%8C%20%D8%A3%D9%88%D8%AF%20%D8%B7%D9%84%D8%A8%20%D9%85%D9%83%D8%A7%D9%84%D9%85%D8%A9%20%D9%81%D8%AD%D8%B5%20%D9%84%D8%AD%D8%B3%D8%A7%D8%A8%D8%A7%D8%AA%D9%8A%20%D8%A7%D9%84%D8%A5%D8%B9%D9%84%D8%A7%D9%86%D9%8A%D8%A9%20%D8%A8%D9%85%D9%8A%D8%B2%D8%A7%D9%86%D9%8A%D8%A9%20%D8%B4%D9%87%D8%B1%D9%8A%D9%91%D8%A9%20%D9%85%D8%AD%D8%AF%D8%AF%D8%A9."
      target="_blank"
      rel="noopener noreferrer"
      className={`floating-whatsapp-btn ${isVisible ? 'visible' : ''}`}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      aria-label="تواصل معنا عبر واتساب"
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="currentColor"
        style={{ display: 'block' }}
      >
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.963C16.59 2.019 14.12 1.01 11.5 1.01c-5.436 0-9.861 4.372-9.865 9.8.001 1.762.478 3.486 1.38 5.025l-.955 3.487 3.587-.928zM17.18 14.4c-.284-.141-1.682-.822-1.942-.916-.26-.094-.45-.141-.64.141-.19.283-.736.917-.902 1.104-.165.187-.332.21-.617.069-.285-.141-1.203-.439-2.292-1.397-.847-.746-1.42-1.668-1.586-1.95-.166-.283-.018-.437.124-.577.127-.126.284-.33.427-.496.143-.165.19-.283.285-.472.095-.189.047-.354-.024-.496-.071-.141-.64-1.523-.877-2.09-.23-.554-.464-.48-.64-.489-.166-.008-.356-.01-.546-.01-.19 0-.5.07-.76.353-.26.283-1 .991-1 2.418s1.02 2.793 1.16 2.982c.14.188 2.007 3.03 4.862 4.24.68.288 1.21.46 1.623.59.684.215 1.307.185 1.8.113.55-.082 1.682-.679 1.92-1.335.237-.656.237-1.217.165-1.336-.07-.118-.26-.188-.545-.33z" />
      </svg>
    </a>
  );
}

export default FloatingWhatsapp;
