'use client'

import React, { useEffect, useRef } from 'react'
import gsap from 'gsap'

/**
 * Hero: componente visual (client) que muestra el título de bienvenida
 * y una descripción, con animaciones GSAP "astrales".
 *
 * @param {{ userName: string }} props
 * @returns {JSX.Element}
 *
 * @description
 * - Animación de entrada y pulso continuo en el título y el párrafo.
 * - Usa refs y un timeline GSAP; limpia la animación al desmontar.
 */
export default function Hero({ userName }: { userName: string }): React.ReactElement {
  const titleRef = useRef<HTMLHeadingElement | null>(null)
  const subRef = useRef<HTMLParagraphElement | null>(null)

  useEffect(() => {
    const title = titleRef.current
    if (!title) return

    // Entrada: usar fromTo para asegurar estado final consistente
    const tl = gsap.timeline()
    tl.fromTo(title, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 1.5, ease: 'power2.out' })

    // Pulso sutil y glow en loop SOLO en el título (animamos transform y filter,
    // evitamos tocar color para no interferir con estilos CSS globales)
    const pulse = gsap.timeline({ repeat: -1, yoyo: true, defaults: { ease: 'sine.inOut' } })
    pulse.to(title, { scale: 1.03, duration: 1.6, filter: 'drop-shadow(0 0 18px rgba(124,58,237,0.9))' })
    pulse.to(title, { scale: 1.0, duration: 1.6, filter: 'none' })

    return () => {
      tl.kill()
      pulse.kill()
      // Limpiar propiedades inline que GSAP pudo haber dejado
      try {
        gsap.set(title, { clearProps: 'transform,opacity,filter' })
      } catch {
        // ignore
      }
    }
  }, [])

  return (
    <div className="text-center mb-6">
      <h1 ref={titleRef} className="text-4xl font-bold">
        Bienvenido {userName} a Alquimara
      </h1>
      <p ref={subRef} className="mt-4 text-lg text-gray-700">
        Explora nuestros productos y descubre la magia de la naturaleza.
      </p>
    </div>
  )
}
