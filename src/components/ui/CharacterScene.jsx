import { useEffect, useRef } from 'react';
import gsap from 'gsap';

/**
 * CharacterScene
 * Renders the 3 blob characters and drives all their behavior off a single
 * `state` prop: 'idle' | 'typingEmail' | 'passwordHidden' | 'passwordVisible' | 'error' | 'success'
 * `exiting`: when true, plays a shrink/slide-down/fade-out exit animation.
 */
export default function CharacterScene({ state, exiting }) {
  const sceneRef = useRef(null);
  const groupRefs = {
    orange: useRef(null),
    purple: useRef(null),
    yellow: useRef(null),
  };
  const pupilRefs = useRef([]);
  const coverRefs = {
    orange: useRef(null),
    purple: useRef(null),
    yellow: useRef(null),
  };

  pupilRefs.current = [];
  const addPupilRef = (el) => {
    if (el && !pupilRefs.current.includes(el)) pupilRefs.current.push(el);
  };

  // Entrance animation on mount — always set final state first, then animate in.
  useEffect(() => {
    const ctx = gsap.context(() => {
      const groups = Object.values(groupRefs)
        .map((r) => r.current)
        .filter(Boolean);

      gsap.set(groups, {
        transformOrigin: '50% 100%',
        scaleY: 1,
        y: 0,
        opacity: 1,
        rotate: 0,
      });

      gsap.from(groups, {
        scaleY: 0.2,
        y: 40,
        opacity: 0,
        duration: 0.6,
        ease: 'back.out(2)',
        stagger: 0.08,
        clearProps: 'scaleY,opacity',
      });
    }, sceneRef);

    return () => ctx.revert();
  }, []);

  // Exit animation — plays when `exiting` becomes true, right before unmount
  useEffect(() => {
    if (!exiting) return;
    const groups = Object.values(groupRefs)
      .map((r) => r.current)
      .filter(Boolean);

    gsap.to(groups, {
      y: 60,
      scaleY: 0.2,
      opacity: 0,
      duration: 0.35,
      ease: 'power2.in',
      stagger: 0.05,
      transformOrigin: '50% 100%',
    });
  }, [exiting]);

  // Cursor tracking: pupils move within eyes, bodies lean subtly toward cursor
  useEffect(() => {
    const covered = state === 'passwordHidden';

    const handleMouseMove = (e) => {
      if (covered || exiting) return;

      pupilRefs.current.forEach((pupil) => {
        const rect = pupil.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const angle = Math.atan2(e.clientY - cy, e.clientX - cx);
        const dist = 3.5;
        gsap.to(pupil, {
          x: Math.cos(angle) * dist,
          y: Math.sin(angle) * dist,
          duration: 0.3,
          ease: 'power2.out',
          overwrite: 'auto',
        });
      });

      if (!sceneRef.current) return;
      const sceneRect = sceneRef.current.getBoundingClientRect();
      const sceneCenterX = sceneRect.left + sceneRect.width / 2;
      const relativeX = (e.clientX - sceneCenterX) / sceneRect.width;

      Object.values(groupRefs).forEach((ref) => {
        if (!ref.current) return;
        gsap.to(ref.current, {
          rotate: relativeX * 4,
          duration: 0.5,
          ease: 'power2.out',
          overwrite: 'auto',
          transformOrigin: '50% 100%',
        });
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [state, exiting]);

  // State-driven reactions
  useEffect(() => {
    if (exiting) return;
    const covers = Object.values(coverRefs).map((r) => r.current).filter(Boolean);
    const groups = Object.values(groupRefs).map((r) => r.current).filter(Boolean);
    const pupils = pupilRefs.current;

    // Eyelid covers are no longer used for hide/show — always keep them hidden.
    gsap.to(covers, { y: -40, opacity: 0, duration: 0.2 });

    if (state === 'passwordHidden') {
      const tl = gsap.timeline();
      tl.to(groups, {
        scaleX: 0.05,
        duration: 0.18,
        ease: 'power1.in',
        transformOrigin: '50% 100%',
        stagger: 0.03,
      })
        .set(pupils, { opacity: 0 })
        .to(groups, {
          scaleX: 1,
          duration: 0.22,
          ease: 'power1.out',
          stagger: 0.03,
        });
    } else if (state === 'passwordVisible') {
      const tl = gsap.timeline();
      tl.to(groups, {
        scaleX: 0.05,
        duration: 0.15,
        ease: 'power1.in',
        transformOrigin: '50% 100%',
        stagger: 0.03,
      })
        .set(pupils, { opacity: 1 })
        .to(groups, {
          scaleX: 1,
          duration: 0.25,
          ease: 'back.out(2)',
          stagger: 0.03,
        });
    } else if (state === 'typingEmail') {
      gsap.to(groups, { y: -3, duration: 0.3, ease: 'power1.out' });
    } else if (state === 'error') {
      gsap.fromTo(
        groups,
        { rotate: 0 },
        {
          rotate: -6,
          duration: 0.08,
          yoyo: true,
          repeat: 5,
          ease: 'power1.inOut',
          onComplete: () => gsap.to(groups, { rotate: 0, y: 3, duration: 0.3 }),
        }
      );
    } else if (state === 'success') {
      gsap.to(groups, {
        y: -50,
        scaleY: 1.15,
        duration: 0.35,
        ease: 'power2.out',
        stagger: 0.06,
        yoyo: true,
        repeat: 1,
      });
    } else {
      gsap.to(groups, { y: 0, duration: 0.3 });
    }
  }, [state, exiting]);

  return (
    <svg
      ref={sceneRef}
      className="character-svg"
      viewBox="0 0 300 250"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Orange character */}
      <g ref={groupRefs.orange}>
        <path d="M 30 250 Q 20 160 70 150 Q 120 160 110 250 Z" fill="#FF7D42" />
        <circle cx="55" cy="180" r="5" fill="#000" ref={addPupilRef} />
        <circle cx="85" cy="180" r="5" fill="#000" ref={addPupilRef} />
        <rect
          ref={coverRefs.orange}
          x="45"
          y="168"
          width="50"
          height="16"
          rx="8"
          fill="#E8672E"
          opacity="0"
          style={{ transform: 'translateY(-40px)' }}
        />
      </g>

      {/* Purple character */}
      <g ref={groupRefs.purple}>
        <path d="M 100 250 Q 90 70 140 60 Q 190 70 180 250 Z" fill="#8B5CF6" />
        <circle cx="125" cy="110" r="6" fill="#FFF" />
        <circle cx="125" cy="110" r="3" fill="#000" ref={addPupilRef} />
        <circle cx="155" cy="110" r="6" fill="#FFF" />
        <circle cx="155" cy="110" r="3" fill="#000" ref={addPupilRef} />
        <rect
          ref={coverRefs.purple}
          x="112"
          y="97"
          width="56"
          height="18"
          rx="9"
          fill="#7C3AED"
          opacity="0"
          style={{ transform: 'translateY(-40px)' }}
        />
      </g>

      {/* Yellow character */}
      <g ref={groupRefs.yellow}>
        <path d="M 170 250 Q 160 120 210 110 Q 260 120 250 250 Z" fill="#FBBF24" />
        <circle cx="195" cy="140" r="4" fill="#000" ref={addPupilRef} />
        <circle cx="225" cy="140" r="4" fill="#000" ref={addPupilRef} />
        <rect
          ref={coverRefs.yellow}
          x="185"
          y="129"
          width="50"
          height="15"
          rx="7"
          fill="#F5A623"
          opacity="0"
          style={{ transform: 'translateY(-40px)' }}
        />
      </g>
    </svg>
  );
}